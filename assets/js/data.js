// Curated from the public repository READMEs and GitHub API on 2026-09-05.
window.portfolioData = {
  snapshotDate: "2026-09-05",
  projects: [
    { name: "c4phy", title: "c4phy", subtitle: "计算物理的开放实验记录", category: "physics", icon: "orbit", description: "用 C / C++ 做数值计算，用 Python、Raylib 与 SDL2 观察结果。从随机行走、双摆到傅里叶分析，最近开始探索盒中核子的束缚态。", tags: ["C / C++", "Python", "Numerical simulation"], language: "C", featured: true },
    { name: "MCMCode", title: "MCMCode", subtitle: "从数据到模型的工具箱", category: "modeling", icon: "chart-no-axes-combined", description: "为数学建模竞赛积累的可运行模板。覆盖回归、分类、优化、预测、图论、统计检验与论文绘图，配套原理和使用文档。", tags: ["scikit-learn", "SciPy", "OR-Tools"], language: "Python" },
    { name: "slog", title: "slog", subtitle: "让今天接得上昨天", category: "tools", icon: "terminal", description: "极简 Markdown 学习日志 CLI。自动带入未懂问题与待办，支持检索、统计、终端浏览和本地 Git 快照。单文件，零第三方依赖。", tags: ["CLI", "Markdown", "Zero dependencies"], language: "Python" },
    { name: "obsidian-pdf-reading-progress", title: "PDF Reading Progress", subtitle: "让阅读留下进度", category: "tools", icon: "book-open", description: "Obsidian 的 PDF 阅读进度插件。在文件列表与状态栏记录当前页数，集中查看阅读列表，也能标记一本书已经读完。", tags: ["Obsidian", "Plugin", "Reading"], language: "TypeScript" },
    { name: "chinese-to-english-textbook", title: "Textbook Pipeline", subtitle: "从中文教材到英文排版", category: "tools", icon: "languages", description: "中文 STEM 教材到英文 LaTeX 的五阶段流程：内容提取、结构重组、翻译、排版与校对，附术语表及学术书籍版式模板。", tags: ["LaTeX", "STEM", "Translation"], language: "TeX" },
    { name: "cpp_learn", title: "cpp_learn", subtitle: "C++ 学习与实践", category: "physics", icon: "code-2", description: "C++ 学习过程中保留的代码练习。把语言学习与计算物理的数值、图形编程实践连接起来。", tags: ["C++", "Practice"], language: "C++" },
    { name: "setsuna-1106", title: "Personal Website", subtitle: "我的个人网站", category: "tools", icon: "panels-top-left", description: "个人 GitHub Profile 与作品集。集中整理公开项目、计算物理笔记和实验记录，保留每一次构建的轨迹。", tags: ["HTML", "CSS", "JavaScript"], language: "CSS" }
  ],
  repositories: [
    { name: "c4phy", language: "C", stars: 2, pushed_at: "2026-09-05T03:41:46Z" },
    { name: "MCMCode", language: "Python", stars: 1, pushed_at: "2026-09-03T15:05:49Z" },
    { name: "setsuna-1106", language: "CSS", stars: 0, pushed_at: "2026-09-02T15:09:34Z" },
    { name: "slog", language: "Python", stars: 0, pushed_at: "2026-08-29T13:28:12Z" },
    { name: "cpp_learn", language: "C++", stars: 0, pushed_at: "2026-08-03T14:24:07Z" },
    { name: "chinese-to-english-textbook", language: "TeX", stars: 0, pushed_at: "2026-05-01T04:24:47Z" },
    { name: "obsidian-pdf-reading-progress", language: "TypeScript", stars: 1, pushed_at: "2026-04-27T07:47:13Z" }
  ]
};
