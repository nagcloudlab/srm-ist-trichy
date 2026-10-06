import { useEffect, useMemo, useState } from 'react';
import { mulberry32, Plot, type Pt } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

const INK = '#68707c', BLUE = '#3157d5', CORAL = '#c8432f', MINT = '#277a59', VIOLET = '#6a4bb5';

/* =====================================================================
   1 · Optimizer race on an ill-conditioned valley
   L(x, y) = ½ (x² + K·y²)  →  ∇L = (x, K·y).  Steep in y, shallow in x.
   SGD-style and adaptive optimizers get separate learning rates: their η means different things.
   ===================================================================== */

const K = 50;
const START: Pt = [-4.5, 1.6];
const loss = ([x, y]: Pt) => 0.5 * (x * x + K * y * y);
const grad = ([x, y]: Pt): Pt => [x, K * y];

type Opt = 'sgd' | 'momentum' | 'rmsprop' | 'adam';
const OPTS: { id: Opt; name: string; color: string }[] = [
  { id: 'sgd', name: 'SGD', color: INK },
  { id: 'momentum', name: 'Momentum', color: BLUE },
  { id: 'rmsprop', name: 'RMSprop', color: CORAL },
  { id: 'adam', name: 'Adam', color: MINT },
];

/** Runs `steps` updates of one optimizer from START; returns the visited points. */
export function runOptimizer(opt: Opt, lrSgd: number, lrAdaptive: number, beta: number, steps: number): Pt[] {
  const path: Pt[] = [START];
  let p: Pt = [...START];
  let v: Pt = [0, 0];      // momentum velocity / Adam first moment
  let s: Pt = [0, 0];      // RMSprop / Adam second moment
  const b1 = beta, b2 = 0.999, rho = 0.9, eps = 1e-8;
  const lr = opt === 'sgd' || opt === 'momentum' ? lrSgd : lrAdaptive;
  for (let t = 1; t <= steps; t++) {
    const g = grad(p);
    const next: Pt = [0, 0];
    for (let i = 0; i < 2; i++) {
      if (opt === 'sgd') next[i] = p[i] - lr * g[i];
      else if (opt === 'momentum') { v[i] = beta * v[i] + g[i]; next[i] = p[i] - lr * v[i]; }
      else if (opt === 'rmsprop') { s[i] = rho * s[i] + (1 - rho) * g[i] * g[i]; next[i] = p[i] - (lr * g[i]) / (Math.sqrt(s[i]) + eps); }
      else {
        v[i] = b1 * v[i] + (1 - b1) * g[i];
        s[i] = b2 * s[i] + (1 - b2) * g[i] * g[i];
        const mh = v[i] / (1 - b1 ** t), vh = s[i] / (1 - b2 ** t);
        next[i] = p[i] - (lr * mh) / (Math.sqrt(vh) + eps);
      }
    }
    p = next;
    path.push([Math.max(-9, Math.min(9, p[0])), Math.max(-9, Math.min(9, p[1]))]);
    if (!Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 1e6 || Math.abs(p[1]) > 1e6) break;
  }
  return path;
}

