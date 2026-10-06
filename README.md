# 合成大西瓜

纯前端 Canvas + Matter.js 两关小游戏。第一关使用 01.png～07.png，第二关使用原 1.png～6.png；素材均为项目内副本，未修改原文件。运行时不依赖 E 盘、图片 CDN、后端或联网 API。

## 本地运行

```powershell
npm install
npm run dev
```

手机触摸或鼠标拖动后松手投放，键盘方向键移动，空格投放。

## 构建与测试

```powershell
npm test
npm run build
npm run preview
```

`dist/` 是完整静态网站。本地 Vite 仅用于开发和预览，不是生产后端。

## GitHub Pages 发布与更新

`.github/workflows/pages.yml` 会在 main 分支推送后自动执行测试、构建并将 `dist/` 部署到 GitHub Pages。`vite.config.js` 的生产 base 为 `/watermelon-game/`。

```powershell
git add .
git commit -m "update"
git push
```

公网地址：https://lark-liang.github.io/watermelon-game/

## 关卡规则

第一关“合成大西瓜”有 7 级。合成分数依次为 2、4、8、16、32、64；07+07 同时消除并加 128 分。累计完成 5 次最高级消除后暂停，玩家点击“进入第二关”继续。

第二关“合成大嫂子”沿用原 1～6 素材。合成分数依次为 2、4、8、16、32；6+6 同时消除并加 64 分，游戏持续到危险线判定结束。第一关分数会带入第二关，任意位置重开都会回到第一关并清零。

逻辑世界固定为 420×560。第一关前六级使用原基础直径的 1.05 倍并自然延伸第七级；第二关六级使用原基础直径的 1.10 倍。Canvas 白圆与 Matter.js 碰撞半径来自同一关卡配置。

图片加载后扫描 alpha>0 的实际边界，包含半透明像素。绘制时去除完全透明留白，保持宽高比与全部可见内容，并缩放至白圆内 95% 的安全范围。

危险线位于 y=116。新投放物体有 1300ms 宽限，之后连续越线 1800ms 才结束。待投放预览不进入失败判定。

## 主要文件

- `index.html`：关卡信息、游戏画布、过关与结束弹窗。
- `src/config.js`：两关素材、尺寸、分数、目标和共用物理参数。
- `src/game.js`：物理世界、合并队列、计分、切关、失败与重置。
- `src/main.js`：素材加载、Canvas 绘制、高 DPI 和 Pointer Events。
- `src/sprite.js`：素材非透明边界和安全包围圆计算。
- `assets/01.png`～`07.png`、`assets/1.png`～`6.png`：两关素材副本。
- `alpha-report.json`：13 张素材的透明边界实测结果。
- `tests/`：Matter.js 物理、两关状态和透明边界测试。

## 验证

21 项自动化测试覆盖逐级合成、最高级消除、五次通关、手动切关、跨关计分、重置、碰撞去重、连锁、危险线和尺寸同步。Chromium 生产构建按 390×844 与 412×915 两种手机竖屏视口检查，无滚动溢出，13 张素材均正常加载，Pointer 点击投放和高 DPI 画布正常，控制台无错误。
