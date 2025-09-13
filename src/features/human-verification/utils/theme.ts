// src/features/human-verification/utils/theme.ts
export type AppTheme = "light" | "dark";

/** Read the current app theme from <html class="dark"> */
export function detectAppTheme(): AppTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Subscribe to app theme changes by watching <html> class mutations.
 * Returns an unsubscribe function.
 */
export function onAppThemeChange(cb: (theme: AppTheme) => void): () => void {
  const html = document.documentElement;
  const notify = () => cb(detectAppTheme());

  // initial fire
  notify();

  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "class") {
        notify();
        break;
      }
    }
  });

  obs.observe(html, { attributes: true });
  return () => obs.disconnect();
}
