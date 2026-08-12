import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearToken, getToken, setToken as persistToken, setUnauthorizedHandler } from "../api/client";

// Centralizes "are we logged in" state. Reads the token from localStorage on
// boot so a page refresh doesn't bounce the user back to /login, and wires
// itself up to the API client's 401 handler so an expired/invalid token
// anywhere in the app (not just at login) forces a logout + redirect.

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const login = (newToken: string) => {
    persistToken(newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
  };

  // Any API call that gets a 401 (expired/invalid JWT) should log the user
  // out immediately rather than leaving stale UI state around.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: token !== null, login, logout }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
