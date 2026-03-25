import { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { AccessDenied } from "./AccessDenied";
import { AuthScreen } from "./AuthScreen";
import { AuthWatermark } from "./AuthWatermark";

export function AuthGate({ children }: { children: ReactNode }) {
  const { status, user, error, authorizeByCode } = useAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fbff,_#eef4fb)] text-sm text-slate-500">
        正在校验访问权限...
      </div>
    );
  }

  if (status === "denied") {
    return <AccessDenied message={error || "当前授权无效或已停用。"} />;
  }

  if (status !== "authorized" || !user) {
    return <AuthScreen error={error} onSubmit={async (code) => void authorizeByCode(code)} />;
  }

  return (
    <>
      {children}
      <AuthWatermark user={user} />
    </>
  );
}
