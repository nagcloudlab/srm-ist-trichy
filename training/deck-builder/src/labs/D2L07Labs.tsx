import { useState } from 'react';
import { Plot } from '../components/art';
import { Lab, Metric, Slider } from './lab-kit';

const CORAL = '#c8432f';
const MINT = '#277a59';
const LOG2 = Math.log(2);

/**
 * Distance lab: real = Uniform[0, 1], fake = Uniform[θ, θ + 1].
 * Overlap o = max(0, 1 − |θ|) → JS = (1 − o)·log 2 (exact), W1 = |θ|.
 */
export function DistanceLab() {
  const [theta, setTheta] = useState(0.5);
  const overlap = Math.max(0, 1 - Math.abs(theta));
  const js = (1 - overlap) * LOG2;
  const w1 = Math.abs(theta);
  const disjoint = overlap === 0;
  return (
    <Lab
      controls={<Slider label="Fake shift θ" value={theta} min={-4} max={4} step={0.1} onChange={setTheta} tone="mint" format={(v) => v.toFixed(1)} />}
      metrics={<>
        <Metric label="Overlap" value={overlap.toFixed(2)} />
        <Metric label="JS divergence" value={js.toFixed(3)} tone={disjoint ? 'coral' : 'blue'} />
        <Metric label="Wasserstein W₁" value={w1.toFixed(2)} tone="mint" />
        <Metric label="JS gradient d/dθ" value={disjoint ? '0' : (theta === 0 ? '0' : '±0.693')} tone={disjoint ? 'coral' : 'plain'} />
      </>}
      foot={<>Real = Uniform[0, 1], fake = Uniform[θ, θ+1]. JS = (1 − overlap)·log 2 is exact; it reaches log 2 ≈ 0.693 at |θ| = 1 and never moves again. W₁ = |θ| keeps shrinking as the fake approaches.</>}
    >
      <div className="l07-strip" aria-label={`Real box at 0 to 1, fake box at ${theta.toFixed(1)} to ${(theta + 1).toFixed(1)}`}>
        <div className="l07-track">
          <div className="l07-box l07-real" style={{ left: `${((0 + 4) / 8) * 100}%`, width: `${100 / 8}%` }}>real</div>
          <div className="l07-box l07-fake" style={{ left: `${((theta + 4) / 8) * 100}%`, width: `${100 / 8}%` }}>fake</div>
        </div>
      </div>
      <Plot
        ariaLabel={`At shift ${theta.toFixed(1)}, JS is ${js.toFixed(3)} and Wasserstein is ${w1.toFixed(2)}`}
        x={[-4, 4]} y={[0, 4]} xTicks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} yTicks={[0, 0.693, 1, 2, 3, 4]}
        xLabel="fake shift θ" yLabel="distance" height={260}
        lines={[
          { f: (t) => Math.abs(t), color: MINT, label: 'W₁ = |θ|' },
          { f: (t) => (1 - Math.max(0, 1 - Math.abs(t))) * LOG2, color: CORAL, label: 'JS' },
        ]}
        points={[
          { at: [theta, w1], color: MINT, r: 8 },
          { at: [theta, js], color: CORAL, r: 8 },
        ]}
      />
    </Lab>
  );
}

const sigmoid = (a: number) => 1 / (1 + Math.exp(-a));

/** Gradient lab: fake logit a → D(fake) = σ(a); compare |∂L/∂a| for minimax vs non-saturating. */
export function SaturationLab() {
  const [a, setA] = useState(-9.21);
  const p = sigmoid(a);
  const mm = -p;
  const ns = p - 1;
  const ratio = Math.abs(ns) / Math.max(Math.abs(mm), 1e-12);
  return (
    <Lab
      controls={<Slider label="Fake logit a" value={a} min={-10} max={4} step={0.01} onChange={setA} tone="coral" format={(v) => v.toFixed(2)} />}
      metrics={<>
        <Metric label="D(fake) = σ(a)" value={p < 0.001 ? p.toExponential(1) : p.toFixed(4)} />
        <Metric label="Minimax ∂L/∂a = −σ(a)" value={mm.toFixed(4)} tone="coral" />
        <Metric label="Non-saturating σ(a) − 1" value={ns.toFixed(4)} tone="mint" />
        <Metric label="Ratio NS / minimax" value={ratio >= 100 ? `${Math.round(ratio).toLocaleString()}×` : `${ratio.toFixed(2)}×`} tone="blue" />
      </>}
      foot={<>a = −9.21 ↔ D(fake) = 0.0001: minimax −0.0001, non-saturating −0.9999 (≈ 10,000×). At a = 0 (D = 0.5) both are −0.5.</>}
    >
      <Plot
        ariaLabel={`At logit ${a.toFixed(2)}, minimax gradient size ${Math.abs(mm).toFixed(4)}, non-saturating ${Math.abs(ns).toFixed(4)}`}
        x={[-10, 4]} y={[0, 1]} xTicks={[-10, -8, -6, -4, -2, 0, 2, 4]} yTicks={[0, 0.25, 0.5, 0.75, 1]}
        xLabel="fake logit a  (left = D sure it is fake)" yLabel="|∂L/∂a|" height={300}
        marks={[{ x: 0 }]}
        lines={[
          { f: (v) => sigmoid(v), color: CORAL, label: 'minimax' },
          { f: (v) => 1 - sigmoid(v), color: MINT, label: 'non-sat.' },
        ]}
        points={[
          { at: [a, Math.abs(mm)], color: CORAL, r: 8 },
          { at: [a, Math.abs(ns)], color: MINT, r: 8 },
        ]}
      />
    </Lab>
  );
}

