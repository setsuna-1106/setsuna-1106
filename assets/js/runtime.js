"use strict";

window.Site = (() => {
  const $ = (selector) => document.querySelector(selector);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  function palette() {
    const css = getComputedStyle(document.documentElement);
    return Object.fromEntries(["bg", "surface", "line", "ink", "muted", "accent", "coral", "yellow", "draft"].map((key) => [key, css.getPropertyValue(`--${key}`).trim()]));
  }
  function icon(button, name, label) {
    button.innerHTML = `<i data-lucide="${name}"></i>`;
    button.title = label;
    button.setAttribute("aria-label", label);
    window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
  }
  function canvas2d(canvas) {
    const { width, height } = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }
  // One clock per scene; no animation work while paused, offscreen or backgrounded.
  function animate(element, draw, onState = () => {}) {
    let running = !motion.matches, visible = true, request = 0, last = null;
    function frame(now) {
      request = 0;
      // Rough strokes need fewer frames than the former WebGL scene.
      if (last !== null && now - last < 1000 / 30) { schedule(); return; }
      const delta = last === null ? 0 : Math.min((now - last) / 1000, .05);
      last = now; draw(delta); schedule();
    }
    function schedule() {
      const active = running && visible && !document.hidden;
      if (active && !request) request = requestAnimationFrame(frame);
      if (!active) { cancelAnimationFrame(request); request = 0; last = null; }
    }
    function setRunning(value) { running = value && !motion.matches; onState(running); schedule(); }
    if ("IntersectionObserver" in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(element);
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", () => setRunning(!motion.matches));
    new ResizeObserver(() => draw(0)).observe(element);
    document.addEventListener("themechange", () => draw(0));
    onState(running); draw(0); schedule();
    return { toggle: () => setRunning(!running), setRunning, redraw: () => draw(0), get running() { return running; } };
  }
  return { $, motion, palette, icon, canvas2d, animate };
})();
