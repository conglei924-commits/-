import { AuthUser } from "../../types/auth";

export function AuthWatermark({ user }: { user: AuthUser }) {
  return (
    <div className="fixed bottom-4 right-4 z-40 rounded-[18px] border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-500 shadow-soft backdrop-blur">
      <div>已授权：{user.key}</div>
      <div>权限：{user.accessLevel}</div>
      <div>设备：{user.deviceId}</div>
    </div>
  );
}

