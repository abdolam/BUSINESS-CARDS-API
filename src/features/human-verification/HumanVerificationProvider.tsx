import React, { useCallback, useMemo, useRef, useState } from "react";
import { createHoneypotProps } from "./strategies/HoneypotStrategy";
import { createTimeGate } from "./strategies/TimeGateStrategy";
import { encodeHV } from "./service/hvClient";
import {
  HumanVerificationCtx,
  type HVContextValue,
  type HVSignals,
} from "./HumanVerificationContext";

type Props = {
  children: React.ReactNode;
  minDwellMs?: number;
  turnstileSiteKey?: string | undefined;
};

export function HumanVerificationProvider({
  children,
  minDwellMs = 2500,
  turnstileSiteKey,
}: Props) {
  const [touched, setTouched] = useState(false);
  const [pointerMoves, setPointerMoves] = useState(0);
  const [honeypotFilled, setHoneypotFilled] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const gate = useMemo(() => createTimeGate(minDwellMs), [minDwellMs]);
  const startedAtRef = useRef<number>(gate.startedAt);

  const startGate = useCallback(() => setTouched(true), []);

  React.useEffect(() => {
    const onMove = () => setPointerMoves((n) => n + 1);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const dwellMs = Math.max(0, Date.now() - startedAtRef.current);
  const captchaEnabled = Boolean(turnstileSiteKey);

  const signals: HVSignals = {
    dwellMs,
    touched,
    pointerMoves,
    startedAt: startedAtRef.current,
    honeypotFilled,
    captchaProvider: captchaEnabled ? "turnstile" : undefined,
    captchaToken,
  };

  const canSubmit =
    gate.isOpen() &&
    touched &&
    !honeypotFilled &&
    (!captchaEnabled || !!captchaToken);

  const hvToken = canSubmit ? encodeHV(signals) : null;

  const registerHoneypot = (name?: string) =>
    createHoneypotProps((filled) => setHoneypotFilled(filled), name);

  const refresh = () => {
    setTouched(false);
    setPointerMoves(0);
    setHoneypotFilled(false);
    setCaptchaToken(null);
    startedAtRef.current = Date.now();
  };

  const value: HVContextValue = {
    ready: true,
    canSubmit,
    signals,
    hvToken,
    startGate,
    registerHoneypot,
    setCaptchaToken,
    refresh,
    captchaEnabled,
  };

  return (
    <HumanVerificationCtx.Provider value={value}>
      {children}
    </HumanVerificationCtx.Provider>
  );
}
