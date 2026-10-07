import { useState } from 'react';
import { Plot } from '../components/art';
import { Lab, Metric, Segmented, Slider } from './lab-kit';

const sig = (x: number) => 1 / (1 + Math.exp(-x));
const ALPHA = 0.2;

type Fn = { key: string; name: string; color: string; dash?: boolean; f: (x: number) => number; d: (x: number) => number };

// Derivatives follow PyTorch's conventions at the kink (ReLU'(0) = 0, LeakyReLU'(0) = α).
const FNS: Fn[] = [
  { key: 'relu', name: 'ReLU', color: '#277a59', f: (x) => Math.max(0, x), d: (x) => (x > 0 ? 1 : 0) },
  { key: 'leaky', name: 'LeakyReLU 0.2', color: '#c8432f', dash: true, f: (x) => (x > 0 ? x : ALPHA * x), d: (x) => (x > 0 ? 1 : ALPHA) },
  { key: 'tanh', name: 'Tanh', color: '#3157d5', f: Math.tanh, d: (x) => 1 - Math.tanh(x) ** 2 },
  { key: 'sigmoid', name: 'Sigmoid', color: '#a87a00', f: sig, d: (x) => sig(x) * (1 - sig(x)) },
];

const fmt = (v: number) => (Math.abs(v) > 0 && Math.abs(v) < 0.001 ? v.toExponential(1) : v.toFixed(3));

export function ActivationExplorer() {
  const [x, setX] = useState(-2);
  const [view, setView] = useState<'f' | 'd'>('f');
  const deriv = view === 'd';
  return (
    <Lab
      controls={<>
        <Slider label="Input x" value={x} min={-6} max={6} step={0.1} onChange={setX} format={(v) => v.toFixed(1)} />
        <Segmented label="Plot" options={[{ value: 'f', label: 'Signal f(x)' }, { value: 'd', label: "Local slope f′(x)" }]} value={view} onChange={setView} />
      </>}
      metrics={<>
        {FNS.map((fn) => (
          <div className="lab-metric tone-plain act-fn-metric" key={fn.key}>
            <small style={{ color: fn.color }}>{fn.name}</small>
            <strong>{fmt(fn.f(x))}</strong>
            <span>slope {fmt(fn.d(x))}</span>
          </div>
        ))}
      </>}
      foot={<>Flat tails: σ′(±10) ≈ 0.000045, tanh′(±5) ≈ 0.00018. At x = 0 PyTorch uses ReLU′ = 0. Local slopes only — not the full GAN gradient.</>}
    >
      <div className="act-legend">{FNS.map((fn) => <span key={fn.key}><i style={{ background: fn.dash ? `repeating-linear-gradient(90deg, ${fn.color} 0 5px, transparent 5px 8px)` : fn.color }} />{fn.name}</span>)}</div>
      <Plot
        ariaLabel={`${deriv ? 'Derivatives' : 'Outputs'} of four activations, marked at x = ${x.toFixed(1)}`}
        x={[-6, 6]} y={deriv ? [-0.1, 1.1] : [-2, 6]}
        xTicks={[-6, -4, -2, 0, 2, 4, 6]} yTicks={deriv ? [0, 0.5, 1] : [-2, 0, 2, 4, 6]}
        xLabel="input x" yLabel={deriv ? "f′(x)" : 'f(x)'} height={330}
        marks={[{ x }]}
        lines={FNS.map((fn) => ({ f: deriv ? fn.d : fn.f, color: fn.color, dash: fn.dash }))}
        points={FNS.map((fn) => ({ at: [x, deriv ? fn.d(x) : fn.f(x)] as [number, number], color: fn.color, r: 6 }))}
      />
    </Lab>
  );
}

export function PixelNormLab() {
  const [pixel, setPixel] = useState(64);
  const v = pixel / 127.5 - 1;
  const back = Math.round(((v + 1) / 2) * 255);
  return (
    <Lab
      controls={<Slider label="Stored pixel byte" value={pixel} min={0} max={255} step={1} onChange={setPixel} format={(p) => String(p)} />}
      metrics={<>
        <Metric label="Byte" value={pixel} />
        <Metric label="Normalized" value={v.toFixed(3)} tone="blue" />
        <Metric label="Tanh pre-image" value={Math.abs(v) >= 1 ? (v > 0 ? '+∞' : '−∞') : Math.atanh(v).toFixed(2)} tone="violet" />
        <Metric label="Displayed back" value={back} tone="mint" />
      </>}
      foot={<>Tensor already in [0, 1] (after ToTensor)? Use x * 2 − 1 — don’t divide by 127.5 again.</>}
    >
      <div className="act-pixel">
        <div className="act-swatch" style={{ background: `rgb(${pixel},${pixel},${pixel})` }} aria-label={`Gray swatch for byte ${pixel}`} />
        <div className="act-scale">
          <div className="act-scale-row"><small>STORED</small><div className="act-bar"><span style={{ left: `${(pixel / 255) * 100}%` }} /></div><div className="act-ends"><b>0</b><b>127.5</b><b>255</b></div></div>
          <div className="act-formula">pixel / 127.5 − 1</div>
          <div className="act-scale-row"><small>WHAT D SEES · WHAT TANH OUTPUTS</small><div className="act-bar act-bar-blue"><span style={{ left: `${((v + 1) / 2) * 100}%` }} /></div><div className="act-ends"><b>−1 black</b><b>0</b><b>+1 white</b></div></div>
          <div className="act-formula">display = ((fake + 1) / 2).clamp(0, 1)</div>
        </div>
      </div>
    </Lab>
  );
}

export function SaturationLab() {
  const [a, setA] = useState(-6);
  const p = sig(a);
  const minimax = -p;
  const ns = p - 1;
  return (
    <Lab
      controls={<Slider label="D's logit for a fake, a" value={a} min={-10} max={10} step={0.1} onChange={setA} tone="coral" format={(v) => v.toFixed(1)} />}
      metrics={<>
        <Metric label="D(fake) prob." value={fmt(p)} tone="coral" />
        <Metric label="Sigmoid slope" value={fmt(p * (1 - p))} />
        <Metric label="Minimax grad" value={fmt(minimax)} tone={Math.abs(minimax) < 0.05 ? 'coral' : 'plain'} />
        <Metric label="Non-sat grad" value={fmt(ns)} tone="mint" />
      </>}
      foot={<>Scalar derivatives with respect to the fake logit, before the chain rule through D and G. Non-saturating G loss = BCE(D(fake), 1).</>}
    >
      <Plot
        ariaLabel={`Generator gradients at fake logit ${a.toFixed(1)}: minimax ${minimax.toFixed(3)}, non-saturating ${ns.toFixed(3)}`}
        x={[-10, 10]} y={[-1.1, 0.1]} xTicks={[-10, -5, 0, 5, 10]} yTicks={[-1, -0.5, 0]}
        xLabel="fake logit a   (left: D confidently says fake · right: D fooled)" yLabel="∂ G loss / ∂a" height={330}
        marks={[{ x: a }]}
        lines={[
          { f: (v) => -sig(v), color: '#c8432f', label: 'minimax −σ(a)' },
          { f: (v) => sig(v) - 1, color: '#277a59', label: 'non-sat σ(a)−1' },
        ]}
        points={[{ at: [a, minimax], color: '#c8432f' }, { at: [a, ns], color: '#277a59' }]}
      />
    </Lab>
  );
}
