const canvas = document.querySelector("#oscillator");
const ctx = canvas.getContext("2d");
const dampingInput = document.querySelector("#damping");
const frequencyInput = document.querySelector("#frequency");
const playButton = document.querySelector("#play-sim");
const statusText = document.querySelector("#sim-status");
const taskList = document.querySelector("#task-list");
const taskFilterButtons = document.querySelectorAll("[data-task-filter]");

const tasks = [
  {
    title: "整理 c4phy 项目主页",
    area: "Website",
    status: "done",
    detail: "完成瑞士风个人网站、GitHub profile 信息、项目入口和 advance 动态版链接。",
  },
  {
    title: "补全任务统计模块",
    area: "Website",
    status: "done",
    detail: "把学习任务转换成可筛选、可自动统计的前端组件，并把状态拆成 done / doing / open。",
  },
  {
    title: "同步 GitHub 公开仓库列表",
    area: "GitHub",
    status: "done",
    detail: "根据 GitHub API 更新为 4 个公开仓库，并移除未出现在公开列表中的项目展示。",
  },
  {
    title: "完善 ODE / nonlinear oscillations 笔记",
    area: "Notes",
    status: "doing",
    detail: "继续整理 Euler、RK2、RK4、阻尼振子与非线性振子的相位误差和稳定性观察。",
  },
  {
    title: "给随机行走加入更多可视化",
    area: "Simulation",
    status: "open",
    detail: "补充自回避行走、均方位移、扩散距离和多样本统计分布图。",
  },
  {
    title: "整理 spontaneous decay 文档",
    area: "Notes",
    status: "open",
    detail: "把离散衰变模拟和指数近似的对照写成项目说明。",
  },
  {
    title: "补充球内反射模块说明",
    area: "Simulation",
    status: "open",
    detail: "说明光线在球内反射的几何假设、边界处理和可视化输出方式。",
  },
  {
    title: "细化教材转换流程页面",
    area: "Workflow",
    status: "doing",
    detail: "把 PDF 解析、术语统一、LaTeX 重建和最终校对拆成可复用步骤。",
  },
  {
    title: "给 Obsidian 插件补使用场景",
    area: "Tooling",
    status: "open",
    detail: "补充长文档阅读、教材复习和文件浏览器进度提示的实际用例。",
  },
  {
    title: "检查 Pages 部署内容",
    area: "GitHub",
    status: "done",
    detail: "独立 Pages 仓库已经接入个人网站，根目录主页和 advance 子站可以分别部署。",
  },
];

let running = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let time = 0;
let lastFrame = performance.now();

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * scale));
  canvas.height = Math.max(240, Math.floor(rect.height * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawGrid(width, height) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#ededed";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawAxis(width, height, originY) {
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, originY);
  ctx.lineTo(width - 28, originY);
  ctx.moveTo(48, 28);
  ctx.lineTo(48, height - 30);
  ctx.stroke();

  ctx.fillStyle = "#111111";
  ctx.font = "700 11px SFMono-Regular, Menlo, monospace";
  ctx.fillText("x(t)", width - 64, originY - 12);
  ctx.fillText("t", 58, 42);
}

function oscillatorValue(t, gamma, omega) {
  return Math.exp(-gamma * t) * Math.cos(omega * t);
}

