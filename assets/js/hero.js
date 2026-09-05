"use strict";

(() => {
  const { $, palette, animate, icon, canvas2d } = Site;
  const canvas = $("#hero-canvas"), fallback = $("#hero-fallback"), section = $("#top");
  let renderer, scene, camera, lines, time = 1.5, tilt = 0, targetTilt = 0;
  const rows = 48, columns = 100;
  function heightAt(x, z) {
    return .58 * Math.sin(x * .8 - time * .65) * Math.cos(z * .62 + time * .22) + .23 * Math.sin(x * 1.5 + z - time * .8);
  }
  function fallbackMode() {
    canvas.hidden = true; fallback.hidden = false; renderer = null;
  }
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    camera.position.set(0, 7.7, 9.5); camera.lookAt(0, 0, 0);
    lines = new THREE.Group(); scene.add(lines);
    for (let row = 0; row < rows; row++) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(columns * 3), 3));
      const material = new THREE.LineBasicMaterial({ transparent: true, opacity: .35 + row / rows * .45 });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false; lines.add(line);
    }
  } catch (_) { fallbackMode(); }
  canvas.addEventListener("webglcontextlost", (event) => { event.preventDefault(); fallbackMode(); clock.redraw(); });
  function draw(delta) {
    time += delta;
    tilt += (targetTilt - tilt) * .04;
    const colors = palette(), { width, height } = section.getBoundingClientRect();
    const mobile = width <= 600;
    const area = mobile ? { x: width * .05, y: height - 270, w: width * .9, h: 195 } : { x: width * .54, y: 10, w: width * .44, h: height - 135 };
    if (renderer) {
      const size = renderer.getSize(new THREE.Vector2());
      if (size.x !== width || size.y !== height) renderer.setSize(width, height, false);
      renderer.setScissorTest(false); renderer.setViewport(0, 0, width, height); renderer.clear();
      renderer.setViewport(area.x, height - area.y - area.h, area.w, area.h);
      camera.aspect = area.w / area.h;
      const distance = Math.max(1, 1.45 / camera.aspect);
      camera.position.set(0, 7.7 * distance, 9.5 * distance);
      camera.updateProjectionMatrix();
      lines.rotation.y = -.22 + tilt;
      const first = new THREE.Color(colors.accent), second = new THREE.Color(colors.coral);
      lines.children.forEach((line, row) => {
        const z = (row / (rows - 1) - .5) * 6.2;
        const positions = line.geometry.attributes.position;
        for (let col = 0; col < columns; col++) {
          const x = (col / (columns - 1) - .5) * 9;
          positions.setXYZ(col, x, heightAt(x, z), z);
        }
        positions.needsUpdate = true;
        line.material.color.copy(first).lerp(second, Math.max(0, (row / rows - .5) * 1.8));
      });
      renderer.render(scene, camera);
    } else {
      const { ctx } = canvas2d(fallback);
      for (let row = 0; row < 32; row++) {
        ctx.beginPath(); ctx.strokeStyle = row < 20 ? colors.accent : colors.coral; ctx.globalAlpha = .35 + row / 64;
        for (let col = 0; col <= 100; col++) {
          const x = (col / 100 - .5) * 9, z = (row / 31 - .5) * 6.2;
          const px = area.x + col / 100 * area.w, py = area.y + area.h * .25 + row / 31 * area.h * .5 - heightAt(x, z) * area.h * .18;
          if (col) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  const clock = animate(section, draw, (running) => icon($("#hero-play"), running ? "pause" : "play", running ? "暂停波场" : "播放波场"));
  $("#hero-play").addEventListener("click", () => clock.toggle());
  section.addEventListener("pointermove", (event) => { if (event.pointerType === "mouse" && !Site.motion.matches) targetTilt = (event.clientX / section.clientWidth - .5) * .35; });
  section.addEventListener("pointerleave", () => { targetTilt = 0; });
})();
