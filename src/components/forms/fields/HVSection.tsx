import { useHumanVerification } from "@/features/human-verification/useHumanVerification";
import HumanTurnstile from "@/features/human-verification/components/HumanTurnstile";
import { useMemo } from "react";

export default function HVSection() {
  const { captchaEnabled, signals } = useHumanVerification();
  const siteKey = useMemo(
    () => import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined,
    []
  );

  if (!captchaEnabled || !siteKey) return null;

  return (
    <div className="pt-2">
      <div className="turnstile-slot">
        <HumanTurnstile siteKey={siteKey} />
      </div>

      <input
        type="hidden"
        name="turnstileToken"
        value={signals?.captchaToken ?? ""}
      />
    </div>
  );
}
