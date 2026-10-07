'use client';

import { useEffect, useMemo, useState } from 'react';

type LabId = 'step-size' | 'descent' | 'gradient' | 'dual-parameter' | 'multi-input' | 'relu' | 'hidden-layer' | 'backprop-gate' | 'sigmoid-bce' | 'classifier' | 'autograd';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const dualXs = [1, 2, 3];
const dualYs = [7, 9, 11];
const pointsPath = (values: number[], min: number, max: number, width = 720, height = 280) => values.map((value, index) => {
  const x = 58 + (index / Math.max(1, values.length - 1)) * (width - 90);
  const y = 22 + (1 - (value - min) / Math.max(.0001, max - min)) * (height - 72);
  return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

function Slider({ label, value, min, max, step, onChange, suffix = '' }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; suffix?: string }) {
  return <label className="lab-slider"><span>{label}<b>{Number(value.toFixed(3))}{suffix}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function ChartFrame({ children, xLabel, yLabel, label }: { children: React.ReactNode; xLabel: string; yLabel: string; label: string }) {
  return <svg className="lab-chart" viewBox="0 0 720 280" role="img" aria-label={label}>
    <rect className="lab-chart-frame" x="58" y="18" width="632" height="220" rx="8" />
    {[0, 1, 2, 3, 4].map((tick) => <line key={`h${tick}`} x1="58" y1={18 + tick * 55} x2="690" y2={18 + tick * 55} />)}
    {[0, 1, 2, 3, 4, 5].map((tick) => <line key={`v${tick}`} x1={58 + tick * 126.4} y1="18" x2={58 + tick * 126.4} y2="238" />)}
    {children}
    <text className="lab-axis-label" x="374" y="271" textAnchor="middle">{xLabel}</text>
    <text className="lab-axis-label" x="15" y="128" textAnchor="middle" transform="rotate(-90 15 128)">{yLabel}</text>
  </svg>;
}

function Metric({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return <div className={`lab-metric ${tone}`}><small>{label}</small><strong>{value}</strong></div>;
}

function StepSizeLab() {
  const [rate, setRate] = useState(.1);
  const gradient = -9.2867;
  const weight = 1 - rate * gradient;
  const loss = (14 / 3) * (weight - 2) ** 2;
  const curve = Array.from({ length: 101 }, (_, index) => {
    const w = .5 + index * .035;
    return (14 / 3) * (w - 2) ** 2;
  });
  const xAt = (w: number) => 58 + ((w - .5) / 3.5) * 632;
  const yAt = (value: number) => 22 + (1 - clamp(value / 20, 0, 1)) * 208;
  return <LabShell title="One-step learning-rate calculator" controls={<Slider label="Learning rate η" value={rate} min={.01} max={.3} step={.01} onChange={setRate} />} metrics={<><Metric label="New weight" value={weight.toFixed(4)} /><Metric label="New loss" value={loss.toFixed(4)} tone={loss < 4.6667 ? 'good' : 'bad'} /><Metric label="Result" value={loss < .1 ? 'near minimum' : loss < 4.6667 ? 'improved' : 'overshot'} tone={loss < 4.6667 ? 'good' : 'bad'} /></>}>
    <div className="lab-arithmetic" aria-live="polite"><span>1.0 − {rate.toFixed(2)} × (−9.2867)</span><span>= <b>{weight.toFixed(4)}</b></span></div>
    <ChartFrame xLabel="weight w" yLabel="loss" label={`Learning rate ${rate.toFixed(2)} moves the weight to ${weight.toFixed(4)} with loss ${loss.toFixed(4)}`}>{[.5, 1, 2, 3, 4].map((tick) => <text className="lab-tick" key={`x-${tick}`} x={xAt(tick)} y="255" textAnchor="middle">{tick}</text>)}{[0, 5, 10, 15, 20].map((tick) => <text className="lab-tick" key={`y-${tick}`} x="49" y={yAt(tick)} textAnchor="end" dominantBaseline="middle">{tick}</text>)}<path className="lab-series" d={pointsPath(curve, 0, 20)} /><path className="lab-update-arrow" d={`M${xAt(1)},${yAt(14 / 3)} L${xAt(weight)},${yAt(loss)}`} /><circle className="lab-start-point" cx={xAt(1)} cy={yAt(14 / 3)} r="7" /><circle className="lab-point" cx={xAt(weight)} cy={yAt(loss)} r="9" /></ChartFrame>
  </LabShell>;
}

function DescentLab() {
  const [rate, setRate] = useState(.1);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const weights = useMemo(() => {
    const values = [1];
    for (let i = 0; i < 10; i += 1) values.push(values.at(-1)! - rate * (28 / 3) * (values.at(-1)! - 2));
    return values;
  }, [rate]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((value) => {
      if (value >= 10) { setPlaying(false); return 10; }
      return value + 1;
    }), 520);
    return () => window.clearInterval(timer);
  }, [playing]);
  const visible = weights.slice(0, step + 1);
  const bound = Math.max(3, ...weights.map((value) => Math.abs(value)));
  const path = pointsPath(visible, -bound, bound);
  const lastX = 58 + (step / 10) * 632;
  const lastY = 22 + (1 - (weights[step] + bound) / (2 * bound)) * 208;
  const loss = (14 / 3) * (weights[step] - 2) ** 2;
  return <LabShell title="Learning-rate flight simulator" controls={<>
    <Slider label="Learning rate η" value={rate} min={.01} max={.3} step={.01} onChange={(value) => { setRate(value); setStep(0); setPlaying(false); }} />
    <button className="lab-button primary" onClick={() => { if (step >= 10) setStep(0); setPlaying((value) => !value); }}>{playing ? 'Pause' : step >= 10 ? 'Replay' : 'Run 10 steps'}</button>
    <button className="lab-button" onClick={() => { setPlaying(false); setStep(0); }}>Reset</button>
  </>} metrics={<><Metric label="Step" value={`${step}/10`} /><Metric label="Weight" value={weights[step].toFixed(3)} tone={Math.abs(weights[step] - 2) < .02 ? 'good' : ''} /><Metric label="Loss" value={loss.toFixed(loss > 999 ? 0 : 4)} tone={loss > 10 ? 'bad' : ''} /></>}>
    <ChartFrame xLabel="training step" yLabel="weight" label={`Weight after ${step} steps is ${weights[step].toFixed(3)}`}>
      <line className="lab-reference" x1="58" y1={22 + (1 - (2 + bound) / (2 * bound)) * 208} x2="690" y2={22 + (1 - (2 + bound) / (2 * bound)) * 208} />
      <text className="lab-direct-label" x="680" y={14 + (1 - (2 + bound) / (2 * bound)) * 208} textAnchor="end">ideal w = 2</text>
      <path className="lab-series" d={path} />
      <circle className="lab-point" cx={lastX} cy={lastY} r="8" />
    </ChartFrame>
  </LabShell>;
}

function GradientLab() {
  const [weight, setWeight] = useState(1);
  const [x, setX] = useState(2);
  const target = 9, bias = 5;
  const prediction = weight * x + bias, error = prediction - target, loss = error ** 2, gradient = 2 * error * x;
  const curve = Array.from({ length: 81 }, (_, i) => { const w = -1 + i * .075; return (w * x + bias - target) ** 2; });
  const max = Math.max(...curve);
  const dotX = 58 + ((weight + 1) / 6) * 632;
  const dotY = 22 + (1 - loss / max) * 208;
  return <LabShell title="Exact-gradient calculator" controls={<><Slider label="Weight w" value={weight} min={-1} max={5} step={.05} onChange={setWeight} /><Slider label="Input x" value={x} min={1} max={4} step={1} onChange={setX} /></>} metrics={<><Metric label="Prediction" value={prediction.toFixed(2)} /><Metric label="Loss" value={loss.toFixed(2)} /><Metric label="Exact gradient" value={gradient.toFixed(2)} tone={gradient === 0 ? 'good' : gradient > 0 ? 'bad' : ''} /></>}>
    <div className="lab-arithmetic" aria-live="polite"><span>ŷ = {weight.toFixed(2)} × {x} + 5 = <b>{prediction.toFixed(2)}</b></span><span>e = {prediction.toFixed(2)} − 9 = <b>{error.toFixed(2)}</b></span><span>dL/dw = 2 × {error.toFixed(2)} × {x} = <b>{gradient.toFixed(2)}</b></span></div>
    <ChartFrame xLabel="weight w" yLabel="loss" label={`Loss ${loss.toFixed(2)} at weight ${weight.toFixed(2)}`}><path className="lab-series" d={pointsPath(curve, 0, max)} /><circle className="lab-point" cx={dotX} cy={dotY} r="8" /></ChartFrame>
  </LabShell>;
}

function DualParameterLab() {
  const [weight, setWeight] = useState(1);
  const [bias, setBias] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timeline = useMemo(() => {
    const history = [{ epoch: 0, weight: 1, bias: 0 }];
    let w = 1, b = 0;
    for (let epoch = 1; epoch <= 1000; epoch += 1) {
      const errors = dualXs.map((x, index) => w * x + b - dualYs[index]);
      const gradW = errors.reduce((sum, error, index) => sum + 2 * error * dualXs[index], 0) / dualXs.length;
      const gradB = errors.reduce((sum, error) => sum + 2 * error, 0) / dualXs.length;
      w -= .1 * gradW;
      b -= .1 * gradB;
      history.push({ epoch, weight: w, bias: b });
    }
    const epochs = [0, ...Array.from({ length: 10 }, (_, index) => index + 1), ...Array.from({ length: 9 }, (_, index) => (index + 2) * 10), ...Array.from({ length: 9 }, (_, index) => (index + 2) * 100)];
    return epochs.map((epoch) => history[epoch]);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame((current) => {
      if (current >= timeline.length - 1) { setPlaying(false); return current; }
      const next = current + 1;
      setWeight(timeline[next].weight);
      setBias(timeline[next].bias);
      return next;
    }), 180);
    return () => window.clearInterval(timer);
  }, [playing, timeline]);
  const predictions = dualXs.map((x) => weight * x + bias);
  const errors = predictions.map((value, index) => value - dualYs[index]);
  const loss = errors.reduce((sum, value) => sum + value ** 2, 0) / 3;
  const gradW = errors.reduce((sum, value, index) => sum + 2 * value * dualXs[index], 0) / 3;
  const gradB = errors.reduce((sum, value) => sum + 2 * value, 0) / 3;
  const setManual = (nextWeight: number, nextBias: number) => { setPlaying(false); setFrame(-1); setWeight(nextWeight); setBias(nextBias); };
  const reset = () => { setPlaying(false); setFrame(0); setWeight(1); setBias(0); };
  const run = () => {
    if (frame < 0 || frame >= timeline.length - 1) reset();
    setPlaying((value) => !value);
  };
  const xAt = (value: number) => 58 + (value / 3.5) * 632;
  const yAt = (value: number) => 238 - (clamp(value, 0, 16) / 16) * 216;
  return <LabShell title="Two-parameter learning lab" controls={<><Slider label="Weight w" value={weight} min={0} max={4} step={.05} onChange={(value) => setManual(value, bias)} /><Slider label="Bias b" value={bias} min={0} max={8} step={.1} onChange={(value) => setManual(weight, value)} /><button className="lab-button primary" onClick={run}>{playing ? 'Pause' : frame > 0 && frame < timeline.length - 1 ? 'Continue' : 'Animate training'}</button><button className="lab-button" onClick={reset}>Reset</button></>} metrics={<><Metric label="Epoch" value={frame < 0 ? 'manual' : String(timeline[frame].epoch)} /><Metric label="Mean loss" value={loss.toFixed(3)} tone={loss < .02 ? 'good' : ''} /><Metric label="Weight gradient" value={gradW.toFixed(2)} /><Metric label="Bias gradient" value={gradB.toFixed(2)} /></>}>
    <div className="dual-lab-stage">
      <div className="dual-live-values">{dualXs.map((x, index) => <div key={x}><small>x = {x}</small><strong>ŷ = {predictions[index].toFixed(2)}</strong><span>target {dualYs[index]}</span></div>)}</div>
      <svg className="lab-chart dual-line-chart" viewBox="0 0 720 280" role="img" aria-label={`Model line with weight ${weight.toFixed(2)}, bias ${bias.toFixed(2)}, and mean loss ${loss.toFixed(3)}`}>
        <rect className="lab-chart-frame" x="58" y="18" width="632" height="220" rx="8" />
        <line className="dual-axis" x1="58" y1="238" x2="690" y2="238" /><line className="dual-axis" x1="58" y1="18" x2="58" y2="238" />
        {[0,1,2,3].map((tick) => <text className="lab-tick" key={`dx-${tick}`} x={xAt(tick)} y="258" textAnchor="middle">{tick}</text>)}
        {[0,5,10,15].map((tick) => <text className="lab-tick" key={`dy-${tick}`} x="48" y={yAt(tick)} textAnchor="end" dominantBaseline="middle">{tick}</text>)}
        <line className="dual-model-line" x1={xAt(0)} y1={yAt(bias)} x2={xAt(3.5)} y2={yAt(weight * 3.5 + bias)} />
        {dualXs.map((x, index) => <circle className="dual-target-point" key={`target-${x}`} cx={xAt(x)} cy={yAt(dualYs[index])} r="8" />)}
        {dualXs.map((x, index) => <circle className="dual-prediction-point" key={`prediction-${x}`} cx={xAt(x)} cy={yAt(predictions[index])} r="6" />)}
        <text className="lab-axis-label" x="374" y="275" textAnchor="middle">input x</text><text className="lab-axis-label" x="15" y="128" textAnchor="middle" transform="rotate(-90 15 128)">prediction ŷ</text>
      </svg>
    </div>
    <div className="lab-arithmetic"><span>w changes the <b>slope</b></span><span>b shifts <b>every prediction</b></span><span>calculate both gradients, then update both</span></div>
  </LabShell>;
}

