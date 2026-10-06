import { useState } from 'react';
import { Plot } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

const BLUE = '#3157d5', VIOLET = '#6a4bb5', CORAL = '#c8432f', MINT = '#277a59', INK = '#111827';

/* ---------- (1) the neuron: w and b over the delivery data ---------- */

const DELIVERY: [number, number][] = [[1, 7], [2, 9], [3, 11]];

export function NeuronLab() {
  const [w, setW] = useState(1);
  const [b, setB] = useState(5);
  const preds = DELIVERY.map(([x]) => w * x + b);
  const mse = DELIVERY.reduce((s, [, y], i) => s + (preds[i] - y) ** 2, 0) / DELIVERY.length;
  const perfect = mse < 1e-9;
  return (
    <Lab
      controls={<>
        <Slider label="weight w · minutes per km" value={w} min={0} max={4} step={0.1} onChange={setW} tone="violet" />
        <Slider label="bias b · starting minutes" value={b} min={0} max={10} step={0.5} onChange={setB} tone="coral" />
        <div className="lab-row"><LabButton onClick={() => { setW(1); setB(5); }}>Reset to w = 1, b = 5</LabButton></div>
      </>}
      metrics={<>
        <Metric label="ŷ at 1, 2, 3 km" value={preds.map((p) => Number(p.toFixed(1))).join(' · ')} tone="blue" />
        <Metric label="MSE (loss)" value={mse.toFixed(2)} tone={perfect ? 'mint' : mse < 1 ? 'yellow' : 'coral'} />
        <Metric label="Rule · ŷ =" value={`${w.toFixed(1)}x + ${b.toFixed(1)}`} />
        <Metric label="Verdict" value={perfect ? 'Exact fit' : mse < 1 ? 'Close' : 'Keep tuning'} tone={perfect ? 'mint' : 'plain'} />
      </>}
      foot={<>Find the line that passes through all three deliveries. Learning will do this search automatically.</>}
    >
      <Plot
        ariaLabel={`Line y = ${w} x + ${b} over delivery data; mean squared error ${mse.toFixed(2)}`}
        x={[0, 4]} y={[0, 18]} xTicks={[0, 1, 2, 3, 4]} yTicks={[0, 3, 6, 9, 12, 15, 18]}
        xLabel="distance x (km)" yLabel="time (min)" height={330}
        lines={[{ f: (x) => w * x + b, color: VIOLET, label: 'ŷ = wx + b' }]}
        points={DELIVERY.map(([x, y]) => ({ at: [x, y] as [number, number], color: BLUE, r: 8 }))}
      >
        {(sx, sy) => DELIVERY.map(([x, y], i) => (
          <line key={x} x1={sx(x)} x2={sx(x)} y1={sy(y)} y2={sy(preds[i])} stroke={CORAL} strokeWidth="2.5" strokeDasharray="4 4" />
        ))}
      </Plot>
    </Lab>
  );
}

/* ---------- (2) hidden layer: two ReLU units make |x| ---------- */

export function HiddenLayerLab() {
  const [x, setX] = useState(3);
  const z1 = 1 * x, z2 = -1 * x;
  const h1 = Math.max(0, z1), h2 = Math.max(0, z2);
  const y = h1 + h2;
  const gate = (z: number, h: number, name: string, w: string) => (
    <div className={`s3-gate ${h > 0 ? 'on' : 'off'}`}>
      <small>{name} · weight {w}</small>
      <span>z = {w} × {x.toFixed(1)} = {z.toFixed(1)}</span>
      <strong>h = ReLU({z.toFixed(1)}) = {h.toFixed(1)}</strong>
      <em>{h > 0 ? 'ON — passes' : 'OFF — blocked'}</em>
    </div>
  );
  return (
    <Lab
      controls={<Slider label="input x" value={x} min={-4} max={4} step={0.1} onChange={setX} tone="blue" />}
      metrics={<>
        <Metric label="h₁ (right side)" value={h1.toFixed(1)} tone={h1 > 0 ? 'mint' : 'plain'} />
        <Metric label="h₂ (left side)" value={h2.toFixed(1)} tone={h2 > 0 ? 'mint' : 'plain'} />
        <Metric label="ŷ = 1·h₁ + 1·h₂" value={y.toFixed(1)} tone="yellow" />
        <Metric label="Active units" value={`${(h1 > 0 ? 1 : 0) + (h2 > 0 ? 1 : 0)} of 2`} />
      </>}
      foot={<>Each unit handles one side of zero. Together they draw a V — a shape no single straight line can make.</>}
    >
      <div className="s3-gates">{gate(z1, h1, 'Hidden 1', '1')}{gate(z2, h2, 'Hidden 2', '−1')}</div>
      <Plot
        ariaLabel={`Network output ${y.toFixed(1)} at x ${x.toFixed(1)}; the full curve is the absolute value`}
        x={[-4, 4]} y={[0, 4.5]} xTicks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} yTicks={[0, 1, 2, 3, 4]}
        xLabel="input x" yLabel="output ŷ" height={250}
        lines={[{ f: (v) => Math.abs(v), color: MINT, label: 'ŷ = |x|' }]}
        points={[{ at: [x, y], color: INK, r: 8, label: `(${x.toFixed(1)}, ${y.toFixed(1)})` }]}
      />
    </Lab>
  );
}

