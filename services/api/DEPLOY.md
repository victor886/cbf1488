# API 部署说明

## 当前状态（2026-11-12）

- CloudBase 测试环境 `huge-ocelot-d9gufllb9595dcbcc` 已部署 HTTP 云函数 `cbf1488-api`（Node.js 20.19）。
- 测试 API：`https://huge-ocelot-d9gufllb9595dcbcc-1527687074.ap-shanghai.app.tcloudbase.com/api`。
- HTTP 网关 `/api` 路由到 `WEB_SCF`，路径透传已开启；当前使用 CloudBase 默认域名。
- CloudBase PG 使用 `CloudBaseRepository` 调用 PG REST API；API Key 只保存在云函数环境变量。本地凭据位于 Git 忽略的 `.local/api.env`。
- 健康、公开查询、管理员未登录拒绝、CORS 及临时 PG CRUD 均已验证；测试数据已删除。未播种演示业务数据。
- 管理员生产登录、媒体云存储、自定义域名与小程序体验版仍未完成。

## CloudBase 部署

小程序 H5 和管理后台共用同一份 Express API，部署为 HTTP 云函数，统一处理 `/api/*`。CloudBase 启动适配器位于 [`cloudbase/`](./cloudbase/)。运行 `npm run package:cloudbase --workspace @cbf1488/api` 生成 `services/api/.deploy/cloudbase-http/`，再通过 `tcb fn deploy` 上传。HTTP 云函数使用 Node.js 20.19 并监听 9000 端口。

测试期使用 CloudBase 默认 HTTPSERVICE 域名。备案、TLS 证书和 DNS 完成后，再绑定 `api.cbf1488.com` 并配置 `/api` 路由。

云函数需要以下环境变量：

```text
NODE_ENV=production
PORT=9000
STORAGE_DRIVER=cloudbase
CLOUDBASE_GATEWAY=true
CLOUDBASE_ENV_ID=<CloudBase 环境 ID>
CLOUDBASE_API_KEY=<后端专用 API Key>
TOKEN_SECRET=<至少 32 字符的随机值>
SEED_DEMO_DATA=false
```

API Key 只能存放在云函数环境变量中，不能写入 H5、小程序、源代码或 Git。CloudBase 的函数环境变量更新是全量替换，修改时必须保留其他运行变量。

## 数据存储与迁移

当前 CloudBase PG 为共享实例，不提供应用可用的原生 PostgreSQL TCP 连接。`CloudBaseRepository` 通过 `/v1/rdb/rest/app_documents` 访问数据，并用 `version` 条件更新及有限重试处理并发；CloudBase 模式禁用 `reset()`，避免全表清空。

本地 JSON 仅用于演示。`STORAGE_DRIVER=postgres` 的 `PostgresRepository` 使用原生 `pg` 和事务，适用于本地 PostgreSQL 或 Lighthouse 上自托管的 PostgreSQL。SQL migration 位于 `db/migrations/`，TCP 迁移脚本不适用于当前共享 CloudBase PG。

后续迁移到 Lighthouse 时，使用本目录 Dockerfile 启动相同的 Express `src/`，配置 PostgreSQL TCP 连接并将存储驱动切换为 `postgres`。

## 未完成事项

- `POST /api/auth/wechat` 尚未实现；生产 `/api/auth/dev-login` 按设计隐藏，所以后台管理员登录当前不可用。
- 媒体上传还没有腾讯云对象存储适配器。
- 自定义域名需等待 ICP、证书与 DNS 完成。
- 正式发布必须同时完成 API、静态站和小程序体验版，并验证体验流程；详情见根目录 [RELEASE.md](../../RELEASE.md)。
