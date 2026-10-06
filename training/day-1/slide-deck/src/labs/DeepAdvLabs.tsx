import { useMemo, useState } from 'react';
import { gaussian, mulberry32, Plot, type Pt } from '../components/art';
import { Lab, Metric, Segmented, Slider } from './lab-kit';

/* ---------- 1 · initialization: signal scale through a deep ReLU MLP ---------- */

type Init = 'small' | 'xavier' | 'he' | 'large';
const WIDTH = 64;
const BATCH = 48;
const MAX_DEPTH = 20;
const INIT_STD: Record<Init, number> = {
  small: 0.01,
  xavier: Math.sqrt(2 / (WIDTH + WIDTH)), // 0.125
  he: Math.sqrt(2 / WIDTH), // 0.177
  large: 1,
};
const INIT_LABEL: Record<Init, string> = { small: 'std 0.01', xavier: 'Xavier', he: 'He', large: 'std 1' };

/** RMS of the pre-activations z at every layer of a width-64 ReLU MLP (seeded, so it is repeatable). */
function simulate(init: Init): number[] {
  const rand = mulberry32(7);
  const std = INIT_STD[init];
  let h: Float64Array[] = Array.from({ length: BATCH }, () => Float64Array.from({ length: WIDTH }, () => gaussian(rand)));
  const rms: number[] = [];
  for (let layer = 0; layer < MAX_DEPTH; layer++) {
    const W = Array.from({ length: WIDTH }, () => Float64Array.from({ length: WIDTH }, () => gaussian(rand) * std));
    let sq = 0;
    const next: Float64Array[] = [];
    for (const x of h) {
      const z = new Float64Array(WIDTH);
      for (let i = 0; i < WIDTH; i++) {
        let s = 0;
        const row = W[i];
        for (let j = 0; j < WIDTH; j++) s += row[j] * x[j];
        z[i] = s;
        sq += s * s;
      }
      next.push(z.map((v) => (v > 0 ? v : 0)));
    }
    rms.push(Math.sqrt(sq / (BATCH * WIDTH)));
    h = next;
  }
  return rms;
}

const fmtSci = (v: number) => (v === 0 ? '0' : v >= 0.01 && v < 1000 ? v.toFixed(v < 1 ? 3 : 1) : v.toExponential(1));

export function InitLab() {
  const [init, setInit] = useState<Init>('large');
  const [depth, setDepth] = useState(10);
  const all = useMemo(() => ({ small: simulate('small'), xavier: simulate('xavier'), he: simulate('he'), large: simulate('large') }), []);
  const rms = all[init].slice(0, depth);
  const last = rms[rms.length - 1];
  const perLayer = Math.pow(last / rms[0], 1 / Math.max(1, depth - 1));
  const verdict = last < 1e-3 ? 'vanishing' : last > 1e3 ? 'exploding' : 'stable';
  const clampLog = (v: number) => Math.max(-20, Math.min(20, Math.log10(Math.max(v, 1e-30))));
  const pts: Pt[] = rms.map((v, i) => [i + 1, clampLog(v)]);
  return (
    <Lab
      controls={<>
        <Segmented label="Weight init (width 64)" options={(['small', 'xavier', 'he', 'large'] as Init[]).map((v) => ({ value: v, label: INIT_LABEL[v] }))} value={init} onChange={setInit} />
        <Slider label="Depth (layers)" value={depth} min={2} max={MAX_DEPTH} step={1} onChange={setDepth} format={(v) => String(v)} />
      </>}
      metrics={<>
        <Metric label="Init std" value={INIT_STD[init].toFixed(3)} />
        <Metric label={`Scale at layer ${depth}`} value={fmtSci(last)} tone={verdict === 'stable' ? 'mint' : 'coral'} />
        <Metric label="× per layer" value={perLayer.toFixed(3)} />
        <Metric label="Verdict" value={verdict} tone={verdict === 'stable' ? 'mint' : 'coral'} />
      </>}
      foot="Random inputs, ReLU after every layer. Scale = RMS of the pre-activations. He keeps it near 1; Xavier (made for tanh) shrinks by ≈ 1/√2 per ReLU layer."
    >
      <Plot
        ariaLabel={`Activation scale per layer with ${INIT_LABEL[init]} initialization`}
        x={[1, MAX_DEPTH]} y={[-20, 20]} xTicks={[1, 5, 10, 15, 20]} yTicks={[-20, -10, 0, 10, 20]}
        xLabel="layer" yLabel="log₁₀(activation scale)" height={330}
        marks={[{ y: 0, label: 'scale = 1' }]}
        lines={[{ pts, color: verdict === 'stable' ? '#277a59' : '#eb5a46', label: INIT_LABEL[init] }]}
        points={pts.length ? [{ at: pts[pts.length - 1], color: verdict === 'stable' ? '#277a59' : '#eb5a46' }] : []}
      />
    </Lab>
  );
}

