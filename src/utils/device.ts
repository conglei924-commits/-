import { AUTH_STORAGE_KEYS } from "../config/authConfig";

const createDeviceId = () => {
  const random = Math.random().toString(36).slice(2, 8);
  return `dev_${random}`;
};

export const getOrCreateDeviceId = () => {
  const existing = localStorage.getItem(AUTH_STORAGE_KEYS.deviceId);
  if (existing) return existing;
  const next = createDeviceId();
  localStorage.setItem(AUTH_STORAGE_KEYS.deviceId, next);
  return next;
};

