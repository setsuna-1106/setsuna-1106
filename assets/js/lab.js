"use strict";

(() => {
  const { $, palette, canvas2d, animate, icon } = Site;
  const canvas = $("#lab-canvas");
  const models = {
    oscillator: {
      number: "01", title: "阻尼谐振动", caption: "Damped harmonic oscillator",
      equation: "ẍ + 2γẋ + ω₀²x = 0", note: "x(0) = 1 m · v(0) = 0 m/s", condition: "m = 1 kg · 0 ≤ t ≤ 20 s",
      parameters: [["damping", "阻尼系数", "γ / s⁻¹", 0, .8, .01], ["frequency", "固有角频率", "ω₀ / rad·s⁻¹", 1, 3, .05]],
      values: [.18, 1.5], presets: { light: ["轻阻尼", .18, 1.5], free: ["无阻尼", 0, 1.5], strong: ["较强阻尼", .7, 1.5] }, preset: "light",
      views: [["displacement", "位移"], ["phase", "相空间"]], view: "displacement",
      labels: ["时间 t / s", "位移 x / m", "速度 v / m·s⁻¹", "能量 E / E₀"], legend: ["运动轨迹", "当前状态"]
    },
    wave: {
      number: "02", title: "相向波的干涉", caption: "Counterpropagating waves",
      equation: "y = sin(kx − ωt) + sin(−kx − ωt + φ)", note: "A₁ = A₂ = 1 m · c = 1 m/s", condition: "ω = ck · k = 2π / λ",
      parameters: [["wavelength", "波长", "λ / m", 1, 6, .1], ["phase-offset", "相位差", "φ / π", 0, 2, .05]],
      values: [3, 0], presets: { standing: ["同相入射", 3, 0], opposite: ["反相入射", 3, 1], short: ["短波长", 1.5, 0] }, preset: "standing",
      views: [["superposition", "叠加"], ["envelope", "包络"]], view: "superposition",
      labels: ["时间 t / s", "y(0,t) / m", "波长 λ / m", "频率 f / Hz"], legend: ["合成波", "向右传播", "向左传播"]
    },
    orbit: {
      number: "03", title: "开普勒椭圆轨道", caption: "Keplerian orbit",
      equation: "r̈ = −μr / |r|³", note: "μ = GM = 1 · 单位归一化", condition: "起点：近心点 · 0 ≤ e < 1",
      parameters: [["eccentricity", "偏心率", "e", 0, .8, .01], ["semi-major", "半长轴", "a", .7, 2, .05]],
      values: [.45, 1.2], presets: { ellipse: ["椭圆轨道", .45, 1.2], circle: ["圆轨道", 0, 1.2], elongated: ["高偏心率", .75, 1.2] }, preset: "ellipse",
      views: [["trajectory", "轨道"], ["velocity", "速度矢量"]], view: "trajectory",
      labels: ["时间 t", "距离 r", "速率 |v|", "比能量 ε"], legend: ["运行轨迹", "运动天体", "中心天体"]
    }
  };
  let model = "oscillator", time = 0, orbitSolution = null, clock;
  const current = () => models[model];
  function configure() {
    const config = current();
    $("#model-caption").textContent = `${config.title} / ${config.caption}`;
    $("#experiment-panel").setAttribute("aria-labelledby", `tab-${model}`);
    $("#lab-settings").innerHTML = `<p class="eyebrow">MODEL / ${config.number}</p><h3>${config.title}</h3><p class="equation">${config.equation}</p>` +
      config.parameters.map(([id, label, unit, min, max, step], index) => `<div class="parameter"><label for="${id}">${label}<span>${unit}</span></label><div><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${config.values[index]}"><output id="${id}-value" for="${id}">${config.values[index].toFixed(2)}</output></div></div>`).join("") +
      `<label class="preset-label" for="preset">参数预设</label><select id="preset">${Object.entries(config.presets).map(([key, [label]]) => `<option value="${key}">${label}</option>`).join("")}<option value="custom" disabled>自定义</option></select><div class="model-note"><span>${config.note}</span><p>${config.condition}</p></div>`;
    $("#preset").value = config.preset;
    config.parameters.forEach(([id], index) => $("#" + id).addEventListener("input", () => {
      config.values[index] = Number($("#" + id).value);
      $("#" + id + "-value").textContent = config.values[index].toFixed(2);
      config.preset = "custom"; $("#preset").value = "custom"; reset();
    }));
    $("#preset").addEventListener("change", () => {
      config.preset = $("#preset").value;
      config.values = config.presets[config.preset].slice(1);
      configure(); reset();
    });
    renderViews();
    document.querySelectorAll(".telemetry span").forEach((label, index) => { label.textContent = config.labels[index]; });
  }
  function renderViews() {
    const config = current();
    $("#lab-views").innerHTML = config.views.map(([key, title]) => `<button type="button" data-view="${key}" class="${key === config.view ? "is-active" : ""}" aria-pressed="${key === config.view}">${title}</button>`).join("");
    $("#lab-views").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { config.view = button.dataset.view; renderViews(); clock.redraw(); }));
    canvas.setAttribute("aria-label", `${config.title}：${config.views.find(([key]) => key === config.view)[1]}`);
    const legend = model === "wave" && config.view === "envelope" ? ["合成波", "振幅包络"] : config.legend;
    $("#plot-legend").innerHTML = legend.map((label, index) => `<span><i class="legend-swatch swatch-${index}" style="${model === "orbit" && index === 2 ? "background:var(--yellow)" : model === "wave" && config.view === "envelope" && index === 1 ? "background:var(--muted)" : ""}" aria-hidden="true"></i>${label}</span>`).join("");
  }
  function reset() {
    time = 0;
    if (model === "orbit") orbitSolution = Physics.orbit(current().values[1], current().values[0]);
    $("#lab-status").textContent = clock?.running ? "运行中" : "已暂停";
    clock?.redraw();
  }
  const tabs = [...document.querySelectorAll("[data-model]")];
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      model = tab.dataset.model;
      tabs.forEach((other) => { other.setAttribute("aria-selected", other === tab); other.tabIndex = other === tab ? 0 : -1; });
      configure(); reset();
    });
    tab.addEventListener("keydown", (event) => {
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault(); tabs[next].focus(); tabs[next].click();
    });
  });
  function telemetry(values) {
    document.querySelectorAll(".telemetry output").forEach((output, index) => { output.textContent = (Math.abs(values[index]) < .005 ? 0 : values[index]).toFixed(2); });
  }
  function path(ctx, count, point, color, width = 1.8, alpha = 1) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.beginPath();
    for (let i = 0; i <= count; i++) { const [x, y] = point(i / count); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke(); ctx.globalAlpha = 1;
  }
  function dot(ctx, x, y, color, radius = 4) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI); ctx.fill();
  }
  function plot(ctx, width, height, rangeX, rangeY, labelX, labelY, colors) {
    const bounds = { left: 48, right: width - 22, top: 30, bottom: height - 38 };
    const mapX = (x) => bounds.left + (x - rangeX[0]) / (rangeX[1] - rangeX[0]) * (bounds.right - bounds.left);
    const mapY = (y) => bounds.bottom - (y - rangeY[0]) / (rangeY[1] - rangeY[0]) * (bounds.bottom - bounds.top);
    ctx.font = "10px monospace"; ctx.fillStyle = colors.muted; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = rangeX[0] + i / 4 * (rangeX[1] - rangeX[0]);
      const y = rangeY[0] + i / 4 * (rangeY[1] - rangeY[0]);
      ctx.strokeStyle = colors.line; ctx.beginPath(); ctx.moveTo(mapX(x), bounds.top); ctx.lineTo(mapX(x), bounds.bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bounds.left, mapY(y)); ctx.lineTo(bounds.right, mapY(y)); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(Number(x.toFixed(1)), mapX(x), bounds.bottom + 19);
      ctx.textAlign = "right"; ctx.fillText(Number(y.toFixed(1)), bounds.left - 9, mapY(y) + 3);
    }
    ctx.textAlign = "left"; ctx.fillText(labelY, bounds.left, 16);
    ctx.textAlign = "right"; ctx.fillText(labelX, bounds.right, height - 4); ctx.textAlign = "left";
    return { mapX, mapY, ...bounds };
  }
  function drawOscillator(ctx, width, height, colors) {
    const [gamma, omega] = current().values, phase = current().view === "phase";
    const { mapX, mapY } = plot(ctx, width, height, phase ? [-1.2, 1.2] : [0, 20], phase ? [-omega * 1.2, omega * 1.2] : [-1.2, 1.2], phase ? "x / m" : "t / s", phase ? "v / m/s" : "x / m", colors);
    const point = (t) => { const state = Physics.oscillator(t, gamma, omega); return [mapX(phase ? state.x : t), mapY(phase ? state.v : state.x)]; };
    path(ctx, 500, (p) => point(p * 20), colors.accent, 1.2, .22);
    path(ctx, 500, (p) => point(p * time), colors.accent, 2);
    dot(ctx, ...point(time), colors.coral, 4.5);
    const state = Physics.oscillator(time, gamma, omega);
    telemetry([time, state.x, state.v, state.energy]);
  }
  function drawWave(ctx, width, height, colors) {
    const [wavelength, phasePi] = current().values;
    const { mapX, mapY } = plot(ctx, width, height, [-6, 6], [-2.4, 2.4], "x / m", "y / m", colors);
    const state = (x) => Physics.wave(x, time, wavelength, phasePi * Math.PI);
    if (current().view === "superposition") {
      path(ctx, 400, (p) => [mapX(p * 12 - 6), mapY(state(p * 12 - 6).first)], colors.coral, 1.2, .65);
      path(ctx, 400, (p) => [mapX(p * 12 - 6), mapY(state(p * 12 - 6).second)], colors.muted, 1.2, .65);
    } else {
      ctx.setLineDash([4, 5]);
      for (const sign of [-1, 1]) path(ctx, 400, (p) => [mapX(p * 12 - 6), mapY(sign * state(p * 12 - 6).envelope)], colors.muted, 1, .7);
      ctx.setLineDash([]);
    }
    path(ctx, 500, (p) => [mapX(p * 12 - 6), mapY(state(p * 12 - 6).sum)], colors.accent, 2.3);
    dot(ctx, mapX(0), mapY(state(0).sum), colors.accent);
    telemetry([time, state(0).sum, wavelength, 1 / wavelength]);
  }
  function drawOrbit(ctx, width, height, colors) {
    const [eccentricity, a] = current().values;
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);
    const scale = Math.min((width - 86) / (2.6 * a), (height - 92) / (2.6 * a));
    const centerX = width / 2, centerY = height / 2 + 5;
    const mapX = (x) => centerX + (x + a * eccentricity) * scale;
    const mapY = (y) => centerY - y * scale;
    const point = (t) => { const state = orbitSolution.at(t); return [mapX(state.x), mapY(state.y)]; };
    ctx.strokeStyle = colors.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, centerY); ctx.lineTo(width - 30, centerY); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(centerX, centerY, a * scale, b * scale, 0, 0, 2 * Math.PI); ctx.stroke();
    const fraction = time % orbitSolution.period;
    path(ctx, 240, (p) => point(fraction - (1 - p) * orbitSolution.period * .22), colors.accent, 2.5, .85);
    const state = orbitSolution.at(time), x = mapX(state.x), y = mapY(state.y);
    ctx.fillStyle = colors.accent; ctx.globalAlpha = .07; ctx.beginPath(); ctx.moveTo(mapX(0), centerY);
    for (let i = 0; i <= 80; i++) ctx.lineTo(...point(fraction - (1 - i / 80) * orbitSolution.period * .1));
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.line; ctx.beginPath(); ctx.moveTo(mapX(0), centerY); ctx.lineTo(x, y); ctx.stroke();
    dot(ctx, mapX(0), centerY, colors.yellow, 9);
    dot(ctx, x, y, colors.coral, 5.5);
    if (current().view === "velocity") {
      const angle = Math.atan2(-state.vy, state.vx);
      const length = Math.min(44, Math.min(width, height) * .12) * state.v / Math.sqrt((1 + eccentricity) / (a * (1 - eccentricity)));
      const endX = x + Math.cos(angle) * length, endY = y + Math.sin(angle) * length;
      ctx.strokeStyle = colors.coral; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY);
      ctx.moveTo(endX - Math.cos(angle - .45) * 7, endY - Math.sin(angle - .45) * 7); ctx.lineTo(endX, endY); ctx.lineTo(endX - Math.cos(angle + .45) * 7, endY - Math.sin(angle + .45) * 7); ctx.stroke();
    }
    ctx.fillStyle = colors.muted; ctx.font = "10px monospace";
    ctx.fillText(`T = ${orbitSolution.period.toFixed(2)}`, 24, 22);
    ctx.fillText(`h = ${state.angularMomentum.toFixed(3)}`, 24, height - 16);
    telemetry([time, state.r, state.v, state.energy]);
  }
  function draw(delta) {
    time += delta;
    if (model === "oscillator" && time >= 20) { time = 20; clock?.setRunning(false); $("#lab-status").textContent = "已完成"; }
    const { ctx, width, height } = canvas2d(canvas), colors = palette();
    ({ oscillator: drawOscillator, wave: drawWave, orbit: drawOrbit })[model](ctx, width, height, colors);
  }
  configure();
  clock = animate(canvas, draw, (running) => {
    icon($("#lab-play"), running ? "pause" : "play", running ? "暂停实验" : "播放实验");
    $("#lab-status").textContent = running ? "运行中" : "已暂停";
  });
  $("#lab-play").addEventListener("click", () => { if (model === "oscillator" && time >= 20) reset(); clock.toggle(); });
  $("#lab-reset").addEventListener("click", reset);
})();
