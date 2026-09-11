# 个人网站

直接打开 `index.html` 即可预览；将根目录文件与 `assets/` 一起部署到 GitHub Pages。

- `assets/js/data.js`：项目介绍与公开仓库快照，依据 2026-09-05 的 GitHub API 和各项目 README 整理。
- `assets/js/app.js`：分类筛选、主题、图片预览与仓库更新。
- `assets/js/hero.js`、`assets/js/lab.js`、`assets/js/physics.js`：首屏波场、三个物理模型和数值计算。
- `assets/css/site.css`：桌面与移动端布局，支持“稿纸 / 黑板”双载体、系统主题跟随、手写材质和减少动画偏好。
- `assets/`：笔记插图与本地 Lucide 图标。

“最近的仓库更新”按 GitHub `pushed_at` 排序。刷新按钮读取公开 API 并缓存成功结果；网络不可用时保留带日期的快照。项目介绍由 `assets/js/data.js` 手动维护。

实验区可切换阻尼振子、波的干涉和开普勒轨道；每个模型有独立参数、预设和两个视图。参数变化重置时间，首屏和实验独立暂停，离屏及后台自动停止绘制。减少动画偏好下默认暂停。首屏使用 Canvas 2D 手绘波场。

主题切换只更换书写工具：亮色用稿纸、钢笔和铅笔语义，暗色用黑板、粉笔和淡黄草稿线；手动选择保存到本地，未选择时跟随系统 `prefers-color-scheme`。

- 阻尼振子：欠阻尼解析解，`x(0)=1, v(0)=0, m=1`，20 秒后停止。
- 波的干涉：等振幅、等频率的相向平面波，`c=1 m/s`，满足 `ω=ck`；读数为 `x=0` 处的实际位移。
- 轨道：Numeric.js Dormand–Prince 积分，`μ=1`，从近心点出发；比能量与角动量由同一时刻的位置、速度计算。

运行 `node --test tests/physics.test.cjs` 检查物理不变量。项目无需构建工具；`assets/js/runtime.js` 只提供共享绘制和动画生命周期。

旧版 `advance/` 及其独占图片已删除，历史仍在 Git 中。根目录的旧脚本、数据与样式已迁入 `assets/`。

第三方库均固定版本并保存在 `assets/vendor/`：Lucide 0.468.0、Numeric.js 1.2.6、Rough.js 4.6.6（旧 Three.js 文件保留但不加载）。各自许可证保存在同目录的 `.LICENSE` 文件中；页面无需在线 CDN。

## 演算现场（稿纸 / 黑板）

双主题共用原有内容和物理模型。所有颜色和工具参数从 `assets/css/site.css` 的 CSS 变量读取：`--ink` 为定稿，`--coral` 为强调，`--accent` 为链接与补充，`--draft` 为示意与待定线。悬停只加深蓝色；选中使用红圈。黑板的小字红 / 蓝在最浅背景 `--soft` 上分别为 5.95:1 / 7.44:1；亮色红笔已单独加深。

`assets/js/notebook.js` 负责首帧后加载本地 Rough.js 4.6.6、两种工具参数、逐字书写、圈选和笔记分页。静态示意图接近视口才生成；随机种子固定，切换主题不改变图形含义。首页波场已改用 Canvas 2D 手绘线条，不再加载 Three.js。实验绘制限制在 30 fps，离屏和后台停止；减少动画偏好下保持静止，参数、模型和视图仍可切换。

`assets/fonts/` 保存霞鹜文楷与 Caveat 的 WOFF2 网页子集和 OFL 许可证，合计约 180 KB，使用 `font-display: swap`。中文采用文楷，拉丁标题与公式采用 Caveat；缺字或字体不可用时回退到系统楷体 / 可读系统字体。增加正文后可用 `scripts/subset-fonts.py` 重建子集（需要 fontTools、brotli 和上游 TTF 源文件）。

主题选择保存在 `setsuna-theme`；“随系统”删除覆盖值，重新跟随系统。切换约 760 ms，支持“跳过动画”和 Escape；减少动画时立即完成。手写抖动仅作用于姓名、页边批注、签名中的少数字符，保留独立的读屏文本。笔记缩略图为手绘示意，原始图片仍可打开查看。

验证：运行 `node --test tests/physics.test.cjs` 检查物理不变量；通过本地 HTTP 服务打开 `tests/browser.html` 可运行浏览器回归检查（主题默认 / 保存 / 连点 / 跟随系统 / 存储不可用、减少动画、项目筛选、模型与笔记分页、320 / 375 / 768 / 1440px 排版）。测试使用独立 iframe 模拟系统偏好和存储，不改访客实际设置。
