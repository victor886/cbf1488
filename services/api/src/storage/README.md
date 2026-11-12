# 存储适配

将业务数据存取与路由隔离。开发默认使用本地 JSON；自管 PostgreSQL（本地容器 / Lighthouse）使用 `PostgresRepository` 和 `DATABASE_URL`；CloudBase 共享 PG 使用 `CloudBaseRepository`，通过服务端 CloudBase PG REST API 访问 `app_documents`，凭据只注入云函数环境。不要让客户端直接访问数据库。

CloudBase 共享 PG 不提供给此项目原生 `pg` TCP 连接地址，因此不能复用 `PostgresRepository`。`CloudBaseRepository` 保持相同的 list/get/insert/mutate 接口；更新通过 `version` 条件写入实现有限重试。CloudBase 模式禁用全表 `reset()`，避免误删环境业务数据。
