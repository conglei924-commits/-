import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DailyMetrics, InsightWarning } from "../types";
import { formatCurrency, formatDateShort, formatNumber, formatPercent } from "../utils/format";
import { InsightPanel } from "./InsightPanel";

interface Props {
  rows: DailyMetrics[];
  current: DailyMetrics;
  insights: InsightWarning[];
  metric: "refundAmount" | "refundRate";
  range: 7 | 15 | 30;
  onMetricChange: (value: "refundAmount" | "refundRate") => void;
  onRangeChange: (value: 7 | 15 | 30) => void;
}

export function RefundRiskSection({ rows, current, insights, metric, range, onMetricChange, onRangeChange }: Props) {
  const isRate = metric === "refundRate";
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">Refund & Risk</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">退款与风险区</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["退款金额", formatCurrency(current.refundAmount)],
          ["退款率", formatPercent(current.refundRate)],
          ["退后交易额", formatCurrency(current.netRevenueAfterRefund)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">退款趋势</h3>
              <p className="mt-1 text-sm text-slate-500">支持查看退款金额或退款率的近期变化。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onMetricChange("refundAmount")} className={`rounded-full px-4 py-2 text-sm font-medium ${metric === "refundAmount" ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}>退款金额</button>
              <button type="button" onClick={() => onMetricChange("refundRate")} className={`rounded-full px-4 py-2 text-sm font-medium ${metric === "refundRate" ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}>退款率</button>
              {[7, 15, 30].map((item) => (
                <button key={item} type="button" onClick={() => onRangeChange(item as 7 | 15 | 30)} className={`rounded-full px-4 py-2 text-sm font-medium ${range === item ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}>
                  {item}天
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid stroke="#dbe5f1" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDateShort} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => (isRate ? formatPercent(value) : formatNumber(value))} />
                <Tooltip formatter={(value: number) => [isRate ? formatPercent(value) : formatCurrency(value), metric === "refundRate" ? "退款率" : "退款金额"]} contentStyle={{ borderRadius: 18, border: "1px solid #dbe5f1" }} />
                <Line type="monotone" dataKey={metric} stroke={isRate ? "#475569" : "#2563eb"} strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-semibold text-slate-950">洞察与风险提示</h3>
          <p className="mt-1 text-sm text-slate-500">由当前数据自动生成，不依赖人工写死结论。</p>
          <div className="mt-4">
            <InsightPanel insights={insights} />
          </div>
        </div>
      </div>
    </section>
  );
}
