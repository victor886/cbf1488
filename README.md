# CBF1488 社区篮球

CBF1488 的小程序入口、H5/管理后台和统一 Node API。移动端页面依据 Figma `gAOEWELSEZzC7ZEB1ERLjs` 实现，HeroUI Native 组件通过 React Native Web 在 H5 中复用，小程序保留轻量微信原生 WebView 外壳。

## 工程目录

```text
apps/
  mini-program/    微信原生 WebView 壳，体验版从这里上传
  admin-web/       HeroUI Native H5、PC 入口站和管理后台
services/
  api/              Node.js / Express 统一业务 API
    cloudbase/      CloudBase HTTP 云函数启动适配
.local/             本机凭据与临时配置（Git 忽略）
```

比赛、队员、出勤和充值规则只在 `services/api` 维护。`apps/mini-program` 负责微信容器入口，H5 页面和图片静态资源放在 `apps/admin-web`，微信主包不包含整套图片或前端组件库。

## 域名规划

| 域名 | 用途 |
|---|---|
| `cbf1488.com` | 跳转到 `www.cbf1488.com` |
| `www.cbf1488.com` | PC 介绍站；`/?surface=mini` 为小程序 H5 |
| `admin.cbf1488.com` | Web 管理后台（当前社区管理，后续可加入 CDN 管理界面） |
| `api.cbf1488.com` | 统一 Node API |
| `cdn.cbf1488.com` | 后续静态媒体/CDN 域名 |

介绍站只写 CBF1488 篮球活动的真实范围。CloudBase 默认测试静态域名已部署；自定义域名备案、HTTPS、DNS 和微信业务域名尚未配置。

## 本地运行

需要 Node.js 20 或更新 LTS 版本。在仓库根目录安装依赖并启动两个进程：

```sh
npm install
npm run dev:api
npm run dev:admin
```

管理后台和 H5 默认调用 `http://localhost:1488/api`。用浏览器访问 Expo 输出的本地地址；`?surface=mini`、`?surface=admin`、`?surface=public` 可分别打开移动端界面、管理后台和 PC 介绍站。API 首次启动时自动准备 JSON 演示数据，不需要云端账号或数据库。

微信开发者工具可导入仓库根目录（`project.config.json` 指向 `apps/mini-program/`）或直接导入 `apps/mini-program/`。选择“本地 H5 开发”编译模式可通过 `?dev=1` 加载本机 `http://localhost:8081/?surface=mini`；真机访问需给设备可达的 HTTPS 页面地址。

## 环境与凭据

- API 本地配置：`.local/api.env`，模板见 `services/api/.env.example`。
- 微信 AppSecret、上传私钥、CloudBase 环境凭据放在根目录 `.local/`，不要放进 Git。
- `project.config.json` 中的 AppID 是小程序公开标识，不是 AppSecret。
- 本地登录使用演示账号；正式微信登录和小程序体验版上传尚未完成。

## 工程文档

- [工程架构](./ARCHITECTURE.md) · [发布流程](./RELEASE.md)
- [小程序说明](./apps/mini-program/README.md) · [H5/管理后台说明](./apps/admin-web/README.md)
- [API 说明](./services/api/README.md)

CloudBase 测试环境已部署 API HTTP 云函数和 H5/管理后台静态文件，使用 CloudBase 默认域名。运行 `npm run package:cloudbase --workspace @cbf1488/api` 可生成函数上传目录；部署密钥只从 `.local/api.env` 注入，不进入代码包或 Git。

## 状态

当前状态是 CloudBase 测试环境已部署；生产自定义域名、管理员正式登录和小程序体验版尚未完成，因此不是正式发布。详情与验证结果见 [RELEASE.md](./RELEASE.md)。
