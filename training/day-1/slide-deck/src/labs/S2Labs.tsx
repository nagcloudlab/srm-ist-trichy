import { useState } from 'react';
import { Plot } from '../components/art';
import { Lab, Metric, Segmented, Slider } from './lab-kit';

const CORAL = '#c8432f';
const MINT = '#277a59';
const BLUE = '#3157d5';
const clampP = (p: number) => Math.min(0.999, Math.max(0.001, p));

/** BCE explorer: one prediction p, one target y — see the penalty. */
export function BceLab() {
  const [p, setP] = useState(0.8);
  const [y, setY] = useState<'1' | '0'>('1');
  const target = Number(y);
  const loss = target === 1 ? -Math.log(clampP(p)) : -Math.log(clampP(1 - p));
  const mse = (target - p) ** 2;
  const verdict = loss < 0.25 ? 'confident and right' : loss < 1 ? 'unsure' : loss < 2.5 ? 'wrong' : 'confident and WRONG';
  return (
    <Lab
      controls={<>
        <Segmented label="Target y (the truth)" options={[{ value: '1', label: 'y = 1 · real' }, { value: '0', label: 'y = 0 · fake' }]} value={y} onChange={setY} />
        <Slider label="D's prediction p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} tone="coral" format={(v) => v.toFixed(2)} />
      </>}
      metrics={<>
        <Metric label="BCE loss" value={loss.toFixed(3)} tone={loss < 0.25 ? 'mint' : loss > 2 ? 'coral' : 'yellow'} />
        <Metric label="MSE for comparison" value={mse.toFixed(3)} />
        <Metric label="Reading" value={verdict} tone="plain" />
      </>}
      foot={<>{target === 1 ? <>y = 1 → BCE = −log(p). Pushes p toward 1.</> : <>y = 0 → BCE = −log(1 − p). Pushes p toward 0.</>} At p = 0.01 vs y = 1: BCE 4.61, MSE only 0.98.</>}
    >
      <Plot
        ariaLabel={`BCE loss ${loss.toFixed(3)} for prediction ${p.toFixed(2)} with target ${y}`}
        x={[0, 1]} y={[0, 5]} xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[0, 1, 2, 3, 4, 5]}
        xLabel="D's prediction p = P(real)" yLabel="loss" height={340}
        lines={[
          { f: (v) => -Math.log(clampP(v)), color: target === 1 ? BLUE : '#c9cdd6', label: 'y=1: −log p', width: target === 1 ? 4 : 2 },
          { f: (v) => -Math.log(clampP(1 - v)), color: target === 0 ? CORAL : '#c9cdd6', label: 'y=0: −log(1−p)', width: target === 0 ? 4 : 2 },
        ]}
        points={[{ at: [p, Math.min(loss, 5)], color: target === 1 ? BLUE : CORAL, r: 9, label: loss.toFixed(2) }]}
      />
    </Lab>
  );
}

/**
 * Opposite goals on one fake sample: as D(fake) moves, D's loss and G's loss pull in opposite directions.
 * Also shows why the minimax G objective saturates when D confidently rejects fakes.
 */
export function OppositeGoalsLab() {
  const [p, setP] = useState(0.05);
  const dLoss = -Math.log(clampP(1 - p));
  const gNs = -Math.log(clampP(p));
  const gMinimax = Math.log(clampP(1 - p));
  // Gradients w.r.t. D's fake logit a (p = σ(a)):
  const gradMinimax = p; // |d/da log(1 − σ(a))| = σ(a)
  const gradNs = 1 - p; // |d/da −log σ(a)| = 1 − σ(a)
  return (
    <Lab
      controls={<Slider label="D(G(z)) — D's score for one fake" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} tone="coral" format={(v) => v.toFixed(2)} />}
      metrics={<>
        <Metric label="D's loss · −log(1−p)" value={dLoss.toFixed(3)} tone="coral" />
        <Metric label="G's loss (used) · −log p" value={gNs.toFixed(3)} tone="mint" />
        <Metric label="G push · non-saturating" value={gradNs.toFixed(2)} tone="mint" />
        <Metric label="G push · minimax" value={gradMinimax.toFixed(2)} tone={gradMinimax < 0.1 ? 'coral' : 'plain'} />
      </>}
      foot={<>"Push" = size of the gradient on D's fake logit. Early in training D(fake) ≈ 0: the minimax objective log(1−p) = {gMinimax.toFixed(3)} is nearly flat, so G barely learns. −log p stays steep.</>}
    >
      <Plot
        ariaLabel={`At D of fake ${p.toFixed(2)}, D loss ${dLoss.toFixed(2)} and G loss ${gNs.toFixed(2)}`}
        x={[0, 1]} y={[-3, 4.5]} xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[-3, -2, -1, 0, 1, 2, 3, 4]}
        xLabel="D(G(z)) — how real D thinks the fake is" yLabel="value" height={340}
        marks={[{ x: p }]}
        lines={[
          { f: (v) => -Math.log(clampP(1 - v)), color: CORAL, label: 'D loss' },
          { f: (v) => -Math.log(clampP(v)), color: MINT, label: 'G loss' },
          { f: (v) => Math.log(clampP(1 - v)), color: MINT, dash: true, width: 2.5, label: 'minimax' },
        ]}
        points={[
          { at: [p, Math.min(dLoss, 4.5)], color: CORAL },
          { at: [p, Math.min(gNs, 4.5)], color: MINT },
          { at: [p, Math.max(gMinimax, -3)], color: '#9ce1c4' },
        ]}
      />
    </Lab>
  );
}
