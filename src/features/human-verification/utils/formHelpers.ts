import React from "react";
import { useHumanVerification } from "../useHumanVerification";
import type { HVContextValue } from "../HumanVerificationContext";

export function HiddenHoneypotField(): React.ReactElement | null {
  const hv = useHumanVerification() as HVContextValue;
  const hp = hv.registerHoneypot("website");
  return React.createElement(
    "div",
    { "aria-hidden": true },
    React.createElement("input", Object.assign({ type: "text" }, hp))
  );
}

export type CaptchaState = {
  token: string | null;
  setToken: (t: string | null) => void;
};

export function canSubmitWithCaptcha(token: string | null) {
  return typeof token === "string" && token.length > 0;
}
