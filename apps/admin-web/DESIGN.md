# H5 与管理后台设计

## Figma 依据

主依据为 Figma 文件 `gAOEWELSEZzC7ZEB1ERLjs`。主要移动端画板为 390×844，已读取比赛列表 `183:671`、比赛详情 `183:976`、出勤榜 `7:102`、队员与个人页 `8:28` / `8:138` / `103:738`，以及建赛流程 `243:1501` 起的页面。

当前设计系统使用深蓝渐变 `#0B1531 → #143B72 → #0A1C3D`、内容面 `#22395D`、主要操作色 `#1D4ED8`、青色强调 `#73E5F7`。中文字级、间距、状态色、玻璃面和圆角按 Figma 节点记录实现；Figma 的临时 asset URL 不能作为应用地址。

## 组件

- HeroUI Native：Button、Input、Chip、Card、Avatar、Tabs。
- HeroUI Native Pro 本地组件：建赛的 `DateTimePicker` 和 `NumberStepper`，来源于 `vendor/ui-native-pro/`。
- 当前已读取的设计页没有图表组件，因此不安装图表引擎。

## 入口

- `www.cbf1488.com/?surface=mini`：按 Figma 移动版展示小程序 H5。
- `admin.cbf1488.com`：管理入口。已知 Figma 提供的是 390px 管理流程画板，没有独立桌面后台画板；桌面后台的版式选择待用户回复，未据此虚构一套桌面视觉规格。
- `www.cbf1488.com/`：用户要求用于 ICP 的 PC 介绍页，只展示 CBF1488 篮球活动的已知信息。

## 资产与包体

比赛封面、队员头像、品牌图、图标和氛围 SVG 由 H5 静态目录提供；小程序主包仅有 WebView 页和必要配置。图片后续迁移到 `cdn.cbf1488.com` 时保持页面路径与数据模型不变。
