import { redirect } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import type { apiResponse } from "../types/type";

const handleResponse = async (
  url: string,
  options?: RequestInit,
  onChunk?: (data: string) => void,
) => {
  const { accessToken, setUser, setAccessToken } = useUserStore.getState();
  const response = await fetch(`/api${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      ...(options?.headers ?? {}),
    },
  });

  if (accessToken && response.status === 401) {
    const res = await fetchService.post("/auth/token", {});
    if (res.code == 400) {
      setAccessToken("");
      setUser(null);
      redirect("/auth/login");
    } else {
      setAccessToken(res.data.token);
      return await handleResponse(url, { ...options });
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
  if (response.status === 400) {
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

  async stream(
    url: string,
    data: { [index: string]: any },
    headers: HeadersInit | undefined,
    onChunk: (data: string) => void,
    signal?: AbortSignal,
  ) {
    await handleResponse(
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