function MultiInputLab() {
  const [distance, setDistance] = useState(4);
  const [packages, setPackages] = useState(2);
  const [w1, setW1] = useState(2);
  const [w2, setW2] = useState(3);
  const bias = 5, first = distance * w1, second = packages * w2, total = first + second + bias;
  return <LabShell title="Multi-input prediction calculator" controls={<><Slider label="Distance" value={distance} min={0} max={8} step={.5} suffix=" km" onChange={setDistance} /><Slider label="Packages" value={packages} min={0} max={5} step={1} onChange={setPackages} /><Slider label="Minutes per km" value={w1} min={0} max={5} step={.1} onChange={setW1} /><Slider label="Minutes per package" value={w2} min={0} max={6} step={.1} onChange={setW2} /></>} metrics={<Metric label="Predicted delivery time" value={`${total.toFixed(1)} min`} tone="good" />}>
    <div className="lab-contributions" aria-live="polite"><div style={{ '--amount': `${clamp(first / Math.max(total, 1) * 100, 0, 100)}%` } as React.CSSProperties}><span>distance</span><b>{w1.toFixed(1)} × {distance} = {first.toFixed(1)}</b></div><div style={{ '--amount': `${clamp(second / Math.max(total, 1) * 100, 0, 100)}%` } as React.CSSProperties}><span>packages</span><b>{w2.toFixed(1)} × {packages} = {second.toFixed(1)}</b></div><div style={{ '--amount': `${clamp(bias / Math.max(total, 1) * 100, 0, 100)}%` } as React.CSSProperties}><span>bias</span><b>+ {bias}</b></div></div>
  </LabShell>;
}

