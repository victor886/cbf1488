# H5 与管理后台

本工程使用 Expo、React Native Web 和 HeroUI Native。一个静态构建按 Host/query 显示三个入口：`www.cbf1488.com` PC 介绍站、`www.cbf1488.com/?surface=mini` 小程序 H5、`admin.cbf1488.com` 管理后台。微信原生工程只加载 H5，因此本目录的组件、图片和图标不会进入小程序主包。

## 本地运行

在仓库根目录执行 `npm install`，启动 `npm run dev:api` 和 `npm run dev:admin`。开发期 API 默认是 `http://localhost:1488/api`，数据来自本地 JSON 演示库。浏览器地址加 `?surface=mini`、`?surface=admin` 或 `?surface=public` 可切换入口。

## HeroUI 组件

- Figma 中的 Button、Input、Chip、Card、Avatar、Tabs 使用 `heroui-native`。
- HeroUI Native Pro 源码 vendored 在 `vendor/ui-native-pro/`，建赛时间选择使用其中的 `DateTimePicker`。
- Figma 资源存于 `public/static/`，品牌图存于 `public/brand/`；不使用临时 Figma URL。开通 CDN 后可替换资源 base URL。
- 当前 Figma 页面没有图表画板，因此不引入图表包。

## 构建与域名

```sh
npm run build:admin
```

构建输出在 `dist/`。同一静态构建可由 `www` 和 `admin` 两个域名提供；Host 分支让 `www` 显示公开介绍站，`admin` 显示管理工作台。API Base 可用 `EXPO_PUBLIC_API_BASE` 设置，生产目标为 `https://api.cbf1488.com/api`。

CloudBase 测试静态站已部署。生产 API 地址通过 `EXPO_PUBLIC_API_BASE` 写入 Expo 动态配置；管理员正式登录尚未配置，本地演示登录在生产构建中关闭。发布状态见 [DEPLOY.md](./DEPLOY.md)。
