import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type HttpErrorDetail = {
  status?: number;
  message?: string;
  title?: string;
};

export function useGlobalHttpErrors() {
  const navigate = useNavigate();

  useEffect(() => {
    const onHttpError = (e: Event) => {
      const { detail = {} } = e as CustomEvent<HttpErrorDetail>;
      const title =
        detail.title ?? (detail.status ? `שגיאה ${detail.status}` : "שגיאה");
      const message =
        detail.message ??
        (detail.status && detail.status >= 500
          ? "השירות אינו זמין כרגע. נסה שוב מאוחר יותר."
          : "לא ניתן ליצור קשר עם השרת.");

      navigate("/error", { replace: true, state: { title, message } });
    };

    window.addEventListener("http-error", onHttpError as EventListener);
    return () =>
      window.removeEventListener("http-error", onHttpError as EventListener);
  }, [navigate]);
}

/** Optional: use when you want to navigate to the error page imperatively */
export function emitHttpError(detail: HttpErrorDetail) {
  window.dispatchEvent(
    new CustomEvent<HttpErrorDetail>("http-error", { detail }) as Event
  );
}
