import { ParseIssue, UploadNotice } from "../types";

interface Props {
  notice: UploadNotice | null;
  warnings: ParseIssue[];
  loading: boolean;
  onUpload: (file: File) => void;
  onDownloadTemplate: () => void;
  canUpload: boolean;
  permissionHint?: string;
}

export function UploadPanel({ notice, warnings, loading, onUpload, onDownloadTemplate, canUpload, permissionHint }: Props) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">Upload & Guide</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">数据上传与说明区</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">支持 CSV / Excel 浏览器本地解析。未上传时展示示例数据；上传成功后会自动刷新整页并保存到 localStorage。</p>

          <div className="mt-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,251,255,1),_rgba(255,255,255,1))] p-5">
            <div className="flex flex-wrap items-center gap-3">
              <label className={`inline-flex cursor-pointer rounded-full px-5 py-3 text-sm font-semibold transition ${loading ? "bg-slate-300 text-white" : "bg-slate-950 text-white hover:bg-slate-800"}`}>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  disabled={loading || !canUpload}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUpload(file);
                    event.currentTarget.value = "";
                  }}
                />
                {!canUpload ? "当前权限不可上传" : loading ? "解析中..." : "上传 Excel / CSV"}
              </label>
              <button type="button" onClick={onDownloadTemplate} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                下载模板 CSV
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "支持中文字段和英文别名自动映射",
                "浏览器本地解析，不上传服务器",
                "自动数值清洗、忽略空行、补齐衍生指标",
                "上传成功后自动保存最近一次数据",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>

            {!canUpload && permissionHint ? (
              <div className="mt-4 rounded-[20px] border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
                {permissionHint}
              </div>
            ) : null}
          </div>

          {notice ? (
            <div className={`mt-4 rounded-[24px] px-5 py-4 text-sm ${notice.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-900" : notice.type === "error" ? "border border-slate-300 bg-slate-100 text-slate-900" : "border border-brand-200 bg-brand-50 text-brand-900"}`}>
              <p className="font-semibold">{notice.title}</p>
              <p className="mt-1 leading-6">{notice.detail}</p>
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="mt-4 rounded-[24px] border border-slate-300 bg-slate-50 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">解析提示</p>
              <div className="mt-3 max-h-48 space-y-2 overflow-auto pr-1 text-sm text-slate-600">
                {warnings.map((warning, index) => (
                  <p key={`${warning.row}-${index}`}>第 {warning.row} 行：{warning.message}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-950">字段模板说明</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            建议文件至少包含：日期、平台、店铺、访客数、成交买家数、成交订单数、成交金额、退款金额、推广费、货款成本、快递成本、平台扣费、人员成本、其它分摊。
          </p>
          <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">支持映射示例</p>
            <div className="mt-3 grid gap-2">
              <span>`日期 -> date`</span>
              <span>`访客数 -> visitors / uv`</span>
              <span>`成交金额 -> revenue / gmv`</span>
              <span>`推广费占比 -> adSpendRatio / 净费比`</span>
              <span>`净利润率 -> netProfitRate`</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
