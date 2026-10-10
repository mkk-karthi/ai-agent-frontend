import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../stores/UserStore";
import type { apiResponse } from "../types/type";

// Prevents duplicate /auth/token requests when multiple TanStack queries receive 401 at the same time.
let refreshPromise: Promise<string | null> | null = null;

const handleUnauthorized = () => {
  const { setUser, setAccessToken } = useUserStore.getState();
  setAccessToken("");
  setUser(null);
  useQueryClient().clear();

  if (window.location.pathname !== "/auth/login") {
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
  options?: RequestInit,
  onChunk?: (data: string) => void,
) => {
  const { accessToken } = useUserStore.getState();
  const response = await fetch(`/api${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      ...(options?.headers ?? {}),
    },
  });

  if (response.status === 401) {
    // For auth endpoints, don't attempt to refresh token
    if (url.startsWith("/auth/")) {
      if (url === "/auth/token") {
        handleUnauthorized();
        throw new Error("Unauthorized");
      }
      return await response.json();
    }

    // Try refreshing the access token (shares promise if multiple queries hit 401 concurrently)
    const newToken = await refreshAccessToken();
    if (newToken) {
      return await handleResponse(
        url,
        {
          ...options,
          headers: {
            ...(options?.headers ?? {}),
            Authorization: `Bearer ${newToken}`,
          },
        },
        onChunk,
      );
    } else {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }
  }

  if (response.status === 404) {
    return {
      success: false,
      code: 404,
      message: "Not found",
    };
  }

  if (response.status === 429) {
    return response.json();
  }

  // Validation errors
  if (response.status === 400 || response.status === 403) {
    return await response.json();
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
      return { success: true };
    }
  } else {
    return await response.json();
  }
};

export const fetchService = {
  async get<T = any>(url: string, headers?: HeadersInit | undefined): Promise<apiResponse<T>> {
    return await handleResponse(url, {
      method: "GET",
      credentials: "include",
      headers,
    });
  },

  async post(url: string, data: { [index: string]: any }, headers?: HeadersInit | undefined) {
    return await handleResponse(url, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });
  },

  async put(url: string, data: { [index: string]: any }, headers?: HeadersInit | undefined) {
    return await handleResponse(url, {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });
  },

  async delete(url: string, headers?: HeadersInit | undefined) {
    return await handleResponse(url, {
      method: "DELETE",
      credentials: "include",
      headers,
    });
  },

  async patch(url: string, data: { [index: string]: any }, headers?: HeadersInit | undefined) {
    return await handleResponse(url, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });
  },

  async stream(
    url: string,
    data: { [index: string]: any },
    headers: HeadersInit | undefined,
    onChunk: (data: string) => void,
    signal?: AbortSignal,
  ) {
    return await handleResponse(
      url,
      {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data),
        signal,
      },
      onChunk,
    );
  },
};