/* ---------- 2 · normalization: which elements share one mean and variance ---------- */

type Norm = 'batch' | 'layer' | 'instance' | 'group';
const N = 4, C = 6, HW = 4, GROUPS = 2;
const NORM_LABEL: Record<Norm, string> = { batch: 'BatchNorm', layer: 'LayerNorm', instance: 'InstanceNorm', group: 'GroupNorm (G = 2)' };

function shares(norm: Norm, a: { n: number; c: number }, b: { n: number; c: number }) {
  if (norm === 'batch') return a.c === b.c;
  if (norm === 'layer') return a.n === b.n;
  if (norm === 'instance') return a.n === b.n && a.c === b.c;
  return a.n === b.n && Math.floor(a.c / (C / GROUPS)) === Math.floor(b.c / (C / GROUPS));
}

export function NormLab() {
  const [norm, setNorm] = useState<Norm>('batch');
  const [anchor, setAnchor] = useState({ n: 1, c: 2 });
  const count = { batch: N * HW, layer: C * HW, instance: HW, group: (C / GROUPS) * HW }[norm];
  const cell = 26, gap = 4, block = cell * 2 + gap, bgap = 14;
  const W = 70 + C * (block + bgap), H = 40 + N * (block + 16);
  return (
    <Lab
      controls={<>
        <Segmented label="Normalization" options={(['batch', 'layer', 'instance', 'group'] as Norm[]).map((v) => ({ value: v, label: NORM_LABEL[v].split(' ')[0] }))} value={norm} onChange={setNorm} />
        <p className="adv-hint">Click any block to move the anchor.</p>
      </>}
      metrics={<>
        <Metric label="Elements per mean / var" value={String(count)} tone="blue" />
        <Metric label="Depends on batch size?" value={norm === 'batch' ? 'yes' : 'no'} tone={norm === 'batch' ? 'coral' : 'mint'} />
        <Metric label="Statistics computed" value={String({ batch: C, layer: N, instance: N * C, group: N * GROUPS }[norm])} />
        <Metric label="Typical home" value={{ batch: 'DCGAN, CNNs', layer: 'Transformers, WGAN-GP critic', instance: 'Style transfer, CycleGAN', group: 'Small batches' }[norm]} />
      </>}
      foot="Tensor N × C × (H·W) = 4 samples × 6 channels × 4 pixels. Highlighted cells share one mean and one variance with the anchor."
    >
      <svg className="adv-norm-grid" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${NORM_LABEL[norm]}: highlighted cells share statistics with sample ${anchor.n + 1}, channel ${anchor.c + 1}`}>
        {Array.from({ length: C }, (_, c) => <text key={`c${c}`} className="adv-axis" x={70 + c * (block + bgap) + block / 2} y={18} textAnchor="middle">C{c + 1}</text>)}
        {Array.from({ length: N }, (_, n) => (
          <g key={n}>
            <text className="adv-axis" x={30} y={40 + n * (block + 16) + block / 2 + 4} textAnchor="middle">N{n + 1}</text>
            {Array.from({ length: C }, (_, c) => {
              const on = shares(norm, anchor, { n, c });
              const isAnchor = anchor.n === n && anchor.c === c;
              const x0 = 70 + c * (block + bgap), y0 = 30 + n * (block + 16);
              return (
                <g key={c} className="adv-block" onClick={() => setAnchor({ n, c })}>
                  {Array.from({ length: HW }, (_, k) => (
                    <rect key={k} x={x0 + (k % 2) * (cell + gap)} y={y0 + Math.floor(k / 2) * (cell + gap)} width={cell} height={cell} rx={5}
                      className={on ? 'adv-cell on' : 'adv-cell'} />
                  ))}
                  {isAnchor && <rect x={x0 - 4} y={y0 - 4} width={block + 8} height={block + 8} rx={8} className="adv-anchor" />}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </Lab>
  );
}
