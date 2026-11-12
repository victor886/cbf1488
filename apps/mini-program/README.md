# 微信小程序

此工程是轻量微信容器壳：一个原生页面加载 `https://www.cbf1488.com/?surface=mini`。比赛、队员、榜单和个人页面由 `apps/admin-web` 的 HeroUI Native H5 提供；Node 业务规则统一放在 `services/api`。图片和组件库不放入小程序主包。

## 本地开发

1. 仓库根目录运行 `npm install` 和 `npm run dev:api`。
2. 另开终端运行 `npm run dev:admin`，本地浏览器可直接查看 H5。
3. 微信开发者工具可以导入仓库根目录（根 `project.config.json` 会将小程序根定位到本目录），也可以直接导入本目录。选择“本地 H5 开发”编译模式会打开 `pages/webview/index?dev=1`，加载 `http://localhost:8081/?surface=mini`。
4. 真机调试需要配置设备可访问的 HTTPS 页面/API 地址及微信平台业务域名。

本地演示账号由 API 提供。AppSecret、上传私钥和平台凭据不要写入项目源文件或发在聊天中；集中放在仓库根目录被 Git 忽略的 `.local/`。当前 `project.config.json` 里的 AppID 是公开标识，真实登录密钥和上传私钥尚未配置。

## 页面入口

`pages/webview/index` 是唯一注册页面。默认 H5 地址在 `app.js` 的 `h5Url`；部署域名改变时先更新地址，再核对 HTTPS 和微信业务域名配置。

构建、体验版上传和记录方式见 [DEPLOY.md](./DEPLOY.md)。
