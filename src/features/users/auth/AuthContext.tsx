import React, { useEffect, useMemo, useState } from "react";
import { TOKEN_KEY, computeState, type AuthState } from "./helpers";
import { AuthContext, type AuthContextValue } from "./context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() =>
    computeState(localStorage.getItem(TOKEN_KEY))
  );

  const login = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setState(computeState(token));
    window.dispatchEvent(new Event("auth-changed"));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState(computeState(null));
    window.dispatchEvent(new Event("auth-changed"));
    // Always send the user to Home after logout to avoid stale/error pages
    if (location.pathname !== "/") {
      // avoid adding an extra history entry
      window.history.replaceState(null, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY)
        setState(computeState(localStorage.getItem(TOKEN_KEY)));
    };
    const onAuthChanged = () =>
      setState(computeState(localStorage.getItem(TOKEN_KEY)));
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChanged as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "auth-changed",
        onAuthChanged as EventListener
      );
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider; // <-- default export (component only)
