// Project descriptions follow public READMEs. The activity snapshot comes from the GitHub API.
window.portfolioData = {
  snapshotDate: "2026-11-24",
  projects: [
    { name: "electrostatic-bvp", title: "静电边值问题", subtitle: "有限差分与边界电荷法", category: "physics", description: "用有限差分求解二维 Laplace 方程，在矩形区域与解析解对照，再用边界电荷法比较开放空间与接地外框中的有限平行板电场。", tags: ["Laplace 方程", "NumPy", "网格收敛"], language: "Python" },
    { name: "sr", title: "sr", subtitle: "本地科研资料与进度管理", category: "tools", description: "把文献、阅读证据和项目进度保存在 Markdown、BibTeX 与 JSON 中。支持 Zotero 对接、PDF 校验和论文阅读记录。", tags: ["CLI", "Zotero", "BibTeX"], language: "Python" },
    { name: "c4phy", title: "c4phy", subtitle: "计算物理的开放实验记录", category: "physics", icon: "orbit", description: "用 C / C++ 和 Python 做计算物理练习，记录差分误差、蒙特卡洛随机行走、非线性振荡和束缚态本征值计算。", tags: ["C / C++", "Python", "数值实验"], language: "C", featured: true },
    { name: "ai4physics", title: "AI×Physics", subtitle: "论文精读与技术专题", category: "physics", icon: "sparkles", description: "已发布 DU-NO 神经算子论文精读和 Jev 概率决策接口专题。每篇中文解读沿着问题、方法、证据与局限展开。", tags: ["神经算子", "AI", "中文解读"], language: "Python" },
    { name: "bedwars-arena", title: "BedWars Arena", subtitle: "二维多智能体仿真平台", category: "modeling", description: "把 BedWars 的部分规则抽象成可重复运行的二维环境，开放策略接口、对局回放和最小 PPO 训练流程。", tags: ["多智能体", "PPO", "可复现仿真"], language: "Python" },
    { name: "invis-attack-sim", title: "InvisAttackSim", subtitle: "对局事件的蒙特卡洛建模", category: "modeling", description: "用事件驱动的蒙特卡洛模拟估计简化 BedWars 对局中的隐身进攻事件密度，已与汇总记录做描述性比较，数据校准仍在进行。", tags: ["Monte Carlo", "离散事件", "统计建模"], language: "Python" },
    { name: "MCMCode", title: "MCMCode", subtitle: "从数据到模型的工具箱", category: "modeling", icon: "chart-no-axes-combined", description: "为数学建模竞赛积累的可运行模板。覆盖回归、分类、优化、预测、图论、统计检验与论文绘图，配套原理和使用文档。", tags: ["scikit-learn", "SciPy", "OR-Tools"], language: "Python" },
    { name: "slog", title: "slog", subtitle: "Markdown 学习日志", category: "tools", icon: "terminal", description: "单文件、零第三方依赖的 Python CLI。每天新建一份 Markdown 日志，并从终端查看课程进度与下次开始的位置。", tags: ["CLI", "Markdown", "零第三方依赖"], language: "Python" },
    { name: "obsidian-pdf-reading-progress", title: "PDF Reading Progress", subtitle: "让阅读留下进度", category: "tools", icon: "book-open", description: "Obsidian 的 PDF 阅读进度插件。在文件列表与状态栏记录当前页数，集中查看阅读列表，也能标记一本书已经读完。", tags: ["Obsidian", "Plugin", "Reading"], language: "TypeScript" },
    { name: "chinese-to-english-textbook", title: "Textbook Pipeline", subtitle: "从中文教材到英文排版", category: "tools", icon: "languages", description: "中文 STEM 教材到英文 LaTeX 的五阶段流程：内容提取、结构重组、翻译、排版与校对，附术语表及学术书籍版式模板。", tags: ["LaTeX", "STEM", "Translation"], language: "TeX" },
    { name: "cpp_learn", title: "cpp_learn", subtitle: "C++ 学习与实践", category: "physics", icon: "code-2", description: "C++ 学习过程中保留的代码练习。把语言学习与计算物理的数值、图形编程实践连接起来。", tags: ["C++", "Practice"], language: "C++" },
    { name: "setsuna-1106", title: "Personal Website", subtitle: "我的个人网站", category: "tools", icon: "panels-top-left", description: "个人 GitHub Profile 与作品集。集中整理公开项目、计算物理笔记和实验记录，保留每一次构建的轨迹。", tags: ["HTML", "CSS", "JavaScript"], language: "CSS" }
  ],
  repositories: [
    { name: "bedwars-arena", language: "Python", stars: 0, pushed_at: "2026-11-23T11:45:46Z" },
    { name: "electrostatic-bvp", language: "Python", stars: 0, pushed_at: "2026-11-18T03:38:00Z" },
    { name: "setsuna-1106", language: "CSS", stars: 0, pushed_at: "2026-10-23T16:37:41Z" },
    { name: "invis-attack-sim", language: "Python", stars: 0, pushed_at: "2026-10-23T08:03:52Z" },
    { name: "slog", language: "Python", stars: 0, pushed_at: "2026-10-13T01:37:57Z" },
    { name: "sr", language: "Python", stars: 0, pushed_at: "2026-10-03T06:09:27Z" },
    { name: "c4phy", language: "C", stars: 2, pushed_at: "2026-09-28T08:31:07Z" },
    { name: "ai4physics", language: "Python", stars: 0, pushed_at: "2026-09-26T04:50:08Z" },
    { name: "MCMCode", language: "Python", stars: 1, pushed_at: "2026-09-03T15:05:49Z" },
    { name: "cpp_learn", language: "C++", stars: 0, pushed_at: "2026-08-03T14:24:07Z" },
    { name: "chinese-to-english-textbook", language: "TeX", stars: 0, pushed_at: "2026-05-01T04:24:47Z" },
    { name: "obsidian-pdf-reading-progress", language: "TypeScript", stars: 1, pushed_at: "2026-04-27T07:47:13Z" }
  ]
};
