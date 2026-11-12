# HeroUI Native Pro 本地依赖

源码从本机目录 `herouipr_v3/herouipro-native-v3/packages` 复制，用于确保本项目按要求使用 Pro 组件；应用通过 `file:vendor/ui-native-pro` 安装，仅从此包导入组件。

当前业务实际使用 `DateTimePicker`。组件实现位于 `src/components/date-time-picker/`，样式入口位于 `src/styles/`。`package.json` 的 exports 已指向源码，供 Expo Metro 在构建时编译；不要把组件代码复制到业务页面。

更新时先从本机源包比对差异，再按项目依赖和所需组件更新本目录。源包声明 `SEE LICENSE IN LICENSE`，但本地包目录未包含许可证文件；提交或向外分发此 vendor 源码前，需确认对应授权并一并保留许可证。
