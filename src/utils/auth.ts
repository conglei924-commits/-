import {
  ACCESS_CODE_WHITELIST,
  ENABLE_DEMO_MODE,
  URL_KEY_WHITELIST,
} from "../config/authConfig";
import { AuthConfigItem, AuthResult, AuthUser } from "../types/auth";

// 这是一个前端权限门槛方案，用于控制分发和降低滥用，不是强安全方案。
// 逻辑尽量保持纯函数化，便于未来升级成后端鉴权。

const findEnabledItem = (key: string, list: AuthConfigItem[]) =>
  list.find((item) => item.enabled && item.key.toLowerCase() === key.trim().toLowerCase());

export const getUrlAccessKey = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("key")?.trim() ?? "";
};

export const removeUrlAccessKey = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("key");
  window.history.replaceState({}, "", url.toString());
};

export const createAuthUser = (item: AuthConfigItem, deviceId: string): AuthUser => ({
  key: item.key,
  accessLevel: item.accessLevel,
  deviceId,
  authorizedAt: new Date().toISOString(),
});

export const validateAccessCode = (input: string, deviceId: string): AuthResult => {
  const item = findEnabledItem(input, ACCESS_CODE_WHITELIST);
  if (!item) {
    return { ok: false, message: "授权码无效，请检查后重试。" };
  }
  if (item.accessLevel === "demo" && !ENABLE_DEMO_MODE) {
    return { ok: false, message: "当前演示权限已关闭。", denied: true };
  }
  return { ok: true, user: createAuthUser(item, deviceId) };
};

export const validateUrlKey = (input: string, deviceId: string): AuthResult => {
  const item = findEnabledItem(input, URL_KEY_WHITELIST);
  if (!item) {
    return { ok: false, message: "当前分享链接未授权或已失效。" };
  }
  if (item.accessLevel === "demo" && !ENABLE_DEMO_MODE) {
    return { ok: false, message: "当前演示权限已关闭。", denied: true };
  }
  return { ok: true, user: createAuthUser(item, deviceId) };
};

export const validateStoredUser = (user: AuthUser | null): AuthResult => {
  if (!user) {
    return { ok: false, message: "尚未授权。" };
  }

  const accessItem =
    findEnabledItem(user.key, ACCESS_CODE_WHITELIST) ??
    findEnabledItem(user.key, URL_KEY_WHITELIST);

  if (!accessItem) {
    return { ok: false, message: "当前授权已停用，请重新验证。", denied: true };
  }

  if (accessItem.accessLevel === "demo" && !ENABLE_DEMO_MODE) {
    return { ok: false, message: "当前演示权限已关闭。", denied: true };
  }

  return {
    ok: true,
    user: {
      ...user,
      accessLevel: accessItem.accessLevel,
    },
  };
};

export const isFullAccess = (user: AuthUser | null) => user?.accessLevel === "full";
