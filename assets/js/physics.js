"use strict";

window.Physics = (() => {
  function oscillator(t, gamma, omega) {
    const wd = Math.sqrt(omega * omega - gamma * gamma);
    const decay = Math.exp(-gamma * t);
    const x = decay * (Math.cos(wd * t) + gamma / wd * Math.sin(wd * t));
    const v = -decay * omega * omega / wd * Math.sin(wd * t);
    return { x, v, energy: (v * v + omega * omega * x * x) / (omega * omega) };
  }
  // Equal-frequency counterpropagating plane waves, c=1 m/s, A=1 m.
  function wave(x, t, wavelength, phase) {
    const k = 2 * Math.PI / wavelength;
    const first = Math.sin(k * (x - t));
    const second = Math.sin(k * (-x - t) + phase);
    return { first, second, sum: first + second, envelope: 2 * Math.abs(Math.cos(k * x - phase / 2)) };
  }
  function orbit(a, eccentricity) {
    const period = 2 * Math.PI * Math.sqrt(a ** 3);
    const periapsis = a * (1 - eccentricity);
    const speed = Math.sqrt((1 + eccentricity) / (a * (1 - eccentricity)));
    const solution = numeric.dopri(0, period, [periapsis, 0, 0, speed], (_t, [x, y, vx, vy]) => {
      const r3 = Math.hypot(x, y) ** 3;
      return [vx, vy, -x / r3, -y / r3];
    }, 1e-10, 10000);
    if (solution.x[solution.x.length - 1] < period) throw new Error("Orbit integration did not complete");
    return {
      period,
      at(t) {
        const wrapped = ((t % period) + period) % period;
        const [x, y, vx, vy] = solution.at(wrapped);
        const r = Math.hypot(x, y), v = Math.hypot(vx, vy);
        return { x, y, vx, vy, r, v, energy: v * v / 2 - 1 / r, angularMomentum: x * vy - y * vx };
      }
    };
  }
  return { oscillator, wave, orbit };
})();
