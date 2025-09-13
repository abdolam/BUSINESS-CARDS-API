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
  // strategies / helpers
  startGate: () => void;
  registerHoneypot: (name?: string) => {
    name: string;
    id: string;
    tabIndex: number;
    autoComplete: string;
    "aria-hidden": true;
    style: React.CSSProperties;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  setCaptchaToken: (token: string | null) => void;
  refresh: () => void;
  // feature flags
  captchaEnabled: boolean;
};
