"use strict";
(() => {
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const data = window.portfolioData;
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
  $("#project-grid").innerHTML = projects.map((p) => {
    const content = `<div class="project-top"><i data-lucide="${p.icon}"></i><span>演算 / ${String(data.projects.indexOf(p) + 1).padStart(2, "0")}</span></div><h3><a href="${repoURL(p.name)}">${escapeHTML(p.title)}</a></h3><p class="project-subtitle"><span class="conclusion">${escapeHTML(p.subtitle)}</span></p><p class="project-description">${escapeHTML(p.description)}</p><div class="project-tags">${p.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div><div class="project-footer"><span class="language">${escapeHTML(p.language)}</span><a class="text-link" href="${repoURL(p.name)}">查看项目 <i data-lucide="arrow-up-right"></i></a></div>`;
    return `<article class="project-card${p.featured ? " featured" : ""}">${p.featured ? `<div class="project-body">${content}</div><figure class="project-art"><img src="assets/random-walk.png" width="360" height="260" alt="c4phy 随机行走与扩散笔记中的原始图示"><figcaption><span>RANDOM WALK / DIFFUSION</span><span>FIG. 02</span></figcaption></figure>` : content}</article>`;
  }).join("");
  $("#result-count").textContent = `${projects.length} 个项目`;
  icons();
  document.dispatchEvent(new Event("projectsrendered"));
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

const systemTheme = matchMedia("(prefers-color-scheme: dark)");
function effectiveTheme() {
  return document.documentElement.dataset.theme || (systemTheme.matches ? "dark" : "light");
}
function syncThemeButton() {
  const dark = effectiveTheme() === "dark";
  const button = $("#theme-toggle");
  const label = dark ? "切换到稿纸模式" : "切换到黑板模式";
  button.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i><span class="theme-mode-label" aria-hidden="true">${dark ? "稿纸" : "黑板"}</span>`;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", String(dark));
  $("#theme-system").hidden = !document.documentElement.dataset.theme;
  icons();
  $("meta[name=\"theme-color\"]").content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
}
let themeFinish = () => {};
function switchTheme(next) {
  themeFinish();
  const root = document.documentElement;
  if (next === "system") delete root.dataset.theme;
  else root.dataset.theme = next;
  try { next === "system" ? localStorage.removeItem("setsuna-theme") : localStorage.setItem("setsuna-theme", next); } catch (_) {}
  syncThemeButton();
  document.dispatchEvent(new Event("themechange"));
  if (Site.motion.matches) return;
  const transition = $(".theme-transition"), skip = $("#skip-transition");
  transition.classList.add("is-active"); skip.hidden = false;
  let timer;
  themeFinish = () => { clearTimeout(timer); transition.classList.remove("is-active"); skip.hidden = true; themeFinish = () => {}; };
  timer = setTimeout(themeFinish, 760);
}
$("#theme-toggle").addEventListener("click", () => switchTheme(effectiveTheme() === "dark" ? "light" : "dark"));
$("#theme-system").addEventListener("click", () => switchTheme("system"));
$("#skip-transition").addEventListener("click", () => { themeFinish(); $("#theme-toggle").focus(); });
Site.motion.addEventListener("change", () => { if (Site.motion.matches) themeFinish(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") themeFinish(); });
systemTheme.addEventListener("change", () => {
  if (!document.documentElement.dataset.theme) {
    syncThemeButton();
    document.dispatchEvent(new Event("themechange"));
  }
});
function setMenu(open) {
  $("#navigation").classList.toggle("is-open", open);
  $("#menu-toggle").setAttribute("aria-expanded", open);
  buttonIcon("#menu-toggle", open ? "x" : "menu", open ? "收起导航" : "展开导航");
}
$("#menu-toggle").addEventListener("click", () => setMenu($("#menu-toggle").getAttribute("aria-expanded") !== "true"));
$("#navigation").addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });
// Icon replacement can detach the click target; the original event path stays valid.
document.addEventListener("click", (event) => { if (!event.composedPath().includes($(".site-header"))) setMenu(false); });

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
renderProjects(); renderActivity(); syncThemeButton(); updateNav();
})();
