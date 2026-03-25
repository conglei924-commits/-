import { FormEvent, useState } from "react";

interface Props {
  error?: string;
  onSubmit: (code: string) => Promise<void>;
}

export function AuthScreen({ error, onSubmit }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit(code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff,_#eef4fb)] px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-600">Authorized Access</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">访问验证</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          这是一个前端权限门槛方案，用于控制小范围分发和降低滥用，不是强安全方案。请输入访问码以继续进入看板。
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
            <span className="text-xs font-medium text-slate-500">授权码</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="请输入访问码"
              className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
            />
          </label>

          {error ? (
            <div className="rounded-[20px] border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "验证中..." : "进入看板"}
          </button>
        </form>
      </div>
    </div>
  );
}

