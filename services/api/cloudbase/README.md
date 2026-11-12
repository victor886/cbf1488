# CloudBase HTTP 云函数入口

此目录只放 CloudBase HTTP 云函数运行适配，不放业务路由或数据规则。

- `scf_bootstrap`：CloudBase HTTP 云函数启动脚本，使用 Node.js 20 运行 `src/index.js`，并将监听端口设为 9000。
- 业务源代码仍位于 `../src/`。
- 从仓库根目录运行 `npm run package:cloudbase`，生成 `../.deploy/cloudbase-http/` 上传包。生成目录被 Git 忽略。

CloudBase 测试环境已部署 `cbf1488-api` HTTP 函数；函数密钥由 `.local/api.env` 提供给部署流程，只写入 CloudBase 函数环境变量。HTTP 函数只负责 API；H5/管理后台另行构建并发布到静态托管。迁移到 Lighthouse 时使用 `../Dockerfile`，不使用此目录的启动脚本。
