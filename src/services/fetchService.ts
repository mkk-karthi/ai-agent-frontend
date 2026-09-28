import { redirect } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";

const handleResponse = async (url: string, options?: { [index: string]: any }) => {
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
      message: "Not found",
    };
  }

  return await response.json();
};

export const fetchService = {
  async get(url: string, headers?: { [index: string]: string | number }) {
    return await handleResponse(url, {
      method: "GET",
      credentials: "include",
      headers,
    });
  },

  async post(
    url: string,
    data: { [index: string]: any },
    headers?: { [index: string]: string | number },
  ) {
    return await handleResponse(url, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });
  },

  async put(
    url: string,
    data: { [index: string]: any },
    headers?: { [index: string]: string | number },
  ) {
    return await handleResponse(url, {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });
  },

  async delete(url: string, headers?: { [index: string]: string | number }) {
    return await handleResponse(url, {
      method: "DELETE",
      credentials: "include",
      headers,
    });
  },
};
