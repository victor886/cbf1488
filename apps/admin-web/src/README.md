# 管理后台与 H5 源码

Expo 应用入口在 `App.tsx`，`api.ts` 负责调用统一 API。此应用根据主机名和 `surface` 参数切换管理后台、备案展示站和小程序 H5 页面。三种界面分别维护在 `screens/mini.tsx`、`screens/admin.tsx`、`screens/public.tsx`；建赛流程放在 `screens/create-match.tsx`。

UI 以 `design-reference/` 中的 Figma 导出参考为准，共用页面框架和提示组件在 `components/`，样式表在 `theme/styles.ts`，日期格式化在 `utils/date.ts`。组件优先使用 HeroUI Native；HeroUI Native Pro 的本地副本在 `../vendor/ui-native-pro/`，不要从 CDN 加载运行时代码。不要在此目录保存密钥。
