import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DailyMetrics, MetricOption } from "../types";
import { formatCurrency, formatDateShort, formatNumber, formatPercent } from "../utils/format";

interface Props {
  rows: DailyMetrics[];
  options: MetricOption[];
  activeMetric: MetricOption;
  range: 7 | 15 | 30;
  onMetricChange: (option: MetricOption) => void;
  onRangeChange: (value: 7 | 15 | 30) => void;
}

const byType = (type: MetricOption["type"], value: number) => {
  if (type === "currency") return formatCurrency(value);
  if (type === "percent") return formatPercent(value);
  return formatNumber(value);
};

export function TrendChartSection({ rows, options, activeMetric, range, onMetricChange, onRangeChange }: Props) {
  if (rows.length === 0) {
    return (
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">趋势分析</h2>
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
          当前筛选范围没有可展示数据。
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">Trend Analysis</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">趋势分析区</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">支持按指标和时间范围切换，所有图表共用统一数据源，适合老板、客户和团队直接查看。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[7, 15, 30].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRangeChange(item as 7 | 15 | 30)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${range === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              近{item}天
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onMetricChange(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${activeMetric.key === option.key ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 h-[360px] rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,251,255,0.95),_rgba(255,255,255,1))] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <CartesianGrid stroke="#dbe5f1" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateShort} stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => byType(activeMetric.type, value)} />
            <Tooltip
              labelFormatter={(value) => `日期：${value}`}
              formatter={(value: number) => [byType(activeMetric.type, value), activeMetric.label]}
              contentStyle={{ borderRadius: 18, border: "1px solid #dbe5f1", boxShadow: "0 16px 40px rgba(15, 23, 42, 0.10)" }}
            />
            <Line type="monotone" dataKey={activeMetric.key} stroke={activeMetric.color} strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