function ReluLab() {
  const [z, setZ] = useState(-3);
  const output = Math.max(0, z);
  const mapX = (value: number) => 374 + value * 52;
  const mapY = (value: number) => 228 - value * 34;
  return <LabShell title="Move through the ReLU gate" controls={<Slider label="Input z" value={z} min={-6} max={6} step={.1} onChange={setZ} />} metrics={<><Metric label="Input" value={z.toFixed(1)} /><Metric label="ReLU output" value={output.toFixed(1)} tone={z > 0 ? 'good' : ''} /><Metric label="Gate" value={z > 0 ? 'ON' : 'OFF'} tone={z > 0 ? 'good' : 'bad'} /></>}>
    <ChartFrame xLabel="input z" yLabel="ReLU(z)" label={`ReLU of ${z.toFixed(1)} is ${output.toFixed(1)}`}><path className="lab-series" d={`M${mapX(-6)},${mapY(0)} L${mapX(0)},${mapY(0)} L${mapX(6)},${mapY(6)}`} /><line className="lab-zero-axis" x1={mapX(0)} y1="18" x2={mapX(0)} y2="238" /><circle className="lab-point" cx={mapX(z)} cy={mapY(output)} r="9" /></ChartFrame>
  </LabShell>;
}

function HiddenLayerLab() {
  const [x, setX] = useState(3);
  const [v2, setV2] = useState(1);
  const z1 = x, z2 = -x;
  const h1 = Math.max(0, z1), h2 = Math.max(0, z2);
  const right = h1, left = v2 * h2, prediction = right + left;
  return <LabShell title="Hidden-layer forward-pass calculator" controls={<><Slider label="Input x" value={x} min={-5} max={5} step={.1} onChange={setX} /><Slider label="Left-side output weight v₂" value={v2} min={0} max={3} step={.1} onChange={setV2} /></>} metrics={<><Metric label="Hidden 1 · h₁" value={h1.toFixed(1)} tone={h1 > 0 ? 'good' : ''} /><Metric label="Hidden 2 · h₂" value={h2.toFixed(1)} tone={h2 > 0 ? 'good' : ''} /><Metric label="Prediction ŷ" value={prediction.toFixed(1)} tone="good" /></>}>
    <div className="hidden-live-flow" aria-live="polite">
      <article className={h1 > 0 ? 'active' : ''}><small>RIGHT-SIDE NEURON</small><span>z₁ = 1 × {x.toFixed(1)} = {z1.toFixed(1)}</span><strong>h₁ = ReLU({z1.toFixed(1)}) = {h1.toFixed(1)}</strong><b>1 × {h1.toFixed(1)} = {right.toFixed(1)}</b></article>
      <article className={h2 > 0 ? 'active' : ''}><small>LEFT-SIDE NEURON</small><span>z₂ = −1 × {x.toFixed(1)} = {z2.toFixed(1)}</span><strong>h₂ = ReLU({z2.toFixed(1)}) = {h2.toFixed(1)}</strong><b>{v2.toFixed(1)} × {h2.toFixed(1)} = {left.toFixed(1)}</b></article>
      <div><small>OUTPUT NEURON</small><span>{right.toFixed(1)} + {left.toFixed(1)}</span><strong>ŷ = {prediction.toFixed(1)}</strong></div>
    </div>
  </LabShell>;
}

