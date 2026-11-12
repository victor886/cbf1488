# 应用目录

本目录只放两个客户端工程：

- [`mini-program/`](./mini-program/README.md)：微信小程序壳，承载 `admin-web` 构建出的 H5。
- [`admin-web/`](./admin-web/README.md)：React Native Web 前端，提供小程序 H5、管理后台与备案展示站。

新业务规则写进 `services/api`，不要在客户端复制权限、报名或数据校验逻辑。各工程的启动与发布说明见各自 README 和 `DEPLOY.md`。
