import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { AuthResult, AuthStatus, AuthUser } from "../types/auth";
import { clearStoredAuthUser, getStoredAuthUser, setStoredAuthUser } from "../utils/authStorage";
import { getOrCreateDeviceId } from "../utils/device";
import {
  getUrlAccessKey,
  removeUrlAccessKey,
  validateAccessCode,
  validateStoredUser,
  validateUrlKey,
} from "../utils/auth";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  error: string;
  authorizeByCode: (code: string) => Promise<AuthResult>;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [deviceId] = useState(() => getOrCreateDeviceId());

  useEffect(() => {
    const storedResult = validateStoredUser(getStoredAuthUser());
    if (storedResult.ok) {
      setUser(storedResult.user);
      setStatus("authorized");
      return;
    }

    const urlKey = getUrlAccessKey();
    if (urlKey) {
      const urlResult = validateUrlKey(urlKey, deviceId);
      removeUrlAccessKey();
      if (urlResult.ok) {
        setStoredAuthUser(urlResult.user);
        setUser(urlResult.user);
        setStatus("authorized");
        return;
      }

      setError(urlResult.message);
      setStatus(urlResult.denied ? "denied" : "unauthorized");
      return;
    }

    setError(storedResult.denied ? storedResult.message : "");
    setStatus(storedResult.denied ? "denied" : "unauthorized");
  }, [deviceId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      authorizeByCode: async (code: string) => {
        const result = validateAccessCode(code, deviceId);
        if (result.ok) {
          setStoredAuthUser(result.user);
          setUser(result.user);
          setError("");
          setStatus("authorized");
        } else {
          setError(result.message);
          setStatus(result.denied ? "denied" : "unauthorized");
        }
        return result;
      },
      signOut: () => {
        clearStoredAuthUser();
        setUser(null);
        setError("");
        setStatus("unauthorized");
      },
    }),
    [deviceId, error, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

