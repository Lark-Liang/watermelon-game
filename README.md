# 合成大西瓜

纯前端 Canvas + Matter.js 游戏。原素材 1.png～6.png 已完整复制，未修改原文件。运行时不依赖 E 盘、图片 CDN、后端或联网 API。

## 本地运行

在本目录打开 PowerShell：

```powershell
npm.cmd install
npm.cmd run dev
```

打开终端显示的本地地址。手机触摸拖动后松手投放，电脑鼠标移动后点击；键盘方向键移动，空格投放。

## 构建与测试

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

`dist/` 是完整的静态网站，可上传任意静态托管。不要直接双击 index.html；ES 模块需要 HTTP 静态服务。本地 Vite 仅用于开发/预览，不是生产后端。

## GitHub Pages 发布与更新

使用 `.github/workflows/pages.yml` 自动测试、构建并部署 `dist/`。生产环境只有静态文件，没有后端、数据库或服务端逻辑。

仓库 Settings → Pages → Build and deployment → Source 应选择 **GitHub Actions**。

后续修改在 main 分支提交并推送：

```powershell
git add .
git commit -m "update"
git push
```

Actions 成功后会自动更新网站。`vite.config.js` 的生产路径固定为 `/watermelon-game/`，与当前 GitHub 仓库名一致。不提交 node_modules、dist、缓存、系统或 IDE 临时文件。

参考：[GitHub Pages 官方工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 主要文件

- `index.html`：信息区、游戏画布、结束弹窗。
- `src/config.js`：标题、尺寸比例、分数、随机权重、物理参数和失败延迟。
- `src/game.js`：物理世界、锁定合并队列、连锁合成、计分、失败及重开。
- `src/main.js`：素材加载、等比白圆绘制、高 DPI、Pointer Events。
- `src/sprite.js`：非透明内容边界和安全包围圆计算。
- `alpha-report.json`：6 张素材的透明边界实测结果。
- `src/style.css`：手机优先布局。
- `assets/1.png`～`6.png`：原始素材副本。
- `tests/game.test.js`：16 项真实 Matter.js 物理与状态回归测试。
- `browser-test-report.json`、`integration-test-report.json`：浏览器实测结果。
- `mobile.png`、`desktop.png`、`all-levels.png`、`game-over.png`：测试截图；仅根目录留作证据，不进入 dist。

逻辑世界固定 420×560，显示与输入按同一比例缩放，因此手机旋转不会重排物理刚体。直径为逻辑宽度的 8.5%、12.5%、17.5%、24%、32%、42%。图片加载后扫描 alpha>0 的真实边界（包含半透明像素），仅去除完全透明留白；根据可见像素最远角缩放至圆半径的 95%，保留宽高比和全部可见内容。受不规则图案形状约束，长边约占直径的 79%～91%，不能为强行达到 95% 而裁剪角部。图片保持正向，碰撞刚体仍为圆形。

危险线位于 y=116。新投放有 1300ms 宽限，之后连续越线 1800ms 结束；待投放预览不进入判定。6+6 同时消除并加 64 分，不产生 7 级。分值在 config.js 的 maxLevelClearPoints 中配置。仅显示本局分数，随机投放仍限 1～3 级，不显示后续预览。

## 验证范围

16 项逻辑测试全部通过；Windows Edge（Chromium）使用 iPhone 13 设备参数及 390×844 触摸视口测试，并检查横屏、桌面、生产构建、逐级合成、结束弹窗、重开、触摸投放。无页面/控制台错误。未进行实体 iPhone Safari 测试。素材 4 原图约 3.94MB，首次加载耗时取决于网络，加载完成后才开始游戏。

公网发布状态：待完成部署平台认证后发布，当前没有已验证的公网链接。
