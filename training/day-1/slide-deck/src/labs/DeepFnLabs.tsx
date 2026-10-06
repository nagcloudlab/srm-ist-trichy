import { useState } from 'react';
import { Plot, type Pt } from '../components/art';
import { Lab, Metric, Segmented, Slider } from './lab-kit';

/* ---------- activation functions and their derivatives ---------- */

const sig = (x: number) => 1 / (1 + Math.exp(-x));
const erf = (x: number) => {
  // Abramowitz–Stegun 7.1.26 (max error 1.5e−7) — plenty for a plot
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
};
const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
const phi = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

export type ActName = 'relu' | 'leaky' | 'elu' | 'gelu' | 'silu' | 'sigmoid' | 'tanh';

export const ACTS: Record<ActName, { label: string; color: string; f: (x: number) => number; d: (x: number) => number; range: string }> = {
  relu: { label: 'ReLU', color: '#277a59', f: (x) => Math.max(0, x), d: (x) => (x > 0 ? 1 : 0), range: '[0, ∞)' },
  leaky: { label: 'LeakyReLU 0.2', color: '#c8432f', f: (x) => (x > 0 ? x : 0.2 * x), d: (x) => (x > 0 ? 1 : 0.2), range: '(−∞, ∞)' },
  elu: { label: 'ELU α=1', color: '#a35c00', f: (x) => (x > 0 ? x : Math.exp(x) - 1), d: (x) => (x > 0 ? 1 : Math.exp(x)), range: '(−1, ∞)' },
  gelu: { label: 'GELU', color: '#6a4bb5', f: (x) => x * Phi(x), d: (x) => Phi(x) + x * phi(x), range: '[−0.17, ∞)' },
  silu: { label: 'SiLU', color: '#0e7490', f: (x) => x * sig(x), d: (x) => sig(x) * (1 + x * (1 - sig(x))), range: '[−0.28, ∞)' },
  sigmoid: { label: 'Sigmoid', color: '#68707c', f: sig, d: (x) => sig(x) * (1 - sig(x)), range: '(0, 1)' },
  tanh: { label: 'Tanh', color: '#3157d5', f: Math.tanh, d: (x) => 1 - Math.tanh(x) ** 2, range: '(−1, 1)' },
};

const fmt = (v: number) => (Math.abs(v) < 0.0005 ? '0.000' : v.toFixed(3));

/** Pick a function, move x, compare the signal f(x) and the local slope f′(x). */
export function ActivationZooLab() {
  const [name, setName] = useState<ActName>('gelu');
  const [x, setX] = useState(-1);
  const [view, setView] = useState<'f' | 'd'>('f');
  const act = ACTS[name];
  const g = view === 'f' ? act.f : act.d;
  return (
    <Lab
      controls={<>
        <Segmented label="Function" value={name} onChange={setName} options={(Object.keys(ACTS) as ActName[]).slice(0, 4).map((k) => ({ value: k, label: ACTS[k].label.split(' ')[0] }))} />
        <Segmented label="…or" value={name} onChange={setName} options={(Object.keys(ACTS) as ActName[]).slice(4).map((k) => ({ value: k, label: ACTS[k].label }))} />
        <Segmented label="Plot" value={view} onChange={setView} options={[{ value: 'f', label: 'Signal f(x)' }, { value: 'd', label: 'Slope f′(x)' }]} />
        <Slider label="Input x" value={x} min={-5} max={5} step={0.05} onChange={setX} format={(v) => v.toFixed(2)} />
      </>}
      metrics={<>
        <Metric label="f(x)" value={fmt(act.f(x))} tone="blue" />
        <Metric label="f′(x)" value={fmt(act.d(x))} tone={act.d(x) < 0.05 ? 'coral' : 'mint'} />
        <Metric label="Output range" value={act.range} />
        <Metric label="Slope at x = −5" value={fmt(act.d(-5))} tone={act.d(-5) < 0.05 ? 'coral' : 'plain'} />
      </>}
      foot={<>Faint lines = the other functions. A slope near 0 means almost no gradient flows back through this unit.</>}
    >
      <Plot
        ariaLabel={`${act.label} ${view === 'f' ? 'value' : 'derivative'} from −5 to 5`}
        x={[-5, 5]} y={view === 'f' ? [-2, 5] : [-0.2, 1.4]}
        xTicks={[-4, -2, 0, 2, 4]} yTicks={view === 'f' ? [-2, 0, 2, 4] : [0, 0.5, 1]}
        xLabel="input x" yLabel={view === 'f' ? 'f(x)' : 'f′(x)'} height={330}
        lines={[
          ...(Object.keys(ACTS) as ActName[]).filter((k) => k !== name).map((k) => ({ f: view === 'f' ? ACTS[k].f : ACTS[k].d, color: '#c9cdd4', width: 1.6 })),
          { f: g, color: act.color, width: 4, label: act.label },
        ]}
        marks={[{ x }]}
        points={[{ at: [x, g(x)] as Pt, color: act.color, r: 8 }]}
      />
    </Lab>
  );
}

