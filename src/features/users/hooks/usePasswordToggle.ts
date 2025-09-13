import { useState, useCallback } from "react";

export function usePasswordToggle(initial = false) {
  const [shown, setShown] = useState<boolean>(initial);
  const toggle = useCallback(() => setShown((v) => !v), []);
  return { shown, toggle, setShown };
}