function BackpropGateLab() {
  const [x, setX] = useState(2);
  const [target, setTarget] = useState(4);
  const w = 1, v = 1;
  const z = w * x, h = Math.max(0, z), prediction = v * h;
  const error = prediction - target, loss = error ** 2, blame = 2 * error;
  const gradV = blame * h, blameH = blame * v, gate = z > 0 ? 1 : 0;
  const blameZ = blameH * gate, gradW = blameZ * x;
  return <LabShell title="Backpropagation gate calculator" controls={<><Slider label="Input x" value={x} min={-4} max={4} step={.1} onChange={setX} /><Slider label="Target y" value={target} min={0} max={6} step={.5} onChange={setTarget} /></>} metrics={<><Metric label="Loss" value={loss.toFixed(2)} tone={loss < .1 ? 'good' : 'bad'} /><Metric label="ReLU gate" value={gate ? 'OPEN' : 'CLOSED'} tone={gate ? 'good' : 'bad'} /><Metric label="Gradient for v" value={gradV.toFixed(2)} /><Metric label="Gradient for w" value={gradW.toFixed(2)} tone={!gate && loss > 0 ? 'bad' : ''} /></>}>
    <div className="backprop-live-flow" aria-live="polite">
      <article><small>FORWARD</small><span>z = 1 × {x.toFixed(1)} = {z.toFixed(1)}</span><span>h = ReLU(z) = {h.toFixed(1)}</span><strong>ŷ = {prediction.toFixed(1)} · loss = {loss.toFixed(2)}</strong></article>
      <article><small>OUTPUT BLAME</small><span>2 × ({prediction.toFixed(1)} − {target.toFixed(1)})</span><strong>{blame.toFixed(1)}</strong><b>gradᵥ = {blame.toFixed(1)} × {h.toFixed(1)} = {gradV.toFixed(1)}</b></article>
      <article className={gate ? 'active' : 'blocked'}><small>THROUGH RELU</small><span>{blameH.toFixed(1)} × gate {gate}</span><strong>blame at z = {blameZ.toFixed(1)}</strong><b>grad w = {blameZ.toFixed(1)} × {x.toFixed(1)} = {gradW.toFixed(1)}</b></article>
    </div>
  </LabShell>;
}

