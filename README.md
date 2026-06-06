# Personal Website

这是 `setsuna-1106` 的个人网站项目，用来展示 GitHub 公开项目、计算物理学习记录、可视化笔记和当前任务统计。页面采用静态 HTML/CSS/JavaScript 实现，不依赖构建工具，也不需要安装前端框架。

当前网站内容主要来自：

- GitHub profile: `setsuna-1106`
- Pages repository: `setsuna-1106/setsuna-1106`
- 计算物理学习仓库: `setsuna-1106/c4phy`
- 本地学习笔记中的图片素材

## 项目目标

这个网站不是通用模板，而是一个面向个人学习和项目展示的轻量入口页。它的目标是：

- 展示个人身份、学校、GitHub 账号和联系方式
- 展示公开仓库与学习项目入口
- 展示计算物理学习工作流：C 做数值计算，Python 做可视化
- 展示来自笔记的真实图像素材
- 统计当前学习和维护任务的进度
- 可直接部署到 GitHub Pages

## 功能概览

### 1. 个人首屏

首屏展示：

- 名称：告文
- GitHub 账号：`setsuna-1106`
- 南京大学物理系学生身份
- GitHub profile 入口
- 计算物理方向说明
- 一个可交互的阻尼振动示意图

阻尼振动面板支持：

- 暂停 / 继续动画
- 调整阻尼系数 `gamma`
- 调整频率 `omega`

相关代码位于：

- `index.html`: `.hero-panel`
- `styles.css`: `.hero-panel`, `.sim-controls`
- `script.js`: oscillator drawing functions

### 2. GitHub 项目索引

`GitHub index` 区块展示公开仓库和重要项目入口，包括：

- `c4phy`
- `chinese-to-english-textbook`
- `obsidian-pdf-reading-progress`
- `setsuna-1106`
- `nvim-config`
- `c4phy/src` 中的计算物理模块

如果需要修改项目卡片，编辑 `index.html` 中的 `.project-list`。

### 3. 计算物理工作流

`Workflow` 区块说明本项目采用的计算物理工作流：

```text
Model -> Compute -> Visualize -> Document
```

核心思想是：

```text
C 数值计算核心 -> 数据输出 -> Python / Raylib 可视化 -> 笔记整理
```

### 4. 笔记图像展示

`Visual notebook` 区块展示来自 c4phy 笔记的图片，包括：

- 随机行走
- 中心差分
- Euler 积分误差
- 线性同余随机数生成公式

图片文件位于：

```text
assets/random-walk.png
assets/central-difference.png
assets/euler-rule.png
assets/linear-congruent.png
```

### 5. 学习进度矩阵

`Learning matrix` 区块展示不同计算物理主题在笔记、C 代码、可视化方面的完成状态。

如果需要修改矩阵内容，编辑 `index.html` 中的 `.matrix`。

### 6. 当前任务统计

`Current task statistics` 区块由 JavaScript 自动计算任务状态，显示：

- Total: 总任务数
- Done: 已完成任务数
- Doing: 进行中任务数
- Open: 待处理任务数
- Completion: 完成率

任务列表支持筛选：

- All
- Doing
- Open
- Done

## 文件结构

```text
website/
├── README.md
├── index.html
├── styles.css
├── script.js
└── assets/
    ├── central-difference.png
    ├── euler-rule.png
    ├── github-avatar.jpg
    ├── linear-congruent.png
    └── random-walk.png
```

### 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面结构和主要内容 |
| `styles.css` | 瑞士风视觉样式、响应式布局、任务统计样式 |
| `script.js` | 阻尼振动画布、任务统计、任务筛选 |
| `assets/` | 网站使用的头像和笔记图片素材 |
| `README.md` | 项目文档 |

## 本地预览

这个项目是纯静态网站，可以直接打开：

```text
website/index.html
```

也可以使用本地静态服务器预览：

```bash
cd website
python3 -m http.server 8765 --bind 127.0.0.1
```

然后访问：

```text
http://127.0.0.1:8765/
```

如果只修改 HTML/CSS/JS，刷新浏览器即可看到结果。

## 维护任务统计

任务数据位于 `script.js` 顶部的 `tasks` 数组：

```js
const tasks = [
  {
    title: "整理 c4phy 项目主页",
    area: "Website",
    status: "done",
    detail: "完成瑞士风个人网站、GitHub profile 信息和项目入口。",
  },
];
```

每个任务包含四个字段：

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| `title` | 任务标题 | `"完善 ODE 笔记"` |
| `area` | 所属领域 | `"Notes"` |
| `status` | 任务状态 | `"doing"` |
| `detail` | 任务说明 | `"整理 Euler、RK2、RK4 的误差观察"` |

### 支持的任务状态

目前支持三种状态：

```text
done
doing
open
```

统计逻辑会自动计算：

```js
completion = done / total
```

