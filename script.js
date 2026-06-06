const canvas = document.querySelector("#oscillator");
const ctx = canvas.getContext("2d");
const dampingInput = document.querySelector("#damping");
const frequencyInput = document.querySelector("#frequency");
const playButton = document.querySelector("#play-sim");
const statusText = document.querySelector("#sim-status");

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
requestAnimationFrame(frame);
