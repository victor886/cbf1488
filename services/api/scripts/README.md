# API 构建脚本

`package-cloudbase-http.js` 将 `src/`、API 依赖清单和 `cloudbase/scf_bootstrap` 组装到 Git 忽略的 `.deploy/cloudbase-http/`，并在产物目录安装生产依赖，供后续部署为单个 CloudBase HTTP 云函数。产物不包含本地数据、`.env` 或 Dockerfile。

`migrate-postgres.js` 按版本顺序执行 `db/migrations/*.sql`，连接地址从 `DATABASE_URL` 读取。共享环境新增结构时只添加 migration，不改写已执行文件。

`cloudbase-smoke.js` 对当前 `.local/api.env` 指定的 CloudBase PG 环境执行临时 insert/read/update 检查，并在 `finally` 中按唯一 collection + id 删除测试行、验证记录已不存在。不要移除清理步骤或改成全表清理。