function drawCurve(width, height, originY, gamma, omega) {
  const left = 56;
  const right = width - 34;
  const amp = Math.min(112, height * 0.27);
  const samples = Math.max(140, Math.floor(width * 0.55));

  ctx.strokeStyle = "#0057b8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < samples; i += 1) {
    const u = i / (samples - 1);
    const t = u * 16;
    const x = left + u * (right - left);
    const y = originY - oscillatorValue(t, gamma, omega) * amp;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#e2382a";
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  for (let i = 0; i < samples; i += 1) {
    const u = i / (samples - 1);
    const t = u * 16;
    const envelope = Math.exp(-gamma * t);
    const x = left + u * (right - left);
    const y = originY - envelope * amp;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < samples; i += 1) {
    const u = i / (samples - 1);
    const t = u * 16;
    const envelope = -Math.exp(-gamma * t);
    const x = left + u * (right - left);
    const y = originY - envelope * amp;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  const phase = (time % 16) / 16;
  const dotT = phase * 16;
  const dotX = left + phase * (right - left);
  const dotY = originY - oscillatorValue(dotT, gamma, omega) * amp;

  ctx.fillStyle = "#ffd21f";
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(dotX, dotY);
  ctx.lineTo(dotX, originY);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawSpring(width, height, gamma, omega) {
  const baseX = 56;
  const baseY = height - 56;
  const value = oscillatorValue(time % 16, gamma, omega);
  const massX = width - 90 + value * Math.min(54, width * 0.08);
  const massY = baseY;
  const coils = 10;

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX - 22, baseY - 30);
  ctx.lineTo(baseX - 22, baseY + 30);
  ctx.moveTo(baseX - 22, baseY);
  ctx.lineTo(baseX, baseY);
  ctx.stroke();

  ctx.strokeStyle = "#e2382a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  for (let i = 0; i <= coils; i += 1) {
    const u = i / coils;
    const x = baseX + u * (massX - baseX - 28);
    const y = baseY + (i % 2 === 0 ? -12 : 12);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(massX - 28, baseY);
  ctx.stroke();

  ctx.fillStyle = "#111111";
  ctx.fillRect(massX - 28, massY - 24, 56, 48);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 12px SFMono-Regular, Menlo, monospace";
  ctx.fillText("m", massX - 4, massY + 4);
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const gamma = Number(dampingInput.value);
  const omega = Number(frequencyInput.value);
  const originY = Math.max(130, height * 0.44);

  drawGrid(width, height);
  drawAxis(width, height, originY);
  drawCurve(width, height, originY, gamma, omega);
  drawSpring(width, height, gamma, omega);
}

function frame(now) {
  const delta = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (running) {
    time += delta * 1.8;
  }
  draw();
  requestAnimationFrame(frame);
}

function updatePlayState() {
  statusText.textContent = running ? "running" : "paused";
  statusText.style.color = running ? "#168a61" : "#e2382a";
  playButton.setAttribute("aria-label", running ? "Pause simulation" : "Play simulation");
  playButton.setAttribute("title", running ? "Pause simulation" : "Play simulation");
  playButton.querySelector("span").textContent = running ? "II" : ">";
}

function taskCounts() {
  return tasks.reduce(
    (counts, task) => {
      counts.total += 1;
      counts[task.status] += 1;
      return counts;
    },
    { total: 0, done: 0, doing: 0, open: 0 }
  );
}

function setText(id, value) {
  const node = document.querySelector(id);
  if (node) node.textContent = value;
}

function renderTaskStats() {
  const counts = taskCounts();
  const completion = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
  setText("#task-total", counts.total);
  setText("#task-done", counts.done);
  setText("#task-doing", counts.doing);
  setText("#task-open", counts.open);
  setText("#task-percent", `${completion}%`);

  const meter = document.querySelector("#task-meter-bar");
  if (meter) meter.style.width = `${completion}%`;
}

function renderTasks(filter = "all") {
  if (!taskList) return;

  const visibleTasks = filter === "all" ? tasks : tasks.filter((task) => task.status === filter);
  taskList.innerHTML = visibleTasks
    .map(
      (task) => `
        <article class="task-row">
          <div class="task-row-main">
            <h3>${task.title}</h3>
            <p>${task.detail}</p>
          </div>
          <div class="task-row-status" data-status="${task.status}">${task.status}</div>
          <div class="task-row-meta">${task.area}</div>
        </article>
      `
    )
    .join("");
}

function bindTaskFilters() {
  taskFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      taskFilterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderTasks(button.dataset.taskFilter);
    });
  });
}

playButton.addEventListener("click", () => {
  running = !running;
  updatePlayState();
});

[dampingInput, frequencyInput].forEach((input) => {
  input.addEventListener("input", draw);
});

window.addEventListener("resize", () => {
  resizeCanvas();
  draw();
});

resizeCanvas();
updatePlayState();
renderTaskStats();
renderTasks();
bindTaskFilters();
requestAnimationFrame(frame);
