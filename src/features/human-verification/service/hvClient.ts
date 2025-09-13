import { HVSignals } from "../types";

export function encodeHV(signals: HVSignals): string {
  // keep it small but readable server-side
  const payload = {
    v: "v1",
    t: signals.startedAt,
    d: signals.dwellMs,
    m: signals.pointerMoves,
    u: signals.touched ? 1 : 0,
    h: signals.honeypotFilled ? 1 : 0,
    cp: signals.captchaProvider || null,
    ct: signals.captchaToken || null,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}