export function OptimizerRaceLab() {
  const [lr, setLr] = useState(0.02);
  const [alr, setAlr] = useState(0.1);
  const [beta, setBeta] = useState(0.9);
  const [steps, setSteps] = useState(0);
  const [running, setRunning] = useState(false);
  const MAX = 80;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSteps((n) => {
      if (n >= MAX) { setRunning(false); return MAX; }
      return n + 1;
    }), 90);
    return () => window.clearInterval(timer);
  }, [running]);

  const paths = useMemo(() => OPTS.map((o) => ({ ...o, path: runOptimizer(o.id, lr, alr, beta, steps) })), [lr, alr, beta, steps]);
  const ellipses = [0.5, 2, 5, 10, 16];

  return (
    <Lab
      controls={<>
        <Slider label="η · SGD & momentum" value={lr} min={0.005} max={0.045} step={0.0025} onChange={setLr} format={(v) => v.toFixed(4)} />
        <Slider label="η · RMSprop & Adam" value={alr} min={0.02} max={0.3} step={0.01} onChange={setAlr} format={(v) => v.toFixed(2)} tone="coral" />
        <Slider label="β (momentum / Adam β₁)" value={beta} min={0} max={0.95} step={0.05} onChange={setBeta} format={(v) => v.toFixed(2)} tone="violet" />
        <Slider label="Steps taken" value={steps} min={0} max={MAX} step={1} onChange={(v) => { setRunning(false); setSteps(v); }} format={(v) => `${v}`} tone="mint" />
        <div className="lab-row">
          <LabButton primary onClick={() => { if (steps >= MAX) setSteps(0); setRunning((r) => !r); }}>{running ? 'Pause' : 'Race'}</LabButton>
          <LabButton onClick={() => { setRunning(false); setSteps((n) => Math.min(MAX, n + 1)); }}>+1 step</LabButton>
          <LabButton onClick={() => { setRunning(false); setSteps(0); }}>Reset</LabButton>
        </div>
      </>}
      metrics={<>
        {paths.map((o) => {
          const L = loss(o.path[o.path.length - 1]);
          return <Metric key={o.id} label={`${o.name} · loss`} value={Number.isFinite(L) && L < 1e4 ? L.toFixed(3) : 'diverged'} tone={o.id === 'sgd' ? 'plain' : o.id === 'momentum' ? 'blue' : o.id === 'rmsprop' ? 'coral' : 'mint'} />;
        })}
      </>}
      foot={<>Valley L = ½(x² + 50y²): 50× steeper across than along. Plain SGD diverges above η = 2/50 = 0.04.</>}
    >
      <Plot
        ariaLabel={`Paths of four optimizers after ${steps} steps on an elongated valley`}
        x={[-5, 5]} y={[-2, 2]} xTicks={[-4, -2, 0, 2, 4]} yTicks={[-2, -1, 0, 1, 2]}
        xLabel="x · shallow direction" yLabel="y · steep" height={290}
        points={[{ at: START, color: '#111827', r: 6 }, { at: [0, 0], color: '#f4c657', r: 7 }]}
        lines={paths.filter((o) => o.path.length > 1).map((o) => ({ pts: o.path, color: o.color, width: 2.5 }))}
      >
        {(sx, sy) => ellipses.map((c) => (
          <ellipse key={c} cx={sx(0)} cy={sy(0)} rx={Math.abs(sx(Math.sqrt(2 * c)) - sx(0))} ry={Math.abs(sy(Math.sqrt((2 * c) / K)) - sy(0))} fill="none" stroke="rgba(17,24,39,.12)" strokeWidth="1.2" />
        ))}
      </Plot>
      <div className="opt-legend">{OPTS.map((o) => <span key={o.id}><i style={{ background: o.color }} />{o.name}</span>)}</div>
    </Lab>
  );
}

/* =====================================================================
   2 · Adam internals: m, v, bias correction, step size
   ===================================================================== */

type Seq = 'constant' | 'noisy' | 'flip' | 'fading';
const B1 = 0.9, B2 = 0.999, EPS = 1e-8, T_MAX = 20;

function gradients(seq: Seq): number[] {
  const rand = mulberry32(7);
  return Array.from({ length: T_MAX }, (_, i) => {
    if (seq === 'constant') return 0.5;
    if (seq === 'noisy') return Number((0.5 + (rand() - 0.5) * 1.6).toFixed(2));
    if (seq === 'flip') return i % 2 === 0 ? 0.5 : -0.5;
    return Number((0.5 * 0.8 ** i).toFixed(4));
  });
}

export type AdamRow = { t: number; g: number; m: number; v: number; mh: number; vh: number; step: number; raw: number };

export function adamTrace(gs: number[]): AdamRow[] {
  let m = 0, v = 0;
  return gs.map((g, i) => {
    const t = i + 1;
    m = B1 * m + (1 - B1) * g;
    v = B2 * v + (1 - B2) * g * g;
    const mh = m / (1 - B1 ** t), vh = v / (1 - B2 ** t);
    return { t, g, m, v, mh, vh, step: mh / (Math.sqrt(vh) + EPS), raw: m / (Math.sqrt(v) + EPS) };
  });
}

