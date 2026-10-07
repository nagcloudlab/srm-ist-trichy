import { useMemo, useState } from 'react';
import { mulberry32 } from '../components/art';
import { Lab, LabButton, Metric, Segmented } from './lab-kit';

/* ---------- a tiny "conditional generator": label picks the strokes, noise picks the style ---------- */

type Seg = [number, number, number, number];

// Strokes for all ten digits in a unit square (x right, y down).
const GLYPHS: Seg[][] = [
  [[.5, .18, .66, .26], [.66, .26, .72, .5], [.72, .5, .66, .74], [.66, .74, .5, .82], [.5, .82, .34, .74], [.34, .74, .28, .5], [.28, .5, .34, .26], [.34, .26, .5, .18]],
  [[.42, .3, .55, .18], [.55, .18, .55, .82]],
  [[.3, .3, .45, .2], [.45, .2, .62, .24], [.62, .24, .66, .4], [.66, .4, .3, .8], [.3, .8, .72, .8]],
  [[.3, .22, .66, .22], [.66, .22, .48, .48], [.48, .48, .68, .62], [.68, .62, .58, .8], [.58, .8, .3, .78]],
  [[.6, .82, .6, .18], [.6, .18, .28, .6], [.28, .6, .74, .6]],
  [[.68, .2, .36, .2], [.36, .2, .33, .47], [.33, .47, .55, .43], [.55, .43, .68, .55], [.68, .55, .66, .72], [.66, .72, .52, .82], [.52, .82, .32, .78]],
  [[.64, .2, .45, .3], [.45, .3, .34, .52], [.34, .52, .36, .72], [.36, .72, .5, .82], [.5, .82, .65, .72], [.65, .72, .64, .58], [.64, .58, .5, .5], [.5, .5, .36, .58]],
  [[.28, .22, .72, .22], [.72, .22, .44, .82]],
  [[.5, .2, .66, .3], [.66, .3, .34, .65], [.34, .65, .5, .8], [.5, .8, .66, .65], [.66, .65, .34, .3], [.34, .3, .5, .2]],
  [[.5, .2, .66, .3], [.66, .3, .66, .46], [.66, .46, .5, .55], [.5, .55, .34, .46], [.34, .46, .34, .3], [.34, .3, .5, .2], [.66, .42, .6, .82]],
];

const SIZE = 16;

/** Style comes only from the noise seed: slant, stroke thickness, size, small jitter. */
function styleFromNoise(seed: number) {
  const r = mulberry32(seed * 977 + 13);
  return { slant: (r() - .5) * .62, thick: .045 + r() * .075, scale: .74 + r() * .3, jitter: r() * .05, seed };
}

function segDist(px: number, py: number, [x1, y1, x2, y2]: Seg) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function renderDigit(label: number, noiseSeed: number) {
  const st = styleFromNoise(noiseSeed);
  const r = mulberry32(noiseSeed * 31 + label);
  const segs = GLYPHS[label].map((s) => {
    const pts = [s[0], s[1], s[2], s[3]].map((v) => v + (r() - .5) * st.jitter);
    const tf = (x: number, y: number): [number, number] => {
      const sx = .5 + (x - .5) * st.scale, sy = .5 + (y - .5) * st.scale;
      return [sx + st.slant * (.5 - sy), sy];
    };
    const [a, b] = tf(pts[0], pts[1]);
    const [c, d] = tf(pts[2], pts[3]);
    return [a, b, c, d] as Seg;
  });
  const out: number[] = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const d = Math.min(...segs.map((s) => segDist((col + .5) / SIZE, (row + .5) / SIZE, s)));
      out.push(Math.max(0, Math.min(1, (st.thick - d) / .04 + .5)));
    }
  }
  return out;
}

function Glyph({ values, px = 76, label }: { values: number[]; px?: number; label: string }) {
  return (
    <svg className="pixel-digit" viewBox={`0 0 ${SIZE} ${SIZE}`} width={px} height={px} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={SIZE} height={SIZE} fill="#111827" />
      {values.map((v, i) => v > .02 && <rect key={i} x={i % SIZE} y={Math.floor(i / SIZE)} width="1" height="1" fill="#f7f4ed" opacity={v} />)}
    </svg>
  );
}

const DIGITS = Array.from({ length: 10 }, (_, d) => ({ value: String(d), label: String(d) }));

