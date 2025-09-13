// src/features/cards/utils/image.ts
export const DEFAULT_CARD_IMAGE_URL =
  (import.meta.env.VITE_DEFAULT_CARD_IMAGE_URL as string | undefined) ??
  "/logo.png";

function isHttpUrl(v: string | undefined): v is string {
  return !!v && /^https?:\/\//i.test(v);
}

export function loadImageOk(url: string, timeout = 5000): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    const t = window.setTimeout(() => finish(false), timeout);
    img.onload = () => {
      window.clearTimeout(t);
      finish(true);
    };
    img.onerror = () => {
      window.clearTimeout(t);
      finish(false);
    };
    img.src = url;
  });
}

/** Return a valid image URL (original if it loads, otherwise the default). */
export async function withImageFallback(
  url: string | undefined
): Promise<string> {
  if (isHttpUrl(url) && (await loadImageOk(url))) return url;
  return DEFAULT_CARD_IMAGE_URL;
}
