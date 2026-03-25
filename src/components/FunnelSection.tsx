import { DailyMetrics } from "../types";
import { formatNumber, formatPercent } from "../utils/format";

export function FunnelSection({ row }: { row: DailyMetrics }) {
  const buyerRate = row.visitors > 0 ? row.buyers / row.visitors : 0;
  const orderRate = row.buyers > 0 ? row.orders / row.buyers : 0;
  const stages = [
    { label: "访客数", value: row.visitors, rate: 1, width: "100%", color: "#cbd5e1" },
    { label: "成交买家数", value: row.buyers, rate: buyerRate, width: `${Math.max(34, buyerRate * 100)}%`, color: "#60a5fa" },
    { label: "成交订单数", value: row.orders, rate: orderRate, width: `${Math.max(24, buyerRate * orderRate * 100)}%`, color: "#1d4ed8" },
  ];

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">Funnel</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">经营漏斗区</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["买家转化率", formatPercent(buyerRate)],
          ["下单效率", formatPercent(orderRate)],
          ["综合成交转化率", formatPercent(row.conversionRate)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-5 pt-2">
            {stages.map((stage) => (
              <div key={stage.label} className="mx-auto flex h-[68px] items-center justify-center rounded-[18px] text-center font-semibold text-slate-950" style={{ width: stage.width, backgroundColor: stage.color }}>
                <div>
                  {stage.label} {formatNumber(stage.value)}
                  <div className="mt-1 text-xs font-medium text-slate-700">转化率 {formatPercent(stage.rate)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {stages.map((stage) => (
            <article key={stage.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{stage.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{formatNumber(stage.value)}</p>
              <span className="mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: `${stage.color}22`, color: stage.color }}>
                {formatPercent(stage.rate)}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
