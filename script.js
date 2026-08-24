document.documentElement.classList.add("js-ready");

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const tasks = [
  { title: "完善 ODE / nonlinear oscillations 笔记", area: "Notes", status: "doing", detail: "继续整理 Euler、RK2、RK4、阻尼振子与非线性振子的相位误差和稳定性观察。" },
  { title: "给随机行走加入更多可视化", area: "Simulation", status: "open", detail: "补充自回避行走、均方位移、扩散距离和多样本统计分布图。" },
  { title: "整理 spontaneous decay 文档", area: "Notes", status: "open", detail: "把离散衰变模拟和指数近似的对照写成项目说明。" },
  { title: "补充球内反射模块说明", area: "Simulation", status: "open", detail: "说明光线在球内反射的几何假设、边界处理和可视化输出方式。" },
  { title: "细化教材转换流程页面", area: "Workflow", status: "doing", detail: "把 PDF 解析、术语统一、LaTeX 重建和最终校对拆成可复用步骤。" },
  { title: "给 Obsidian 插件补使用场景", area: "Tooling", status: "open", detail: "补充长文档阅读、教材复习和文件浏览器进度提示的实际用例。" },
];

const moduleMeta = {
  oscillator: {
    title: "DAMPED OSCILLATOR",
    method: "EULER / RK FAMILY",
    detail: "用阻尼振子检验步长、相位误差、能量衰减和数值稳定性。",
    values: ["PHASE 1.42", "STEPS 128", "STABLE"],
  },
  walk: {
    title: "RANDOM WALK",
    method: "MONTE CARLO",
    detail: "随机行走与扩散距离统计连接概率模型、模拟和可视化。",
    values: ["RMS 4.82", "SAMPLES 240", "SAMPLING"],
  },
  pendulum: {
    title: "DOUBLE PENDULUM",
    method: "NONLINEAR ODE",
    detail: "用相位轨迹观察非线性系统对初值误差的敏感性。",
    values: ["CHAOS 0.78", "STEPS 512", "SENSITIVE"],
  },
};

let heroRunning = !reducedMotion;
let labRunning = !reducedMotion;
let time = 0;
let lastFrame = performance.now();
let activeModule = "oscillator";
let taskFilter = "all";
let pendulumTrail = [];
let heroVisible = true;
let labVisible = true;

const heroControls = {
  canvas: $("#oscillator"),
  damping: $("#damping"),
  frequency: $("#frequency"),
};

function resizeCanvas(canvas) {
  if (!canvas) return { width: 0, height: 0 };
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const width = Math.max(300, Math.floor(rect.width));
  const height = Math.max(220, Math.floor(rect.height));
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return { width, height, ctx };
}

