# 小程序开发与体验版

## 本地预览

1. 仓库根目录安装 npm 依赖，并运行 `npm run dev:api` 与 `npm run dev:admin`。
2. 微信开发者工具可以导入仓库根目录（`miniprogramRoot` 指向 `apps/mini-program/`），也可以直接导入 `apps/mini-program/`。
3. 在顶部“编译模式”中选择“本地 H5 开发”，它会用 `dev=1` 参数打开 `pages/webview/index`，加载本机 `http://localhost:8081/?surface=mini`。该地址只适合开发工具模拟器；真机须使用设备可访问的 HTTPS H5 地址。
4. API 开发地址由 H5 的 `EXPO_PUBLIC_API_BASE` 决定，默认 `http://localhost:1488/api`。

小程序代码包只有一个 WebView 页面，不含 H5 图片或 HeroUI 代码。体验版发布前需把 `app.js` 的 `h5Url` 指向已部署 H5，并确认微信平台中对应业务域名已可用。

## 上传体验版

当前尚未上传体验版。正式上传需在微信开发者工具中上传构建版本，或使用微信上传 API 的私钥流水线；凭据保存在 Git 忽略的 `.local/`，不能写进 `project.config.json` 或提交 Git。上传后还要设置体验版、扫码检查本次涉及的页面与授权流程，并记录版本号和验证结果。

API/H5 部署、代码版本、体验版版本和真机验证都要放进同一发布记录；详情见仓库根目录 [RELEASE.md](../../RELEASE.md)。
