# WebView 宿主页

`index.wxml` 仅渲染微信 `web-view`，`index.js` 根据本地开发开关或生产环境选择 H5 地址。体验版/正式版需要在小程序管理后台配置合法业务域名；不要将 AppSecret 或上传私钥写入本目录。
