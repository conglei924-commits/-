import { InsightWarning } from "../types";

const toneMap = {
  正常: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
  关注: "border-brand-200 bg-brand-50 text-brand-900",
  风险: "border-slate-300 bg-slate-100 text-slate-900",
};

export function InsightPanel({ insights }: { insights: InsightWarning[] }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
        当前周期暂无显著风险提示。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((item) => (
        <article key={item.id} className={`rounded-[24px] border px-5 py-4 ${toneMap[item.level]}`}>
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-base font-semibold">{item.title}</h4>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold">{item.level}</span>
          </div>
          <p className="mt-2 text-sm leading-6">{item.description}</p>
        </article>
      ))}
    </div>
  );
}