/* ---------- (3) backprop stepper ---------- */

type Hot = 'x' | 'w' | 'z' | 'relu' | 'h' | 'v' | 'y' | 'loss';
type BpStep = { title: string; detail: string; hot: Hot[]; back: boolean; vals: Partial<Record<Hot, string>> };

const BASE: Partial<Record<Hot, string>> = { x: '2', w: '1', z: '2', h: '2', v: '1', y: '2', loss: '4' };
const BP_STEPS: BpStep[] = [
  { title: 'Forward pass', detail: 'z = 1 × 2 = 2 · h = ReLU(2) = 2 · y = 1 × 2 = 2 · loss = (2 − 4)² = 4', hot: ['x', 'w', 'z', 'relu', 'h', 'v', 'y', 'loss'], back: false, vals: BASE },
  { title: 'How wrong?', detail: 'blame at y = 2 × (y − target) = 2 × (2 − 4) = −4', hot: ['y', 'loss'], back: true, vals: { ...BASE, y: 'blame −4' } },
  { title: 'Output weight gradient', detail: 'grad_v = blame × h = −4 × 2 = −8', hot: ['v', 'h'], back: true, vals: { ...BASE, v: 'grad −8' } },
  { title: 'Pass blame to h', detail: 'blame at h = blame × v = −4 × 1 = −4', hot: ['h', 'v'], back: true, vals: { ...BASE, h: 'blame −4' } },
  { title: 'Through ReLU?', detail: 'z = 2 > 0 → gate OPEN → blame passes through unchanged (−4)', hot: ['relu', 'z'], back: true, vals: { ...BASE, z: 'blame −4' } },
  { title: 'Hidden weight gradient', detail: 'grad_w = blame × x = −4 × 2 = −8', hot: ['w', 'x'], back: true, vals: { ...BASE, w: 'grad −8' } },
  { title: 'Update BOTH weights', detail: 'v = 1 − 0.01 × (−8) = 1.08 · w = 1 − 0.01 × (−8) = 1.08', hot: ['w', 'v'], back: false, vals: { ...BASE, w: '1.08', v: '1.08' } },
  { title: 'Check: forward again', detail: 'z = 2.16 · h = 2.16 · y = 1.08 × 2.16 = 2.3328 · loss = (2.3328 − 4)² ≈ 2.78', hot: ['z', 'h', 'y', 'loss'], back: false, vals: { x: '2', w: '1.08', z: '2.16', h: '2.16', v: '1.08', y: '2.33', loss: '2.78' } },
];

