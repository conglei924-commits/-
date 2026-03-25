export type MetricKey =
  | "visitors"
  | "buyers"
  | "orders"
  | "aov"
  | "revenue"
  | "conversionRate"
  | "netRevenueAfterRefund"
  | "refundAmount"
  | "refundRate"
  | "adSpend"
  | "adSpendRatio"
  | "goodsCost"
  | "shippingCost"
  | "platformFee"
  | "laborCost"
  | "otherAllocation"
  | "netProfit"
  | "netProfitRate";

export type DataSourceType = "mock" | "uploaded";
export type RiskLevel = "正常" | "关注" | "风险";

export interface DailyMetrics {
  date: string;
  platform: string;
  store: string;
  visitors: number;
  buyers: number;
  orders: number;
  aov: number;
  revenue: number;
  conversionRate: number;
  netRevenueAfterRefund: number;
  refundAmount: number;
  refundRate: number;
  adSpend: number;
  adSpendRatio: number;
  goodsCost: number;
  shippingCost: number;
  platformFee: number;
  laborCost: number;
  otherAllocation: number;
  netProfit: number;
  netProfitRate: number;
  dod?: Partial<Record<MetricKey, number>>;
}

export interface DashboardDataset {
  rows: DailyMetrics[];
  sourceType: DataSourceType;
  sourceName: string;
  updatedAt: string;
}

export interface MetricOption {
  key: MetricKey;
  label: string;
  type: "number" | "currency" | "percent";
  color: string;
}

export interface InsightWarning {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
}

export interface UploadNotice {
  type: "success" | "error" | "info";
  title: string;
  detail: string;
}

export interface ParseIssue {
  row: number;
  message: string;
}

export interface ParseResult {
  rows: DailyMetrics[];
  sourceName: string;
  warnings: ParseIssue[];
}

export interface ScopeOption {
  platform: string;
  stores: string[];
}
