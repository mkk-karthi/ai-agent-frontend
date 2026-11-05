import { queryClient } from "./queryClient";
import { useUserStore } from "../stores/UserStore";
import type { apiResponse } from "../types/type";

interface FetchOptions extends RequestInit {
  responseType?: "json" | "text" | "blob";
}

// Prevents duplicate /auth/token requests when multiple TanStack queries receive 401 at the same time.
let refreshPromise: Promise<string | null> | null = null;

const handleUnauthorized = () => {
  const { setUser, setAccessToken } = useUserStore.getState();
  setAccessToken("");
  setUser(null);
  queryClient.clear();

  if (typeof window !== "undefined" && window.location.pathname !== "/auth/login") {
    window.location.replace("/auth/login");
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  // If a token refresh is already in progress, reuse the existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // Immediately invoke the async function to start the network request
  // and store the pending Promise so concurrent calls can share it.
  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const res = await response.json();
      if (res.code === 200 && res.data?.token) {
        useUserStore.getState().setAccessToken(res.data.token);
        return res.data.token as string;
      }

      return null;
    } catch {
      return null;
    } finally {
      // Clear the in-flight promise once resolved or rejected
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const handleResponse = async (
  url: string,
  options?: FetchOptions,
  onChunk?: (data: string) => void,
) => {
  const { accessToken } = useUserStore.getState();
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

  const requestHeaders = new Headers(options?.headers);
  if (!isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (accessToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!requestHeaders.has("x-timezone") && typeof Intl !== "undefined") {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) requestHeaders.set("x-timezone", tz);
    } catch {}
  }
  if (!requestHeaders.has("x-locale") && typeof navigator !== "undefined") {
    try {
      const loc = navigator.language;
      if (loc) requestHeaders.set("x-locale", loc);
    } catch {}
  }

  const response = await fetch(`/api${url}`, {
    ...options,
    headers: requestHeaders,
  });

  if (response.status === 401) {
    // For auth endpoints (except user profile) and shared endpoints, don't attempt to refresh token
    if ((url.startsWith("/auth/") && url !== "/auth/user") || url.startsWith("/shared/")) {
      if (url === "/auth/token") {
        handleUnauthorized();
        throw new Error("Unauthorized");
      }
      if (options?.responseType === "blob") {
        throw new Error("Unauthorized");
      }
      return options?.responseType === "text" ? await response.text() : await response.json();
    }

    // Try refreshing the access token (shares promise if multiple queries hit 401 concurrently)
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = new Headers(options?.headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      return await handleResponse(
        url,
        {
          ...options,
          headers: retryHeaders,
        },
        onChunk,
      );
    } else {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }
  }

  if (response.status === 404) {
    if (options?.responseType === "text" || options?.responseType === "blob") {
      throw new Error("Not found");
    }
    return {
      success: false,
      code: 404,
      message: "Not found",
    };
  }

  if (response.status === 429) {
    if (options?.responseType === "blob") {
      throw new Error("Too many requests");
    }
    return options?.responseType === "text" ? await response.text() : await response.json();
  }

  // Validation errors
  if (response.status === 400 || response.status === 403) {
    if (options?.responseType === "blob") {
      throw new Error(`Failed with status ${response.status}`);
    }
    return options?.responseType === "text" ? await response.text() : await response.json();
  }

  if (!response.ok || !response.body) {
    throw new Error("Server error, Try again later.");
  }

  if (onChunk) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    } finally {
      reader.releaseLock();
    }
    return { success: true };
  }

  if (options?.responseType === "blob") {
    return await response.blob();
  }

  if (options?.responseType === "text") {
    return await response.text();
  }

  return await response.json();
};

interface FetchService {
  get(url: string, headers: HeadersInit | undefined, responseType: "blob"): Promise<Blob>;
  get(url: string, headers: HeadersInit | undefined, responseType: "text"): Promise<string>;
  get<T = any>(url: string, headers?: HeadersInit, responseType?: "json"): Promise<apiResponse<T>>;
  post<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<apiResponse<T>>;
  put<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<apiResponse<T>>;
  delete<T = any>(url: string, headers?: HeadersInit): Promise<apiResponse<T>>;
  patch<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<apiResponse<T>>;
  stream(
    url: string,
    data: any,
    headers: HeadersInit | undefined,
    onChunk: (data: string) => void,
    signal?: AbortSignal,
  ): Promise<any>;
}

export const fetchService: FetchService = {
  async get(
    url: string,
    headers?: HeadersInit,
    responseType: "json" | "text" | "blob" = "json",
  ): Promise<any> {
    return await handleResponse(url, {
      method: "GET",
      credentials: "include",
      headers,
      responseType,
    });
  },

  async post<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<apiResponse<T>> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    return await handleResponse(url, {
      method: "POST",
      credentials: "include",
      headers,
      body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  async put<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<apiResponse<T>> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    return await handleResponse(url, {
      method: "PUT",
      credentials: "include",
      headers,
      body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T = any>(url: string, headers?: HeadersInit): Promise<apiResponse<T>> {
    return await handleResponse(url, {
      method: "DELETE",
      credentials: "include",
      headers,
    });
  },

  async patch<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<apiResponse<T>> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    return await handleResponse(url, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  async stream(
    url: string,
    data: any,
    headers: HeadersInit | undefined,
    onChunk: (data: string) => void,
    signal?: AbortSignal,
  ) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    return await handleResponse(
      url,
      {
        method: "POST",
        credentials: "include",
        headers,
        body: isFormData ? data : JSON.stringify(data),
        signal,
      },
      onChunk,
    );
  },
};
