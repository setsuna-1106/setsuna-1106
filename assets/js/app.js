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

const categoryLabels = {
  physics: ["计算物理", "PHYSICS / RESEARCH"],
  modeling: ["数学建模", "MODELING / METHODS"],
  tools: ["学习工具", "TOOLS / WORKFLOW"]
};
// Each project receives a small, source-native diagram instead of a stock thumbnail.
const projectDiagrams = {
  ai4physics: `<circle class="diagram-guide" cx="250" cy="160" r="104"/><circle class="diagram-guide" cx="250" cy="160" r="57"/><path class="diagram-ink" d="M96 235C147 207 164 96 241 121S350 246 408 83"/><path class="diagram-accent" d="M121 88L241 121L374 220M241 121L408 83"/><circle class="diagram-dot" cx="121" cy="88" r="6"/><circle class="diagram-dot" cx="241" cy="121" r="7"/><circle class="diagram-dot" cx="374" cy="220" r="6"/><text x="95" y="66">AI</text><text x="388" y="259">φ</text>`,
  c4phy: `<path class="diagram-guide" d="M62 256H448M85 277V45"/><path class="diagram-ink" d="M103 222L132 189L159 203L182 151L214 165L239 119L268 143L293 102L318 123L353 76L385 102L422 65"/><path class="diagram-accent" d="M103 222L422 65"/><circle class="diagram-dot" cx="103" cy="222" r="7"/><circle class="diagram-dot" cx="422" cy="65" r="9"/><text x="252" y="275">⟨r²⟩ ∝ N</text>`,
  MCMCode: `<path class="diagram-guide" d="M67 264H445M84 280V49M84 188H445M84 113H445"/><path class="diagram-ink" d="M94 244C143 240 169 222 205 189S265 102 315 112S371 169 430 54"/><path class="diagram-accent" d="M99 237L178 217L249 157L322 115L404 101"/><circle class="diagram-dot" cx="178" cy="217" r="6"/><circle class="diagram-dot" cx="249" cy="157" r="6"/><circle class="diagram-dot" cx="322" cy="115" r="6"/><text x="307" y="280">min f(x)</text>`,
  slog: `<path class="diagram-ink" d="M103 62H399V267H103Z"/><path class="diagram-guide" d="M104 105H399M143 105V267M164 139H359M164 174H335M164 209H371M164 244H315"/><path class="diagram-accent" d="M117 132l8 8 13-17M117 202l8 8 13-17"/><text x="119" y="92">LOG / 09.25</text><text x="164" y="158">what I learned</text>`,
  "obsidian-pdf-reading-progress": `<path class="diagram-guide" d="M133 69H333l45 46v181H133Z"/><path class="diagram-ink" d="M133 69H333l45 46v181H133Z M333 69v46h45 M163 150H319M163 180H319M163 210H285"/><path class="diagram-accent" d="M163 253H348"/><circle class="diagram-guide" cx="377" cy="80" r="43"/><path class="diagram-accent" d="M377 37A43 43 0 1 1 338 98"/><text x="337" y="89">72%</text>`,
  "chinese-to-english-textbook": `<path class="diagram-ink" d="M72 77Q161 52 235 79V265Q159 241 72 268ZM265 79Q340 52 428 77V268Q340 241 265 265Z"/><path class="diagram-guide" d="M101 136H203M101 171H194M101 205H187M298 136H399M298 171H384M298 205H391"/><path class="diagram-accent" d="M222 170H279M261 154l18 16-18 16"/><text x="111" y="116">中</text><text x="302" y="116">EN</text>`,
  cpp_learn: `<path class="diagram-guide" d="M64 258H443M88 282V47M137 228H419"/><path class="diagram-ink" d="M118 214C168 214 186 78 251 78S330 214 402 214"/><path class="diagram-accent" d="M132 214L251 78L387 214"/><circle class="diagram-dot" cx="251" cy="78" r="7"/><text x="135" y="64">for (int i = 0; i &lt; N; i++)</text><text x="304" y="276">C++</text>`,
  "setsuna-1106": `<path class="diagram-ink" d="M74 57H427V266H74Z M74 102H427"/><path class="diagram-guide" d="M98 123V248M120 129H261M120 155H309M120 184H270M120 212H327"/><path class="diagram-accent" d="M281 211C309 166 325 181 343 147S377 130 400 158"/><circle class="diagram-dot" cx="104" cy="81" r="5"/><circle class="diagram-dot" cx="121" cy="81" r="5"/><circle class="diagram-dot" cx="138" cy="81" r="5"/><text x="294" y="245">s. / 1106</text>`
};
function diagram(name) {
  return `<svg viewBox="0 0 500 320" aria-hidden="true" focusable="false"><path class="diagram-corner" d="M23 43V23h20M457 23h20v20M23 277v20h20M457 297h20v-20"/>${projectDiagrams[name] || projectDiagrams["setsuna-1106"]}</svg>`;
}
function selectProject(project) {
  if (!project) return;
  const stage = $(".project-stage");
  if (stage.dataset.project === project.name) return;
  stage.dataset.project = project.name;
  $("#stage-art").innerHTML = diagram(project.name);
  $("#stage-art").querySelectorAll(".diagram-ink, .diagram-accent").forEach(path => {
    path.style.setProperty("--draw-length", String(path.getTotalLength()));
  });
  $("#stage-number").textContent = `PLATE ${String(data.projects.indexOf(project) + 1).padStart(2, "0")}`;
  $("#stage-title").textContent = project.title;
  $("#stage-subtitle").textContent = project.subtitle;
  $("#stage-category").textContent = categoryLabels[project.category][1];
  $("#stage-language").textContent = project.language;
  $$(".project-entry").forEach(entry => entry.classList.toggle("is-active", entry.dataset.project === project.name));
  if (!Site.motion.matches) {
    const art = $("#stage-art svg");
    art.animate?.([{ opacity: .4, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 420, easing: "ease-out" });
  }
}

function renderProjects(category = "all") {
  const projects = data.projects.filter((p) => category === "all" || p.category === category);
  $("#project-grid").innerHTML = projects.map(p => {
    const number = String(data.projects.indexOf(p) + 1).padStart(2, "0");
    return `<a class="project-entry" href="${repoURL(p.name)}" data-project="${escapeHTML(p.name)}"><span class="entry-number" aria-hidden="true">${number}</span><span class="entry-copy"><span class="entry-type">${categoryLabels[p.category][0]} / ${escapeHTML(p.language)}</span><strong class="entry-title">${escapeHTML(p.title)}</strong><span class="entry-subtitle">${escapeHTML(p.subtitle)}</span><span class="entry-description">${escapeHTML(p.description)}</span><span class="entry-tags">${p.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}</span></span><span class="entry-art" aria-hidden="true">${diagram(p.name)}</span><span class="entry-arrow" aria-hidden="true">↗</span></a>`;
  }).join("");
  $("#result-count").textContent = `${projects.length} 个项目`;
  $("#stage-range").textContent = `INDEX / ${String(projects.length).padStart(2, "0")} ENTRIES`;
  $(".project-stage").dataset.project = "";
  selectProject(projects[0]);
  document.dispatchEvent(new Event("projectsrendered"));
}
$("#project-grid").addEventListener("pointerover", event => {
  const entry = event.target.closest(".project-entry");
  if (entry) selectProject(data.projects.find(project => project.name === entry.dataset.project));
});
$("#project-grid").addEventListener("focusin", event => {
  const entry = event.target.closest(".project-entry");
  if (entry) selectProject(data.projects.find(project => project.name === entry.dataset.project));
});
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

const navLinks = $$("#navigation a[href^='#']");
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
