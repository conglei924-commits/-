import { AuthConfigItem } from "../types/auth";

export const AUTH_STORAGE_KEYS = {
  authUser: "ecommerce-profit-dashboard:auth-user",
  deviceId: "ecommerce-profit-dashboard:device-id",
} as const;

export const ENABLE_DEMO_MODE = true;

export const ACCESS_CODE_WHITELIST: AuthConfigItem[] = [
  { key: "DEMO001", accessLevel: "demo", label: "演示版授权", enabled: true },
  { key: "VIP001", accessLevel: "full", label: "完整版授权", enabled: true },
  { key: "CLIENT_A", accessLevel: "full", label: "客户 A 授权", enabled: true },
];

export const URL_KEY_WHITELIST: AuthConfigItem[] = [
  { key: "alpha", accessLevel: "full", label: "Alpha Link", enabled: true },
  { key: "beta", accessLevel: "demo", label: "Beta Demo Link", enabled: true },
];

