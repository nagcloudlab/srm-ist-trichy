import { useState } from 'react';
import { Plot, type Pt } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

const REAL: Pt = [0.8, 0.2];
const FAKE: Pt = [-0.4, 0.6];
const LAMBDA = 10;

/** Two toy critics with exact gradients: a plane (constant slope k) and a wavy surface. */
function gradient(kind: 'plane' | 'wavy', k: number, [x, y]: Pt): Pt {
  // plane: C = k·(0.6x + 0.8y)                 → ∇C = (0.6k, 0.8k), ‖∇C‖ = k
  // wavy:  C = k·(0.6x + 0.8y) + 0.4·sin(4x)    → ∂C/∂x gains 1.6·cos(4x)
  const gx = 0.6 * k + (kind === 'wavy' ? 1.6 * Math.cos(4 * x) : 0);
  const gy = 0.8 * k + 0 * y;
  return [gx, gy];
}

/**
 * Interpolation lab: slide ε to place x̂ on the segment between a real and a fake point,
 * read the critic's exact gradient there and the penalty it pays.
 */
export function InterpLab() {
  const [eps, setEps] = useState(0.25);
  const [k, setK] = useState(2);
  const [kind, setKind] = useState<'plane' | 'wavy'>('plane');
  const xh: Pt = [eps * REAL[0] + (1 - eps) * FAKE[0], eps * REAL[1] + (1 - eps) * FAKE[1]];
  const g = gradient(kind, k, xh);
  const norm = Math.hypot(g[0], g[1]);
  const pen = (norm - 1) ** 2;
  // slope along the whole segment, sampled — shows where a wavy critic breaks the rule
  const along: Pt[] = Array.from({ length: 41 }, (_, i) => {
    const e = i / 40;
    const p: Pt = [e * REAL[0] + (1 - e) * FAKE[0], e * REAL[1] + (1 - e) * FAKE[1]];
    const gg = gradient(kind, k, p);
    return [e, Math.hypot(gg[0], gg[1])];
  });
  const arrowScale = 0.12;
  return (
    <Lab
      controls={<>
        <Slider label="ε · where on the line" value={eps} min={0} max={1} step={0.01} onChange={setEps} format={(v) => v.toFixed(2)} />
        <div className="lab-row"><LabButton onClick={() => setEps(Math.round(Math.random() * 100) / 100)}>Sample ε ~ U[0, 1]</LabButton></div>
        <Slider label="Critic steepness k" value={k} min={0.2} max={3} step={0.1} onChange={setK} tone="violet" format={(v) => v.toFixed(1)} />
        <Segmented label="Critic surface" options={[{ value: 'plane', label: 'Plane' }, { value: 'wavy', label: 'Wavy' }]} value={kind} onChange={setKind} />
      </>}
      metrics={<>
        <Metric label="x̂" value={`(${xh[0].toFixed(2)}, ${xh[1].toFixed(2)})`} tone="blue" />
        <Metric label="∇C(x̂)" value={`(${g[0].toFixed(2)}, ${g[1].toFixed(2)})`} tone="violet" />
        <Metric label="‖∇C(x̂)‖" value={norm.toFixed(2)} tone={Math.abs(norm - 1) < 0.1 ? 'mint' : 'coral'} />
        <Metric label="λ · (‖∇C‖ − 1)²" value={(LAMBDA * pen).toFixed(2)} tone={pen < 0.01 ? 'mint' : 'coral'} />
      </>}
      foot={<>Real x = (0.8, 0.2) · fake x̃ = (−0.4, 0.6) · λ = 10. Plane with k = 2, ε = 0.25 reproduces the worked example: slope 2, penalty 1.</>}
    >
      <div className="l09-lab-pair">
        <Plot
          ariaLabel={`Interpolate at epsilon ${eps.toFixed(2)}: gradient norm ${norm.toFixed(2)}`}
          x={[-0.7, 1.1]} y={[-0.1, 1.0]} xTicks={[-0.5, 0, 0.5, 1]} yTicks={[0, 0.5, 1]}
          xLabel="pixel 1" yLabel="pixel 2" height={620}
          lines={[{ pts: [FAKE, REAL], color: '#68707c', width: 2, dash: true }]}
          points={[
            { at: FAKE, color: '#eb5a46', r: 9, label: 'fake x̃' },
            { at: REAL, color: '#3157d5', r: 9, label: 'real x' },
            { at: xh, color: '#f4c657', r: 9, label: 'x̂' },
          ]}
        >
          {(sx, sy) => {
            const tip: Pt = [xh[0] + g[0] * arrowScale, xh[1] + g[1] * arrowScale];
            const ang = Math.atan2(sy(tip[1]) - sy(xh[1]), sx(tip[0]) - sx(xh[0]));
            const hx = sx(tip[0]), hy = sy(tip[1]);
            return (
              <g>
                <line x1={sx(xh[0])} y1={sy(xh[1])} x2={hx} y2={hy} stroke="#7353bd" strokeWidth={3.5} strokeLinecap="round" />
                <path d={`M${hx},${hy} L${hx - 12 * Math.cos(ang - 0.45)},${hy - 12 * Math.sin(ang - 0.45)} L${hx - 12 * Math.cos(ang + 0.45)},${hy - 12 * Math.sin(ang + 0.45)} Z`} fill="#7353bd" />
              </g>
            );
          }}
        </Plot>
        <Plot
          ariaLabel="Gradient norm of the critic along the line from fake to real"
          x={[0, 1]} y={[0, 4]} xTicks={[0, 0.25, 0.5, 0.75, 1]} yTicks={[0, 1, 2, 3, 4]}
          xLabel="ε (0 = fake, 1 = real)" yLabel="‖∇C‖" height={620}
          marks={[{ y: 1, label: 'target 1' }]}
          lines={[{ pts: along, color: '#7353bd', label: 'slope' }]}
          points={[{ at: [eps, Math.min(norm, 4)], color: '#f4c657', r: 8 }]}
        />
      </div>
    </Lab>
  );
}