function SigmoidBceLab() {
  const [logit, setLogit] = useState(0);
  const [target, setTarget] = useState<0 | 1>(1);
  const probability = 1 / (1 + Math.exp(-logit));
  const loss = -(target * Math.log(probability) + (1 - target) * Math.log(1 - probability));
  const curve = Array.from({ length: 101 }, (_, i) => 1 / (1 + Math.exp(-(-6 + i * .12))));
  const dotX = 58 + ((logit + 6) / 12) * 632, dotY = 22 + (1 - probability) * 208;
  return <LabShell title="Sigmoid + BCE probability lab" controls={<><Slider label="Raw score z" value={logit} min={-6} max={6} step={.1} onChange={setLogit} /><div className="lab-toggle" role="group" aria-label="Target class"><button className={target === 1 ? 'active' : ''} onClick={() => setTarget(1)}>Real · 1</button><button className={target === 0 ? 'active' : ''} onClick={() => setTarget(0)}>Fake · 0</button></div></>} metrics={<><Metric label="Probability real" value={`${(probability * 100).toFixed(1)}%`} /><Metric label="BCE loss" value={loss.toFixed(3)} tone={loss < .2 ? 'good' : loss > 2 ? 'bad' : ''} /></>}>
    <ChartFrame xLabel="raw score z" yLabel="probability" label={`Sigmoid probability ${(probability * 100).toFixed(1)} percent`}><path className="lab-series" d={pointsPath(curve, 0, 1)} /><line className="lab-reference" x1="58" y1="126" x2="690" y2="126" /><text className="lab-direct-label" x="680" y="117" textAnchor="end">decision = 0.5</text><circle className="lab-point" cx={dotX} cy={dotY} r="8" /></ChartFrame>
  </LabShell>;
}

