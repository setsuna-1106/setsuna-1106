# 个人网站

直接打开 `index.html` 即可预览；将根目录文件与 `assets/` 一起部署到 GitHub Pages。

- `assets/js/data.js`：项目介绍与公开仓库快照，依据 2026-09-05 的 GitHub API 和各项目 README 整理。
- `assets/js/app.js`：分类筛选、主题、图片预览与仓库更新。
- `assets/js/hero.js`、`assets/js/lab.js`、`assets/js/physics.js`：首屏波场、三个物理模型和数值计算。
- `assets/css/site.css`：桌面与移动端布局，支持浅色、深色和减少动画偏好。
- `assets/`：笔记插图与本地 Lucide 图标。

“最近的仓库更新”按 GitHub `pushed_at` 排序。刷新按钮读取公开 API 并缓存成功结果；网络不可用时保留带日期的快照。项目介绍由 `assets/js/data.js` 手动维护。

实验区可切换阻尼振子、波的干涉和开普勒轨道；每个模型有独立参数、预设和两个视图。参数变化重置时间，首屏和实验独立暂停，离屏及后台自动停止绘制。减少动画偏好下默认暂停。WebGL 不可用时首屏使用 Canvas 2D 波场。

- 阻尼振子：欠阻尼解析解，`x(0)=1, v(0)=0, m=1`，20 秒后停止。
- 波的干涉：等振幅、等频率的相向平面波，`c=1 m/s`，满足 `ω=ck`；读数为 `x=0` 处的实际位移。
- 轨道：Numeric.js Dormand–Prince 积分，`μ=1`，从近心点出发；比能量与角动量由同一时刻的位置、速度计算。

运行 `node --test tests/physics.test.cjs` 检查物理不变量。项目无需构建工具；`assets/js/runtime.js` 只提供共享绘制和动画生命周期。

旧版 `advance/` 及其独占图片已删除，历史仍在 Git 中。根目录的旧脚本、数据与样式已迁入 `assets/`。

第三方库均固定版本并保存在 `assets/vendor/`：Lucide 0.468.0、Three.js 0.160.1、Numeric.js 1.2.6。各自许可证保存在同目录的 `.LICENSE` 文件中；页面无需在线 CDN。
