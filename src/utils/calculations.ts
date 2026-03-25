import { DailyMetrics, InsightWarning, MetricKey } from "../types";

const round = (value: number, digits = 2) => {
  const base = 10 ** digits;
  return Math.round(value * base) / base;
};

export const getTotalCost = (row: Pick<DailyMetrics, "adSpend" | "goodsCost" | "shippingCost" | "platformFee" | "laborCost" | "otherAllocation">) =>
  row.adSpend + row.goodsCost + row.shippingCost + row.platformFee + row.laborCost + row.otherAllocation;

export const normalizeMetrics = (
  row: Omit<DailyMetrics, "dod" | "aov" | "conversionRate" | "netRevenueAfterRefund" | "refundRate" | "adSpendRatio" | "netProfit" | "netProfitRate">,
): Omit<DailyMetrics, "dod"> => {
  const revenue = Math.max(Number(row.revenue) || 0, 0);
  const refundAmount = Math.max(Number(row.refundAmount) || 0, 0);
  const netRevenueAfterRefund = Math.max(revenue - refundAmount, 0);
  const totalCost = getTotalCost(row);
  const netProfit = netRevenueAfterRefund - totalCost;
  const orders = Math.max(Number(row.orders) || 0, 0);
  const visitors = Math.max(Number(row.visitors) || 0, 0);
  const buyers = Math.max(Number(row.buyers) || 0, 0);

  return {
    ...row,
    visitors,
    buyers,
    orders,
    revenue,
    refundAmount,
    aov: round(orders > 0 ? revenue / orders : 0, 2),
    conversionRate: round(visitors > 0 ? buyers / visitors : 0, 4),
    netRevenueAfterRefund: round(netRevenueAfterRefund, 2),
    refundRate: round(revenue > 0 ? refundAmount / revenue : 0, 4),
    adSpendRatio: round(netRevenueAfterRefund > 0 ? row.adSpend / netRevenueAfterRefund : 0, 4),
    netProfit: round(netProfit, 2),
    netProfitRate: round(netRevenueAfterRefund > 0 ? netProfit / netRevenueAfterRefund : 0, 4),
  };
};

const dodValue = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 1;
  return (current - previous) / Math.abs(previous);
};

export const recalculateDataset = (
  rows: Omit<DailyMetrics, "dod" | "aov" | "conversionRate" | "netRevenueAfterRefund" | "refundRate" | "adSpendRatio" | "netProfit" | "netProfitRate">[],
): DailyMetrics[] =>
  rows
    .slice()
    .sort((a, b) => {
      const scopeCompare = `${a.platform}-${a.store}`.localeCompare(`${b.platform}-${b.store}`);
      if (scopeCompare !== 0) return scopeCompare;
      return a.date.localeCompare(b.date);
    })
    .map((row) => normalizeMetrics(row))
    .reduce<DailyMetrics[]>((acc, row) => {
      const previous = [...acc].reverse().find((item) => item.platform === row.platform && item.store === row.store);
      const dod = previous
        ? ({
            visitors: dodValue(row.visitors, previous.visitors),
            buyers: dodValue(row.buyers, previous.buyers),
            orders: dodValue(row.orders, previous.orders),
            aov: dodValue(row.aov, previous.aov),
            revenue: dodValue(row.revenue, previous.revenue),
            conversionRate: dodValue(row.conversionRate, previous.conversionRate),
            netRevenueAfterRefund: dodValue(row.netRevenueAfterRefund, previous.netRevenueAfterRefund),
            refundAmount: dodValue(row.refundAmount, previous.refundAmount),
            refundRate: dodValue(row.refundRate, previous.refundRate),
            adSpend: dodValue(row.adSpend, previous.adSpend),
            adSpendRatio: dodValue(row.adSpendRatio, previous.adSpendRatio),
            goodsCost: dodValue(row.goodsCost, previous.goodsCost),
            shippingCost: dodValue(row.shippingCost, previous.shippingCost),
            platformFee: dodValue(row.platformFee, previous.platformFee),
            laborCost: dodValue(row.laborCost, previous.laborCost),
            otherAllocation: dodValue(row.otherAllocation, previous.otherAllocation),
            netProfit: dodValue(row.netProfit, previous.netProfit),
            netProfitRate: dodValue(row.netProfitRate, previous.netProfitRate),
          } satisfies Partial<Record<MetricKey, number>>)
        : {};
      acc.push({ ...row, dod });
      return acc;
    }, []);

export const getScopeRows = (rows: DailyMetrics[], platform: string, store: string) =>
  rows.filter((row) => row.platform === platform && row.store === store);

export const getTrendRows = (rows: DailyMetrics[], range: 7 | 15 | 30) => rows.slice(-range);

export const getInsights = (current: DailyMetrics, rows: DailyMetrics[]): InsightWarning[] => {
  if (rows.length === 0) return [];
  const previous = rows[rows.length - 2];
  const avgRefundRate = rows.reduce((sum, item) => sum + item.refundRate, 0) / rows.length;
  const avgProfitRate = rows.reduce((sum, item) => sum + item.netProfitRate, 0) / rows.length;
  const avgConversion = rows.reduce((sum, item) => sum + item.conversionRate, 0) / rows.length;
  const costRatio = current.netRevenueAfterRefund > 0 ? getTotalCost(current) / current.netRevenueAfterRefund : 0;
  const list: InsightWarning[] = [];

  if (current.refundRate >= 0.12 || current.refundRate > avgRefundRate * 1.2) {
    list.push({
      id: "refund-high",
      level: "风险",
      title: "退款率偏高",
      description: `当前退款率高于阶段均值，建议排查商品体验、履约质量和售后原因。`,
    });
  }
  if (previous && current.adSpend > previous.adSpend && current.netProfit < previous.netProfit) {
    list.push({
      id: "spend-efficiency",
      level: "关注",
      title: "推广投入增加但利润走弱",
      description: `推广费持续增加，但净利润没有同步增长，投放效率需要复盘。`,
    });
  }
  if (previous && current.revenue > previous.revenue && current.netProfitRate < previous.netProfitRate) {
    list.push({
      id: "margin-pressure",
      level: "关注",
      title: "销售增长但利润率承压",
      description: `成交金额仍在增长，但净利润率回落，说明成本和退款正在侵蚀利润。`,
    });
  }
  if (previous && current.visitors > previous.visitors && current.conversionRate < previous.conversionRate) {
    list.push({
      id: "traffic-quality",
      level: "关注",
      title: "流量质量波动",
      description: `访客增长但成交转化率回落，建议检查投放人群、内容和落地页承接。`,
    });
  }
  if (costRatio >= 0.82) {
    list.push({
      id: "cost-pressure",
      level: "风险",
      title: "总成本占比偏高",
      description: `总成本已经达到退后交易额的高位区间，利润缓冲空间较小。`,
    });
  }
  if (current.netProfitRate >= avgProfitRate && current.conversionRate >= avgConversion) {
    list.push({
      id: "healthy",
      level: "正常",
      title: "经营质量稳定",
      description: `净利润率和转化率均高于当前阶段均值，整体经营效率保持健康。`,
    });
  }
  return list.slice(0, 6);
};
