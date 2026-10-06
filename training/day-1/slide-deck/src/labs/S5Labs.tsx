import { useEffect, useMemo, useState } from 'react';
import { digitGrid, mulberry32, PixelDigit } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

/* ---------- shared number grid ---------- */

const INK = '#111827', BLUE = '#3157d5', CORAL = '#eb5a46', MUTED = '#68707c', LINE = 'rgba(17,24,39,.18)';

/** Square grid of numbers. `hi` outlines a window; `dim` greys cells; `scale` sets the colour range. */
export function NumGrid({ values, cols, cell = 44, hi, dim, scale = 1, binary, label, fmt = (v: number) => String(v) }: {
  values: (number | null)[];
  cols: number;
  cell?: number;
  hi?: { r: number; c: number; size: number; color?: string };
  dim?: (i: number) => boolean;
  scale?: number;
  binary?: boolean;
  label?: string;
  fmt?: (v: number) => string;
}) {
  const rows = Math.ceil(values.length / cols);
  const W = cols * cell, H = rows * cell;
  return (
    <figure className="s5-grid">
      <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} width={W + 4} role="img" aria-label={label ?? 'number grid'}>
        {values.map((v, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const isDim = dim?.(i) || v === null;
          let fill = '#fff', text = INK;
          if (v !== null && !isDim) {
            if (binary) { fill = v ? BLUE : '#fff'; text = v ? '#fff' : '#9aa1ab'; }
            else if (v > 0) { const a = Math.min(1, v / scale); fill = `rgba(49,87,213,${0.12 + 0.6 * a})`; text = a > 0.6 ? '#fff' : INK; }
            else if (v < 0) { const a = Math.min(1, -v / scale); fill = `rgba(235,90,70,${0.12 + 0.6 * a})`; text = a > 0.6 ? '#fff' : INK; }
          }
          return (
            <g key={i}>
              <rect x={c * cell} y={r * cell} width={cell} height={cell} fill={isDim ? '#f3f1ec' : fill} stroke={LINE} strokeWidth="1" />
              {v !== null && !isDim && <text x={c * cell + cell / 2} y={r * cell + cell / 2 + cell * 0.13} textAnchor="middle" fontSize={cell * 0.38} fontWeight="700" fontFamily="var(--mono)" fill={text}>{fmt(v)}</text>}
            </g>
          );
        })}
        {hi && <rect x={hi.c * cell} y={hi.r * cell} width={hi.size * cell} height={hi.size * cell} fill="none" stroke={hi.color ?? CORAL} strokeWidth="4" rx="4" />}
      </svg>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  );
}

/* ---------- 1 · convolution lab ---------- */

// A 6×6 "7": top bar and a diagonal stroke (1 = ink).
const IMAGE = [
  0, 1, 1, 1, 1, 0,
  0, 0, 0, 0, 1, 0,
  0, 0, 0, 1, 0, 0,
  0, 0, 0, 1, 0, 0,
  0, 0, 1, 0, 0, 0,
  0, 0, 1, 0, 0, 0,
];
const KERNELS = {
  vertical: { name: 'Vertical edge', short: 'Vertical', k: [-1, 0, 1, -1, 0, 1, -1, 0, 1], hint: 'Positive where ink starts on the right, negative where it ends.' },
  horizontal: { name: 'Horizontal edge', short: 'Horizontal', k: [-1, -1, -1, 0, 0, 0, 1, 1, 1], hint: 'Responds to ink appearing below the window centre.' },
  blur: { name: 'Box blur (sum)', short: 'Blur', k: [1, 1, 1, 1, 1, 1, 1, 1, 1], hint: 'Counts ink in the 3×3 window — divide by 9 for the average.' },
  sharpen: { name: 'Sharpen', short: 'Sharpen', k: [0, -1, 0, -1, 5, -1, 0, -1, 0], hint: 'Boosts the centre pixel against its four neighbours.' },
} as const;
type KernelId = keyof typeof KERNELS;
const OUT = 4; // 6 − 3 + 1

function convAt(k: readonly number[], pos: number) {
  const r0 = Math.floor(pos / OUT), c0 = pos % OUT;
  const products: number[] = [];
  for (let m = 0; m < 3; m++) for (let n = 0; n < 3; n++) products.push(IMAGE[(r0 + m) * 6 + (c0 + n)] * k[m * 3 + n]);
  return { r0, c0, products, sum: products.reduce((a, b) => a + b, 0) };
}

