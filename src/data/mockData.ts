import { DashboardDataset, DailyMetrics, ScopeOption } from "../types";
import { recalculateDataset } from "../utils/calculations";

export const platformStoreOptions: ScopeOption[] = [
  { platform: "抖音", stores: ["抖音旗舰店", "抖音直播店", "抖音精选店"] },
  { platform: "京东", stores: ["京东自营店", "京东旗舰店"] },
  { platform: "淘宝", stores: ["淘宝企业店", "淘宝C店"] },
  { platform: "拼多多", stores: ["拼多多旗舰店", "拼多多专营店"] },
];

const scopeFactors = [
  { platform: "抖音", store: "抖音旗舰店", traffic: 1.08, spend: 1, fee: 1 },
  { platform: "抖音", store: "抖音直播店", traffic: 0.96, spend: 1.05, fee: 1 },
  { platform: "抖音", store: "抖音精选店", traffic: 0.88, spend: 0.98, fee: 1 },
  { platform: "京东", store: "京东自营店", traffic: 0.92, spend: 0.95, fee: 1.03 },
  { platform: "京东", store: "京东旗舰店", traffic: 0.86, spend: 1, fee: 1.02 },
  { platform: "淘宝", store: "淘宝企业店", traffic: 0.94, spend: 1.01, fee: 1 },
  { platform: "淘宝", store: "淘宝C店", traffic: 0.82, spend: 1.06, fee: 0.99 },
  { platform: "拼多多", store: "拼多多旗舰店", traffic: 1.02, spend: 1.04, fee: 1 },
  { platform: "拼多多", store: "拼多多专营店", traffic: 0.98, spend: 1.08, fee: 1 },
];

function createMockRows(): Omit<DailyMetrics, "dod" | "aov" | "conversionRate" | "netRevenueAfterRefund" | "refundRate" | "adSpendRatio" | "netProfit" | "netProfitRate">[] {
  const endDate = new Date("2026-03-25");
  return scopeFactors.flatMap((scope, scopeIndex) =>
    Array.from({ length: 30 }, (_, index) => {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - (29 - index));
      const weekly = index % 7;
      const visitors = Math.round(
        (3000 + index * 42) *
          (1 + weekly * 0.026) *
          (index >= 20 ? 1.07 : 1) *
          scope.traffic *
          (1 + scopeIndex * 0.015),
      );
      const buyers = Math.round(
        visitors *
          (0.059 + (weekly - 3) * 0.0018 + (index >= 22 ? -0.0015 : 0) + (scope.platform === "拼多多" ? 0.003 : 0)),
      );
      const orders = Math.round(buyers * (1.08 + (weekly >= 5 ? 0.05 : 0.018)));
      const revenue = Math.round(
        orders * (185 + weekly * 3.6 + (index >= 15 ? 6 : 0)) * (1 + scopeIndex * 0.012),
      );
      const refundAmount = Math.round(
        revenue *
          (0.045 + (weekly === 0 ? 0.008 : 0) + (index >= 24 ? 0.006 : 0) + (scope.platform === "拼多多" ? 0.0035 : 0)),
      );
      return {
        date: date.toISOString().slice(0, 10),
        platform: scope.platform,
        store: scope.store,
        visitors,
        buyers,
        orders,
        revenue,
        refundAmount,
        adSpend: Math.round(revenue * (0.128 + (weekly - 2) * 0.0035 + (index >= 20 ? 0.008 : 0)) * scope.spend),
        goodsCost: Math.round(revenue * 0.392),
        shippingCost: Math.round(orders * (12.5 + (weekly >= 5 ? 0.8 : 0.3)) * (scope.platform === "京东" ? 1.05 : 1)),
        platformFee: Math.round(revenue * (0.052 + (scope.platform === "京东" ? 0.003 : 0)) * scope.fee),
        laborCost: Math.round((1680 + index * 20 + weekly * 34) * (1 + scopeIndex * 0.02)),
        otherAllocation: Math.round((980 + weekly * 42 + (index >= 18 ? 120 : 0)) * (1 + scopeIndex * 0.016)),
      };
    }),
  );
}

export const mockDataset: DashboardDataset = {
  rows: recalculateDataset(createMockRows()),
  sourceType: "mock",
  sourceName: "示例经营数据",
  updatedAt: new Date("2026-03-25T09:30:00").toISOString(),
};
