import { useEffect, useRef, useState } from "react";
import { useHumanVerification } from "../useHumanVerification";
import type { HVContextValue } from "../HumanVerificationContext";
import { detectAppTheme, onAppThemeChange } from "../utils/theme";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: Element,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __onTurnstileLoadedQueue?: Array<() => void>;
    __onTurnstileLoaded?: () => void;
  }
}

type Props = {
  siteKey?: string;
  theme?: "light" | "dark" | "auto";
};

export default function HumanTurnstile({ siteKey, theme = "auto" }: Props) {
  const { setCaptchaToken } = useHumanVerification() as HVContextValue;
  const mountRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  // track effective theme when `theme` prop is "auto"
  const [appTheme, setAppTheme] = useState<"light" | "dark">(detectAppTheme());

  // watch <html> class changes to follow your app’s toggle
  // 1) Theme watcher — single cleanup that handles both
  useEffect(() => {
    if (theme !== "auto") return;
    const html = document.documentElement;
    const update = () => setAppTheme(detectAppTheme());

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
          update();
        }
      }
    });
    obs.observe(html, { attributes: true });

    update();
    const unsubscribe = onAppThemeChange(setAppTheme);

    return () => {
      unsubscribe?.();
      obs.disconnect();
    };
  }, [theme]);

  // 2) Ensure Turnstile script is present, then render
  useEffect(() => {
    let cancelled = false;
    const el = mountRef.current;
    if (!el || !siteKey) return;

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (window.turnstile) return resolve();

        // already queued? keep waiting
        if (!window.__onTurnstileLoadedQueue) {
          window.__onTurnstileLoadedQueue = [];
        }
        window.__onTurnstileLoaded = () => {
          try {
            window.__onTurnstileLoadedQueue?.forEach((fn) => fn());
          } finally {
            window.__onTurnstileLoadedQueue = [];
          }
        };

        // if script tag exists, just wait for onload
        const exist = document.querySelector<HTMLScriptElement>(
          'script[data-hv="turnstile"]'
        );
        if (exist) return resolve();

        const s = document.createElement("script");
        s.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__onTurnstileLoaded&render=explicit";
        s.async = true;
        s.defer = true;
        s.setAttribute("data-hv", "turnstile");
        s.onload = () => resolve();
        document.head.appendChild(s);
      });

    const doRender = () => {
      if (cancelled || !el || !window.turnstile) return;

      el.removeAttribute("data-ts-rendered");
      el.innerHTML = "";

      const effectiveTheme: "light" | "dark" | "auto" =
        theme === "auto" ? appTheme : theme;

      widgetIdRef.current = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: effectiveTheme,
        callback: (token: string) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(null),
        "error-callback": () => setCaptchaToken(null),
      });
    };

    ensureScript().then(() => {
      if (cancelled) return;
      if (window.turnstile) {
        requestAnimationFrame(doRender);
      } else {
        window.__onTurnstileLoadedQueue!.push(() =>
          requestAnimationFrame(doRender)
        );
      }
    });

    return () => {
      cancelled = true;
      try {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } finally {
        widgetIdRef.current = null;
        setCaptchaToken(null);
      }
    };
  }, [siteKey, theme, appTheme, setCaptchaToken]);

  // 3) Reserve space to avoid layout collapse under sticky headers
  return <div ref={mountRef} className="min-h-[70px] relative z-[60]" />;

  if (!siteKey) return null;
  return <div ref={mountRef} />;
}
