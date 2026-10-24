# 森林还债管家 · Forest Debt Manager

一个自用的负债还款管理桌面/网页应用：按**利率优先（雪崩法）**安排每月还款，并根据收入、固定支出和弹性生活开销，自动算出每月生活费、每周上限和每天上限。森林绿风格，数据只存在本机，不联网、不上传。

> 个人学习与自用项目，测算结果仅供参考，不构成任何理财建议；实际利率、最低还款额与还款日请以各平台官方 App 为准。

## 功能特性

- **负债平台台账**：登记花呗、招商信用卡、中信信用卡、微信分付、京东白条、抖音月付、朋友借款等平台的当前欠款、年利率、最低还款额、还款日与备注；支持新增、编辑、删除，可自定义每个平台的卡片配色。
- **还款计划**：按利率从高到低（雪崩法）逐月分配还款额，展示每月利息、本金、剩余余额、逐笔还清节点与整体进度。
- **预算规划**：填写每月还债额度后，结合收入与支出自动测算生活费额度、缓冲、每周上限、每天上限，并给出生活开销参考区间与状态提示；收入去向以环形饼图呈现。
- **收入账本**：记录固定月收入、副业收入，以及固定支出与弹性生活的各项明细。
- **本地存储**：全部数据保存在浏览器/应用本机 localStorage，不建服务端、不跨设备同步、不上传云端。

### 固定收支类目（金额可改，类目固定）

- 月收入：固定月收入 💰、其他副业 📈
- 固定支出：房租 🏠、水电 💡、宠物 🐱、吃饭 🍚、香烟 🚬、健身 💪
- 弹性生活：聚餐 🍻、充值 📱、油费 ⛽、衣服 👕、网购 🛒、停车 🅿️、其他 📦

### 计算口径

- 结余 = 月收入 − 固定支出
- 生活费额度 = 结余 − 每月还债
- 缓冲 = 生活费额度 − 弹性计划
- 每周上限 = 生活费额度 ÷ 4；每天上限 = 生活费额度 ÷ 30
- 状态：现金流健康 / 生活费偏紧 / 已无生活费空间 / 还债超出结余 / 弹性支出超支

## 技术栈

- 前端：React 19 + TypeScript + Vite 8
- 样式：Tailwind CSS v4 + shadcn/ui
- 路由：react-router-dom
- 图表：手写 SVG 环形饼图（另集成 echarts-for-react / recharts 供参考）
- 桌面壳：Electron 45 + electron-builder（Windows x64：NSIS 安装包 + 便携版单文件）
- 数据：React Context 全局状态 + localStorage 持久化

## 快速开始

环境要求：Node.js 20 及以上（推荐 22）、npm。

```bash
# 安装依赖
npm install

# 本地开发预览（默认端口 28417）
npm run dev
# 浏览器访问 http://localhost:28417/

# 类型检查
npm run typecheck

# 代码检查
npm run lint
```

## 构建产物

### 1. 本地网页版（Node 静态服务）

```bash
npm run build:standalone
```

产物落在 `standalone/app/`；`standalone/server.js` 仅用 Node 内置模块起静态服务（端口 28417），`standalone/启动还债管家.bat` 为一键启动脚本（仅 Windows）。

### 2. Electron 桌面版（Windows x64）

```bash
# 先生成静态产物（HashRouter + 相对资源路径，供 file:// 加载）
npm run build:electron

# 再打包 NSIS 安装包与便携版单文件
npm run build:win
```

产物输出到 `release/`：

- `森林还债管家 Setup 1.0.0.exe`：NSIS 安装包，可自选安装目录，自动创建桌面与开始菜单快捷方式；
- `森林还债管家-便携版.exe`：免安装单文件，双击即用、不写注册表。

> 打包提示：Electron / electron-builder 对非 ASCII 路径较敏感，建议把工程复制到纯英文路径下执行 `npm run build:win`；macOS、Linux 打包未在本项目验证，当前仅配置了 Windows x64 目标。

## 目录结构

```
src/
├── index.tsx                 # 入口，按 VITE_ROUTER 选择 HashRouter / BrowserRouter
├── app.tsx                   # 路由配置
├── components/               # 业务组件与 shadcn/ui 基础组件
├── pages/                    # 四个业务页面
│   ├── DebtsPage/            # 负债平台
│   ├── PlanPage/             # 还款计划
│   ├── BudgetPage/           # 预算规划
│   └── IncomePage/           # 收入账本
├── lib/                      # 类型、算法、预算、类目、配色、状态管理
└── hooks/                    # 自定义 Hooks
electron/
├── main.cjs                  # Electron 主进程：窗口、单实例锁、外部链接接管
└── preload.cjs               # 预加载脚本（仅暴露有限环境信息）
standalone/
├── server.js                 # 本地网页版静态服务（无第三方依赖）
└── 启动还债管家.bat           # Windows 一键启动脚本
public/                       # 静态资源
```

## 路径别名

```typescript
import { cn } from "@/lib/utils";
// @/ → src/
```

## 数据与隐私

- 数据键：`forest-debt-desktop:state-v2`，存于本机 localStorage；Electron 桌面版存于应用用户数据目录。
- 应用**不接入**任何银行、消费信贷平台接口，不做自动登录或余额抓取；所有金额由本人手动填写。
- 项目内自带的金额、利率均为示例占位数据，首次使用请替换为本人真实账单。
- 应用不包含登录、账号体系与云端同步；卸载或清空应用数据目录后记录会被清除。

## 已知边界与待办

- 算法目前未强制每笔每月先扣最低还款额；无息借款（如朋友借款）的还款顺序可进一步细化。
- 暂无账单 Excel/CSV 导入与数据一键导出备份功能。
- 当前使用 Electron 默认图标，尚未配置自定义应用图标；安装包未做代码签名，首次启动可能触发系统 SmartScreen 提示。

## License

MIT
