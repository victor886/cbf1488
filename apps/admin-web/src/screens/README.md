# 页面入口

- `mini.tsx`：小程序内 H5 页面和社区用户流程，依据移动端 Figma 页面。
- `admin.tsx`：社区管理工作台和创建比赛流程。
- `create-match.tsx`：共用的比赛创建、时间选择和发布预览流程。
- `public.tsx`：`www.cbf1488.com` 的 PC 介绍入口。

页面只负责界面和交互状态；业务数据请求统一走 `../api.ts`。跨页面布局放在 `../components/`，样式从 `../theme/styles.ts` 引用。