function ClassifierLab() {
  const [weight, setWeight] = useState(.5);
  const [bias, setBias] = useState(0);
  const [input, setInput] = useState(1);
  const score = weight * input + bias;
  const probability = 1 / (1 + Math.exp(-score));
  const predicted = probability > .5 ? 1 : 0;
  const boundary = Math.abs(weight) < .001 ? null : -bias / weight;
  const xAt = (x: number) => 66 + ((x + 4) / 8) * 628;
  const yAt = (p: number) => 232 - p * 198;
  const path = Array.from({ length: 121 }, (_, index) => {
    const x = -4 + index / 15;
    const p = 1 / (1 + Math.exp(-(weight * x + bias)));
    return `${index ? 'L' : 'M'}${xAt(x).toFixed(1)},${yAt(p).toFixed(1)}`;
  }).join(' ');
  const setPreset = (w: number, b: number) => { setWeight(w); setBias(b); };
  return <LabShell title="Binary-classifier boundary lab" controls={<>
    <Slider label="Weight w" value={weight} min={-5} max={5} step={.1} onChange={setWeight} />
    <Slider label="Bias b" value={bias} min={-6} max={6} step={.1} onChange={setBias} />
    <Slider label="Test input x" value={input} min={-4} max={4} step={.1} onChange={setInput} />
    <div className="lab-toggle" role="group" aria-label="Classifier presets"><button onClick={() => setPreset(.5, 0)}>Start</button><button onClick={() => setPreset(2.36, 0)}>Trained</button><button onClick={() => setPreset(5, -5)}>Shifted</button></div>
  </>} metrics={<><Metric label="Raw score z" value={score.toFixed(2)} /><Metric label="p(class 1)" value={`${(probability * 100).toFixed(1)}%`} /><Metric label="Predicted class" value={String(predicted)} tone={predicted ? 'good' : ''} /><Metric label="0.5 boundary" value={boundary === null ? 'none' : `x = ${boundary.toFixed(2)}`} /></>}>
    <svg className="lab-chart classifier-lab-chart" viewBox="0 0 720 280" role="img" aria-label={`Classifier with weight ${weight.toFixed(1)}, bias ${bias.toFixed(1)}, boundary ${boundary === null ? 'undefined' : boundary.toFixed(2)}, and probability ${probability.toFixed(3)} at x ${input.toFixed(1)}`}>
      <rect className="lab-chart-frame" x="66" y="24" width="628" height="208" rx="8" />
      <line className="classifier-axis" x1="66" y1="232" x2="694" y2="232" /><line className="classifier-axis" x1={xAt(0)} y1="24" x2={xAt(0)} y2="232" />
      <line className="lab-reference" x1="66" y1={yAt(.5)} x2="694" y2={yAt(.5)} /><text className="lab-direct-label" x="687" y={yAt(.5)-8} textAnchor="end">p = 0.5</text>
      {boundary !== null && boundary >= -4 && boundary <= 4 && <><line className="classifier-boundary" x1={xAt(boundary)} y1="24" x2={xAt(boundary)} y2="232" /><text className="lab-direct-label" x={xAt(boundary)+8} y="44">boundary</text></>}
      {[-4,-3,-2,-1,0,1,2,3,4].map(tick => <text className="lab-tick" key={`cx-${tick}`} x={xAt(tick)} y="255" textAnchor="middle">{tick}</text>)}
      {[0,.5,1].map(tick => <text className="lab-tick" key={`cy-${tick}`} x="56" y={yAt(tick)+4} textAnchor="end">{tick.toFixed(1)}</text>)}
      <path className="lab-series" d={path} /><line className="classifier-input-guide" x1={xAt(input)} y1={yAt(probability)} x2={xAt(input)} y2="232" /><circle className="lab-point" cx={xAt(input)} cy={yAt(probability)} r="9" />
      <text className="lab-axis-label" x="380" y="276" textAnchor="middle">input x</text><text className="lab-axis-label" x="18" y="128" textAnchor="middle" transform="rotate(-90 18 128)">p(class 1)</text>
    </svg>
    <div className="lab-arithmetic" aria-live="polite"><span>z = {weight.toFixed(1)} × {input.toFixed(1)} + {bias.toFixed(1)} = <b>{score.toFixed(2)}</b></span><span>sigmoid({score.toFixed(2)}) = <b>{probability.toFixed(3)}</b></span><span>{probability.toFixed(3)} {probability > .5 ? '>' : '≤'} 0.5 → <b>class {predicted}</b></span></div>
  </LabShell>;
}

