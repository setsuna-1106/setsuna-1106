"use strict";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const data = window.portfolioData;
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const repoURL = (name) => `https://github.com/setsuna-1106/${encodeURIComponent(name)}`;
const icons = () => window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
function buttonIcon(id, name, label) {
  const button = $(id);
  button.innerHTML = `<i data-lucide="${name}"></i>`;
  button.title = label;
  button.setAttribute("aria-label", label);
  icons();
}

function renderProjects(category = "all") {
  const projects = data.projects.filter((p) => category === "all" || p.category === category);
  const colors = { C: "#657b82", Python: "#b08d36", TypeScript: "#367fb4", TeX: "#618d52", "C++": "#c35b70", CSS: "#8e6aa6" };
  $("#project-grid").innerHTML = projects.map((p) => {
    const content = `<div class="project-top"><i data-lucide="${p.icon}"></i><span>${p.featured ? "FEATURED / 01" : "OPEN SOURCE"}</span></div><h3><a href="${repoURL(p.name)}">${escapeHTML(p.title)}</a></h3><p class="project-subtitle">${escapeHTML(p.subtitle)}</p><p class="project-description">${escapeHTML(p.description)}</p><div class="project-tags">${p.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div><div class="project-footer"><span class="language" style="--language-color:${colors[p.language]}">${escapeHTML(p.language)}</span><a class="text-link" href="${repoURL(p.name)}">查看项目 <i data-lucide="arrow-up-right"></i></a></div>`;
    return `<article class="project-card${p.featured ? " featured" : ""}">${p.featured ? `<div class="project-body">${content}</div><figure class="project-art"><img src="assets/random-walk.png" width="360" height="260" alt="c4phy 随机行走与扩散笔记中的原始图示"><figcaption><span>RANDOM WALK / DIFFUSION</span><span>FIG. 02</span></figcaption></figure>` : content}</article>`;
  }).join("");
  $("#result-count").textContent = `${projects.length} 个项目`;
  icons();
}
$$('[data-filter]').forEach((button) => button.addEventListener("click", () => {
  $$('[data-filter]').forEach((b) => { const selected = b === button; b.classList.toggle("is-active", selected); b.setAttribute("aria-pressed", selected); });
  renderProjects(button.dataset.filter);
}));

let repositories = data.repositories;
let sourceLabel = `GitHub 快照 · ${data.snapshotDate}`;
function renderActivity() {
  $("#activity-list").innerHTML = [...repositories].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 4).map((repo) => {
    const project = data.projects.find((p) => p.name === repo.name);
    return `<a class="activity-row" href="${repoURL(repo.name)}"><time datetime="${escapeHTML(repo.pushed_at)}">${repo.pushed_at.slice(0, 10)}</time><span><strong>${escapeHTML(repo.name)}</strong><small>${escapeHTML(project?.subtitle || repo.language || "公开仓库")}</small></span><i data-lucide="arrow-up-right"></i></a>`;
  }).join("");
  $("#repo-count").textContent = repositories.length;
  $("#star-count").textContent = repositories.reduce((sum, r) => sum + r.stars, 0);
  $("#sync-status").textContent = sourceLabel;
  icons();
}
function validRepositories(value) {
  return Array.isArray(value) && value.length > 0 && value.every((r) => typeof r.name === "string" && /^[\w.-]+$/.test(r.name) && Number.isInteger(r.stars) && r.stars >= 0 && typeof r.pushed_at === "string" && Number.isFinite(Date.parse(r.pushed_at)));
}
async function refreshGithub() {
  const button = $("#refresh-github");
  button.disabled = true;
  $("#sync-status").textContent = "正在读取 GitHub…";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const collected = [];
    for (let page = 1; page <= 10; page++) {
      const response = await fetch(`https://api.github.com/users/setsuna-1106/repos?per_page=100&page=${page}`, { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error(`GitHub ${response.status}`);
      const batch = await response.json();
      if (!Array.isArray(batch)) throw new Error("Invalid response");
      collected.push(...batch);
      if (batch.length < 100) break;
      if (page === 10) throw new Error("Incomplete repository list");
    }
    const next = collected.map((r) => ({ name: r.name, language: r.language, stars: r.stargazers_count, pushed_at: r.pushed_at }));
    if (!validRepositories(next)) throw new Error("Invalid repository data");
    repositories = next;
    const at = Date.now();
    sourceLabel = `GitHub 已同步 · ${new Date(at).toLocaleDateString("sv-SE")}`;
    try { localStorage.setItem("setsuna-repositories-v1", JSON.stringify({ at, repositories })); } catch (_) {}
    renderActivity();
  } catch (_) {
    $("#sync-status").textContent = `暂时无法连接 · ${sourceLabel}`;
  } finally { clearTimeout(timeout); button.disabled = false; }
}
try {
  const cache = JSON.parse(localStorage.getItem("setsuna-repositories-v1"));
  if (cache && Number.isFinite(cache.at) && cache.at <= Date.now() && cache.at >= Date.parse(data.snapshotDate) && validRepositories(cache.repositories)) {
    repositories = cache.repositories;
    sourceLabel = `GitHub 缓存 · ${new Date(cache.at).toLocaleDateString("sv-SE")}`;
  }
} catch (_) {}
$("#refresh-github").addEventListener("click", refreshGithub);

let palette;
function updatePalette() {
  const css = getComputedStyle(document.documentElement);
  palette = Object.fromEntries(["bg", "surface", "line", "ink", "muted", "accent", "coral"].map((key) => [key, css.getPropertyValue(`--${key}`).trim()]));
}
function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  buttonIcon("#theme-toggle", dark ? "sun" : "moon", dark ? "切换浅色主题" : "切换深色主题");
  $('meta[name="theme-color"]').content = dark ? "#171b19" : "#fafbf9";
}
$("#theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("setsuna-theme", next); } catch (_) {}
  syncThemeButton(); updatePalette(); drawHero(); drawLab();
});
function setMenu(open) {
  $("#navigation").classList.toggle("is-open", open);
  $("#menu-toggle").setAttribute("aria-expanded", open);
  buttonIcon("#menu-toggle", open ? "x" : "menu", open ? "收起导航" : "展开导航");
}
$("#menu-toggle").addEventListener("click", () => setMenu($("#menu-toggle").getAttribute("aria-expanded") !== "true"));
$("#navigation").addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });
document.addEventListener("click", (event) => { if (!event.target.closest(".site-header")) setMenu(false); });

