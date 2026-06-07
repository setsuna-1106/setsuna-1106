const data = window.siteData;
const storageKey = "setsuna-advance-tasks-v4";

const state = {
  projectFilter: "all",
  projectSearch: "",
  taskFilter: "all",
  activeModule: data.modules[0].id,
  tasks: loadTasks(),
  running: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  time: 0,
  lastFrame: performance.now(),
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : data.tasks.map((task) => ({ ...task }));
  } catch {
    return data.tasks.map((task) => ({ ...task }));
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(state.tasks));
}

function renderHeroMeta() {
  $("#hero-meta").innerHTML = data.profile.facts
    .map(
      ([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `
    )
    .join("");
}

function renderContact() {
  $("#contact-card").innerHTML = [
    data.profile.name,
    data.profile.location,
    data.profile.email,
  ]
    .map((item) => `<p>${escapeHtml(item)}</p>`)
    .join("");
}

function renderProjectFilters() {
  const tags = new Set();
  data.projects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)));
  const filters = ["all", ...Array.from(tags).sort()];
  $("#project-filters").innerHTML = filters
    .map(
      (tag) => `
        <button class="chip ${state.projectFilter === tag ? "is-active" : ""}" type="button" data-project-filter="${escapeHtml(tag)}">
          ${escapeHtml(tag)}
        </button>
      `
    )
    .join("");
}

function renderProjects() {
  const query = state.projectSearch.trim().toLowerCase();
  const projects = data.projects.filter((project) => {
    const matchesTag = state.projectFilter === "all" || project.tags.includes(state.projectFilter);
    const haystack = `${project.title} ${project.description} ${project.tags.join(" ")} ${project.status}`.toLowerCase();
    return matchesTag && (!query || haystack.includes(query));
  });

  $("#project-list").innerHTML =
    projects
      .map(
        (project) => `
          <article class="project-item">
            <div class="project-code">${escapeHtml(project.code)}</div>
            <div class="project-status">${escapeHtml(project.status)}</div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <ul>
              ${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
            </ul>
            <a class="project-link" href="${escapeHtml(project.link)}">Open repository</a>
          </article>
        `
      )
      .join("") || `<p class="empty-state">没有匹配的项目。</p>`;
}

function renderModules() {
  $("#module-list").innerHTML = data.modules
    .map(
      (module, index) => `
        <button class="module-row ${state.activeModule === module.id ? "is-active" : ""}" type="button" data-module-id="${escapeHtml(module.id)}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(module.title)}</strong>
          <em>${escapeHtml(module.method)}</em>
        </button>
      `
    )
    .join("");
  renderModuleDetail();
}

function renderModuleDetail() {
  const module = data.modules.find((item) => item.id === state.activeModule) || data.modules[0];
  $("#module-detail").innerHTML = `
    <div class="panel-head">
      <span>${escapeHtml(module.method)}</span>
      <span>${Math.round(module.intensity * 100)}%</span>
    </div>
    <div class="module-copy">
      <h3>${escapeHtml(module.title)}</h3>
      <p>${escapeHtml(module.detail)}</p>
    </div>
    <canvas id="walk-canvas" width="640" height="360"></canvas>
    <div class="module-meter" aria-label="Module intensity">
      <span style="width: ${module.intensity * 100}%"></span>
    </div>
  `;
  drawWalk(module.intensity);
}

function renderNotes() {
  $("#note-gallery").innerHTML = data.notes
    .map(
      (note) => `
        <figure class="note-card ${escapeHtml(note.size)}">
          <img src="${escapeHtml(note.image)}" alt="${escapeHtml(note.alt)}">
          <figcaption>
            <span>${escapeHtml(note.label)}</span>
            ${escapeHtml(note.title)}
          </figcaption>
        </figure>
      `
    )
    .join("");
}

function renderMatrix() {
  const rows = [["Topic", "Notes", "C", "Viz"], ...data.matrix];
  $("#matrix").innerHTML = rows
    .map(
      (row, rowIndex) => `
        <div class="matrix-row ${rowIndex === 0 ? "matrix-head" : ""}" role="row">
          ${row
            .map((cell, cellIndex) => {
              const role = rowIndex === 0 ? "columnheader" : "cell";
              return `<span role="${role}" data-state="${escapeHtml(String(cell).toLowerCase())}">${escapeHtml(cell)}</span>`;
            })
            .join("")}
        </div>
      `
    )
    .join("");
}

function taskCounts() {
  return state.tasks.reduce(
    (counts, task) => {
      counts.total += 1;
      counts[task.status] += 1;
      return counts;
    },
    { total: 0, done: 0, doing: 0, open: 0 }
  );
}

function renderTaskStats() {
  const counts = taskCounts();
  const completion = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
  $("#task-summary").innerHTML = [
    ["Total", counts.total],
    ["Done", counts.done],
    ["Doing", counts.doing],
    ["Open", counts.open],
  ]
    .map(
      ([label, value]) => `
        <article class="task-stat">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
  $("#task-percent").textContent = `${completion}%`;
  $("#task-meter-bar").style.width = `${completion}%`;
}

function renderTaskFilters() {
  const filters = ["all", "doing", "open", "done"];
  $("#task-filters").innerHTML = filters
    .map(
      (filter) => `
        <button class="chip ${state.taskFilter === filter ? "is-active" : ""}" type="button" data-task-filter="${filter}">
          ${filter}
        </button>
      `
    )
    .join("");
}

function renderTasks() {
  const tasks = state.taskFilter === "all" ? state.tasks : state.tasks.filter((task) => task.status === state.taskFilter);
  $("#task-list").innerHTML =
    tasks
      .map(
        (task) => `
          <article class="task-row">
            <div class="task-row-main">
              <h3>${escapeHtml(task.title)}</h3>
              <p>${escapeHtml(task.detail || "本地新增任务，可后续补充说明。")}</p>
            </div>
            <div class="task-row-status" data-status="${escapeHtml(task.status)}">
              ${escapeHtml(task.status)}
            </div>
            <div class="task-row-meta">${escapeHtml(task.area || "General")}</div>
          </article>
        `
      )
      .join("") || `<p class="empty-state">当前筛选下没有任务。</p>`;
}

function renderTaskPanel() {
  renderTaskStats();
  renderTaskFilters();
  renderTasks();
}

function bindEvents() {
  $("#project-search").addEventListener("input", (event) => {
    state.projectSearch = event.target.value;
    renderProjects();
  });

  $("#project-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-project-filter]");
    if (!button) return;
    state.projectFilter = button.dataset.projectFilter;
    renderProjectFilters();
    renderProjects();
  });

  $("#module-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-module-id]");
    if (!button) return;
    state.activeModule = button.dataset.moduleId;
    renderModules();
  });

  $("#task-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-filter]");
    if (!button) return;
    state.taskFilter = button.dataset.taskFilter;
    renderTaskPanel();
  });

  $("#task-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cycle-task]");
    if (!button) return;
    const task = state.tasks[Number(button.dataset.cycleTask)];
    const next = { open: "doing", doing: "done", done: "open" };
    task.status = next[task.status] || "open";
    saveTasks();
    renderTaskPanel();
  });

  const taskForm = $("#task-form");
  if (taskForm) {
    taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }

  const resetTasks = $("#reset-tasks");
  if (resetTasks) {
    resetTasks.addEventListener("click", () => {
      state.tasks = data.tasks.map((task) => ({ ...task }));
      saveTasks();
      renderTaskPanel();
    });
  }

  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "ink" ? "paper" : "ink";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("setsuna-advance-theme", next);
  });

  $("#play-sim").addEventListener("click", () => {
    state.running = !state.running;
    updatePlayState();
  });

  [$("#damping"), $("#frequency")].forEach((input) => {
    input.addEventListener("input", drawOscillator);
  });

  window.addEventListener("hashchange", updateRoute);
  window.addEventListener("resize", () => {
    resizeCanvas($("#oscillator"));
    drawOscillator();
    renderModuleDetail();
  });
}

