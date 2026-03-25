import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DailyMetrics } from "../types";
import { getTotalCost } from "../utils/calculations";
import { formatCurrency, formatPercent } from "../utils/format";

const colors = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#cbd5e1"];

export function CostProfitSection({ row }: { row: DailyMetrics }) {
  const totalCost = getTotalCost(row);
  const costItems = [
    { name: "推广费", value: row.adSpend },
    { name: "货款成本", value: row.goodsCost },
    { name: "快递成本", value: row.shippingCost },
    { name: "平台扣费", value: row.platformFee },
    { name: "人员成本", value: row.laborCost },
    { name: "其它分摊", value: row.otherAllocation },
  ];
  const compareData = [
    { name: "成交金额", value: row.revenue, color: "#93c5fd" },
    { name: "退后交易额", value: row.netRevenueAfterRefund, color: "#3b82f6" },
    { name: "总成本", value: totalCost, color: "#475569" },
    { name: "净利润", value: row.netProfit, color: "#1d4ed8" },
  ];

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">Cost & Profit</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">成本与利润结构区</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">总成本和净利润采用统一公式自动计算。推广费占比口径为 推广费 / 退后交易额。</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["推广费", formatCurrency(row.adSpend)],
          ["推广费占比", formatPercent(row.adSpendRatio)],
          ["总成本", formatCurrency(totalCost)],
          ["净利润", formatCurrency(row.netProfit)],
          ["净利润率", formatPercent(row.netProfitRate)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-semibold text-slate-950">成本构成饼图</h3>
          <p className="mt-1 text-sm text-slate-500">观察成本结构和利润侵蚀来源。</p>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costItems} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3}>
                  {costItems.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} contentStyle={{ borderRadius: 18, border: "1px solid #dbe5f1" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {costItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-semibold text-slate-950">收入 / 成本 / 利润对比</h3>
          <p className="mt-1 text-sm text-slate-500">展示收入、退后交易额、总成本和净利润的结构关系。</p>
          <div className="mt-4 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} contentStyle={{ borderRadius: 18, border: "1px solid #dbe5f1" }} />
                <Bar dataKey="value" radius={[16, 16, 0, 0]}>
                  {compareData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