function drawGrid(ctx, width, height, gap = 30) {
  ctx.fillStyle = "#08141c";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(57, 91, 101, .34)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function oscillatorValue(t, gamma, omega) {
  return Math.exp(-gamma * t) * Math.cos(omega * t);
}

function drawHero() {
  const canvas = heroControls.canvas;
  const damping = heroControls.damping;
  const frequency = heroControls.frequency;
  if (!canvas || !damping || !frequency) return;
  const { width, height, ctx } = resizeCanvas(canvas);
  const gamma = Number(damping.value);
  const omega = Number(frequency.value);
  const originY = height * .48;
  const left = 34;
  const right = width - 24;
  const amp = Math.min(100, height * .3);

  drawGrid(ctx, width, height, 30);
  ctx.strokeStyle = "rgba(236, 246, 242, .66)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, originY);
  ctx.lineTo(right, originY);
  ctx.stroke();

  const samples = Math.max(180, Math.floor(width * .7));
  ctx.strokeStyle = "#5ee7d1";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < samples; i += 1) {
    const u = i / (samples - 1);
    const x = left + u * (right - left);
    const y = originY - oscillatorValue(u * 16, gamma, omega) * amp;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#ff9d57";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 7]);
  for (const sign of [1, -1]) {
    ctx.beginPath();
    for (let i = 0; i < samples; i += 1) {
      const u = i / (samples - 1);
      const x = left + u * (right - left);
      const y = originY - sign * Math.exp(-gamma * u * 16) * amp;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const phase = (time % 16) / 16;
  const dotX = left + phase * (right - left);
  const dotY = originY - oscillatorValue(phase * 16, gamma, omega) * amp;
  ctx.save();
  ctx.shadowColor = "#c6f45c";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#c6f45c";
  ctx.beginPath();
  ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "rgba(198, 244, 92, .58)";
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.moveTo(dotX, dotY);
  ctx.lineTo(dotX, height - 25);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#91a5a9";
  ctx.font = "700 10px SFMono-Regular, Menlo, monospace";
  ctx.fillText("AMPLITUDE", left, height - 14);
  ctx.fillText("t", right - 7, originY - 10);
  const energy = Math.exp(-gamma * ((time % 16) * .8));
  const gammaNode = $("#hero-gamma");
  const omegaNode = $("#hero-omega");
  const energyNode = $("#hero-energy");
  if (gammaNode) gammaNode.textContent = gamma.toFixed(2);
  if (omegaNode) omegaNode.textContent = omega.toFixed(1);
  if (energyNode) energyNode.textContent = energy.toFixed(2);
}

function drawLabOscillator(ctx, width, height) {
  const originY = height * .5;
  const left = 28;
  const right = width - 24;
  const amp = Math.min(110, height * .3);
  ctx.strokeStyle = "rgba(236, 246, 242, .5)";
  ctx.beginPath();
  ctx.moveTo(left, originY);
  ctx.lineTo(right, originY);
  ctx.stroke();
  ctx.strokeStyle = "#5ee7d1";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 260; i += 1) {
    const u = i / 259;
    const x = left + u * (right - left);
    const y = originY - oscillatorValue(u * 17 + time * .25, .04, 1.4) * amp;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#c6f45c";
  ctx.font = "700 11px SFMono-Regular, Menlo, monospace";
  ctx.fillText("x(t)", right - 28, originY - amp - 12);
}

function drawLabWalk(ctx, width, height) {
  const centerX = width * .5;
  const centerY = height * .5;
  ctx.strokeStyle = "rgba(236, 246, 242, .4)";
  ctx.beginPath();
  ctx.moveTo(24, centerY);
  ctx.lineTo(width - 24, centerY);
  ctx.moveTo(centerX, 18);
  ctx.lineTo(centerX, height - 18);
  ctx.stroke();
  for (let path = 0; path < 5; path += 1) {
    ctx.strokeStyle = path === 4 ? "#c6f45c" : `rgba(94, 231, 209, ${.18 + path * .1})`;
    ctx.lineWidth = path === 4 ? 2 : 1;
    ctx.beginPath();
    let x = centerX;
    let y = centerY;
    ctx.moveTo(x, y);
    for (let i = 0; i < 120; i += 1) {
      const angle = Math.sin(i * 1.73 + path * 2.1) * Math.PI;
      const step = 1.5 + (Math.sin(i * .29 + path) + 1) * 1.6;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const marker = (time * 18) % 120;
  ctx.fillStyle = "#ff9d57";
  ctx.beginPath();
  ctx.arc(centerX + Math.cos(marker * 1.73) * marker * .8, centerY + Math.sin(marker * 1.73) * marker * .8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#91a5a9";
  ctx.font = "700 11px SFMono-Regular, Menlo, monospace";
  ctx.fillText("RMS / SAMPLE PATHS", 26, 30);
}

function drawLabPendulum(ctx, width, height) {
  const originX = width * .5;
  const originY = Math.min(78, height * .22);
  const armOne = Math.min(110, height * .3);
  const armTwo = Math.min(120, height * .34);
  const angleOne = Math.sin(time * .9) * .72;
  const angleTwo = Math.sin(time * 1.67 + .8) * .9;
  const x1 = originX + Math.sin(angleOne) * armOne;
  const y1 = originY + Math.cos(angleOne) * armOne;
  const x2 = x1 + Math.sin(angleTwo) * armTwo;
  const y2 = y1 + Math.cos(angleTwo) * armTwo;
  pendulumTrail.push({ x: x2, y: y2 });
  if (pendulumTrail.length > 160) pendulumTrail.shift();
  ctx.strokeStyle = "rgba(255, 109, 143, .6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  pendulumTrail.forEach((point, index) => { if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); });
  ctx.stroke();
  ctx.strokeStyle = "#5ee7d1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, originY); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.fillStyle = "#c6f45c";
  ctx.beginPath(); ctx.arc(x1, y1, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ff9d57";
  ctx.beginPath(); ctx.arc(x2, y2, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#91a5a9";
  ctx.font = "700 11px SFMono-Regular, Menlo, monospace";
  ctx.fillText("SENSITIVE INITIAL CONDITIONS", 24, height - 22);
}

function drawLab() {
  const canvas = $("#lab-canvas");
  if (!canvas) return;
  const { width, height, ctx } = resizeCanvas(canvas);
  drawGrid(ctx, width, height, 32);
  if (activeModule === "walk") drawLabWalk(ctx, width, height);
  else if (activeModule === "pendulum") drawLabPendulum(ctx, width, height);
  else drawLabOscillator(ctx, width, height);
}

function updatePlayButton(button, running, label) {
  if (!button) return;
  button.setAttribute("aria-label", running ? `Pause ${label}` : `Play ${label}`);
  button.setAttribute("title", running ? `Pause ${label}` : `Play ${label}`);
  const icon = $("span", button);
  if (icon) icon.textContent = running ? "II" : ">";
}

function setActiveModule(module) {
  activeModule = module;
  pendulumTrail = [];
  const meta = moduleMeta[module];
  $$("[data-module]").forEach((button) => button.classList.toggle("is-active", button.dataset.module === module));
  const method = $("#lab-method");
  const title = $("#lab-module-title");
  const detail = $("#lab-module-detail");
  if (method) method.textContent = meta.method;
  if (title) title.textContent = meta.title;
  if (detail) detail.textContent = meta.detail;
  meta.values.forEach((value, index) => { const node = $("#lab-value-" + String.fromCharCode(97 + index)); if (node) node.textContent = value; });
  drawLab();
}

function updateTaskStats() {
  const counts = tasks.reduce((result, task) => { result.total += 1; result[task.status] += 1; return result; }, { total: 0, done: 0, doing: 0, open: 0 });
  const completion = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
  ["total", "doing", "open", "done"].forEach((key) => { const node = $("#task-" + key); if (node) node.textContent = counts[key]; });
  const percent = $("#task-percent");
  const bar = $("#task-meter-bar");
  if (percent) percent.textContent = `${completion}%`;
  if (bar) bar.style.width = `${completion}%`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function renderTasks() {
  const list = $("#task-list");
  if (!list) return;
  const visible = taskFilter === "all" ? tasks : tasks.filter((task) => task.status === taskFilter);
  list.innerHTML = visible.length ? visible.map((task) => `<article class="task-row"><div class="task-row-main"><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.detail)}</p></div><div class="task-row-status" data-status="${escapeHtml(task.status)}">${escapeHtml(task.status)}</div><div class="task-row-meta">${escapeHtml(task.area)}</div></article>`).join("") : `<p class="empty-state">当前筛选下没有任务。</p>`;
}

function bindInteractions() {
  $("#play-sim")?.addEventListener("click", () => { heroRunning = !heroRunning; updatePlayButton($("#play-sim"), heroRunning, "simulation"); });
  $("#lab-play")?.addEventListener("click", () => { labRunning = !labRunning; updatePlayButton($("#lab-play"), labRunning, "laboratory animation"); });
  $("#damping")?.addEventListener("input", drawHero);
  $("#frequency")?.addEventListener("input", drawHero);
  $$(`[data-module]`).forEach((button) => button.addEventListener("click", () => setActiveModule(button.dataset.module)));
  $$(`[data-task-filter]`).forEach((button) => button.addEventListener("click", () => { taskFilter = button.dataset.taskFilter; $$(`[data-task-filter]`).forEach((item) => item.classList.toggle("is-active", item === button)); renderTasks(); }));
  let resizeTimer = 0;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { drawHero(); drawLab(); }, 120); });
  window.addEventListener("scroll", () => { const max = document.documentElement.scrollHeight - window.innerHeight; const progress = max ? (window.scrollY / max) * 100 : 0; const bar = $("#scroll-progress"); if (bar) bar.style.width = `${progress}%`; }, { passive: true });
  if ("IntersectionObserver" in window) {
    const watchCanvas = (selector, setter) => {
      const canvas = $(selector);
      if (!canvas) return;
      new IntersectionObserver((entries) => { setter(entries[0].isIntersecting); }, { threshold: 0 }).observe(canvas);
    };
    watchCanvas("#oscillator", (visible) => { heroVisible = visible; });
    watchCanvas("#lab-canvas", (visible) => { labVisible = visible; if (visible && !reducedMotion) drawLab(); });
  }
}

function setupReveal() {
  const items = $$(`[data-reveal]`);
  if (!("IntersectionObserver" in window) || reducedMotion) { items.forEach((item) => item.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .12, rootMargin: "0px 0px -8%" });
  items.forEach((item) => observer.observe(item));
}

function setupNav() {
  const links = $$(".nav-links a");
  const sections = links.map((link) => document.getElementById(link.getAttribute("href").slice(1))).filter(Boolean);
  if (!("IntersectionObserver" in window)) return;
  const clearAtTop = () => { if (window.scrollY < 180) links.forEach((link) => link.classList.remove("is-current")); };
  const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) links.forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === `#${visible.target.id}`)); clearAtTop(); }, { rootMargin: "-30% 0px -58%", threshold: [.1, .35, .7] });
  sections.forEach((section) => observer.observe(section));
  window.addEventListener("scroll", clearAtTop, { passive: true });
  clearAtTop();
}

function frame(now) {
  const delta = Math.min(.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if ((heroRunning && heroVisible) || (labRunning && labVisible)) time += delta * 1.8;
  if (heroRunning && heroVisible) drawHero();
  if (labRunning && labVisible) drawLab();
  requestAnimationFrame(frame);
}

updatePlayButton($("#play-sim"), heroRunning, "simulation");
updatePlayButton($("#lab-play"), labRunning, "laboratory animation");
updateTaskStats();
renderTasks();
setActiveModule("oscillator");
bindInteractions();
setupReveal();
setupNav();
drawHero();
drawLab();
requestAnimationFrame(frame);