/** Penalty-curve lab: how hard each slope is punished, two-sided vs one-sided. */
export function PenaltyLab() {
  const [n, setN] = useState(2);
  const [lam, setLam] = useState(10);
  const two = lam * (n - 1) ** 2;
  const one = lam * Math.max(0, n - 1) ** 2;
  const top = Math.max(4 * lam, 4);
  return (
    <Lab
      controls={<>
        <Slider label="Gradient norm ‖∇C(x̂)‖" value={n} min={0} max={3} step={0.05} onChange={setN} format={(v) => v.toFixed(2)} />
        <Slider label="Penalty weight λ" value={lam} min={0} max={50} step={1} onChange={setLam} tone="violet" format={(v) => v.toFixed(0)} />
      </>}
      metrics={<>
        <Metric label="Two-sided · WGAN-GP" value={two.toFixed(2)} tone={two < 0.05 ? 'mint' : 'violet'} />
        <Metric label="One-sided · max(0, ·)²" value={one.toFixed(2)} tone={one < 0.05 ? 'mint' : 'coral'} />
        <Metric label="Slope vs target" value={n < 0.95 ? 'too flat' : n > 1.05 ? 'too steep' : 'on target'} tone={Math.abs(n - 1) <= 0.05 ? 'mint' : 'plain'} />
        <Metric label="λ = 0 means" value={lam === 0 ? 'no constraint' : 'constraint on'} tone={lam === 0 ? 'coral' : 'plain'} />
      </>}
      foot={<>The paper uses the two-sided form: the optimal critic has slope exactly 1 between real and fake, so slopes below 1 are pushed up too.</>}
    >
      <div className="l09-legend"><span className="l09-key l09-key-two">two-sided (WGAN-GP)</span><span className="l09-key l09-key-one">one-sided</span></div>
      <Plot
        ariaLabel={`Penalty at gradient norm ${n.toFixed(2)} with lambda ${lam}: two-sided ${two.toFixed(2)}, one-sided ${one.toFixed(2)}`}
        x={[0, 3]} y={[0, top]} xTicks={[0, 0.5, 1, 1.5, 2, 2.5, 3]}
        xLabel="‖∇C(x̂)‖" yLabel="penalty" height={340}
        marks={[{ x: 1, label: 'slope 1' }]}
        lines={[
          { f: (v) => lam * (v - 1) ** 2, color: '#7353bd' },
          { f: (v) => lam * Math.max(0, v - 1) ** 2, color: '#eb5a46', dash: true },
        ]}
        points={[{ at: [n, Math.min(two, top)], color: '#f4c657', r: 9 }]}
      />
    </Lab>
  );
}