export function ConvLab() {
  const [kid, setKid] = useState<KernelId>('vertical');
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const k = KERNELS[kid].k;
  const all = useMemo(() => Array.from({ length: OUT * OUT }, (_, p) => convAt(k, p).sum), [k]);
  const cur = convAt(k, pos);
  const maxAbs = Math.max(1, ...all.map(Math.abs));

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setPos((p) => {
      if (p >= OUT * OUT - 1) { setPlaying(false); return p; }
      return p + 1;
    }), 650);
    return () => window.clearInterval(t);
  }, [playing]);

  return (
    <Lab
      controls={<>
        <Segmented label="Filter" value={kid} onChange={(v) => { setKid(v); }} options={(Object.keys(KERNELS) as KernelId[]).map((id) => ({ value: id, label: KERNELS[id].short }))} />
        <Slider label="Window position" value={pos} min={0} max={OUT * OUT - 1} step={1} onChange={(v) => { setPlaying(false); setPos(v); }} format={(v) => `${v + 1} / 16`} />
        <div className="lab-row">
          <LabButton primary onClick={() => { if (pos >= OUT * OUT - 1) setPos(0); setPlaying((p) => !p); }}>{playing ? 'Pause' : 'Slide the filter'}</LabButton>
          <LabButton onClick={() => { setPlaying(false); setPos((p) => Math.min(OUT * OUT - 1, p + 1)); }}>Step</LabButton>
          <LabButton onClick={() => { setPlaying(false); setPos(0); }}>Reset</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="Window (row, col)" value={`(${cur.r0}, ${cur.c0})`} />
        <Metric label="Output value" value={String(cur.sum)} tone={cur.sum > 0 ? 'blue' : cur.sum < 0 ? 'coral' : 'plain'} />
        <Metric label="Output size" value="4 × 4" />
        <Metric label="Filter" value={KERNELS[kid].short} />
      </>}
      foot={KERNELS[kid].hint}
    >
      <div className="s5-conv-stage">
        <NumGrid values={IMAGE} cols={6} cell={40} binary hi={{ r: cur.r0, c: cur.c0, size: 3 }} label="input 6 × 6" />
        <span className="s5-op">×</span>
        <NumGrid values={[...k]} cols={3} cell={40} scale={5} label="filter 3 × 3" />
        <span className="s5-op">=</span>
        <NumGrid values={cur.products} cols={3} cell={40} scale={5} label={`products · sum = ${cur.sum}`} />
        <span className="s5-op">→</span>
        <NumGrid values={all} cols={4} cell={40} scale={maxAbs} dim={(i) => i > pos} hi={{ r: cur.r0, c: cur.c0, size: 1, color: INK }} label="output 4 × 4" />
      </div>
    </Lab>
  );
}

/* ---------- 2 · DCGAN shape tracer ---------- */

type Step = { layer: string; shape: string; spatial: number; channels: number; params: number; math?: string; note: string };

const G_STEPS: Step[] = [
  { layer: 'Noise z', shape: '[B, 100]', spatial: 0, channels: 100, params: 0, note: '100 random numbers per image' },
  { layer: 'Linear', shape: '[B, 12544]', spatial: 0, channels: 12544, params: 1266944, math: '256·7·7 = 12,544', note: 'project the noise into enough numbers to reshape' },
  { layer: 'Unflatten', shape: '[B, 256, 7, 7]', spatial: 7, channels: 256, params: 0, note: '256 feature maps, each 7 × 7' },
  { layer: 'ConvTranspose2d · BN · ReLU', shape: '[B, 128, 14, 14]', spatial: 14, channels: 128, params: 524416 + 256, math: '(7−1)·2 − 2 + 4 = 14', note: 'kernel 4 · stride 2 · padding 1 doubles the size' },
  { layer: 'ConvTranspose2d · Tanh', shape: '[B, 1, 28, 28]', spatial: 28, channels: 1, params: 2049, math: '(14−1)·2 − 2 + 4 = 28', note: 'one channel of pixels in [−1, 1]' },
];
const D_STEPS: Step[] = [
  { layer: 'Image', shape: '[B, 1, 28, 28]', spatial: 28, channels: 1, params: 0, note: 'real or fake, kept as a 2-D grid' },
  { layer: 'Conv2d · LeakyReLU', shape: '[B, 64, 14, 14]', spatial: 14, channels: 64, params: 1088, math: '(28−4+2)/2 + 1 = 14', note: 'no BatchNorm on D’s first layer' },
  { layer: 'Conv2d · BN · LeakyReLU', shape: '[B, 128, 7, 7]', spatial: 7, channels: 128, params: 131200 + 256, math: '(14−4+2)/2 + 1 = 7', note: 'stride 2 halves the size again' },
  { layer: 'Flatten', shape: '[B, 6272]', spatial: 0, channels: 6272, params: 0, math: '128·7·7 = 6,272', note: 'feature maps → one long vector' },
  { layer: 'Linear · Sigmoid', shape: '[B, 1]', spatial: 0, channels: 1, params: 6273, note: 'one probability: real or fake' },
];

