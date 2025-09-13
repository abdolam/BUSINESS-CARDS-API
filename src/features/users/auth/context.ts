import React from "react";
import type { AuthState } from "./helpers";

export type AuthContextValue = AuthState & {
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);
