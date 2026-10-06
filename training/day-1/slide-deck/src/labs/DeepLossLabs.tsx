import { useMemo, useState } from 'react';
import { Plot, type Pt } from '../components/art';
import { Lab, Metric, Segmented, Slider } from './lab-kit';
import '../deep/loss.css';

function Legend({ items }: { items: { color: string; label: string; dash?: boolean }[] }) {
  return <div className="loss-legend">{items.map((i) => <span key={i.label}><i style={{ borderColor: i.color, borderTopStyle: i.dash ? 'dashed' : 'solid' }} />{i.label}</span>)}</div>;
}

const BLUE = '#3157d5', CORAL = '#c8432f', MINT = '#277a59', VIOLET = '#6a4bb5', MUTED = '#68707c';
const sigmoid = (a: number) => 1 / (1 + Math.exp(-a));

const huber = (e: number, d: number) => (Math.abs(e) <= d ? 0.5 * e * e : d * (Math.abs(e) - 0.5 * d));

/** Best constant prediction c for each loss: minimize Σ loss(c − yᵢ) over a fine grid. */
function bestConstant(ys: number[], loss: (e: number) => number) {
  let best = 0, bestVal = Infinity;
  for (let c = 0; c <= 45; c += 0.01) {
    const v = ys.reduce((s, y) => s + loss(c - y), 0);
    if (v < bestVal) { bestVal = v; best = c; }
  }
  return best;
}

/** Drag one outlier and watch which loss lets it pull the fitted constant. */
export function RegressionLossLab() {
  const [outlier, setOutlier] = useState(30);
  const [delta, setDelta] = useState(1);
  const ys = useMemo(() => [3, 4, 5, 6, outlier], [outlier]);
  const mse = useMemo(() => bestConstant(ys, (e) => e * e), [ys]);
  const mae = useMemo(() => bestConstant(ys, (e) => Math.abs(e)), [ys]);
  const hub = useMemo(() => bestConstant(ys, (e) => huber(e, delta)), [ys, delta]);
  const sq = ys.map((y) => (mse - y) ** 2);
  const share = sq[4] / sq.reduce((a, b) => a + b, 0);
  return (
    <Lab
      controls={<>
        <Slider label="Outlier value (5th point)" value={outlier} min={5} max={40} step={0.5} onChange={setOutlier} tone="coral" />
        <Slider label="Huber delta δ" value={delta} min={0.5} max={10} step={0.5} onChange={setDelta} tone="violet" />
      </>}
      metrics={<>
        <Metric label="MSE fit = mean" value={mse.toFixed(2)} tone="blue" />
        <Metric label="MAE fit = median" value={mae.toFixed(2)} tone="mint" />
        <Metric label={`Huber fit · delta ${delta}`} value={hub.toFixed(2)} tone="violet" />
        <Metric label="Outlier's share of MSE" value={`${Math.round(share * 100)}%`} tone="coral" />
      </>}
      foot="Data 3, 4, 5, 6 plus one outlier. Each loss picks the single constant that minimizes it."
    >
      <Legend items={[{ color: BLUE, label: `MSE → ${mse.toFixed(2)}` }, { color: MINT, label: `MAE → ${mae.toFixed(2)}`, dash: true }, { color: VIOLET, label: `Huber → ${hub.toFixed(2)}` }]} />
      <Plot
        ariaLabel="Five data points and the constant each loss fits"
        x={[0.5, 5.5]} y={[0, 42]} xTicks={[1, 2, 3, 4, 5]} yTicks={[0, 10, 20, 30, 40]}
        xLabel="example" yLabel="value" height={330}
        lines={[
          { pts: [[0.5, mse], [5.5, mse]] as Pt[], color: BLUE },
          { pts: [[0.5, mae], [5.5, mae]] as Pt[], color: MINT, dash: true, width: 4 },
          { pts: [[0.5, hub], [5.5, hub]] as Pt[], color: VIOLET, width: 2 },
        ]}
        points={ys.map((y, i) => ({ at: [i + 1, y] as Pt, color: i === 4 ? CORAL : MUTED, r: i === 4 ? 9 : 7 }))}
      />
    </Lab>
  );
}

