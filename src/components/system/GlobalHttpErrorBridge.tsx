import { useGlobalHttpErrors } from "@/hooks/useGlobalHttpErrors";

/** Passive listener mounted once to wire global HTTP errors to routing */
export default function GlobalHttpErrorBridge() {
  useGlobalHttpErrors();
  return null;
}
