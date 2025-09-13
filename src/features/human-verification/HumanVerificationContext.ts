import { createContext } from "react";
import type { CSSProperties, ChangeEvent } from "react";

export type HVSignals = {
  dwellMs: number;
  touched: boolean;
  pointerMoves: number;
  startedAt: number;
  honeypotFilled?: boolean;
  captchaProvider?: "turnstile";
  captchaToken?: string | null;
};

export type HVContextValue = {
  ready: boolean;
  canSubmit: boolean;
  signals: HVSignals;
  hvToken: string | null;
  startGate: () => void;
  registerHoneypot: (name?: string) => HoneypotProps;
  setCaptchaToken: (token: string | null) => void;
  refresh: () => void;
  captchaEnabled: boolean;
};

export type HoneypotProps = {
  name: string;
  id: string;
  tabIndex: number;
  autoComplete: string;
  "aria-hidden": true;
  style: CSSProperties;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const HumanVerificationCtx = createContext<HVContextValue | null>(null);
