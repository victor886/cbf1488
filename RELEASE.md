# 发布流程

## 发布完成条件

正式发布必须包含代码提交、统一 API 和静态 H5/管理后台部署，以及小程序体验版上传。需要记录云端部署结果、体验版版本和时间、二维码真机验证结果。缺少体验版上传或验证时，发布状态不能标为完成。

## 目标环境

- 初期：API 部署为腾讯云 CloudBase HTTP 云函数，静态 H5/管理后台托管在 CloudBase 静态站点；生产 API 使用配置好的持久化数据库。
- 后续：API 迁移到腾讯云 Lighthouse，保持 `api.cbf1488.com` 和同一容器接口。
- 静态域名：`www.cbf1488.com` 用作 PC 介绍站和小程序 H5，`admin.cbf1488.com` 用作后台，`cdn.cbf1488.com` 后续用于媒体。
- 微信小程序体验版由 `apps/mini-program/` 上传。

## 每次发布步骤

1. 确认变更范围、环境和版本号，检查 Git 差异与密钥排除状态。
2. 构建 H5/管理后台，部署 API 与静态站到目标环境。
3. 检查目标 API 域名的 `/api/health`、后台身份和本次相关业务读写。ICP 前的测试部署使用 CloudBase 默认域名。
4. 确认 `apps/mini-program/app.js` 的 H5 URL 指向目标环境。
5. 使用本机受保护的微信上传密钥/开发者工具上传小程序版本，将其设置为体验版。
6. 扫码真机检查本次涉及的登录、比赛、报名、管理流程和页面资源。
7. 记录 Git commit、API/静态站部署时间、体验版版本、体验二维码验证结果及失败项。

只有用户明确要求发布且对应云端/微信凭据已配置后才执行平台操作。开发阶段默认使用本地 JSON 演示数据。

## CloudBase 测试部署记录（2026-11-12）

- 环境：`huge-ocelot-d9gufllb9595dcbcc`（CloudBase 国内站，共享 PG）。
- API：HTTP 云函数 `cbf1488-api`，Node.js 20.19；默认 HTTPSERVICE `/api` → `WEB_SCF` 路由。健康检查 HTTP 200；公开比赛列表 HTTP 200；未登录管理接口 HTTP 401；CORS 预检及带 Origin 请求通过。
- 数据库：远程 PG 冒烟测试通过（健康、insert、read、versioned update、delete）；唯一测试行已删除并验证不存在。未播种演示业务数据。
- 管理后台：静态托管 54 个文件，54 成功、0 失败；入口为 CloudBase 静态托管 URL 加 `?surface=admin`，页面和 JS 资源 HTTP 200。
- 本地：未启动 API 或 PostgreSQL 服务；测试结束后会删除本地构建与函数打包目录。
- 未完成：管理员正式登录、媒体上传、`api/admin/www.cbf1488.com` 自定义域名、微信 H5 业务域名、小程序体验版上传和真机验证。当前忽略目录中没有微信上传私钥。
- 状态：**测试环境已部署，正式发布未完成**。未提交代码，未上传体验版。

## 密钥与回滚

AppSecret、上传私钥、数据库 URI、CloudBase token 和 Token Secret 不得提交。数据库回滚前先核对备份和 schema；保留上一版 API 镜像和静态构建物。任何必要步骤失败都应标注为未完成并给出具体状态，不可把本地可用称为云端已部署，也不可把代码提交称为体验版已上传。

工程指引：[API 部署](./services/api/DEPLOY.md)、[管理后台部署](./apps/admin-web/DEPLOY.md)、[小程序体验版](./apps/mini-program/DEPLOY.md)。