/* ---------- gradient through depth ---------- */

const DEPTH_ACTS: ActName[] = ['sigmoid', 'tanh', 'relu', 'gelu'];

/**
 * Each layer multiplies the backward gradient by (weight gain) × f′(z).
 * Simplifying assumption shown on the slide: every layer sees the same pre-activation z.
 */
export function DepthGradientLab() {
  const [depth, setDepth] = useState(10);
  const [z, setZ] = useState(0.5);
  const [gain, setGain] = useState(1);
  const series = DEPTH_ACTS.map((k) => {
    const factor = gain * Math.abs(ACTS[k].d(z));
    const pts: Pt[] = Array.from({ length: depth + 1 }, (_, i) => [i, Math.max(-20, Math.min(6, i * Math.log10(Math.max(factor, 1e-30))))]);
    return { k, factor, pts, final: factor ** depth };
  });
  const show = (v: number) => (v === 0 ? '0' : v >= 0.01 && v < 1000 ? v.toFixed(3) : v.toExponential(1));
  return (
    <Lab
      controls={<>
        <Slider label="Depth (layers)" value={depth} min={1} max={30} step={1} onChange={setDepth} format={(v) => String(v)} />
        <Slider label="Pre-activation z at every layer" value={z} min={-3} max={3} step={0.1} onChange={setZ} format={(v) => v.toFixed(1)} tone="violet" />
        <Slider label="Weight gain |w|" value={gain} min={0.5} max={2} step={0.05} onChange={setGain} format={(v) => v.toFixed(2)} tone="coral" />
      </>}
      metrics={<>
        {series.map((s) => <Metric key={s.k} label={`${ACTS[s.k].label} · ×${s.factor.toFixed(3)}/layer`} value={show(s.final)} tone={s.final < 1e-3 ? 'coral' : s.final > 1e3 ? 'yellow' : 'mint'} />)}
      </>}
      foot={<>Model: gradient after L layers = (gain × f′(z))ᴸ. Same z at every layer — a simplification; real networks vary per unit.</>}
    >
      <Plot
        ariaLabel={`Log10 gradient magnitude through ${depth} layers`}
        x={[0, depth]} y={[-20, 6]} yTicks={[-20, -15, -10, -5, 0, 5]}
        xTicks={Array.from(new Set([0, Math.round(depth / 4), Math.round(depth / 2), Math.round((3 * depth) / 4), depth]))}
        xLabel="layers the gradient has passed through" yLabel="log₁₀ |gradient|" height={330}
        marks={[{ y: 0 }, { y: -6 }]}
        lines={series.map((s) => ({ pts: s.pts, color: ACTS[s.k].color, width: 3.5 }))}
      />
      <div className="fn-legend">{series.map((s) => <span key={s.k}><i style={{ background: ACTS[s.k].color }} />{ACTS[s.k].label}</span>)}<span className="fn-legend-note">dashed: ×1 and 10⁻⁶</span></div>
    </Lab>
  );
}

/* ---------- softmax temperature ---------- */

const LOGITS = [2, 1, 0.1, -1];
const CLASSES = ['cat', 'dog', 'car', 'tree'];

export function SoftmaxTemperatureLab() {
  const [T, setT] = useState(1);
  const e = LOGITS.map((v) => Math.exp((v - Math.max(...LOGITS)) / T));
  const s = e.reduce((a, b) => a + b, 0);
  const p = e.map((v) => v / s);
  const entropy = -p.reduce((a, q) => a + (q > 0 ? q * Math.log2(q) : 0), 0);
  return (
    <Lab
      controls={<>
        <Slider label="Temperature T" value={T} min={0.1} max={5} step={0.05} onChange={setT} format={(v) => v.toFixed(2)} tone="violet" />
        <p className="fn-lab-note">Logits fixed at 2, 1, 0.1, −1. Divide by T, then softmax.</p>
      </>}
      metrics={<>
        <Metric label="Top probability" value={p[0].toFixed(3)} tone="mint" />
        <Metric label="Entropy (bits)" value={entropy.toFixed(2)} tone="violet" />
        <Metric label="Sum" value={p.reduce((a, b) => a + b, 0).toFixed(3)} />
        <Metric label="Regime" value={T < 0.6 ? 'sharp' : T > 2 ? 'flat' : 'normal'} tone={T < 0.6 ? 'coral' : T > 2 ? 'yellow' : 'blue'} />
      </>}
      foot={<>T → 0 approaches a one-hot argmax · T → ∞ approaches uniform (0.25 each, 2 bits).</>}
    >
      <div className="fn-bars" aria-live="polite">
        {p.map((q, i) => (
          <div key={CLASSES[i]} className="fn-bar">
            <span className="fn-bar-name">{CLASSES[i]}<small>logit {LOGITS[i]}</small></span>
            <span className="fn-bar-track"><span style={{ width: `${q * 100}%` }} /></span>
            <b>{q.toFixed(3)}</b>
          </div>
        ))}
      </div>
    </Lab>
  );
}
