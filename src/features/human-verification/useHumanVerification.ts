import { useContext } from "react";
import { HumanVerificationCtx } from "./HumanVerificationContext";

export function useHumanVerification() {
  const ctx = useContext(HumanVerificationCtx);
  if (!ctx)
    throw new Error(
      "useHumanVerification must be used within HumanVerificationProvider"
    );
  return ctx;
}