function ShapeVisual({ step, accent }: { step: Step; accent: string }) {
  const box = 230;
  if (!step.spatial) {
    const h = Math.max(10, Math.min(box, Math.log10(step.channels + 1) * 55));
    return (
      <svg viewBox="0 0 300 260" className="s5-shape-svg" role="img" aria-label={`vector of ${step.channels} numbers`}>
        <rect x={135} y={(260 - h) / 2} width={30} height={h} rx="6" fill={accent} opacity=".85" />
        <text x={150} y={250} textAnchor="middle" fontSize="15" fontFamily="var(--mono)" fill={MUTED}>{step.channels.toLocaleString()} numbers</text>
      </svg>
    );
  }
  const size = 60 + (step.spatial / 28) * 150;
  const slabs = Math.min(8, Math.max(1, Math.round(Math.log2(step.channels)) ));
  const x0 = 40, y0 = 30;
  return (
    <svg viewBox="0 0 300 260" className="s5-shape-svg" role="img" aria-label={`${step.channels} feature maps of ${step.spatial} by ${step.spatial}`}>
      {Array.from({ length: slabs }, (_, i) => slabs - 1 - i).map((i) => (
        <rect key={i} x={x0 + i * 7} y={y0 + i * 5} width={size} height={size} rx="4" fill="#fff" stroke={accent} strokeWidth="1.5" opacity={i ? 0.55 : 1} />
      ))}
      {step.spatial <= 14 && Array.from({ length: step.spatial - 1 }, (_, i) => (
        <g key={i} stroke={accent} strokeOpacity=".35">
          <line x1={x0 + ((i + 1) * size) / step.spatial} y1={y0} x2={x0 + ((i + 1) * size) / step.spatial} y2={y0 + size} />
          <line y1={y0 + ((i + 1) * size) / step.spatial} x1={x0} y2={y0 + ((i + 1) * size) / step.spatial} x2={x0 + size} />
        </g>
      ))}
      <text x={x0 + size / 2} y={y0 + size / 2 + 7} textAnchor="middle" fontSize="20" fontWeight="750" fill={INK}>{step.spatial} × {step.spatial}</text>
      <text x={150} y={252} textAnchor="middle" fontSize="15" fontFamily="var(--mono)" fill={MUTED}>× {step.channels} channel{step.channels > 1 ? 's' : ''}</text>
    </svg>
  );
}

