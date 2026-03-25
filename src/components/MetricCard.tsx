import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

interface MetricCardProps {
  title: string;
  value: number;
  delta?: number;
  type: "number" | "currency" | "percent";
}

const byType = (value: number, type: MetricCardProps["type"]) => {
  if (type === "currency") return formatCurrency(value);
  if (type === "percent") return formatPercent(value);
  return formatNumber(value);
};

export function MetricCard({ title, value, delta = 0, type }: MetricCardProps) {
  const isUp = delta >= 0;
  return (
    <article className="group rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_60px_rgba(37,99,235,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 lg:text-[2.25rem]">
            {byType(value, type)}
          </p>
        </div>
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${isUp ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-600"}`}>
          <span className={`text-base font-semibold ${isUp ? "" : "rotate-180"}`}>↑</span>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`font-semibold ${isUp ? "text-brand-600" : "text-slate-700"}`}>
          {isUp ? "+" : ""}
          {formatPercent(delta)}
        </span>
        <span className="text-slate-500">日环比</span>
      </div>
    </article>
  );
}