/** Lab 1 — label controls WHAT, noise controls HOW. */
export function WhatHowLab() {
  const [label, setLabel] = useState('7');
  const [mode, setMode] = useState<'label' | 'noise'>('label');
  const [roll, setRoll] = useState(1);
  const y = Number(label);
  const noises = useMemo(() => Array.from({ length: 10 }, (_, i) => roll * 101 + i * 7), [roll]);
  const fixedNoise = noises[0];
  const cells = mode === 'label'
    ? noises.map((z, i) => ({ key: `n${i}`, values: renderDigit(y, z), caption: `z${i + 1}`, sub: `y = ${y}` }))
    : Array.from({ length: 10 }, (_, d) => ({ key: `d${d}`, values: renderDigit(d, fixedNoise), caption: `y = ${d}`, sub: 'z1' }));
  const st = styleFromNoise(mode === 'label' ? noises[0] : fixedNoise);
  return (
    <Lab
      controls={<>
        <Segmented label="Experiment" options={[{ value: 'label', label: 'Fix label · vary noise' }, { value: 'noise', label: 'Fix noise · vary label' }]} value={mode} onChange={setMode} />
        {mode === 'label' && <Segmented label="Label y" options={DIGITS} value={label} onChange={setLabel} />}
        <div className="lab-row"><LabButton primary onClick={() => setRoll((r) => r + 1)}>Re-roll noise</LabButton></div>
      </>}
      metrics={<>
        <Metric label="What changes" value={mode === 'label' ? 'style' : 'digit'} tone={mode === 'label' ? 'violet' : 'mint'} />
        <Metric label="What stays" value={mode === 'label' ? `digit ${y}` : 'style'} />
        <Metric label="z1 slant" value={st.slant.toFixed(2)} tone="blue" />
        <Metric label="z1 stroke" value={st.thick.toFixed(3)} tone="blue" />
      </>}
      foot={<>Illustration: a hand-made “generator” where the label picks the strokes and the noise picks slant, thickness and size — the split a trained cGAN learns.</>}
    >
      <div className="l10-grid">
        {cells.map((c) => (
          <figure key={c.key} className="l10-cell">
            <Glyph values={c.values} px={92} label={`Sample with ${c.sub}, ${c.caption}`} />
            <figcaption><b>{c.caption}</b>{c.sub}</figcaption>
          </figure>
        ))}
      </div>
    </Lab>
  );
}

/* ---------- Lab 2 — embedding = one-hot × W ---------- */

const W_SHOW = 5; // show 5 of the 50 embedding numbers
const W = (() => {
  const r = mulberry32(2014);
  return Array.from({ length: 10 }, () => Array.from({ length: W_SHOW }, () => Math.round((r() * 2 - 1) * 100) / 100));
})();

export function EmbeddingLab() {
  const [label, setLabel] = useState('7');
  const y = Number(label);
  return (
    <Lab
      controls={<Segmented label="Label y" options={DIGITS} value={label} onChange={setLabel} />}
      metrics={<>
        <Metric label="onehot(y) sum" value="1" />
        <Metric label="Rows kept" value={`1 of 10 (row ${y})`} tone="mint" />
        <Metric label="G input" value="64 + 50 = 114" tone="blue" />
        <Metric label="Table size" value="10 × 50 = 500" tone="violet" />
      </>}
      foot={<>W shows 5 of the 50 learned numbers per row (toy values). Multiplying by the one-hot keeps exactly one row — that is what nn.Embedding looks up.</>}
    >
      <div className="l10-emb">
        <div className="l10-onehot">
          <small>onehot(y)</small>
          <div>{Array.from({ length: 10 }, (_, i) => <span key={i} className={i === y ? 'on' : ''}>{i === y ? 1 : 0}</span>)}</div>
        </div>
        <span className="l10-op">×</span>
        <div className="l10-w">
          <small>W · 10 × 50</small>
          <table>
            <tbody>
              {W.map((row, i) => (
                <tr key={i} className={i === y ? 'on' : ''}>
                  <th>{i}</th>
                  {row.map((v, j) => <td key={j}>{v.toFixed(2)}</td>)}
                  <td className="l10-more">…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className="l10-op">=</span>
        <div className="l10-e">
          <small>e(y) · 50 numbers</small>
          <div>{W[y].map((v, j) => <span key={j}>{v.toFixed(2)}</span>)}<span>…</span></div>
        </div>
      </div>
      <div className="l10-concat" aria-label="Generator input: 64 noise numbers then 50 label numbers">
        <div className="l10-z" style={{ flex: 64 }}><b>z</b> · 64 noise numbers</div>
        <div className="l10-ey" style={{ flex: 50 }}><b>e({y})</b> · 50 label numbers</div>
      </div>
    </Lab>
  );
}

/* ---------- Lab 3 — label maps: 10 extra channels for D ---------- */

export function LabelMapLab() {
  const [label, setLabel] = useState('7');
  const y = Number(label);
  const img = useMemo(() => renderDigit(y, 5), [y]);
  return (
    <Lab
      controls={<Segmented label="Label y" options={DIGITS} value={label} onChange={setLabel} />}
      metrics={<>
        <Metric label="maps(y) shape" value="(1, 10, 28, 28)" />
        <Metric label="D input" value="(1, 11, 28, 28)" tone="blue" />
        <Metric label="Label numbers" value="7,840" tone="violet" />
        <Metric label="Image numbers" value="784" tone="mint" />
      </>}
      foot={<>Each label channel is one number spread over the whole 28 × 28 grid — every conv filter sees the label at every position.</>}
    >
      <div className="l10-maps">
        <figure className="l10-cell">
          <Glyph values={img} px={92} label={`Image channel: a ${y}`} />
          <figcaption><b>image</b>ch 0</figcaption>
        </figure>
        <span className="l10-op">+</span>
        <div className="l10-channels">
          {Array.from({ length: 10 }, (_, i) => (
            <figure key={i} className={`l10-ch ${i === y ? 'on' : ''}`}>
              <div aria-label={`Label channel ${i}: all ${i === y ? 'ones' : 'zeros'}`} />
              <figcaption>{i === y ? 'all 1s' : 'all 0s'}<b>y = {i}</b></figcaption>
            </figure>
          ))}
        </div>
        <span className="l10-op">=</span>
        <div className="l10-total"><strong>11</strong><span>channels</span></div>
      </div>
    </Lab>
  );
}