export function ShapeLab() {
  const [net, setNet] = useState<'G' | 'D'>('G');
  const [i, setI] = useState(0);
  const steps = net === 'G' ? G_STEPS : D_STEPS;
  const step = steps[Math.min(i, steps.length - 1)];
  const cumulative = steps.slice(0, i + 1).reduce((a, s) => a + s.params, 0);
  const accent = net === 'G' ? '#277a59' : CORAL;
  return (
    <Lab
      controls={<>
        <Segmented label="Network" value={net} onChange={(v) => { setNet(v); setI(0); }} options={[{ value: 'G', label: 'Generator' }, { value: 'D', label: 'Discriminator' }]} />
        <Slider label="Layer" value={i} min={0} max={steps.length - 1} step={1} onChange={setI} format={(v) => `${v + 1} / ${steps.length}`} tone={net === 'G' ? 'mint' : 'coral'} />
        <div className="lab-row">
          <LabButton onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>← Back</LabButton>
          <LabButton primary onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))} disabled={i === steps.length - 1}>Next layer →</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="Tensor shape" value={step.shape} tone={net === 'G' ? 'mint' : 'coral'} />
        <Metric label="This layer’s parameters" value={step.params.toLocaleString()} />
        <Metric label="Running total" value={cumulative.toLocaleString()} />
        <Metric label="Size math" value={step.math ?? '—'} />
      </>}
      foot={net === 'G' ? 'G total: 1,793,665 parameters — 71% sit in the first Linear projection.' : 'D total: 138,817 parameters — weight sharing keeps the conv layers small.'}
    >
      <div className="s5-shape-stage">
        <ol className="s5-shape-steps">
          {steps.map((s, k) => (
            <li key={s.layer} className={k === i ? 'on' : k < i ? 'done' : ''}>
              <button onClick={() => setI(k)}><span>{k + 1}</span><b>{s.layer}</b><code>{s.shape}</code></button>
            </li>
          ))}
        </ol>
        <div className="s5-shape-visual">
          <ShapeVisual step={step} accent={accent} />
          <p>{step.note}</p>
        </div>
      </div>
    </Lab>
  );
}

/* ---------- 3 · mode collapse lab ---------- */

const DIGITS = ['0', '1', '2', '3', '4', '7', '8'];
type Mode = 'healthy' | 'partial' | 'collapsed';

function samplesFor(mode: Mode) {
  const rand = mulberry32(mode === 'healthy' ? 11 : mode === 'partial' ? 23 : 37);
  return Array.from({ length: 24 }, (_, i) => {
    if (mode === 'collapsed') return { digit: '7', seed: 5, wobble: 0.012 * (i % 3) };
    if (mode === 'partial') return { digit: rand() < 0.5 ? '1' : '7', seed: 100 + i, wobble: 0.05 };
    return { digit: DIGITS[(i * 3) % DIGITS.length], seed: 100 + i, wobble: 0.05 };
  });
}

/** Mean pairwise pixel distance between samples — the same idea as lab-04's diversity score. */
function diversity(samples: { digit: string; seed: number; wobble: number }[]) {
  const grids = samples.map((s) => digitGrid(s.digit, 14, 0, 0, s.seed, s.wobble));
  let total = 0, n = 0;
  for (let a = 0; a < grids.length; a++) for (let b = a + 1; b < grids.length; b++) {
    let d = 0;
    for (let k = 0; k < grids[a].length; k++) d += (grids[a][k] - grids[b][k]) ** 2;
    total += Math.sqrt(d); n++;
  }
  return total / n;
}

export function CollapseLab() {
  const [mode, setMode] = useState<Mode>('healthy');
  const samples = useMemo(() => samplesFor(mode), [mode]);
  const score = useMemo(() => diversity(samples), [samples]);
  const healthy = useMemo(() => diversity(samplesFor('healthy')), []);
  const distinct = new Set(samples.map((s) => s.digit)).size;
  return (
    <Lab
      controls={<Segmented label="What G produces for 24 different noises" value={mode} onChange={setMode} options={[{ value: 'healthy', label: 'Healthy' }, { value: 'partial', label: 'Partial collapse' }, { value: 'collapsed', label: 'Full collapse' }]} />}
      metrics={<>
        <Metric label="Distinct digits" value={`${distinct} / ${DIGITS.length}`} tone={distinct >= 6 ? 'mint' : 'coral'} />
        <Metric label="Diversity score" value={score.toFixed(2)} tone={score > healthy * 0.7 ? 'mint' : 'coral'} />
        <Metric label="vs healthy" value={`${Math.round((score / healthy) * 100)}%`} />
        <Metric label="Fools D?" value={mode === 'healthy' ? 'often' : 'each sample can'} />
      </>}
      foot="Diversity = mean pixel distance between every pair of samples (higher = more variety). A collapsed G can have a low G loss: each sample alone may look real."
    >
      <div className="s5-collapse-grid">
        {samples.map((s, i) => <PixelDigit key={`${mode}-${i}`} digit={s.digit} seed={s.seed} wobble={s.wobble} size={14} px={64} label={`sample ${i + 1}: ${s.digit}`} />)}
      </div>
    </Lab>
  );
}
