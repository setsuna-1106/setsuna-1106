const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { window: {} };
vm.createContext(context);
for (const file of ['assets/vendor/numeric.min.js', 'assets/js/physics.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}
const physics = context.window.Physics;

test('oscillator initial conditions, free energy and damping loss', () => {
  for (const gamma of [0, .18, .8]) {
    const initial = physics.oscillator(0, gamma, 1.5);
    assert.equal(initial.x, 1);
    assert.equal(Math.abs(initial.v), 0);
    let previous = 1;
    for (let t = 0; t <= 20; t += .05) {
      const { energy } = physics.oscillator(t, gamma, 1.5);
      assert(energy <= previous + 1e-12);
      if (gamma === 0) assert(Math.abs(energy - 1) < 1e-12);
      previous = energy;
    }
  }
});

test('standing-wave node and phase-shifted envelope', () => {
  for (let t = 0; t < 6; t += .05) {
    assert(Math.abs(physics.wave(0, t, 3, Math.PI).sum) < 1e-12);
    for (let x = -6; x <= 6; x += .25) {
      const state = physics.wave(x, t, 3, .7);
      assert(Math.abs(state.sum) <= state.envelope + 1e-12);
    }
  }
});

test('Kepler energy, angular momentum and apsides across slider bounds', () => {
  for (const a of [.7, 1.2, 2]) for (const e of [0, .45, .8]) {
    const orbit = physics.orbit(a, e);
    assert(Math.abs(orbit.at(0).r - a * (1 - e)) < 1e-10);
    assert(Math.abs(orbit.at(orbit.period / 2).r - a * (1 + e)) < 1e-6);
    for (let i = 0; i < 100; i++) {
      const state = orbit.at(orbit.period * i / 100);
      assert(Math.abs(state.energy + 1 / (2 * a)) < 1e-6);
      assert(Math.abs(state.angularMomentum - Math.sqrt(a * (1 - e * e))) < 1e-6);
    }
  }
});
