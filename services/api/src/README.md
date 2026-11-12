# API 源码

`index.js` 组装 HTTP 服务与中间件，`routes/` 定义接口，`auth/` 处理身份验证，`middleware/` 放跨路由中间逻辑，`data/` 与 `storage/` 分别提供演示数据和存储适配。

新业务能力必须由此服务统一实现。不要将演示数据默认行为改成连接生产资源；环境变量和云端迁移说明见 [`../README.md`](../README.md)。
