import { ScopeOption, UploadNotice } from "../types";
import { formatDateRangeLabel } from "../utils/format";

interface HeaderBarProps {
  platform: string;
  store: string;
  scopeOptions: ScopeOption[];
  dates: string[];
  sourceLabel: string;
  onPlatformChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onExport: () => void;
  onReset: () => void;
  onSignOut: () => void;
  uploadNotice: UploadNotice | null;
  canExport: boolean;
  canReset: boolean;
}

export function HeaderBar({
  platform,
  store,
  scopeOptions,
  dates,
  sourceLabel,
  onPlatformChange,
  onStoreChange,
  onExport,
  onReset,
  onSignOut,
  uploadNotice,
  canExport,
  canReset,
}: HeaderBarProps) {
  const activeScope = scopeOptions.find((item) => item.platform === platform);

  return (
    <header className="rounded-[36px] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur xl:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-600">
            Commerce Analytics
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 xl:text-[3rem]">
            电商经营利润分析看板
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
            一个可直接分享和部署的经营 BI 页面，支持示例数据演示、CSV / Excel 本地上传、浏览器端解析与本地恢复。
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-brand-700">
              时间范围：{formatDateRangeLabel(dates)}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              数据来源：{sourceLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs font-medium text-slate-500">一级菜单：平台</span>
            <select
              value={platform}
              onChange={(event) => onPlatformChange(event.target.value)}
              className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
            >
              {scopeOptions.map((option) => (
                <option key={option.platform} value={option.platform}>
                  {option.platform}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs font-medium text-slate-500">二级菜单：店铺</span>
            <select
              value={store}
              onChange={(event) => onStoreChange(event.target.value)}
              className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
            >
              {activeScope?.stores.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onExport}
            disabled={!canExport}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            导出当前数据 CSV
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            清除本地数据并恢复示例
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:col-span-2"
          >
            退出授权
          </button>
        </div>
      </div>

      {uploadNotice ? (
        <div
          className={`mt-5 rounded-[24px] px-5 py-4 text-sm ${
            uploadNotice.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : uploadNotice.type === "error"
                ? "border border-slate-300 bg-slate-100 text-slate-900"
                : "border border-brand-200 bg-brand-50 text-brand-900"
          }`}
        >
          <p className="font-semibold">{uploadNotice.title}</p>
          <p className="mt-1 leading-6">{uploadNotice.detail}</p>
        </div>
      ) : null}
    </header>
  );
}
