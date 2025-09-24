import axios, {
  type AxiosInstance,
  type AxiosHeaders,
  type AxiosRequestHeaders,
  type RawAxiosRequestHeaders,
} from "axios";
import { TOKEN_KEY } from "@/features/users/auth/helpers";

/** Type guard: is this an AxiosHeaders instance? */
function isAxiosHeaders(h: unknown): h is AxiosHeaders {
  return !!h && typeof (h as AxiosHeaders).set === "function";
}

function attachAuthRequestInterceptor(api: AxiosInstance) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const authValue = `Bearer ${token}`;

      if (isAxiosHeaders(config.headers)) {
        // AxiosHeaders instance
        config.headers.set("Authorization", authValue);
        config.headers.set("x-auth-token", token);
      } else {
        // Plain object headers
        const h: RawAxiosRequestHeaders =
          (config.headers as RawAxiosRequestHeaders | undefined) ?? {};
        h.Authorization = authValue;
        (h as Record<string, string>)["x-auth-token"] = token;
        config.headers = h as AxiosRequestHeaders;
      }
    }
    return config;
  });
}

function attachResponseInterceptors(api: AxiosInstance) {
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error?.response?.status as number | undefined;
      const message =
        (error?.response?.data &&
          (error.response.data.message || error.response.data.error)) ||
        error?.message ||
        "Network error";

      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event("auth-changed"));
      }

      const suppressGlobal =
        axios.isAxiosError(error) &&
        !!error.config &&
        typeof error.config.headers === "object" &&
        (error.config.headers as Record<string, unknown>)["x-local-error"] ===
          "1";

      if (!suppressGlobal && (!error?.response || (status && status >= 500))) {
        window.dispatchEvent(
          new CustomEvent("http-error", {
            detail: { status, message },
          }) as Event
        );
      }

      return Promise.reject(error);
    }
  );
}

export const usersApi = axios.create({
  baseURL: (import.meta.env.VITE_USERS_API_URL ?? "").trim() || undefined,
  timeout: 15000,
});

export const cardsApi = axios.create({
  baseURL: (import.meta.env.VITE_CARDS_API_URL ?? "").trim() || undefined,
  timeout: 15000,
});

// Attach interceptors
attachAuthRequestInterceptor(usersApi);
attachAuthRequestInterceptor(cardsApi);
attachResponseInterceptors(usersApi);
attachResponseInterceptors(cardsApi);