function AutogradLab() {
  const [weight, setWeight] = useState(1);
  const [input, setInput] = useState(2);
  const [target, setTarget] = useState(4);
  const prediction = weight * input;
  const error = prediction - target;
  const loss = error ** 2;
  const gradient = 2 * error * input;
  const nextWeight = weight - .1 * gradient;
  return <LabShell title="Autograd gradient calculator" controls={<>
    <Slider label="Learnable weight w" value={weight} min={-2} max={5} step={.1} onChange={setWeight} />
    <Slider label="Input x" value={input} min={-4} max={4} step={.1} onChange={setInput} />
    <Slider label="Target y" value={target} min={-4} max={8} step={.5} onChange={setTarget} />
  </>} metrics={<><Metric label="Prediction" value={prediction.toFixed(2)} /><Metric label="Loss" value={loss.toFixed(2)} tone={loss < .1 ? 'good' : 'bad'} /><Metric label="w.grad after backward()" value={gradient.toFixed(2)} /><Metric label="w after SGD · lr 0.1" value={nextWeight.toFixed(2)} /></>}>
    <div className="autograd-live-flow" aria-live="polite">
      <article><small>FORWARD</small><span>prediction = {weight.toFixed(1)} × {input.toFixed(1)}</span><strong>{prediction.toFixed(2)}</strong></article>
      <article><small>LOSS</small><span>({prediction.toFixed(2)} - {target.toFixed(1)})²</span><strong>{loss.toFixed(2)}</strong></article>
      <article className="backward"><small>loss.backward()</small><span>2 × {error.toFixed(2)} × {input.toFixed(1)}</span><strong>w.grad = {gradient.toFixed(2)}</strong></article>
      <article className="update"><small>optimizer.step()</small><span>{weight.toFixed(2)} - 0.1 × ({gradient.toFixed(2)})</span><strong>new w = {nextWeight.toFixed(2)}</strong></article>
    </div>
  </LabShell>;
}

function LabShell({ title, controls, metrics, children }: { title: string; controls: React.ReactNode; metrics: React.ReactNode; children: React.ReactNode }) {
  return <div className="interactive-lab"><div className="lab-top"><div><small>LIVE LAB</small><h2>{title}</h2></div><div className="lab-controls">{controls}</div></div><div className="lab-metrics" aria-live="polite">{metrics}</div><div className="lab-visual">{children}</div></div>;
}

export function InteractiveLab({ lab }: { lab: string }) {
  if (lab === 'step-size') return <StepSizeLab />;
  if (lab === 'descent') return <DescentLab />;
  if (lab === 'gradient') return <GradientLab />;
  if (lab === 'dual-parameter') return <DualParameterLab />;
  if (lab === 'multi-input') return <MultiInputLab />;
  if (lab === 'relu') return <ReluLab />;
  if (lab === 'hidden-layer') return <HiddenLayerLab />;
  if (lab === 'backprop-gate') return <BackpropGateLab />;
  if (lab === 'sigmoid-bce') return <SigmoidBceLab />;
  if (lab === 'classifier') return <ClassifierLab />;
  if (lab === 'autograd') return <AutogradLab />;
  return null;
}

export type { LabId };
