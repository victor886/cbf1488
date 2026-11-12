# 统一 Node API

Node.js + Express 服务同时提供小程序 H5 与管理后台所需的身份、权限、比赛、报名、出勤、队员和充值能力。业务校验和数据库访问只在本工程维护，前端不直接连接数据库。

## 本地运行

默认本地演示在仓库根目录运行 `npm install`、`npm run dev:api`。API 默认监听 `http://localhost:1488`，首次运行会建立 `services/api/.data/database.json` 演示数据。

要使用本地 PostgreSQL，先运行 `docker compose -f services/api/docker-compose.yml up -d`，执行 `mkdir -p .local && cp services/api/.env.example .local/api.env`，将 `.local/api.env` 的 `STORAGE_DRIVER` 改为 `postgres`，然后运行 `npm run db:migrate --workspace @cbf1488/api` 和 `npm run dev:api`。`.local/api.env` 已被 Git 忽略。

- `npm run seed`：重置演示数据。
- `npm run start:api`：不启用 watch 的启动方式。
- 本地演示身份：队员陈宇 `m_chen`、管理员 `admin_001`。
- `/api/auth/dev-login` 仅用于非生产环境；`/api/auth/wechat` 尚未接微信身份交换。

## API 范围

| 路由 | 用途 |
|---|---|
| `GET /api/health` | 服务健康状态和存储模式 |
| `/api/auth/*` | 本地演示登录、当前会话、微信登录预留 |
| `/api/matches` | 比赛查询、详情、报名/取消 |
| `GET /api/matches/:id/results` | 已公开比赛结果 |
| `/api/leaderboard` | 月份、赛季与总出勤统计 |
| `/api/members`、`/api/me/profile` | 公开队员资料和本人资料 |
| `/api/admin/*` | 比赛创建、队员与充值管理、开发媒体上传 |

公开队员资料不包含手机号、余额和流水。报名名额、截止时间、重复报名和角色权限由服务端校验。

## 存储

`STORAGE_DRIVER=local` 是本地演示 JSON 存储；`STORAGE_DRIVER=postgres` 使用标准 `pg` 驱动；`STORAGE_DRIVER=cloudbase` 经 CloudBase PG REST API 访问共享 PG。CloudBase API Key 只在后端使用。SQL migration 位于 `db/migrations/`，由 TCP 脚本执行，仅适用于本地或可 TCP 访问的 PostgreSQL。生产环境不可使用 JSON 文件或开发登录。

## 腾讯云与服务器运行方式

小程序 H5 与管理后台共用一个 Express API。CloudBase 初期部署成一个 HTTP 云函数，统一处理 `/api/*`；不按每个路由拆成许多函数。CloudBase 专属启动适配器放在 [`cloudbase/`](./cloudbase/)，运行 `npm run package:cloudbase` 会生成上传目录 `services/api/.deploy/cloudbase-http/`。上传包内的 `scf_bootstrap` 将服务监听端口设为 9000；业务代码仍只维护在 `src/`。

后续迁移到 Lighthouse 时，用 [Dockerfile](./Dockerfile) 启动同一份 `src/`，并将存储适配切换到服务器上的 PostgreSQL TCP 连接；业务路由保持不变。CloudBase PG repository 已接入；微信登录和对象存储上传尚未配置，详见 [DEPLOY.md](./DEPLOY.md)。当前共享实例使用 CloudBase SDK/REST：[官方连接文档](https://docs.cloudbase.net/database/postgresql/connecting-to-postgresql)。

环境变量模板见 [.env.example](./.env.example)，业务状态与数据边界见 [DESIGN.md](./DESIGN.md)。