export function AdamInternalsLab() {
  const [seq, setSeq] = useState<Seq>('constant');
  const [t, setT] = useState(1);
  const [corrected, setCorrected] = useState<'on' | 'off'>('on');
  const rows = useMemo(() => adamTrace(gradients(seq)), [seq]);
  const now = rows[t - 1];
  const stepOf = (r: AdamRow) => (corrected === 'on' ? r.step : r.raw);
  const visible = rows.slice(Math.max(0, t - 4), t);
  const yMax = Math.max(1.2, ...rows.map((r) => Math.abs(r.raw)), ...rows.map((r) => Math.abs(r.step))) * 1.08;

  return (
    <Lab
      controls={<>
        <Segmented label="Gradient sequence" options={[{ value: 'constant', label: 'Constant' }, { value: 'noisy', label: 'Noisy' }, { value: 'flip', label: 'Sign flip' }, { value: 'fading', label: 'Fading' }]} value={seq} onChange={(v) => { setSeq(v); setT(1); }} />
        <Segmented label="Bias correction" options={[{ value: 'on', label: 'On (Adam)' }, { value: 'off', label: 'Off' }]} value={corrected} onChange={setCorrected} />
        <Slider label="Iteration t" value={t} min={1} max={T_MAX} step={1} onChange={setT} format={(v) => `${v}`} tone="violet" />
        <div className="lab-row">
          <LabButton primary onClick={() => setT((n) => Math.min(T_MAX, n + 1))} disabled={t >= T_MAX}>Next step</LabButton>
          <LabButton onClick={() => setT(1)}>Reset</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="gradient g" value={now.g.toFixed(3)} />
        <Metric label="step ÷ η" value={stepOf(now).toFixed(3)} tone={corrected === 'on' ? 'mint' : 'coral'} />
        <Metric label="m · m̂" value={`${now.m.toFixed(3)} · ${now.mh.toFixed(3)}`} tone="blue" />
        <Metric label="v · v̂" value={`${now.v.toFixed(5)} · ${now.vh.toFixed(3)}`} tone="violet" />
      </>}
      foot={<>β₁ = 0.9, β₂ = 0.999. Step shown in units of η: θ moves by η × this number.</>}
    >
      <Plot
        ariaLabel={`Adam step size over ${t} iterations`}
        x={[1, T_MAX]} y={[-yMax, yMax]} xTicks={[1, 5, 10, 15, 20]}
        xLabel="iteration t" yLabel="step ÷ η" height={200}
        marks={[{ y: 1 }]}
        lines={[
          { pts: rows.map((r) => [r.t, r.raw] as Pt), color: CORAL, width: 2, dash: true, label: 'no correction' },
          { pts: rows.map((r) => [r.t, r.step] as Pt), color: MINT, width: 2.5, label: 'Adam' },
        ]}
        points={[{ at: [now.t, stepOf(now)], color: corrected === 'on' ? MINT : CORAL, r: 7 }]}
      />
      <div className="opt-trace" role="table" aria-label="Adam internals for the last four iterations">
        <div className="opt-trace-row opt-trace-head" role="row"><span>t</span><span>g</span><span>m</span><span>v</span><span>m̂</span><span>v̂</span><span>step ÷ η</span></div>
        {visible.map((r) => (
          <div key={r.t} className={`opt-trace-row ${r.t === t ? 'now' : ''}`} role="row">
            <span>{r.t}</span><span>{r.g.toFixed(3)}</span><span>{r.m.toFixed(4)}</span><span>{r.v.toFixed(6)}</span>
            <span>{r.mh.toFixed(3)}</span><span>{r.vh.toFixed(3)}</span><b>{stepOf(r).toFixed(3)}</b>
          </div>
        ))}
      </div>
    </Lab>
  );
}

export const OPT_COLORS = { INK, BLUE, CORAL, MINT, VIOLET };