function BackpropDiagram({ step }: { step: BpStep | null }) {
  const hot = new Set(step?.hot ?? []);
  const vals = step?.vals ?? BASE;
  const node = (id: Hot, cx: number, label: string, tone: string) => (
    <g className={`s3-bp-node ${hot.has(id) ? 'hot' : ''}`}>
      <circle cx={cx} cy={120} r={40} fill={hot.has(id) ? tone : '#fffdf8'} fillOpacity={hot.has(id) ? 0.18 : 1} stroke={tone} strokeWidth={hot.has(id) ? 5 : 2.5} />
      <text x={cx} y={112} textAnchor="middle" className="s3-bp-label">{label}</text>
      <text x={cx} y={138} textAnchor="middle" className="s3-bp-val">{vals[id]}</text>
    </g>
  );
  const edge = (id: Hot, x1: number, x2: number, label: string, tone: string) => (
    <g className={`s3-bp-edge ${hot.has(id) ? 'hot' : ''}`}>
      <line x1={x1} x2={x2} y1={120} y2={120} stroke={hot.has(id) ? tone : '#9aa1ac'} strokeWidth={hot.has(id) ? 6 : 3} />
      <rect x={(x1 + x2) / 2 - 50} y={58} width={100} height={36} rx={10} fill={hot.has(id) ? tone : '#fffdf8'} fillOpacity={hot.has(id) ? 0.16 : 1} stroke={tone} strokeWidth={2} />
      <text x={(x1 + x2) / 2} y={81} textAnchor="middle" className="s3-bp-edge-label">{label} = {vals[id]}</text>
    </g>
  );
  return (
    <svg className="s3-bp" viewBox="0 0 900 220" role="img" aria-label={step ? `${step.title}: ${step.detail}` : 'Network x to z to h to y'}>
      {edge('w', 120, 300, 'w', '#6a4bb5')}
      <line x1={380} x2={490} y1={120} y2={120} stroke={hot.has('relu') ? '#8a6500' : '#9aa1ac'} strokeWidth={hot.has('relu') ? 6 : 3} />
      <rect x={395} y={58} width={80} height={36} rx={10} fill={hot.has('relu') ? '#fbefc9' : '#fffdf8'} stroke="#8a6500" strokeWidth={2} />
      <text x={435} y={81} textAnchor="middle" className="s3-bp-edge-label">ReLU</text>
      {edge('v', 570, 720, 'v', '#6a4bb5')}
      {node('x', 80, 'x', BLUE)}
      {node('z', 340, 'z', '#6a4bb5')}
      {node('h', 530, 'h', MINT)}
      {node('y', 760, 'y', MINT)}
      <g className={hot.has('loss') ? 'hot' : ''}>
        <rect x={700} y={176} width={120} height={36} rx={10} fill={hot.has('loss') ? '#fde9e5' : '#fffdf8'} stroke={CORAL} strokeWidth={hot.has('loss') ? 4 : 2} />
        <text x={760} y={199} textAnchor="middle" className="s3-bp-edge-label">loss = {vals.loss}</text>
      </g>
      <text x={860} y={125} textAnchor="middle" className="s3-bp-target">target 4</text>
      {step?.back && <path d="M800 30 L80 30" stroke={CORAL} strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#s3-arrow)" fill="none" />}
      {step?.back && <text x={440} y={22} textAnchor="middle" className="s3-bp-back">blame flows backward</text>}
      <defs><marker id="s3-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill={CORAL} /></marker></defs>
    </svg>
  );
}

export function BackpropLab() {
  const [i, setI] = useState(0); // 0 = nothing yet, 1..8
  const step = i ? BP_STEPS[i - 1] : null;
  return (
    <Lab
      controls={<>
        <div className="lab-row">
          <LabButton onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>← Back</LabButton>
          <LabButton primary onClick={() => setI((v) => Math.min(8, v + 1))} disabled={i === 8}>{i === 0 ? 'Start' : 'Next step →'}</LabButton>
          <LabButton onClick={() => setI(0)}>Reset</LabButton>
        </div>
        <ol className="s3-bp-list">
          {BP_STEPS.map((s, k) => <li key={s.title} className={k + 1 === i ? 'now' : k + 1 < i ? 'done' : ''}><span>{k + 1}</span>{s.title}</li>)}
        </ol>
      </>}
      metrics={<>
        <Metric label="v" value={i >= 7 ? '1.08' : '1'} tone="violet" />
        <Metric label="w" value={i >= 7 ? '1.08' : '1'} tone="violet" />
        <Metric label="loss" value={i >= 8 ? '2.78' : '4'} tone={i >= 8 ? 'mint' : 'coral'} />
        <Metric label="lr" value="0.01" />
      </>}
    >
      <BackpropDiagram step={step} />
      <div className={`s3-bp-detail ${step?.back ? 'back' : ''}`}>
        <small>{step ? `STEP ${i} OF 8 · ${step.back ? 'BACKWARD' : 'FORWARD / UPDATE'}` : 'READY'}</small>
        <strong>{step ? step.title : 'x = 2, w = 1, v = 1, target = 4'}</strong>
        <p>{step ? step.detail : 'Press Start to run the forward pass, then follow the blame backward.'}</p>
      </div>
    </Lab>
  );
}

/* ---------- (4) sigmoid + BCE vs MSE ---------- */

const sig = (a: number) => 1 / (1 + Math.exp(-a));

export function SigmoidBceLab() {
  const [a, setA] = useState(-2);
  const [target, setTarget] = useState<'1' | '0'>('1');
  const y = Number(target);
  const p = sig(a);
  const bceOf = (q: number) => -(y * Math.log(Math.max(q, 1e-9)) + (1 - y) * Math.log(Math.max(1 - q, 1e-9)));
  const mseOf = (q: number) => (q - y) ** 2;
  const bce = bceOf(p), mse = mseOf(p);
  const confidentWrong = Math.abs(p - y) > 0.9;
  return (
    <Lab
      controls={<>
        <Slider label="D's raw score (logit) a" value={a} min={-6} max={6} step={0.1} onChange={setA} tone="violet" />
        <Segmented label="True label y" options={[{ value: '1', label: 'y = 1 · real' }, { value: '0', label: 'y = 0 · fake' }]} value={target} onChange={setTarget} />
      </>}
      metrics={<>
        <Metric label="p = σ(a)" value={p.toFixed(4)} tone="blue" />
        <Metric label="Verdict" value={p > 0.5 ? 'says real' : p < 0.5 ? 'says fake' : "can't tell"} />
        <Metric label="BCE loss" value={bce.toFixed(3)} tone="coral" />
        <Metric label="MSE loss" value={mse.toFixed(3)} tone="blue" />
      </>}
      foot={confidentWrong ? <><b>Confident and wrong:</b> BCE is {(bce / Math.max(mse, 1e-9)).toFixed(1)}× the MSE penalty.</> : <>Slide toward a confident wrong answer and compare the two penalties.</>}
    >
      <Plot
        ariaLabel={`Prediction ${p.toFixed(3)} with target ${y}: BCE ${bce.toFixed(2)}, MSE ${mse.toFixed(2)}`}
        x={[0, 1]} y={[0, 5]} xTicks={[0, 0.25, 0.5, 0.75, 1]} yTicks={[0, 1, 2, 3, 4, 5]}
        xLabel="D's prediction p (probability of real)" yLabel="loss" height={330}
        marks={[{ x: y, label: `target ${y}` }]}
        lines={[
          { pts: Array.from({ length: 400 }, (_, k) => { const q = 0.0025 + (k / 399) * 0.995; return [q, Math.min(bceOf(q), 6)] as [number, number]; }), color: CORAL },
          { f: (q) => mseOf(q), color: BLUE },
        ]}
        points={[{ at: [p, Math.min(bce, 4.95)], color: CORAL, r: 8 }, { at: [p, mse], color: BLUE, r: 7 }]}
      >
        {(sx, sy) => (
          <g className="s3-legend">
            <line x1={sx(0.38)} x2={sx(0.44)} y1={sy(4.6)} y2={sy(4.6)} stroke={CORAL} strokeWidth="4" />
            <text x={sx(0.455)} y={sy(4.6)} dominantBaseline="middle" fill={CORAL}>BCE (cross-entropy)</text>
            <line x1={sx(0.38)} x2={sx(0.44)} y1={sy(4.1)} y2={sy(4.1)} stroke={BLUE} strokeWidth="4" />
            <text x={sx(0.455)} y={sy(4.1)} dominantBaseline="middle" fill={BLUE}>MSE (squared error)</text>
          </g>
        )}
      </Plot>
    </Lab>
  );
}

/* ---------- static diagram: the 1 → 2 → 1 network ---------- */

export function HiddenNet() {
  const n = (cx: number, cy: number, label: string, sub: string, stroke: string, fill: string) => (
    <g>
      <circle cx={cx} cy={cy} r={44} fill={fill} stroke={stroke} strokeWidth="3" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="s3-net-label">{label}</text>
      <text x={cx} y={cy + 20} textAnchor="middle" className="s3-net-sub">{sub}</text>
    </g>
  );
  const e = (x1: number, y1: number, x2: number, y2: number, label: string) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6a4bb5" strokeWidth="3" />
      <rect x={(x1 + x2) / 2 - 38} y={(y1 + y2) / 2 - 17} width={76} height={34} rx={9} fill="#efe9fb" stroke="#6a4bb5" strokeWidth="1.5" />
      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 6} textAnchor="middle" className="s3-net-w">{label}</text>
    </g>
  );
  return (
    <svg className="s3-net" viewBox="0 0 860 330" role="img" aria-label="Network: input x feeds two hidden ReLU neurons with weights 1 and minus 1, which feed one output neuron with weights 1 and 1">
      {e(130, 165, 400, 80, 'w₁ = 1')}
      {e(130, 165, 400, 250, 'w₂ = −1')}
      {e(400, 80, 700, 165, 'v₁ = 1')}
      {e(400, 250, 700, 165, 'v₂ = 1')}
      {n(110, 165, 'x', 'input', BLUE, '#e8edff')}
      {n(420, 80, 'h₁', 'ReLU', MINT, '#dff5ea')}
      {n(420, 250, 'h₂', 'ReLU', MINT, '#dff5ea')}
      {n(720, 165, 'ŷ', 'output', INK, '#fffdf8')}
      <text x={420} y={322} textAnchor="middle" className="s3-net-cap">HIDDEN LAYER — nobody tells these what to produce</text>
    </svg>
  );
}
