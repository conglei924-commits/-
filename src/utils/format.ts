export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatPercent = (value: number, digits = 2) =>
  `${((value || 0) * 100).toFixed(digits)}%`;

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value || 0);

export const formatDateShort = (value: string) => {
  const date = new Date(value);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
};

export const formatDateRangeLabel = (dates: string[]) => {
  if (dates.length === 0) return "暂无数据";
  return `${dates[0]} 至 ${dates[dates.length - 1]}`;
};
