import { useEffect, useMemo, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { MetricCard } from "./components/MetricCard";
import { TrendChartSection } from "./components/TrendChartSection";
import { CostProfitSection } from "./components/CostProfitSection";
import { RefundRiskSection } from "./components/RefundRiskSection";
import { FunnelSection } from "./components/FunnelSection";
import { UploadPanel } from "./components/UploadPanel";
import { mockDataset, platformStoreOptions } from "./data/mockData";
import { DashboardDataset, DailyMetrics, MetricOption, UploadNotice } from "./types";
import { AuthProvider } from "./context/AuthContext";
import { AuthGate } from "./components/auth/AuthGate";
import { useAuth } from "./hooks/useAuth";
import { getInsights, getScopeRows, getTrendRows } from "./utils/calculations";
import { downloadTextFile } from "./utils/download";
import { buildCsvText, parseDataFile, templateHeaders, templateRows } from "./utils/fileParser";
import { formatCurrency, formatDateRangeLabel, formatPercent } from "./utils/format";
import { clearStoredDataset, loadStoredDataset, saveStoredDataset } from "./utils/storage";

const metricOptions: MetricOption[] = [
  { key: "visitors", label: "访客数趋势", type: "number", color: "#cbd5e1" },
  { key: "buyers", label: "成交买家数趋势", type: "number", color: "#93c5fd" },
  { key: "orders", label: "成交订单数趋势", type: "number", color: "#60a5fa" },
  { key: "revenue", label: "成交金额趋势", type: "currency", color: "#2563eb" },
  { key: "conversionRate", label: "成交转化率趋势", type: "percent", color: "#1d4ed8" },
  { key: "aov", label: "客单价趋势", type: "currency", color: "#3b82f6" },
  { key: "netProfit", label: "净利润趋势", type: "currency", color: "#1e40af" },
  { key: "netProfitRate", label: "净利润率趋势", type: "percent", color: "#475569" },
];

const metricCards: Array<{ title: string; key: keyof DailyMetrics; type: "number" | "currency" | "percent" }> = [
  { title: "访客数", key: "visitors", type: "number" as const },
  { title: "成交买家数", key: "buyers", type: "number" as const },
  { title: "成交订单数", key: "orders", type: "number" as const },
  { title: "成交金额", key: "revenue", type: "currency" as const },
  { title: "客单价", key: "aov", type: "currency" as const },
  { title: "成交转化率", key: "conversionRate", type: "percent" as const },
  { title: "净利润", key: "netProfit", type: "currency" as const },
  { title: "净利润率", key: "netProfitRate", type: "percent" as const },
];

function getInitialDataset(): DashboardDataset {
  return loadStoredDataset() ?? mockDataset;
}

function getInitialScope(dataset: DashboardDataset) {
  const first = dataset.rows[0];
  return {
    platform: first?.platform ?? platformStoreOptions[0].platform,
    store: first?.store ?? platformStoreOptions[0].stores[0],
  };
}

function DashboardApp() {
  const { user, signOut } = useAuth();
  const isFullAccess = user?.accessLevel === "full";
  const [dataset, setDataset] = useState<DashboardDataset>(getInitialDataset);
  const [platform, setPlatform] = useState(() => getInitialScope(getInitialDataset()).platform);
  const [store, setStore] = useState(() => getInitialScope(getInitialDataset()).store);
  const [trendRange, setTrendRange] = useState<7 | 15 | 30>(15);
  const [activeMetric, setActiveMetric] = useState<MetricOption>(metricOptions[3]);
  const [refundMetric, setRefundMetric] = useState<"refundAmount" | "refundRate">("refundAmount");
  const [refundRange, setRefundRange] = useState<7 | 15 | 30>(15);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<UploadNotice | null>(null);
  const [warnings, setWarnings] = useState<{ row: number; message: string }[]>([]);

  const activeDataset = isFullAccess ? dataset : mockDataset;

  const scopeRows = useMemo(() => {
    const rows = getScopeRows(activeDataset.rows, platform, store);
    return rows.length > 0 ? rows : getScopeRows(activeDataset.rows, platformStoreOptions[0].platform, platformStoreOptions[0].stores[0]);
  }, [activeDataset.rows, platform, store]);

  const current = scopeRows[scopeRows.length - 1] as DailyMetrics | undefined;
  const trendRows = useMemo(() => getTrendRows(scopeRows, trendRange), [scopeRows, trendRange]);
  const refundRows = useMemo(() => getTrendRows(scopeRows, refundRange), [scopeRows, refundRange]);
  const insights = useMemo(() => (current ? getInsights(current, trendRows.length > 1 ? trendRows : scopeRows.slice(-trendRange)) : []), [current, trendRows, scopeRows, trendRange]);

  useEffect(() => {
    if (!isFullAccess) return;
    saveStoredDataset(dataset);
  }, [dataset, isFullAccess]);

  const executiveStats = current
    ? [
        ["退后交易额", formatCurrency(current.netRevenueAfterRefund)],
        ["总成本", formatCurrency(current.adSpend + current.goodsCost + current.shippingCost + current.platformFee + current.laborCost + current.otherAllocation)],
        ["退款金额", formatCurrency(current.refundAmount)],
        ["推广费占比", formatPercent(current.adSpendRatio)],
      ]
    : [];

  const handlePlatformChange = (value: string) => {
    setPlatform(value);
    const nextStores = platformStoreOptions.find((item) => item.platform === value)?.stores ?? [];
    setStore(nextStores[0] ?? "");
  };

  const handleUpload = async (file: File) => {
    if (!isFullAccess) {
      setNotice({ type: "info", title: "当前权限不可上传", detail: "当前为 demo 权限，只能查看示例数据；上传功能需要 full 权限。" });
      return;
    }
    try {
      setLoading(true);
      setNotice({ type: "info", title: "正在解析文件", detail: "文件解析与字段映射都在浏览器本地完成。" });
      const result = await parseDataFile(file);
      const nextDataset: DashboardDataset = {
        rows: result.rows,
        sourceType: "uploaded",
        sourceName: result.sourceName,
        updatedAt: new Date().toISOString(),
      };
      setDataset(nextDataset);
      setPlatform(result.rows[0]?.platform ?? platformStoreOptions[0].platform);
      setStore(result.rows[0]?.store ?? platformStoreOptions[0].stores[0]);
      setWarnings(result.warnings);
      setNotice({
        type: "success",
        title: "文件解析成功",
        detail: `已导入 ${result.rows.length} 条日报记录，页面已使用上传数据刷新。`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        title: "文件解析失败",
        detail: error instanceof Error ? error.message : "请检查文件格式、字段名和数据内容。",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!isFullAccess) {
      setNotice({ type: "info", title: "当前权限不可清除数据", detail: "当前为 demo 权限，只能查看示例数据；清除本地数据需要 full 权限。" });
      return;
    }
    clearStoredDataset();
    setDataset(mockDataset);
    setPlatform(platformStoreOptions[0].platform);
    setStore(platformStoreOptions[0].stores[0]);
    setWarnings([]);
    setNotice({
      type: "info",
      title: "已恢复示例数据",
      detail: "本地上传记录已清除，当前页面重新回到默认演示模式。",
    });
  };

  const handleDownloadTemplate = () => {
    downloadTextFile("ecommerce-profit-template.csv", buildCsvText(templateHeaders, templateRows));
  };

  const handleExportCurrent = () => {
    if (!isFullAccess) {
      setNotice({ type: "info", title: "当前权限不可导出数据", detail: "当前为 demo 权限，只能查看示例数据；导出功能需要 full 权限。" });
      return;
    }
    const rows = scopeRows.map((row) => [
      row.date,
      row.platform,
      row.store,
      row.visitors,
      row.buyers,
      row.orders,
      row.aov,
      row.revenue,
      row.conversionRate,
      row.netRevenueAfterRefund,
      row.refundAmount,
      row.refundRate,
      row.adSpend,
      row.adSpendRatio,
      row.goodsCost,
      row.shippingCost,
      row.platformFee,
      row.laborCost,
      row.otherAllocation,
      row.netProfit,
      row.netProfitRate,
    ]);
    downloadTextFile(`dashboard-${platform}-${store}.csv`, buildCsvText(templateHeaders, rows));
  };

  const sourceLabel = isFullAccess
    ? dataset.sourceType === "mock"
      ? "示例数据模式"
      : `已上传文件：${dataset.sourceName}`
    : "示例数据模式（demo 权限）";
  const permissionHint = "当前为 demo 权限，只能查看示例或已授权内容；上传、导出和清除本地数据需要 full 权限。";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_26%),linear-gradient(180deg,_#f8fbff,_#eef4fb)] px-4 py-6 text-slate-900 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <HeaderBar
          platform={platform}
          store={store}
          scopeOptions={platformStoreOptions}
          dates={scopeRows.map((item) => item.date)}
          sourceLabel={sourceLabel}
          onPlatformChange={handlePlatformChange}
          onStoreChange={setStore}
          onExport={handleExportCurrent}
          onReset={handleReset}
          onSignOut={signOut}
          uploadNotice={notice}
          canExport={isFullAccess}
          canReset={isFullAccess}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <MetricCard key={card.key} title={card.title} value={current?.[card.key] ?? 0} delta={current?.dod?.[card.key]} type={card.type} />
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {executiveStats.map(([label, value]) => (
            <article key={label} className="rounded-[28px] border border-brand-100 bg-[linear-gradient(180deg,_rgba(239,246,255,0.95),_rgba(255,255,255,1))] px-5 py-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">{label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
            </article>
          ))}
        </section>

        <TrendChartSection rows={trendRows} options={metricOptions} activeMetric={activeMetric} range={trendRange} onMetricChange={setActiveMetric} onRangeChange={setTrendRange} />

        {current ? (
          <section className="grid gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-7">
              <CostProfitSection row={current} />
            </div>
            <div className="2xl:col-span-5">
              <RefundRiskSection rows={refundRows} current={current} insights={insights} metric={refundMetric} range={refundRange} onMetricChange={setRefundMetric} onRangeChange={setRefundRange} />
            </div>
          </section>
        ) : null}

        {current ? <FunnelSection row={current} /> : null}

        <UploadPanel notice={notice} warnings={warnings} loading={loading} onUpload={handleUpload} onDownloadTemplate={handleDownloadTemplate} canUpload={isFullAccess} permissionHint={permissionHint} />

        <footer className="rounded-[28px] border border-slate-200/80 bg-white/80 px-5 py-4 text-sm text-slate-500 shadow-soft">
          当前页面为纯前端实现，打开即可用，支持直接部署到 Vercel / Netlify / Cloudflare Pages。
          {` `}
          当前范围：{formatDateRangeLabel(scopeRows.map((item) => item.date))}。当前权限：{user?.accessLevel ?? "unknown"}。
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <DashboardApp />
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