function updateRoute() {
  const id = window.location.hash.replace("#", "") || "overview";
  $$("[data-route]").forEach((link) => link.classList.toggle("is-active", link.dataset.route === id));
}

function restoreTheme() {
  const saved = localStorage.getItem("setsuna-advance-theme");
  if (saved) document.documentElement.dataset.theme = saved;
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * scale));
  canvas.height = Math.max(240, Math.floor(rect.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function oscillatorValue(t, gamma, omega) {
  return Math.exp(-gamma * t) * Math.cos(omega * t);
}

function drawGrid(ctx, width, height, gap) {
  ctx.fillStyle = getCssColor("--paper");
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = getCssColor("--soft-line");
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

function getCssColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawOscillator() {
  const canvas = $("#oscillator");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const gamma = Number($("#damping").value);
  const omega = Number($("#frequency").value);
  const originY = Math.max(118, height * 0.44);
  const left = 52;
  const right = width - 34;
  const amp = Math.min(108, height * 0.26);
  const samples = Math.max(160, Math.floor(width * 0.6));

  drawGrid(ctx, width, height, 24);

  ctx.strokeStyle = getCssColor("--ink");
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, originY);
  ctx.lineTo(width - 28, originY);
  ctx.moveTo(48, 28);
  ctx.lineTo(48, height - 34);
  ctx.stroke();

  ctx.fillStyle = getCssColor("--ink");
  ctx.font = "800 11px SFMono-Regular, Menlo, monospace";
  ctx.fillText("x(t)", width - 66, originY - 12);
  ctx.fillText("t", 58, 42);

  ctx.strokeStyle = getCssColor("--blue");
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

  ctx.strokeStyle = getCssColor("--red");
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 7]);
  [-1, 1].forEach((sign) => {
    ctx.beginPath();
    for (let i = 0; i < samples; i += 1) {
      const u = i / (samples - 1);
      const t = u * 16;
      const envelope = sign * Math.exp(-gamma * t);
      const x = left + u * (right - left);
      const y = originY - envelope * amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  ctx.setLineDash([]);

  const phase = (state.time % 16) / 16;
  const dotT = phase * 16;
  const dotX = left + phase * (right - left);
  const dotY = originY - oscillatorValue(dotT, gamma, omega) * amp;
  ctx.fillStyle = getCssColor("--yellow");
  ctx.strokeStyle = getCssColor("--ink");
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const massX = width - 90 + oscillatorValue(state.time % 16, gamma, omega) * Math.min(54, width * 0.08);
  const massY = height - 58;
  ctx.strokeStyle = getCssColor("--red");
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, massY);
  for (let i = 0; i <= 10; i += 1) {
    const u = i / 10;
    const x = 48 + u * (massX - 82);
    const y = massY + (i % 2 === 0 ? -12 : 12);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(massX - 28, massY);
  ctx.stroke();
  ctx.fillStyle = getCssColor("--ink");
  ctx.fillRect(massX - 28, massY - 24, 56, 48);
  ctx.fillStyle = getCssColor("--paper");
  ctx.font = "800 12px SFMono-Regular, Menlo, monospace";
  ctx.fillText("m", massX - 4, massY + 4);
}

function drawWalk(intensity) {
  const canvas = $("#walk-canvas");
  if (!canvas) return;
  resizeCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  drawGrid(ctx, width, height, 20);

  let x = width / 2;
  let y = height / 2;
  const steps = Math.floor(80 + intensity * 180);
  const step = 8;
  ctx.strokeStyle = getCssColor("--blue");
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < steps; i += 1) {
    const angle = ((i * 97 + Math.floor(intensity * 100)) % 360) * (Math.PI / 180);
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;
    x = Math.max(18, Math.min(width - 18, x));
    y = Math.max(18, Math.min(height - 18, y));
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = getCssColor("--yellow");
  ctx.strokeStyle = getCssColor("--ink");
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function updatePlayState() {
  const statusText = $("#sim-status");
  const playButton = $("#play-sim");
  statusText.textContent = state.running ? "running" : "paused";
  statusText.dataset.status = state.running ? "running" : "paused";
  playButton.setAttribute("aria-label", state.running ? "Pause simulation" : "Play simulation");
  playButton.setAttribute("title", state.running ? "Pause simulation" : "Play simulation");
  playButton.querySelector("span").textContent = state.running ? "II" : ">";
}

function frame(now) {
  const delta = Math.min(0.05, (now - state.lastFrame) / 1000);
  state.lastFrame = now;
  if (state.running) state.time += delta * 1.8;
  drawOscillator();
  requestAnimationFrame(frame);
}

function init() {
  restoreTheme();
  renderHeroMeta();
  renderContact();
  renderProjectFilters();
  renderProjects();
  renderModules();
  renderNotes();
  renderMatrix();
  renderTaskPanel();
  bindEvents();
  updateRoute();
  resizeCanvas($("#oscillator"));
  updatePlayState();
  requestAnimationFrame(frame);
}

init();
