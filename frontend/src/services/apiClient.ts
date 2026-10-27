import axios, { AxiosError } from "axios";

const TOKEN_KEY = "churniq:access_token";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_CHURN_API_URL ?? "http://127.0.0.1:8000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("churniq:session-expired"));
    }
    return Promise.reject(error);
  }
);

export function setAccessToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function refreshTokenPlaceholder() {
  return null;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail ?? error.message ?? "Network request failed.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