因此新增、删除或修改任务后，不需要手动修改统计数字。

### 新增任务示例

在 `tasks` 数组中加入：

```js
{
  title: "补充双摆相图",
  area: "Simulation",
  status: "open",
  detail: "加入不同初始条件下的双摆轨迹和相空间观察。",
}
```

保存后刷新页面即可。

## 修改个人信息

个人信息主要位于 `index.html`：

- 首屏标题：`<h1>告文</h1>`
- 简介：`.hero-statement`
- GitHub profile card：`.profile-card`
- 联系信息：`.contact-card`

如果 GitHub 账号、邮箱或主页链接发生变化，优先修改这些位置。

## 修改项目卡片

项目卡片位于 `index.html` 的 `.project-list`：

```html
<article class="project-item">
  <div class="project-code">C01</div>
  <h3>c4phy</h3>
  <p>计算物理学习记录...</p>
  <ul>
    <li>C</li>
    <li>Physics</li>
  </ul>
  <a class="project-link" href="https://github.com/setsuna-1106/c4phy">Open repository</a>
</article>
```

建议保持：

- `project-code` 为短编号
- `h3` 为项目名
- `p` 为一句清晰说明
- `ul` 为 2 到 4 个标签
- `project-link` 指向真实仓库或目录

## 修改图片素材

图片放在 `assets/` 中。替换图片时注意：

- 文件名需要和 `index.html` 中的 `src` 一致
- 尽量使用压缩后的 PNG/JPG
- 图片应能说明真实项目内容，而不是纯装饰
- 替换头像时建议使用正方形图片

## 视觉风格

网站采用简洁瑞士风：

- 网格背景
- 黑白主体
- 少量红、蓝、黄强调色
- 粗体标题
- 表格化卡片布局
- 低圆角或无圆角
- 清晰边框
- 响应式单列移动端布局

主要设计变量位于 `styles.css` 顶部：

```css
:root {
  --bg: #f7f7f4;
  --paper: #ffffff;
  --ink: #111111;
  --red: #e2382a;
  --blue: #0057b8;
  --yellow: #ffd21f;
}
```

## 响应式布局

CSS 中有两个主要断点：

```css
@media (max-width: 1040px) { ... }
@media (max-width: 720px) { ... }
```

移动端重点处理：

- 导航压缩
- 首屏改为单列
- 项目卡片改为单列
- 任务统计改为单列
- 学习矩阵压缩列宽
- 避免横向滚动

## 验证清单

修改后建议检查：

```bash
node --check website/script.js
```

然后本地预览并确认：

- 页面能正常加载
- 控制台没有 error
- 图片全部加载
- 阻尼振动动画可运行
- 暂停按钮可用
- `gamma` 和 `omega` 滑块可用
- 任务统计数字正确
- 任务筛选按钮可用
- 桌面端无横向溢出
- 手机端无横向溢出

当前任务统计的预期结果是：

```text
Total: 6
Done: 2
Doing: 2
Open: 2
Completion: 33%
```

## 部署到 GitHub Pages

这个网站可以部署到独立 Pages 仓库：

```text
https://github.com/setsuna-1106/setsuna-1106
```

发布地址：

```text
https://setsuna-1106.github.io/setsuna-1106/
```

### 手动同步流程

不要在 `c4phy` 仓库中提交网站发布内容。推荐使用独立临时目录克隆 Pages 仓库：

```bash
tmpdir=$(mktemp -d /private/tmp/setsuna-pages.XXXXXX)
git clone https://github.com/setsuna-1106/setsuna-1106.git "$tmpdir/repo"
```

复制网站文件：

```bash
cp website/index.html "$tmpdir/repo/index.html"
cp website/styles.css "$tmpdir/repo/styles.css"
cp website/script.js "$tmpdir/repo/script.js"
mkdir -p "$tmpdir/repo/assets"
cp website/assets/* "$tmpdir/repo/assets/"
```

提交并推送：

```bash
cd "$tmpdir/repo"
git add index.html styles.css script.js assets
git commit -m "Update personal website"
git push origin main
```

GitHub Pages 通常会在几十秒到几分钟内刷新。

## 注意事项

- 不要提交 `.DS_Store`
- 不要把发布提交混入 `c4phy` 仓库
- 修改任务状态时只使用 `done`、`doing`、`open`
- 新增外链时确认 URL 可访问
- 如果修改 `tasks` 数据结构，需要同步修改 `renderTasks()` 和 `taskCounts()`
- 如果移动网站目录，确保 `index.html`、`styles.css`、`script.js` 和 `assets/` 的相对路径保持一致

## 后续可改进方向

- 从 JSON 文件加载任务数据
- 自动读取 GitHub API 的仓库 star 数和更新时间
- 为项目卡片增加按语言或主题筛选
- 为 c4phy 的每个子项目增加独立详情页
- 增加暗色模式
- 增加中文 / 英文切换
