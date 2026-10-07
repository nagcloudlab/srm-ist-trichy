import { useMemo, useState } from 'react';
import { digitGrid, gaussian, mulberry32, Plot, type Pt } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

const D = 64;
const TYPICAL = Math.sqrt(D); // ≈ 8: where Gaussian z lives in 64-D

const norm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

function randomZ(rand: () => number) {
  return Array.from({ length: D }, () => gaussian(rand));
}

function lerp(a: number[], b: number[], t: number) {
  return a.map((x, i) => (1 - t) * x + t * b[i]);
}

function slerp(a: number[], b: number[], t: number) {
  const omega = Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (norm(a) * norm(b)))));
  const s = Math.sin(omega);
  if (s < 1e-6) return lerp(a, b, t);
  const wa = Math.sin((1 - t) * omega) / s;
  const wb = Math.sin(t * omega) / s;
  return a.map((x, i) => wa * x + wb * b[i]);
}

/** Draw a 14×14 intensity grid (same look as PixelDigit). */
function Grid({ values, px, label }: { values: number[]; px: number; label: string }) {
  return (
    <svg className="pixel-digit" viewBox="0 0 14 14" width={px} height={px} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width="14" height="14" fill="#111827" />
      {values.map((v, i) => v > 0.02 && <rect key={i} x={i % 14} y={Math.floor(i / 14)} width="1" height="1" fill="#f7f4ed" opacity={v} />)}
    </svg>
  );
}

/**
 * Toy generator (illustrative): the shape follows how far along the path we are,
 * the sharpness follows ‖z‖ — like a G that only ever saw ‖z‖ ≈ 8 in training.
 */
function toyImage(shapeMix: number, zNorm: number, seed: number) {
  const a = digitGrid('3', 14, 0, 0, seed);
  const b = digitGrid('8', 14, 0, 0, seed + 1);
  const offShell = Math.min(1, Math.abs(1 - zNorm / TYPICAL) * 2.4); // 0 on the shell, 1 when far off
  const mixed = a.map((v, i) => (1 - shapeMix) * v + shapeMix * b[i]);
  // wash out: pull contrast toward a grey mean as z leaves the typical shell
  const mean = mixed.reduce((s, v) => s + v, 0) / mixed.length;
  return mixed.map((v) => Math.max(0, Math.min(1, (1 - offShell) * v + offShell * (0.55 * mean + 0.25 * v))));
}

export function InterpLab() {
  const [seed, setSeed] = useState(11);
  const [t, setT] = useState(0.5);
  const [method, setMethod] = useState<'lerp' | 'slerp'>('lerp');

  const { z1, z2, omega } = useMemo(() => {
    const rand = mulberry32(seed * 977 + 5);
    const a = randomZ(rand);
    const b = randomZ(rand);
    return { z1: a, z2: b, omega: Math.acos(dot(a, b) / (norm(a) * norm(b))) };
  }, [seed]);

  const curve = (fn: typeof lerp): Pt[] => Array.from({ length: 41 }, (_, i) => [i / 40, norm(fn(z1, z2, i / 40))] as Pt);
  const lerpCurve = useMemo(() => curve(lerp), [z1, z2]);
  const slerpCurve = useMemo(() => curve(slerp), [z1, z2]);
  const nowL = norm(lerp(z1, z2, t));
  const nowS = norm(slerp(z1, z2, t));
  const fn = method === 'lerp' ? lerp : slerp;
  const frames = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];

  return (
    <Lab
      controls={<>
        <Segmented label="Path" options={[{ value: 'lerp', label: 'Lerp (straight)' }, { value: 'slerp', label: 'Slerp (arc)' }]} value={method} onChange={setMethod} />
        <Slider label="Position t" value={t} min={0} max={1} step={0.05} onChange={setT} format={(v) => v.toFixed(2)} />
        <div className="lab-row lab-seed"><small>z pair #{seed - 10}</small><LabButton onClick={() => setSeed((s) => s + 1)}>New pair</LabButton></div>
      </>}
      metrics={<>
        <Metric label="‖z‖ lerp" value={nowL.toFixed(2)} tone={nowL < TYPICAL * 0.85 ? 'coral' : 'mint'} />
        <Metric label="‖z‖ slerp" value={nowS.toFixed(2)} tone="mint" />
        <Metric label="Angle Ω" value={`${(omega * 180 / Math.PI).toFixed(1)}°`} />
        <Metric label="Typical ‖z‖ (√64)" value={TYPICAL.toFixed(2)} />
      </>}
      foot={<>Norms are exact for two seeded 64-D Gaussian vectors. The images come from a toy generator (illustrative): shape follows t, sharpness follows ‖z‖.</>}
    >
      <Plot
        ariaLabel={`Length of z along the path: lerp ${nowL.toFixed(2)}, slerp ${nowS.toFixed(2)} at t = ${t.toFixed(2)}`}
        x={[0, 1]} y={[4, 9]} xTicks={[0, 0.25, 0.5, 0.75, 1]} yTicks={[4, 5, 6, 7, 8, 9]}
        xLabel="position t" yLabel="‖z(t)‖" height={230}
        marks={[{ y: TYPICAL, label: '≈ 8 typical' }, { x: t }]}
        lines={[
          { pts: lerpCurve, color: '#eb5a46', width: method === 'lerp' ? 4 : 2.5 },
          { pts: slerpCurve, color: '#277a59', width: method === 'slerp' ? 4 : 2.5 },
        ]}
        points={[{ at: [t, nowL], color: '#eb5a46', r: 6 }, { at: [t, nowS], color: '#277a59', r: 6 }]}
      />
      <div className="l11-legend"><span className="l11-key lerp">lerp · straight chord</span><span className="l11-key slerp">slerp · arc</span><span>frames below: {method}</span></div>
      <div className="l11-strip" aria-label={`${method} frames from 3 to 8`}>
        {frames.map((f) => {
          const z = fn(z1, z2, f);
          const active = Math.abs(f - t) < 0.09;
          return (
            <figure key={f} className={active ? 'l11-frame on' : 'l11-frame'}>
              <Grid values={toyImage(f, norm(z), 3)} px={64} label={`t = ${f.toFixed(2)}, ‖z‖ = ${norm(z).toFixed(1)}`} />
              <figcaption>{f.toFixed(2)}</figcaption>
            </figure>
          );
        })}
      </div>
    </Lab>
  );
}