/** Logit slider: BCE keeps a strong gradient on confident mistakes, MSE-on-probability does not. */
export function ClassificationLossLab() {
  const [a, setA] = useState(-4);
  const [target, setTarget] = useState<'1' | '0'>('1');
  const [view, setView] = useState<'loss' | 'grad'>('grad');
  const y = Number(target);
  const p = sigmoid(a);
  const bce = -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  const dBce = p - y;
  const mse = (p - y) ** 2;
  const dMse = 2 * (p - y) * p * (1 - p);
  const bceF = (v: number) => { const q = sigmoid(v); return -(y * Math.log(q) + (1 - y) * Math.log(1 - q)); };
  const mseF = (v: number) => (sigmoid(v) - y) ** 2;
  const dBceF = (v: number) => sigmoid(v) - y;
  const dMseF = (v: number) => { const q = sigmoid(v); return 2 * (q - y) * q * (1 - q); };
  const wrong = (y === 1 && a < -2) || (y === 0 && a > 2);
  return (
    <Lab
      controls={<>
        <Slider label="Logit a (raw score)" value={a} min={-8} max={8} step={0.1} onChange={setA} />
        <Segmented label="Target y" options={[{ value: '1', label: 'y = 1 · real' }, { value: '0', label: 'y = 0 · fake' }]} value={target} onChange={setTarget} />
        <Segmented label="Plot" options={[{ value: 'grad', label: 'Gradient ∂L/∂a' }, { value: 'loss', label: 'Loss' }]} value={view} onChange={setView} />
      </>}
      metrics={<>
        <Metric label="p = σ(a)" value={p.toFixed(4)} />
        <Metric label="BCE · ∂/∂a" value={`${bce.toFixed(3)} · ${dBce.toFixed(3)}`} tone="coral" />
        <Metric label="MSE · ∂/∂a" value={`${mse.toFixed(3)} · ${dMse.toFixed(4)}`} tone="blue" />
        <Metric label="Signal ratio |BCE| / |MSE|" value={Math.abs(dMse) < 1e-9 ? '—' : `${Math.abs(dBce / dMse).toFixed(0)}×`} tone={wrong ? 'yellow' : 'plain'} />
      </>}
      foot={wrong ? 'Confident and wrong: BCE still pushes hard; MSE through the sigmoid has almost no gradient.' : 'Move a to the wrong side (e.g. −6 with y = 1) to see MSE go quiet.'}
    >
      <Legend items={view === 'grad' ? [{ color: CORAL, label: 'BCE gradient = p − y' }, { color: BLUE, label: 'MSE gradient = 2(p − y)·p(1 − p)' }] : [{ color: CORAL, label: 'BCE' }, { color: BLUE, label: 'MSE on the probability' }]} />
      {view === 'grad' ? (
        <Plot
          ariaLabel="Gradient of BCE and MSE with respect to the logit"
          x={[-8, 8]} y={[-1.05, 1.05]} xTicks={[-8, -4, 0, 4, 8]} yTicks={[-1, -0.5, 0, 0.5, 1]}
          xLabel="logit a" yLabel="∂L / ∂a" height={330}
          lines={[{ f: dBceF, color: CORAL }, { f: dMseF, color: BLUE }]}
          points={[{ at: [a, dBce], color: CORAL }, { at: [a, dMse], color: BLUE }]}
        />
      ) : (
        <Plot
          ariaLabel="BCE and MSE loss against the logit"
          x={[-8, 8]} y={[0, 8.5]} xTicks={[-8, -4, 0, 4, 8]} yTicks={[0, 2, 4, 6, 8]}
          xLabel="logit a" yLabel="loss" height={330}
          lines={[{ f: bceF, color: CORAL }, { f: mseF, color: BLUE }]}
          points={[{ at: [a, Math.min(bce, 8.4)], color: CORAL }, { at: [a, mse], color: BLUE }]}
        />
      )}
    </Lab>
  );
}
