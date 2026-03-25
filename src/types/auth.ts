export type AccessLevel = "demo" | "full";

export type AuthUser = {
  key: string;
  accessLevel: AccessLevel;
  deviceId: string;
  authorizedAt: string;
};

export type AuthConfigItem = {
  key: string;
  accessLevel: AccessLevel;
  label: string;
  enabled: boolean;
};

export type AuthStatus = "checking" | "authorized" | "unauthorized" | "denied";

export type AuthResult =
  | {
      ok: true;
      user: AuthUser;
    }
  | {
      ok: false;
      message: string;
      denied?: boolean;
    };

