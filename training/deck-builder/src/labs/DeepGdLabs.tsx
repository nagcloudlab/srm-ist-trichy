import { useEffect, useMemo, useState } from 'react';
import { gaussian, mulberry32, Plot, scale, type Pt } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

const BLUE = '#3157d5', CORAL = '#c8432f', MINT = '#277a59', VIOLET = '#6a4bb5', MUTED = '#68707c';

/* ---------- 1 · learning rate on a valley: L = ½(θ₁² + κ θ₂²) ---------- */

const START: Pt = [-8, 3];
const MAX_STEPS = 80;

function valleyPath(eta: number, kappa: number) {
  const path: Pt[] = [START];
  let [a, b] = START;
  let reached: number | null = null;
  for (let t = 1; t <= MAX_STEPS; t++) {
    a = a - eta * a;          // ∂L/∂θ₁ = θ₁
    b = b - eta * kappa * b;  // ∂L/∂θ₂ = κ θ₂
    path.push([a, b]);
    const loss = 0.5 * (a * a + kappa * b * b);
    if (reached === null && loss < 0.01) reached = t;
    if (!Number.isFinite(loss) || Math.abs(a) > 1e6 || Math.abs(b) > 1e6) break;
  }
  return { path, reached };
}

export function ValleyLab() {
  const [eta, setEta] = useState(0.1);
  const [k, setK] = useState<'1' | '10' | '25'>('10');
  const kappa = Number(k);
  const { path, reached } = useMemo(() => valleyPath(eta, kappa), [eta, kappa]);
  const fFast = 1 - eta * kappa, fSlow = 1 - eta;
  const limit = 2 / kappa;
  const status = Math.abs(fFast) >= 1 ? 'diverges' : fFast < 0 ? 'zig-zags in' : 'slides in';
  const W = 760, H = 340, sx = scale([-10, 10], [40, W - 40]), sy = scale([-5, 5], [H - 20, 20]);
  const levels = [0.5, 2, 6, 14, 26, 42];
  return (
    <Lab
      controls={<>
        <Slider label="Learning rate η" value={eta} min={0.005} max={0.3} step={0.005} onChange={setEta} tone="violet" format={(v) => v.toFixed(3)} />
        <Segmented label="Valley shape κ = λmax / λmin" options={[{ value: '1', label: 'round · 1' }, { value: '10', label: 'long · 10' }, { value: '25', label: 'very long · 25' }]} value={k} onChange={setK} />
      </>}
      metrics={<>
        <Metric label="Stability limit 2/λmax" value={limit.toFixed(3)} tone={eta < limit ? 'mint' : 'coral'} />
        <Metric label="Steep axis × per step" value={fFast.toFixed(2)} tone={Math.abs(fFast) >= 1 ? 'coral' : 'plain'} />
        <Metric label="Flat axis × per step" value={fSlow.toFixed(3)} tone="blue" />
        <Metric label="Steps to loss < 0.01" value={reached ?? (status === 'diverges' ? '∞' : `> ${MAX_STEPS}`)} tone={reached ? 'mint' : 'coral'} />
      </>}
      foot={<>Each step multiplies θ₁ by (1 − η) and θ₂ by (1 − ηκ). Path {status}.</>}
    >
      <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Gradient descent path with learning rate ${eta.toFixed(3)} on a valley of shape ${kappa}`}>
        <defs><clipPath id="gd-valley-clip"><rect x="40" y="20" width={W - 80} height={H - 40} /></clipPath></defs>
        <rect className="plot-bg" x="40" y="20" width={W - 80} height={H - 40} rx="6" />
        <g clipPath="url(#gd-valley-clip)">
          {levels.map((c) => (
            <ellipse key={c} cx={sx(0)} cy={sy(0)} rx={sx(Math.sqrt(2 * c)) - sx(0)} ry={sy(0) - sy(Math.sqrt((2 * c) / kappa))} fill="none" stroke="rgba(17,24,39,.12)" strokeWidth="1.5" />
          ))}
          <line className="plot-axis" x1={sx(-10)} x2={sx(10)} y1={sy(0)} y2={sy(0)} />
          <line className="plot-axis" x1={sx(0)} x2={sx(0)} y1={sy(-5)} y2={sy(5)} />
          <polyline points={path.map(([a, b]) => `${sx(a)},${sy(b)}`).join(' ')} fill="none" stroke={status === 'diverges' ? CORAL : VIOLET} strokeWidth="2.5" strokeLinejoin="round" />
          {path.slice(0, 40).map(([a, b], i) => <circle key={i} cx={sx(a)} cy={sy(b)} r={i === 0 ? 7 : 3.5} fill={i === 0 ? BLUE : status === 'diverges' ? CORAL : VIOLET} />)}
          <circle cx={sx(0)} cy={sy(0)} r="7" fill={MINT} stroke="#fff" strokeWidth="2" />
        </g>
        <text className="plot-axis-label" x={W - 44} y={sy(0) - 8} textAnchor="end">θ₁ · flat direction</text>
        <text className="plot-axis-label" x={sx(0) + 8} y="36">θ₂ · steep direction</text>
        <text className="plot-mark-label" x={sx(0) + 10} y={sy(0) + 22}>minimum</text>
      </svg>
    </Lab>
  );
}

/* ---------- 2 · mini-batch noise: fit ŷ = wx + b to noisy data ---------- */

const N = 256, ITERS = 200, LR = 0.05;
const DATA = (() => {
  const r = mulberry32(42);
  return Array.from({ length: N }, () => {
    const x = r() * 4;
    return { x, y: 2 * x + 5 + 2 * gaussian(r) };
  });
})();
// best least-squares fit on this data: w 2.04, b 4.88, loss 4.08
const fullLoss = (w: number, b: number) => DATA.reduce((s, d) => s + (w * d.x + b - d.y) ** 2, 0) / N;

function sgdRun(batch: number, seed: number) {
  const r = mulberry32(seed);
  let w = 0, b = 0;
  const losses: Pt[] = [[0, fullLoss(w, b)]];
  for (let t = 1; t <= ITERS; t++) {
    let gw = 0, gb = 0;
    for (let i = 0; i < batch; i++) {
      const d = batch === N ? DATA[i] : DATA[Math.floor(r() * N)];
      const e = w * d.x + b - d.y;
      gw += 2 * e * d.x;
      gb += 2 * e;
    }
    w -= LR * (gw / batch);
    b -= LR * (gb / batch);
    losses.push([t, fullLoss(w, b)]);
  }
  return { losses, w, b };
}

export function BatchNoiseLab() {
  const [bs, setBs] = useState<'1' | '8' | '64' | '256'>('8');
  const [seed, setSeed] = useState(3);
  const batch = Number(bs);
  const run = useMemo(() => sgdRun(batch, seed), [batch, seed]);
  const full = useMemo(() => sgdRun(N, 1), []);
  const tail = run.losses.slice(-50).map((p) => p[1]);
  const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
  const jitter = Math.sqrt(tail.reduce((a, v) => a + (v - mean) ** 2, 0) / tail.length);
  const epochs = (ITERS * batch) / N;
  return (
    <Lab
      controls={<>
        <Segmented label="Examples per step (batch B)" options={[{ value: '1', label: '1 · SGD' }, { value: '8', label: '8' }, { value: '64', label: '64' }, { value: '256', label: 'all 256' }]} value={bs} onChange={setBs} />
        <div className="lab-row lab-seed"><small>Shuffle seed {seed}</small><LabButton onClick={() => setSeed((s) => s + 1)} disabled={batch === N}>Reshuffle</LabButton></div>
      </>}
      metrics={<>
        <Metric label="Final loss (all data)" value={run.losses[ITERS][1].toFixed(2)} tone="mint" />
        <Metric label="Jitter, last 50 steps" value={jitter.toFixed(3)} tone={jitter > 0.2 ? 'coral' : 'plain'} />
        <Metric label="Learned w · b" value={`${run.w.toFixed(2)} · ${run.b.toFixed(2)}`} tone="violet" />
        <Metric label="Epochs used" value={epochs.toFixed(epochs < 1 ? 2 : 1)} />
      </>}
      foot={<>Dashed grey = all 256 examples per step. Same 200 steps, learning rate 0.05. True line: y = 2x + 5 plus noise (σ = 2), so the best possible loss is 4.08 (starts at 87.7).</>}
    >
      <Plot
        ariaLabel={`Loss over 200 steps with batch size ${batch}`}
        x={[0, ITERS]} y={[0, 40]} xTicks={[0, 50, 100, 150, 200]} yTicks={[0, 10, 20, 30, 40]}
        xLabel="step" yLabel="loss on all data" height={330}
        lines={[
          { pts: full.losses, color: MUTED, dash: true, width: 2 },
          ...(batch === N ? [] : [{ pts: run.losses, color: batch === 1 ? CORAL : BLUE, label: `B = ${batch}`, width: 2 }]),
        ]}
      />
    </Lab>
  );
}

/* ---------- 3 · two players: min_x max_y  x·y ---------- */

export function SpiralLab() {
  const [eta, setEta] = useState(0.2);
  const [mode, setMode] = useState<'sim' | 'alt'>('sim');
  const [steps, setSteps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const path = useMemo(() => {
    const pts: Pt[] = [[1, 0]];
    let x = 1, y = 0;
    for (let t = 0; t < 150; t++) {
      if (mode === 'sim') { const nx = x - eta * y; const ny = y + eta * x; x = nx; y = ny; }
      else { x = x - eta * y; y = y + eta * x; }
      pts.push([x, y]);
    }
    return pts;
  }, [eta, mode]);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setSteps((s) => { if (s >= 150) { setPlaying(false); return 150; } return s + 2; }), 40);
    return () => window.clearInterval(id);
  }, [playing]);
  useEffect(() => { setSteps(0); setPlaying(false); }, [eta, mode]);
  const shown = path.slice(0, steps + 1);
  const [x, y] = shown[shown.length - 1];
  const radius = Math.hypot(x, y);
  return (
    <Lab
      controls={<>
        <Segmented label="Update order" options={[{ value: 'sim', label: 'Simultaneous' }, { value: 'alt', label: 'Alternating' }]} value={mode} onChange={setMode} />
        <Slider label="Learning rate η (both players)" value={eta} min={0.05} max={0.5} step={0.05} onChange={setEta} tone="violet" format={(v) => v.toFixed(2)} />
        <div className="lab-row">
          <LabButton primary onClick={() => { if (steps >= 150) setSteps(0); setPlaying((p) => !p); }}>{playing ? 'Pause' : steps >= 150 ? 'Replay' : 'Play'}</LabButton>
          <LabButton onClick={() => { setPlaying(false); setSteps(0); }}>Reset</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="Step" value={`${steps} / 150`} />
        <Metric label="Distance from (0, 0)" value={radius.toFixed(3)} tone={radius > 1.05 ? 'coral' : 'mint'} />
        <Metric label="Growth per step" value={mode === 'sim' ? `× ${Math.sqrt(1 + eta * eta).toFixed(4)}` : '× 1 (orbit)'} tone={mode === 'sim' ? 'coral' : 'blue'} />
        <Metric label="x (min) · y (max)" value={`${x.toFixed(2)} · ${y.toFixed(2)}`} tone="violet" />
      </>}
      foot={<>x descends f = xy, y ascends it. Balance is (0, 0); neither order reaches it. GANs add TTUR, tuned momentum and better losses.</>}
    >
      <Plot
        ariaLabel={`Two-player gradient path after ${steps} steps, distance ${radius.toFixed(2)} from the equilibrium`}
        x={[-8, 8]} y={[-4, 4]} xTicks={[-8, -4, 0, 4, 8]} yTicks={[-4, -2, 0, 2, 4]} xLabel="x · minimizing player" yLabel="y · maximizing player" height={330}
        lines={[
          { pts: Array.from({ length: 121 }, (_, i) => [Math.cos((i / 120) * 2 * Math.PI), Math.sin((i / 120) * 2 * Math.PI)] as Pt), color: MUTED, dash: true, width: 1.5 },
          ...(shown.length > 1 ? [{ pts: shown, color: mode === 'sim' ? CORAL : BLUE, width: 2.5 }] : []),
        ]}
        points={[{ at: [0, 0], color: MINT, r: 7 }, { at: [x, y], color: mode === 'sim' ? CORAL : BLUE, r: 7 }]}
      />
    </Lab>
  );
}
