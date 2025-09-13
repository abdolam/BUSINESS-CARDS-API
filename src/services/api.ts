import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "").trim();
export const API_ENABLED = BASE_URL.length > 0;

const api = axios.create({
  baseURL: API_ENABLED ? BASE_URL : undefined,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const message =
      (error?.response?.data &&
        (error.response.data.message || error.response.data.error)) ||
      error?.message ||
      "Network error";

    // Auto-logout on 401/403 (token invalid/expired)
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-changed"));
    }

    const suppressGlobal =
      axios.isAxiosError(error) &&
      !!error.config &&
      typeof error.config.headers === "object" &&
      (error.config.headers as Record<string, unknown>)["x-local-error"] ===
        "1";

    // Escalate network errors (no response) OR server 5xx to the branded error page
    if (!suppressGlobal && (!error?.response || (status && status >= 500))) {
      window.dispatchEvent(
        new CustomEvent("http-error", { detail: { status, message } }) as Event
      );
    }

    return Promise.reject(error);
  }
);

export default api;