/** Standard normal CDF via erf approximation (Abramowitz–Stegun 7.1.26). */
function phiCdf(x: number) {
  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const k = 1 / (1 + 0.3275911 * ax);
  const y = 1 - (((((1.061405429 * k - 1.453152027) * k) + 1.421413741) * k - 0.284496736) * k + 0.254829592) * k * Math.exp(-ax * ax);
  return 0.5 * (1 + s * y);
}

function truncStdTheory(t: number) {
  const pdf = Math.exp(-t * t / 2) / Math.sqrt(2 * Math.PI);
  const mass = 2 * phiCdf(t) - 1;
  return Math.sqrt(1 - (2 * t * pdf) / mass);
}

const N_SAMPLES = 8;

export function TruncLab() {
  const [t, setT] = useState(1);
  const [mode, setMode] = useState<'resample' | 'clamp'>('resample');
  const [seed, setSeed] = useState(4);

  const result = useMemo(() => {
    const rand = mulberry32(seed * 131 + 7);
    let outside = 0;
    let pinned = 0;
    let total = 0;
    const zs: number[][] = [];
    for (let n = 0; n < N_SAMPLES; n++) {
      const z = randomZ(rand).map((v) => {
        total++;
        if (Math.abs(v) <= t) return v;
        outside++;
        if (mode === 'clamp') { pinned++; return Math.sign(v) * t; }
        let r = gaussian(rand);
        while (Math.abs(r) > t) r = gaussian(rand);
        return r;
      });
      zs.push(z);
    }
    const all = zs.flat();
    const mean = all.reduce((s, v) => s + v, 0) / all.length;
    const std = Math.sqrt(all.reduce((s, v) => s + (v - mean) ** 2, 0) / all.length);
    // toy image: a 7 whose wobble comes from the first z entries — bigger spread, more varied 7s
    // toy G: stroke wobble grows with this sample's z spread; an extreme entry (|z| > 2.5) adds artefacts
    const images = zs.map((z, i) => {
      const spread = Math.sqrt(z.slice(0, 16).reduce((s, v) => s + v * v, 0) / 16);
      const odd = z.some((v) => Math.abs(v) > 2.5) ? 0.22 : 0;
      return digitGrid('7', 14, odd, 0, 100 + i, 0.24 * spread);
    });
    const variety = images.reduce((acc, img, i) => acc + images.slice(i + 1).reduce((s, other) => s + Math.hypot(...img.map((v, k) => v - other[k])), 0), 0) / ((N_SAMPLES * (N_SAMPLES - 1)) / 2);
    return { outside: outside / total, pinned: pinned / total, std, images, variety };
  }, [t, mode, seed]);

  const theoryOut = 2 * (1 - phiCdf(t));
  return (
    <Lab
      controls={<>
        <Segmented label="Method" options={[{ value: 'resample', label: 'Resample (BigGAN)' }, { value: 'clamp', label: 'Clamp (shortcut)' }]} value={mode} onChange={setMode} />
        <Slider label="Threshold t" value={t} min={0.3} max={3} step={0.1} onChange={setT} format={(v) => v.toFixed(1)} tone="violet" />
        <div className="lab-row lab-seed"><small>8 samples · 64 entries each</small><LabButton onClick={() => setSeed((s) => s + 1)}>Resample</LabButton></div>
      </>}
      metrics={<>
        <Metric label="Outside t · theory" value={`${(theoryOut * 100).toFixed(1)}%`} />
        <Metric label="Outside t · this draw" value={`${(result.outside * 100).toFixed(1)}%`} tone="violet" />
        <Metric label={mode === 'clamp' ? 'Std · clamped' : 'Std · theory'} value={mode === 'clamp' ? result.std.toFixed(2) : truncStdTheory(t).toFixed(2)} />
        <Metric label={mode === 'clamp' ? 'Pinned at ±t' : 'Std · this draw'} value={mode === 'clamp' ? `${(result.pinned * 100).toFixed(1)}%` : result.std.toFixed(2)} tone={mode === 'clamp' ? 'coral' : 'mint'} />
      </>}
      foot={<>z statistics are exact for this draw. The 7s come from a toy generator (illustrative): a wider z spread gives more varied strokes. Variety score {result.variety.toFixed(2)}.</>}
    >
      <div className="l11-trunc-grid" aria-label={`8 toy samples at t = ${t.toFixed(1)}`}>
        {result.images.map((img, i) => <Grid key={i} values={img} px={92} label={`sample ${i + 1}`} />)}
      </div>
      <div className="l11-trunc-scale"><span>t small · typical, alike</span><b style={{ width: `${(t - 0.3) / 2.7 * 100}%` }} /><span>t large · varied, some odd</span></div>
    </Lab>
  );
}
