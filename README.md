# 电商经营利润分析看板

一个可以直接部署为公开网址的纯前端 BI 看板项目，基于：

- Vite
- React
- TypeScript
- Tailwind CSS
- Recharts
- xlsx

项目特点：

- 默认自带完整 mock 数据，任何人打开页面都能立即看到完整 BI 看板效果
- 保留前端权限控制：URL 暗门 + 授权码 + localStorage + 设备标识水印
- 支持 CSV / Excel 上传，本地解析，不依赖后端
- 支持模板下载、当前数据导出、本地持久化恢复
- 可直接部署到 Vercel，得到公开访问网址

## 本地运行

```bash
npm install
npm run dev
```

本地开发完成后，可以直接打包：

```bash
npm run build
```

构建产物会输出到：

```bash
dist
```

## 项目结构

```text
ecommerce-profit-dashboard/
├─ package.json
├─ vite.config.ts
├─ .gitignore
├─ index.html
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ index.css
│  ├─ types.ts
│  ├─ types/
│  │  └─ auth.ts
│  ├─ config/
│  │  └─ authConfig.ts
│  ├─ context/
│  │  └─ AuthContext.tsx
│  ├─ hooks/
│  │  └─ useAuth.ts
│  ├─ data/
│  │  └─ mockData.ts
│  ├─ utils/
│  │  ├─ auth.ts
│  │  ├─ authStorage.ts
│  │  ├─ calculations.ts
│  │  ├─ device.ts
│  │  ├─ download.ts
│  │  ├─ fileParser.ts
│  │  ├─ format.ts
│  │  └─ storage.ts
│  └─ components/
│     ├─ HeaderBar.tsx
│     ├─ MetricCard.tsx
│     ├─ TrendChartSection.tsx
│     ├─ CostProfitSection.tsx
│     ├─ RefundRiskSection.tsx
│     ├─ FunnelSection.tsx
│     ├─ UploadPanel.tsx
│     ├─ InsightPanel.tsx
│     └─ auth/
│        ├─ AuthGate.tsx
│        ├─ AuthScreen.tsx
│        ├─ AccessDenied.tsx
│        └─ AuthWatermark.tsx
```

## 功能说明

### 1. 默认演示模式

页面首次打开时，自动展示完整 mock 电商经营数据：

- 核心指标
- 趋势分析
- 成本利润结构
- 退款风险
- 经营漏斗

所以即使别人没有上传任何文件，也能直接看到完整 BI 看板。

### 2. 权限控制

项目内置一套前端权限门槛方案：

- URL 暗门：例如 `?key=alpha`
- 授权码校验：输入白名单访问码后进入系统
- localStorage 持久化：授权成功后自动恢复
- 设备标识：生成 `deviceId`
- 右下角水印：显示授权标识、权限等级、设备号
- 权限分层：
  - `demo`：只能看示例数据
  - `full`：可上传、导出、清除本地数据

说明：

这是前端权限门槛方案，用于控制分发和降低滥用，不是强安全方案。

### 3. 本地文件上传

支持上传：

- `.csv`
- `.xlsx`
- `.xls`

特点：

- 浏览器本地解析
- 不上传服务器
- 自动字段映射
- 自动数值清洗
- 自动忽略空行
- 解析后刷新整个 dashboard

### 4. 模板下载

页面提供“下载模板 CSV”按钮。

模板包含：

- 中文字段表头
- 1~2 行示例数据

### 5. 当前数据导出

页面提供“导出当前数据 CSV”按钮。

导出的是当前平台 / 店铺筛选范围下正在展示的数据。

### 6. 本地持久化

上传成功后会自动保存到 localStorage。

下次打开页面时：

- 如果权限允许
- 且本地有最近上传的数据

则会自动恢复最近一次数据。

## 字段模板说明

### 推荐中文字段

- 日期
- 平台
- 店铺
- 访客数
- 成交买家数
- 成交订单数
- 客单价
- 成交金额
- 成交转化率
- 退后交易额
- 退款金额
- 退款率
- 推广费
- 推广费占比
- 货款成本
- 快递成本
- 平台扣费
- 人员成本
- 其它分摊
- 净利润
- 净利润率

### 支持英文别名示例

- `日期 -> date`
- `平台 -> platform`
- `店铺 -> store / shop`
- `访客数 -> visitors / uv`
- `成交买家数 -> buyers`
- `成交订单数 -> orders`
- `客单价 -> aov`
- `成交金额 -> revenue / gmv`
- `成交转化率 -> conversionRate / conversion_rate`
- `退后交易额 -> netRevenueAfterRefund`
- `退款金额 -> refundAmount / refund_amount`
- `退款率 -> refundRate / refund_rate`
- `推广费 -> adSpend / ad_spend`
- `推广费占比 -> adSpendRatio / 净费比`
- `货款成本 -> goodsCost / goods_cost`
- `快递成本 -> shippingCost / shipping_cost`
- `平台扣费 -> platformFee / platform_fee`
- `人员成本 -> laborCost / labor_cost`
- `其它分摊 -> otherAllocation / other_allocation`
- `净利润 -> netProfit / net_profit`
- `净利润率 -> netProfitRate / net_profit_rate`

## 业务口径

- 客单价 = 成交金额 / 成交订单数
- 退后交易额 = 成交金额 - 退款金额
- 总成本 = 推广费 + 货款成本 + 快递成本 + 平台扣费 + 人员成本 + 其它分摊
- 净利润 = 退后交易额 - 总成本
- 净利润率 = 净利润 / 退后交易额
- 推广费占比 = 推广费 / 退后交易额

即使上传文件中不包含这些衍生字段，页面也会在浏览器端自动计算。

## 傻瓜式部署教程（Vercel）

本项目默认推荐部署到：

https://vercel.com

部署成功后会自动生成一个公开网址，例如：

```text
https://xxx.vercel.app
```

任何人打开这个网址即可访问页面。

### 【1】注册账号

打开：

https://vercel.com

使用 GitHub、GitLab 或邮箱注册即可。

### 【2】部署方式

#### 方式 A（推荐）

1. 先把项目上传到 GitHub
2. 登录 Vercel
3. 点击 `New Project`
4. 选择你的 GitHub 仓库
5. 点击 `Deploy`

Vercel 会自动识别这是一个 Vite 项目，并自动构建部署。

#### 方式 B（更简单）

在项目目录执行：

```bash
npx vercel
```

首次执行时，按提示完成：

- 登录
- 选择项目目录
- 确认部署

之后 Vercel 会自动完成打包和发布。

### 【3】部署结果

部署成功后会得到类似：

```text
https://xxx.vercel.app
```

的公网地址。

### 【4】如何分享

把这个网址发给任何人即可使用。

对方打开后：

- 可以直接看默认示例数据
- 如果拿到授权码，可以进入系统
- 如果是 `full` 权限，还可以上传自己的 CSV / Excel 本地使用

## 分享边界

本项目采用：

- 静态站点
- 前端权限门槛
- 本地文件上传

明确不依赖：

- 后端
- 私有数据库
- 私有接口
- 需要鉴权的在线表格
- 金山文档在线读取

这意味着它非常适合：

- 小范围商业交付
- 私域客户演示
- 直接部署后通过公开链接分享

## 一句话总结

这就是一个可以直接：

1. `npm install`
2. `npm run build`
3. 部署到 Vercel
4. 获得 `https://xxx.vercel.app`
5. 把网址发给别人用

的完整纯前端电商 BI 看板项目。
