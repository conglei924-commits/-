interface Props {
  message: string;
}

export function AccessDenied({ message }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff,_#eef4fb)] px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-300 bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Access Restricted</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">当前无权限访问</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{message}</p>
        <p className="mt-4 text-sm leading-7 text-slate-500">如需继续使用，请联系提供方重新获取有效授权码或新的访问链接。</p>
      </div>
    </div>
  );
}

