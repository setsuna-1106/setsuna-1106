"use strict";
(() => {
  const { $, palette, canvas2d, animate, icon } = Site;
  const canvas = $('#hero-canvas'), section = $('#top');
  let selectedPhase = .8;
  let time = 0, phase = selectedPhase, targetPhase = selectedPhase;

  function draw(delta) {
    time += delta;
    phase += (targetPhase - phase) * Math.min(1, delta * 5);
    const { ctx, width, height } = canvas2d(canvas), colors = palette();
    const mobile = width <= 600;
    const left = mobile ? 30 : width * .62;
    const top = mobile ? height - 330 : 165;
    const w = mobile ? width - 60 : Math.min(width * .28, 420);
    const h = mobile ? 130 : 180;
    const baseline = h * .52, amplitude = h * .13;
    const font = getComputedStyle(document.documentElement).getPropertyValue('--hand');
    const points = (component) => Array.from({ length: 70 }, (_, i) => {
      const x = i / 69 * w;
      const theta = x / w * Math.PI * 3;
      const first = Math.sin(theta - time * .6);
      const second = Math.sin(theta + time * .6 + phase);
      const value = component === 1 ? first : component === 2 ? second : first + second;
      return [x, baseline - value * amplitude];
    });
    const stroke = (path, color, dash = []) => {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.2;
      ctx.setLineDash(dash);
      path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.stroke(); ctx.setLineDash([]);
    };

    ctx.save(); ctx.translate(left, top);
    ctx.fillStyle = colors.ink; ctx.font = `24px ${font}`;
    ctx.fillText('ψ = ψ₁ + ψ₂', 4, -35);
    ctx.fillStyle = colors.muted; ctx.font = `13px ${font}`;
    ctx.fillText(`Δφ = ${phase.toFixed(1)} rad`, w - 112, -36);
    stroke([[-5, baseline], [w + 4, baseline]], colors.line);
    stroke(points(1), colors.draft, [5, 5]);
    stroke(points(2), colors.muted, [2, 6]);
    Notebook.curve(canvas, points(0), colors.accent, 1.25);
    ctx.fillStyle = colors.coral; ctx.font = `17px ${font}`;
    ctx.fillText('ψ₁', 6, h + 14);
    ctx.fillStyle = colors.muted; ctx.fillText('ψ₂', 52, h + 14);
    ctx.fillStyle = colors.accent; ctx.fillText('ψ₁ + ψ₂', 100, h + 14);
    ctx.fillStyle = colors.ink; ctx.font = `17px ${font}`;
    ctx.fillText('∂²ψ/∂t² = c² ∂²ψ/∂x²', 4, h + 49);
    ctx.restore();
  }

  const clock = animate(section, draw, running => icon($('#hero-play'), running ? 'pause' : 'play', running ? '暂停波场' : '播放波场'));
  $('#hero-play').addEventListener('click', () => clock.toggle());
  $('#hero-phase').addEventListener('input', event => {
    selectedPhase = Number(event.target.value);
    targetPhase = selectedPhase;
    if (!clock.running) { phase = targetPhase; clock.redraw(); }
  });
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    section.addEventListener('pointermove', event => {
      if (event.target.closest('.phase-control, #hero-play')) return;
      const rect = section.getBoundingClientRect();
      targetPhase = Math.max(0, Math.min(Math.PI * 2, (event.clientX - rect.left) / rect.width * Math.PI * 2));
      if (!clock.running) { phase = targetPhase; clock.redraw(); }
    }, { passive: true });
    section.addEventListener('pointerleave', () => {
      targetPhase = selectedPhase;
      if (!clock.running) { phase = targetPhase; clock.redraw(); }
    });
  }
  document.addEventListener('toolsready', () => clock.redraw());
  document.fonts?.ready.then(() => clock.redraw());
})();
