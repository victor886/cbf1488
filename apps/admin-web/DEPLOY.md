# H5 与管理后台部署

## 本地

仓库根目录运行 `npm install`、`npm run dev:api` 和 `npm run dev:admin`。浏览器在 Expo 开发地址查看 H5；用 `?surface=mini`、`?surface=admin`、`?surface=public` 切换入口。开发 API 默认使用本机演示数据。

## 静态站

运行 `npm run build:admin` 生成 `apps/admin-web/dist/`。相同构建可挂载在 `www.cbf1488.com` 和 `admin.cbf1488.com`：`www` 根路径显示 PC 介绍站，`www/?surface=mini` 显示小程序 H5，`admin` Host 显示管理工作台。静态站初期可放到腾讯云 CloudBase 静态托管；后续更换静态托管时沿用同一构建物。

生产构建需设置 `EXPO_PUBLIC_API_BASE` 为目标 API 地址。动态 Expo 配置会将该值写入应用配置，避免依赖 Metro 对 shell 环境变量的内联行为。

2026-11-12 已部署到 CloudBase 静态托管：

- 静态站：`https://huge-ocelot-d9gufllb9595dcbcc-1527687074.tcloudbaseapp.com`
- 管理后台测试入口：静态站 URL 加 `?surface=admin`
- API：`https://huge-ocelot-d9gufllb9595dcbcc-1527687074.ap-shanghai.app.tcloudbase.com/api`

自定义域名还需备案、HTTPS/DNS 及小程序 H5 业务域名配置。管理员正式认证尚未实现；页面可打开，但登录和管理写入还不能验收。

## 静态媒体

本地素材来自 Figma 和项目静态目录，保存在 `public/static/` 与 `public/brand/`。当前构建直接提供素材；开通 CDN 后再把媒体 base URL 切换到 `cdn.cbf1488.com`，不把 CDN 密钥写进前端。

## 管理后台验证

管理员登录与写入需要生产认证和 API 管理员账号配置。当前的 `/api/auth/dev-login` 只用于本地环境，生产 API 会隐藏该路由。部署状态、管理员验证和小程序体验版版本需按仓库根目录 [RELEASE.md](../../RELEASE.md) 一同记录。