const dialog = $("#image-dialog");
$$('[data-lightbox]').forEach((link) => link.addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  $("#dialog-image").src = link.href;
  $("#dialog-image").alt = link.querySelector("img").alt;
  $("#image-caption").textContent = link.dataset.caption;
  dialog.showModal(); document.body.classList.add("dialog-open");
}));
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
dialog.addEventListener("click", (event) => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });

// Exact underdamped solution for x(0)=1, v(0)=0; all slider values satisfy gamma < omega.
function oscillator(t, gamma, omega) {
  const wd = Math.sqrt(omega * omega - gamma * gamma);
  const decay = Math.exp(-gamma * t);
  const x = decay * (Math.cos(wd * t) + gamma / wd * Math.sin(wd * t));
  const v = -decay * omega * omega / wd * Math.sin(wd * t);
  return { x, v, energy: (v * v + omega * omega * x * x) / (omega * omega) };
}
function canvasContext(id) {
  const canvas = $(id);
  const { width, height } = canvas.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}
let heroTime = 0;
let labTime = 0;
let heroRunning = !motionPreference.matches;
let labRunning = !motionPreference.matches;
let heroVisible = true;
let labVisible = false;
let view = "displacement";
function drawHero() {
  const { ctx, width, height } = canvasContext("#hero-canvas");
  const mobile = width <= 600;
  const left = mobile ? 30 : width * .59;
  const right = mobile ? width - 30 : width * .94;
  const top = mobile ? height - 256 : 54;
  const bottom = mobile ? height - 105 : height - 165;
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  const sx = (right - left) * .41, sy = (bottom - top) * .43;
  ctx.strokeStyle = palette.line; ctx.lineWidth = .7;
  for (let x = left; x <= right; x += 29) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); }
  for (let y = top; y <= bottom; y += 29) { ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); }
  ctx.strokeStyle = palette.muted; ctx.globalAlpha = .45;
  ctx.beginPath(); ctx.moveTo(left, cy); ctx.lineTo(right, cy); ctx.moveTo(cx, top); ctx.lineTo(cx, bottom); ctx.stroke(); ctx.globalAlpha = 1;
  const point = (t, gamma) => { const state = oscillator(t, gamma, 1.5); return [cx + state.x * sx, cy - state.v / 1.5 * sy]; };
  [0.065, 0.13, 0.24].forEach((gamma, index) => {
    ctx.strokeStyle = index === 0 ? palette.accent : index === 1 ? palette.coral : palette.muted;
    ctx.globalAlpha = index === 0 ? .9 : .37; ctx.lineWidth = index === 0 ? 1.6 : 1;
    ctx.beginPath();
    for (let i = 0; i <= 700; i++) { const [x, y] = point(i / 700 * 29, gamma); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.globalAlpha = 1;
  });
  const [x, y] = point(heroTime % 29, .065);
  ctx.fillStyle = palette.accent; ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = palette.muted; ctx.font = "10px monospace"; ctx.fillText("x", right + 7, cy + 3); ctx.fillText("v", cx + 7, top - 7);
}
function drawLab() {
  const { ctx, width, height } = canvasContext("#lab-canvas");
  const gamma = Number($("#damping").value), omega = Number($("#frequency").value);
  const left = 44, right = width - 24, top = 22, bottom = height - 34;
  const cy = (top + bottom) / 2;
  const map = (t) => { const s = oscillator(t, gamma, omega); return view === "phase" ? [left + (s.x + 1.15) / 2.3 * (right - left), cy - s.v / (omega * 1.15) * (bottom - top) / 2] : [left + t / 20 * (right - left), cy - s.x / 1.15 * (bottom - top) / 2]; };
  ctx.font = "10px monospace"; ctx.lineWidth = 1; ctx.fillStyle = palette.muted;
  for (let i = 0; i <= 4; i++) {
    const x = left + i / 4 * (right - left);
    ctx.strokeStyle = palette.line; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
    ctx.fillText(view === "phase" ? (-1 + i * .5).toFixed(1) : String(i * 5), x - 7, bottom + 20);
  }
  for (let i = -1; i <= 1; i++) {
    const y = cy - i / 1.15 * (bottom - top) / 2;
    ctx.strokeStyle = palette.line; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
    ctx.fillText(String(view === "phase" ? (i * omega).toFixed(1) : i), 10, y + 4);
  }
  ctx.fillText(view === "phase" ? "v / m/s" : "x / m", left, 13);
  ctx.fillText(view === "phase" ? "x / m" : "t / s", right - 24, height - 3);
  const path = (end) => { ctx.beginPath(); for (let i = 0; i <= 600; i++) { const [x, y] = map(i / 600 * end); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); };
  ctx.strokeStyle = palette.accent; ctx.globalAlpha = .2; ctx.lineWidth = 1.4; path(20); ctx.globalAlpha = 1;
  ctx.lineWidth = 2; path(labTime);
  const [x, y] = map(labTime); ctx.fillStyle = palette.coral; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
  const state = oscillator(labTime, gamma, omega);
  $("#time-value").textContent = labTime.toFixed(2);
  $("#position-value").textContent = state.x.toFixed(2);
  $("#velocity-value").textContent = state.v.toFixed(2);
  $("#energy-value").textContent = state.energy.toFixed(2);
}
function updatePlayButtons() {
  buttonIcon("#hero-play", heroRunning ? "pause" : "play", heroRunning ? "暂停相轨迹" : "播放相轨迹");
  buttonIcon("#lab-play", labRunning ? "pause" : "play", labRunning ? "暂停实验" : "播放实验");
}
$("#hero-play").addEventListener("click", () => { heroRunning = !heroRunning; updatePlayButtons(); });
$("#lab-play").addEventListener("click", () => { labRunning = !labRunning; updatePlayButtons(); });
$("#lab-reset").addEventListener("click", () => { labTime = 0; drawLab(); });
function updateParameters(custom = true) {
  if (custom) $("#preset").value = "custom";
  $("#damping-value").textContent = Number($("#damping").value).toFixed(2);
  $("#frequency-value").textContent = Number($("#frequency").value).toFixed(2);
  labTime = 0; drawLab();
}
["#damping", "#frequency"].forEach((id) => $(id).addEventListener("input", () => updateParameters()));
$("#preset").addEventListener("change", () => { const [gamma, omega] = { light: [.18, 1.5], free: [0, 1.5], strong: [.7, 1.5] }[$("#preset").value]; $("#damping").value = gamma; $("#frequency").value = omega; updateParameters(false); });
$$('[data-view]').forEach((button) => button.addEventListener("click", () => {
  view = button.dataset.view;
  $$('[data-view]').forEach((b) => { b.classList.toggle("is-active", b === button); b.setAttribute("aria-pressed", b === button); });
  $("#lab-canvas").setAttribute("aria-label", view === "phase" ? "阻尼振子的位移与速度相轨迹" : "阻尼振子的位移随时间变化曲线"); drawLab();
}));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.target.id === "hero-canvas") heroVisible = entry.isIntersecting; else labVisible = entry.isIntersecting; }));
  observer.observe($("#hero-canvas")); observer.observe($("#lab-canvas"));
} else labVisible = true;
let previousFrame = performance.now();
function frame(now) {
  const delta = Math.min((now - previousFrame) / 1000, .05); previousFrame = now;
  if (!document.hidden) {
    if (heroRunning && heroVisible) { heroTime += delta * 1.5; drawHero(); }
    if (labRunning && labVisible) { labTime = (labTime + delta) % 20; drawLab(); }
  }
  requestAnimationFrame(frame);
}
motionPreference.addEventListener("change", () => { heroRunning = !motionPreference.matches; labRunning = !motionPreference.matches; updatePlayButtons(); });
new ResizeObserver(() => { drawHero(); drawLab(); }).observe(document.body);
const navLinks = $$("#navigation a");
let navScheduled = false;
function updateNav() {
  let current = "";
  navLinks.forEach((link) => { if ($(link.getAttribute("href")).getBoundingClientRect().top <= 180) current = link.hash; });
  navLinks.forEach((link) => { const selected = link.hash === current; link.classList.toggle("is-current", selected); if (selected) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
  navScheduled = false;
}
window.addEventListener("scroll", () => { if (!navScheduled) { navScheduled = true; requestAnimationFrame(updateNav); } }, { passive: true });
$("#year").textContent = new Date().getFullYear();
renderProjects(); renderActivity(); updatePalette(); syncThemeButton(); updatePlayButtons(); drawHero(); drawLab(); updateNav(); requestAnimationFrame(frame);
