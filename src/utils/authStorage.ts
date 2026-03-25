import { AUTH_STORAGE_KEYS } from "../config/authConfig";
import { AuthUser } from "../types/auth";

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.authUser);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const setStoredAuthUser = (user: AuthUser) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.authUser, JSON.stringify(user));
};

export const clearStoredAuthUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.authUser);
};

