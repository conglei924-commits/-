import * as XLSX from "xlsx";
import { DailyMetrics, ParseIssue, ParseResult } from "../types";
import { recalculateDataset } from "./calculations";

const headerMap: Record<string, keyof Omit<DailyMetrics, "dod">> = {
  日期: "date",
  date: "date",
  day: "date",
  平台: "platform",
  platform: "platform",
  店铺: "store",
  store: "store",
  shop: "store",
  访客数: "visitors",
  visitors: "visitors",
  uv: "visitors",
  成交买家数: "buyers",
  buyers: "buyers",
  paid_buyers: "buyers",
  成交订单数: "orders",
  orders: "orders",
  order_count: "orders",
  客单价: "aov",
  aov: "aov",
  成交金额: "revenue",
  revenue: "revenue",
  gmv: "revenue",
  成交转化率: "conversionRate",
  conversionrate: "conversionRate",
  conversion_rate: "conversionRate",
  退后交易额: "netRevenueAfterRefund",
  netrevenueafterrefund: "netRevenueAfterRefund",
  refundnetrevenue: "netRevenueAfterRefund",
  退款金额: "refundAmount",
  refundamount: "refundAmount",
  refund_amount: "refundAmount",
  退款率: "refundRate",
  refundrate: "refundRate",
  refund_rate: "refundRate",
  推广费: "adSpend",
  adspend: "adSpend",
  ad_spend: "adSpend",
  推广费占比: "adSpendRatio",
  adspendratio: "adSpendRatio",
  净费比: "adSpendRatio",
  货款成本: "goodsCost",
  goodscost: "goodsCost",
  goods_cost: "goodsCost",
  快递成本: "shippingCost",
  shippingcost: "shippingCost",
  shipping_cost: "shippingCost",
  平台扣费: "platformFee",
  platformfee: "platformFee",
  platform_fee: "platformFee",
  人员成本: "laborCost",
  laborcost: "laborCost",
  labor_cost: "laborCost",
  其它分摊: "otherAllocation",
  otherallocation: "otherAllocation",
  other_allocation: "otherAllocation",
  净利润: "netProfit",
  netprofit: "netProfit",
  net_profit: "netProfit",
  净利润率: "netProfitRate",
  netprofitrate: "netProfitRate",
  net_profit_rate: "netProfitRate",
};

const requiredFields = ["date", "platform", "store", "visitors", "buyers", "orders", "revenue", "refundAmount", "adSpend", "goodsCost", "shippingCost", "platformFee", "laborCost", "otherAllocation"] as const;
const numericFields = ["visitors", "buyers", "orders", "aov", "revenue", "conversionRate", "netRevenueAfterRefund", "refundAmount", "refundRate", "adSpend", "adSpendRatio", "goodsCost", "shippingCost", "platformFee", "laborCost", "otherAllocation", "netProfit", "netProfitRate"] as const;

const normalizeHeader = (value: string) => value.replace(/\s+/g, "").replace(/[_-]/g, "_").toLowerCase();

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[,%￥¥,\s]/g, "");
    return cleaned ? Number(cleaned) : 0;
  }
  return 0;
};

const isRowEmpty = (row: Record<string, unknown>) => Object.values(row).every((value) => value === null || value === undefined || String(value).trim() === "");

export const parseDataFile = async (file: File): Promise<ParseResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const warnings: ParseIssue[] = [];
  const parsedRows = jsonRows
    .filter((row) => !isRowEmpty(row))
    .map((row, index) => {
      const next: Record<string, unknown> = {};
      Object.entries(row).forEach(([header, value]) => {
        const mapped = headerMap[normalizeHeader(header)] ?? headerMap[header];
        if (mapped) {
          next[mapped] = value;
        }
      });

      requiredFields.forEach((field) => {
        if (next[field] === undefined || next[field] === "") {
          warnings.push({ row: index + 2, message: `字段 ${field} 缺失，已使用默认值或跳过衍生计算。` });
        }
      });

      numericFields.forEach((field) => {
        if (field in next) {
          next[field] = toNumber(next[field]);
        }
      });

      const buyers = Number(next.buyers || 0);
      const visitors = Number(next.visitors || 0);
      const revenue = Number(next.revenue || 0);
      const refundAmount = Number(next.refundAmount || 0);

      if (!next.date) {
        throw new Error(`第 ${index + 2} 行缺少日期。`);
      }
      if (refundAmount > revenue) {
        warnings.push({ row: index + 2, message: "退款金额大于成交金额，请检查源数据。" });
      }
      if (buyers > visitors * 1.2) {
        warnings.push({ row: index + 2, message: "成交买家数明显高于访客数，请确认口径是否一致。" });
      }

      return {
        date: String(next.date),
        platform: String(next.platform || "未分组平台"),
        store: String(next.store || "未分组店铺"),
        visitors,
        buyers,
        orders: Number(next.orders || 0),
        revenue,
        refundAmount,
        adSpend: Number(next.adSpend || 0),
        goodsCost: Number(next.goodsCost || 0),
        shippingCost: Number(next.shippingCost || 0),
        platformFee: Number(next.platformFee || 0),
        laborCost: Number(next.laborCost || 0),
        otherAllocation: Number(next.otherAllocation || 0),
      };
    });

  if (parsedRows.length === 0) {
    throw new Error("文件中没有可解析的有效数据，请检查表头和内容。");
  }

  return {
    rows: recalculateDataset(parsedRows),
    sourceName: file.name,
    warnings,
  };
};

export const templateHeaders = [
  "日期",
  "平台",
  "店铺",
  "访客数",
  "成交买家数",
  "成交订单数",
  "客单价",
  "成交金额",
  "成交转化率",
  "退后交易额",
  "退款金额",
  "退款率",
  "推广费",
  "推广费占比",
  "货款成本",
  "快递成本",
  "平台扣费",
  "人员成本",
  "其它分摊",
  "净利润",
  "净利润率",
];

export const templateRows = [
  ["2026-03-24", "抖音", "抖音旗舰店", 4120, 332, 356, 193.2, 68779, 0.0806, 65112, 3667, 0.0533, 9576, 0.1471, 26904, 4450, 3577, 1976, 1120, 17509, 0.2689],
  ["2026-03-25", "抖音", "抖音旗舰店", 4184, 344, 334, 194.1, 64845, 0.0822, 60965, 3880, 0.0598, 9380, 0.1539, 25290, 4320, 3372, 1940, -127, 16790, 0.2754],
];

export const buildCsvText = (headers: string[], rows: (string | number)[][]) =>
  [headers.join(","), ...rows.map((row) => row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))].join("\n");
