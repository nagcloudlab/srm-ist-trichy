/* ============================================================
   Interactive Labs — Vanilla JS (ported from Phase 0 React)
   Drop-in widgets for HTML slide decks. No build step needed.
   ============================================================ */

(function () {
  'use strict';

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ── Shared helpers ── */
  function slider(id, label, val, min, max, step, cb) {
    const wrap = document.createElement('label');
    wrap.className = 'lab-ctrl';
    wrap.innerHTML = `<span>${label} <b id="${id}-val">${Number(val.toFixed(3))}</b></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" style="width:100%;">`;
    wrap.querySelector('input').oninput = e => {
      const v = +e.target.value;
      wrap.querySelector('b').textContent = Number(v.toFixed(3));
      cb(v);
    };
    return wrap;
  }

  function metric(label, val, tone) {
    const d = document.createElement('div');
    d.className = 'lab-metric ' + (tone || '');
    d.innerHTML = `<small>${label}</small><strong>${val}</strong>`;
    return d;
  }

  function shell(title, controls, metrics, chart) {
    const el = document.createElement('div');
    el.className = 'lab-shell';
    el.innerHTML = `<h4 class="lab-title">${title}</h4>`;
    const row = document.createElement('div');
    row.className = 'lab-row';
    const left = document.createElement('div');
    left.className = 'lab-left';
    controls.forEach(c => left.appendChild(c));
    const mets = document.createElement('div');
    mets.className = 'lab-metrics';
    metrics.forEach(m => mets.appendChild(m));
    left.appendChild(mets);
    row.appendChild(left);
    if (chart) row.appendChild(chart);
    el.appendChild(row);
    return el;
  }

  function svgChart(w, h, inner) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('class', 'lab-chart');
    svg.innerHTML = inner;
    return svg;
  }

  /* ── 1. Step-Size Lab (L04) ── */
  function stepSizeLab(container) {
    let rate = 0.1;
    const gradient = -9.2867;

    function render() {
      const weight = 1 - rate * gradient;
      const loss = (14/3) * (weight - 2) ** 2;

      // Curve points
      let path = '';
      for (let i = 0; i <= 100; i++) {
        const w = 0.5 + i * 0.035;
        const l = (14/3) * (w - 2) ** 2;
        const x = 40 + (w - 0.5) / 3.5 * 520;
        const y = 20 + (1 - clamp(l / 20, 0, 1)) * 200;
        path += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
      }

      const wx = 40 + (weight - 0.5) / 3.5 * 520;
      const wy = 20 + (1 - clamp(loss / 20, 0, 1)) * 200;
      const sx = 40 + (1 - 0.5) / 3.5 * 520;
      const sy = 20 + (1 - (14/3) * 1 / 20) * 200;

      const tone = loss < 0.1 ? 'good' : loss < 4.67 ? '' : 'bad';
      const result = loss < 0.1 ? 'Near minimum!' : loss < 4.67 ? 'Improved' : 'Overshot!';

      container.innerHTML = '';
      const m1 = metric('New weight', weight.toFixed(4));
      const m2 = metric('New loss', loss.toFixed(4), tone);
      const m3 = metric('Result', result, tone);
      const arith = document.createElement('div');
      arith.className = 'lab-arith';
      arith.innerHTML = `<span>w = 1.0 − ${rate.toFixed(2)} × (−9.29) = <b>${weight.toFixed(4)}</b></span>`;

      const chart = svgChart(600, 260, `
        <line x1="40" y1="220" x2="560" y2="220" stroke="#1a1d2e" stroke-width="1.5"/>
        <line x1="40" y1="20" x2="40" y2="225" stroke="#1a1d2e" stroke-width="1.5"/>
        <text x="300" y="250" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5">weight</text>
        <text x="15" y="120" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5" transform="rotate(-90 15 120)">loss</text>
        <path d="${path}" fill="none" stroke="#3b6df0" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="${sx}" y1="${sy}" x2="${wx}" y2="${wy}" stroke="#10b981" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#labArrow)"/>
        <circle cx="${sx}" cy="${sy}" r="6" fill="#8b90a5"/>
        <circle cx="${wx}" cy="${wy}" r="8" fill="${loss < 4.67 ? '#10b981' : '#ef4444'}"/>
        <defs><marker id="labArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#10b981"/></marker></defs>
      `);

      const sl = slider('rate', 'Learning rate η', rate, 0.01, 0.3, 0.01, v => { rate = v; render(); });
      const s = shell('One-step learning-rate calculator', [sl, arith], [m1, m2, m3], chart);
      container.appendChild(s);
    }
    render();
  }

  /* ── 2. Descent Lab (L05) ── */
  function descentLab(container) {
    let rate = 0.1, step = 0, timer = null;

    function compute() {
      const weights = [1];
      for (let i = 0; i < 10; i++) weights.push(weights[i] - rate * (28/3) * (weights[i] - 2));
      return weights;
    }

    function render() {
      const weights = compute();
      const w = weights[step];
      const loss = (14/3) * (w - 2) ** 2;
      const bound = Math.max(4, ...weights.map(v => Math.abs(v)));

      let path = '';
      for (let i = 0; i <= step; i++) {
        const x = 40 + (i / 10) * 520;
        const y = 20 + (1 - (weights[i] + bound) / (2 * bound)) * 200;
        path += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
      }
      const refY = 20 + (1 - (2 + bound) / (2 * bound)) * 200;
      const cx = 40 + (step / 10) * 520;
      const cy = 20 + (1 - (w + bound) / (2 * bound)) * 200;

      container.innerHTML = '';
      const m1 = metric('Step', `${step}/10`);
      const m2 = metric('Weight', w.toFixed(3), Math.abs(w - 2) < 0.05 ? 'good' : '');
      const m3 = metric('Loss', loss > 999 ? loss.toFixed(0) : loss.toFixed(4), loss > 10 ? 'bad' : '');

      const chart = svgChart(600, 260, `
        <line x1="40" y1="220" x2="560" y2="220" stroke="#1a1d2e" stroke-width="1.5"/>
        <line x1="40" y1="20" x2="40" y2="225" stroke="#1a1d2e" stroke-width="1.5"/>
        <text x="300" y="250" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5">step</text>
        <text x="15" y="120" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5" transform="rotate(-90 15 120)">weight</text>
        <line x1="40" y1="${refY}" x2="560" y2="${refY}" stroke="#10b981" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"/>
        <text x="555" y="${refY - 6}" text-anchor="end" font-family="Inter" font-size="9" fill="#10b981">w = 2</text>
        <path d="${path}" fill="none" stroke="#3b6df0" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="7" fill="#3b6df0"/>
      `);

      const sl = slider('drate', 'Learning rate η', rate, 0.01, 0.3, 0.01, v => { rate = v; step = 0; clearInterval(timer); render(); });
      const runBtn = document.createElement('button');
      runBtn.className = 'lab-btn';
      runBtn.textContent = step >= 10 ? 'Replay' : 'Run 10 steps';
      runBtn.onclick = () => { if (step >= 10) step = 0; clearInterval(timer); timer = setInterval(() => { if (step >= 10) { clearInterval(timer); render(); return; } step++; render(); }, 400); };

      const resetBtn = document.createElement('button');
      resetBtn.className = 'lab-btn secondary';
      resetBtn.textContent = 'Reset';
      resetBtn.onclick = () => { clearInterval(timer); step = 0; render(); };

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:0.5rem;margin-top:0.3rem;';
      btns.appendChild(runBtn);
      btns.appendChild(resetBtn);

      const s = shell('Training flight simulator', [sl, btns], [m1, m2, m3], chart);
      container.appendChild(s);
    }
    render();
  }

  /* ── 3. ReLU Gate Lab (L09) ── */
  function reluLab(container) {
    let z = 1.5;

    function render() {
      const h = Math.max(0, z);
      const gate = z > 0 ? 'OPEN' : 'CLOSED';
      const color = z > 0 ? '#10b981' : '#ef4444';

      container.innerHTML = '';
      const m1 = metric('Input z', z.toFixed(2));
      const m2 = metric('ReLU(z)', h.toFixed(2), z > 0 ? 'good' : 'bad');
      const m3 = metric('Gate', gate, z > 0 ? 'good' : 'bad');

      // ReLU curve
      let path = '';
      for (let i = -40; i <= 40; i++) {
        const v = i * 0.1;
        const rv = Math.max(0, v);
        const x = 300 + v * 60;
        const y = 200 - rv * 40;
        path += (i === -40 ? 'M' : 'L') + x.toFixed(1) + ',' + clamp(y, 20, 220).toFixed(1);
      }
      const dotX = 300 + z * 60;
      const dotY = 200 - h * 40;

      const chart = svgChart(600, 260, `
        <line x1="40" y1="200" x2="560" y2="200" stroke="#e2e5ef" stroke-width="1"/>
        <line x1="300" y1="20" x2="300" y2="230" stroke="#e2e5ef" stroke-width="1"/>
        <text x="300" y="250" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5">z (input)</text>
        <text x="15" y="120" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5" transform="rotate(-90 15 120)">ReLU(z)</text>
        <path d="${path}" fill="none" stroke="#3b6df0" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${clamp(dotX, 40, 560)}" cy="${clamp(dotY, 20, 220)}" r="9" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="${clamp(dotX, 60, 540)}" y="${clamp(dotY - 15, 25, 210)}" text-anchor="middle" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="${color}">${h.toFixed(2)}</text>
      `);

      const sl = slider('relu-z', 'Input z', z, -4, 4, 0.1, v => { z = v; render(); });
      const s = shell('ReLU Gate — drag z to see what passes', [sl], [m1, m2, m3], chart);
      container.appendChild(s);
    }
    render();
  }

  /* ── 4. Sigmoid + BCE Lab (L12) ── */
  function sigmoidBceLab(container) {
    let zVal = 0, target = 1;

    function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
    function bce(p, y) { return -(y * Math.log(clamp(p, 1e-7, 1-1e-7)) + (1-y) * Math.log(clamp(1-p, 1e-7, 1-1e-7))); }

    function render() {
      const p = sigmoid(zVal);
      const loss = bce(p, target);

      container.innerHTML = '';
      const m1 = metric('σ(z)', p.toFixed(4));
      const m2 = metric('BCE loss', loss.toFixed(4), loss < 0.3 ? 'good' : loss > 2 ? 'bad' : '');
      const m3 = metric('Target', target === 1 ? '1 (real)' : '0 (fake)');

      // Sigmoid curve
      let path = '';
      for (let i = -60; i <= 60; i++) {
        const v = i * 0.1;
        const sv = sigmoid(v);
        const x = 300 + v * 40;
        const y = 220 - sv * 200;
        path += (i === -60 ? 'M' : 'L') + clamp(x, 40, 560).toFixed(1) + ',' + y.toFixed(1);
      }
      const dotX = 300 + zVal * 40;
      const dotY = 220 - p * 200;
      const color = (target === 1 && p > 0.5) || (target === 0 && p < 0.5) ? '#10b981' : '#ef4444';

      const chart = svgChart(600, 260, `
        <line x1="40" y1="120" x2="560" y2="120" stroke="#e2e5ef" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="565" y="124" font-family="Inter" font-size="9" fill="#8b90a5">0.5</text>
        <line x1="300" y1="15" x2="300" y2="230" stroke="#e2e5ef" stroke-width="1"/>
        <text x="300" y="250" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5">z</text>
        <path d="${path}" fill="none" stroke="#3b6df0" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="${clamp(dotX, 45, 555)}" cy="${clamp(dotY, 20, 220)}" r="9" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="${clamp(dotX, 60, 540)}" y="${clamp(dotY - 14, 25, 210)}" text-anchor="middle" font-family="JetBrains Mono" font-size="11" font-weight="700" fill="${color}">p=${p.toFixed(3)}, loss=${loss.toFixed(2)}</text>
      `);

      const sl = slider('sig-z', 'Raw score z', zVal, -6, 6, 0.1, v => { zVal = v; render(); });
      const tgl = document.createElement('div');
      tgl.style.cssText = 'display:flex;gap:0.5rem;margin-top:0.3rem;';
      const b1 = document.createElement('button');
      b1.className = 'lab-btn' + (target === 1 ? ' active' : ' secondary');
      b1.textContent = 'Target = 1 (real)';
      b1.onclick = () => { target = 1; render(); };
      const b2 = document.createElement('button');
      b2.className = 'lab-btn' + (target === 0 ? ' active' : ' secondary');
      b2.textContent = 'Target = 0 (fake)';
      b2.onclick = () => { target = 0; render(); };
      tgl.appendChild(b1);
      tgl.appendChild(b2);

      const s = shell('Sigmoid + BCE — slide z and toggle target', [sl, tgl], [m1, m2, m3], chart);
      container.appendChild(s);
    }
    render();
  }

  /* ── 5. Gradient Calculator (L06) ── */
  function gradientLab(container) {
    let weight = 1, x = 2;
    const target = 9, bias = 5;

    function render() {
      const pred = weight * x + bias;
      const error = pred - target;
      const loss = error ** 2;
      const grad = 2 * error * x;

      container.innerHTML = '';
      const m1 = metric('Prediction', pred.toFixed(2));
      const m2 = metric('Loss', loss.toFixed(2));
      const m3 = metric('Gradient', grad.toFixed(2), grad === 0 ? 'good' : '');

      // Loss curve
      let path = '';
      const maxL = 100;
      for (let i = 0; i <= 80; i++) {
        const w = -1 + i * 0.075;
        const l = (w * x + bias - target) ** 2;
        const px = 40 + (w + 1) / 6 * 520;
        const py = 20 + (1 - clamp(l / maxL, 0, 1)) * 200;
        path += (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
      }
      const dx = 40 + (weight + 1) / 6 * 520;
      const dy = 20 + (1 - clamp(loss / maxL, 0, 1)) * 200;

      const chart = svgChart(600, 260, `
        <line x1="40" y1="220" x2="560" y2="220" stroke="#1a1d2e" stroke-width="1.5"/>
        <line x1="40" y1="20" x2="40" y2="225" stroke="#1a1d2e" stroke-width="1.5"/>
        <text x="300" y="250" text-anchor="middle" font-family="Inter" font-size="11" fill="#8b90a5">weight</text>
        <path d="${path}" fill="none" stroke="#3b6df0" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="${clamp(dx,45,555)}" cy="${clamp(dy,25,218)}" r="8" fill="#3b6df0"/>
      `);

      const arith = document.createElement('div');
      arith.className = 'lab-arith';
      arith.innerHTML = `ŷ = ${weight.toFixed(2)} × ${x} + 5 = <b>${pred.toFixed(2)}</b> &nbsp;|&nbsp; e = ${error.toFixed(2)} &nbsp;|&nbsp; dL/dw = 2 × ${error.toFixed(2)} × ${x} = <b>${grad.toFixed(2)}</b>`;

      const sl1 = slider('gw', 'Weight w', weight, -1, 5, 0.05, v => { weight = v; render(); });
      const sl2 = slider('gx', 'Input x', x, 1, 4, 1, v => { x = v; render(); });
      const s = shell('Exact gradient calculator', [sl1, sl2, arith], [m1, m2, m3], chart);
      container.appendChild(s);
    }
    render();
  }

  /* ── Lab CSS ── */
  const css = document.createElement('style');
  css.textContent = `
    .lab-shell { background: var(--bg-card, #f8f9fb); border: 1px solid var(--border, #e2e5ef); border-radius: 14px; padding: 1.2rem; margin: 0.5rem 0; }
    .lab-title { font-size: 0.85rem; font-weight: 700; color: var(--accent-blue, #3b6df0); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.8rem; }
    .lab-row { display: flex; gap: 1.2rem; flex-wrap: wrap; align-items: flex-start; }
    .lab-left { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 0.5rem; }
    .lab-ctrl { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem; color: var(--text-secondary, #4a5068); }
    .lab-ctrl b { color: var(--accent-blue, #3b6df0); font-family: 'JetBrains Mono', monospace; }
    .lab-ctrl input[type=range] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: #ddd; outline: none; }
    .lab-ctrl input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent-blue, #3b6df0); cursor: pointer; }
    .lab-metrics { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.3rem; }
    .lab-metric { background: white; border: 1px solid var(--border-light, #eef0f5); border-radius: 8px; padding: 0.4rem 0.7rem; text-align: center; min-width: 80px; }
    .lab-metric small { display: block; font-size: 0.65rem; color: var(--text-muted, #8b90a5); text-transform: uppercase; letter-spacing: 0.06em; }
    .lab-metric strong { display: block; font-size: 0.95rem; font-family: 'JetBrains Mono', monospace; color: var(--text-primary, #1a1d2e); }
    .lab-metric.good strong { color: #10b981; }
    .lab-metric.bad strong { color: #ef4444; }
    .lab-chart { flex: 1; min-width: 280px; max-width: 100%; height: auto; background: white; border-radius: 10px; border: 1px solid var(--border-light, #eef0f5); }
    .lab-arith { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-secondary, #4a5068); background: white; padding: 0.5rem 0.8rem; border-radius: 8px; border: 1px solid var(--border-light, #eef0f5); }
    .lab-arith b { color: var(--accent-blue, #3b6df0); }
    .lab-btn { font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid var(--accent-blue, #3b6df0); background: var(--accent-blue, #3b6df0); color: white; cursor: pointer; transition: all 0.2s; }
    .lab-btn:hover { opacity: 0.85; }
    .lab-btn.secondary, .lab-btn:not(.active).secondary { background: white; color: var(--text-secondary, #4a5068); border-color: var(--border, #e2e5ef); }
    .lab-btn.active { background: var(--accent-blue, #3b6df0); color: white; }
    @media (max-width: 768px) {
      .lab-row { flex-direction: column; }
      .lab-chart { min-width: 100%; }
    }
  `;
  document.head.appendChild(css);

  /* ── Auto-mount: find all <div data-lab="xxx"> and render ── */
  const labs = { 'step-size': stepSizeLab, 'descent': descentLab, 'relu': reluLab, 'sigmoid-bce': sigmoidBceLab, 'gradient': gradientLab };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lab]').forEach(el => {
      const id = el.dataset.lab;
      if (labs[id]) labs[id](el);
    });
  });
})();
