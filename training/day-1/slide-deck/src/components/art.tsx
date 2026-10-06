import { useMemo, type CSSProperties } from 'react';

/* ---------- seeded randomness (deterministic visuals) ---------- */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sample from a uniform source (Box–Muller). */
export function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/* ---------- pixel digits ---------- */

type Seg = [number, number, number, number];

// Strokes in a unit square (x right, y down). Enough digits for the stories we tell.
const DIGITS: Record<string, Seg[]> = {
  '0': [[.35, .2, .65, .2], [.65, .2, .72, .5], [.72, .5, .65, .8], [.65, .8, .35, .8], [.35, .8, .28, .5], [.28, .5, .35, .2]],
  '1': [[.42, .3, .55, .18], [.55, .18, .55, .82]],
  '2': [[.3, .3, .45, .2], [.45, .2, .62, .24], [.62, .24, .66, .4], [.66, .4, .3, .8], [.3, .8, .72, .8]],
  '3': [[.3, .22, .66, .22], [.66, .22, .48, .48], [.48, .48, .68, .62], [.68, .62, .58, .8], [.58, .8, .3, .78]],
  '4': [[.6, .82, .6, .18], [.6, .18, .28, .6], [.28, .6, .74, .6]],
  '7': [[.28, .22, .72, .22], [.72, .22, .44, .82]],
  '8': [[.5, .2, .66, .3], [.66, .3, .34, .65], [.34, .65, .5, .8], [.5, .8, .66, .65], [.66, .65, .34, .3], [.34, .3, .5, .2]],
  '9': [[.5, .2, .66, .3], [.66, .3, .66, .46], [.66, .46, .5, .55], [.5, .55, .34, .46], [.34, .46, .34, .3], [.34, .3, .5, .2], [.66, .42, .6, .82]],
};

function segDist(px: number, py: number, [x1, y1, x2, y2]: Seg) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Intensity grid (0..1) for a digit, with optional noise mix and blur. */
export function digitGrid(digit: string, size: number, noise = 0, blur = 0, seed = 1, wobble = 0) {
  const segs = DIGITS[digit] ?? DIGITS['7'];
  const rand = mulberry32(seed);
  const jitter = segs.map((s) => s.map((v) => v + (rand() - .5) * wobble) as Seg);
  const grid: number[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const d = Math.min(...jitter.map((s) => segDist((c + .5) / size, (r + .5) / size, s)));
      grid.push(Math.max(0, Math.min(1, (0.085 - d) / 0.05 + .5)));
    }
  }
  let out = grid;
  if (blur > 0) {
    const passes = Math.round(blur * 3);
    for (let p = 0; p < passes; p++) {
      out = out.map((_, i) => {
        const r = Math.floor(i / size), c = i % size;
        let sum = 0, n = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && rr < size && cc >= 0 && cc < size) { sum += out[rr * size + cc]; n++; }
        }
        return sum / n;
      });
    }
    const max = Math.max(...out, .001);
    out = out.map((v) => Math.min(1, v / max * (1 - blur * .35)));
  }
  if (noise > 0) {
    const nrand = mulberry32(seed * 7919 + 3);
    out = out.map((v) => Math.max(0, Math.min(1, (1 - noise) * v + noise * nrand())));
  }
  return out;
}

export function PixelDigit({ digit = '7', size = 14, noise = 0, blur = 0, seed = 1, wobble = 0, px = 140, label, invert = false }: {
  digit?: string; size?: number; noise?: number; blur?: number; seed?: number; wobble?: number; px?: number; label?: string; invert?: boolean;
}) {
  const grid = useMemo(() => digitGrid(digit, size, noise, blur, seed, wobble), [digit, size, noise, blur, seed, wobble]);
  return (
    <svg className="pixel-digit" viewBox={`0 0 ${size} ${size}`} width={px} height={px} role="img" aria-label={label ?? `Pixel image of the digit ${digit}`} shapeRendering="crispEdges">
      <rect width={size} height={size} fill={invert ? '#f7f4ed' : '#111827'} />
      {grid.map((v, i) => v > 0.02 && (
        <rect key={i} x={i % size} y={Math.floor(i / size)} width="1" height="1" fill={invert ? '#111827' : '#f7f4ed'} opacity={v} />
      ))}
    </svg>
  );
}

/* ---------- the two characters ---------- */

/** Generator / Discriminator mark in the phase-0 style: a tinted disc with a serif letter. */
export function Player({ who, size = 120, mood = 'neutral', label = true }: { who: 'G' | 'D'; size?: number; mood?: 'neutral' | 'happy' | 'unsure'; label?: boolean }) {
  const g = who === 'G';
  return (
    <figure className={`player player-${who}`} style={{ width: size, '--size': `${size}px` } as CSSProperties} data-mood={mood} aria-label={g ? 'Generator' : 'Discriminator'}>
      <div className="player-disc">{who}</div>
      {label && <figcaption>{g ? 'Generator' : 'Discriminator'}<strong>{g ? 'creates fakes' : 'judges real vs fake'}</strong></figcaption>}
    </figure>
  );
}

/* ---------- small chart helpers ---------- */

export type Pt = [number, number];

/** Map data → SVG coordinates inside a plot box. */
export function scale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain, [r0, r1] = range;
  return (v: number) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);
}

export function pathOf(points: Pt[], sx: (v: number) => number, sy: (v: number) => number) {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
}

/**
 * A responsive line plot with numeric axes, clipped plotting area and direct labels.
 * Lines are functions sampled over the x-domain or explicit point lists.
 */
export function Plot({ x, y, lines = [], points = [], marks = [], xLabel, yLabel, height = 300, xTicks, yTicks, ariaLabel, children }: {
  x: [number, number];
  y: [number, number];
  lines?: { f?: (v: number) => number; pts?: Pt[]; color: string; label?: string; dash?: boolean; width?: number }[];
  points?: { at: Pt; color: string; r?: number; label?: string }[];
  marks?: { x?: number; y?: number; label?: string }[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  xTicks?: number[];
  yTicks?: number[];
  ariaLabel: string;
  children?: (sx: (v: number) => number, sy: (v: number) => number) => React.ReactNode;
}) {
  const W = 760, H = height, L = 58, R = 130, Tp = 16, B = 44;
  const sx = scale(x, [L, W - R]);
  const sy = scale(y, [H - B, Tp]);
  const ticksX = xTicks ?? niceTicks(x);
  const ticksY = yTicks ?? niceTicks(y);
  const clipId = useMemo(() => `clip-${Math.random().toString(36).slice(2)}`, []);
  return (
    <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      <defs><clipPath id={clipId}><rect x={L} y={Tp} width={W - L - R} height={H - Tp - B} /></clipPath></defs>
      <rect className="plot-bg" x={L} y={Tp} width={W - L - R} height={H - Tp - B} rx="6" />
      {ticksY.map((t) => <g key={`y${t}`}><line className="plot-grid" x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} /><text className="plot-tick" x={L - 8} y={sy(t)} textAnchor="end" dominantBaseline="middle">{fmt(t)}</text></g>)}
      {ticksX.map((t) => <g key={`x${t}`}><line className="plot-grid" y1={Tp} y2={H - B} x1={sx(t)} x2={sx(t)} /><text className="plot-tick" x={sx(t)} y={H - B + 18} textAnchor="middle">{fmt(t)}</text></g>)}
      {x[0] < 0 && x[1] > 0 && <line className="plot-axis" x1={sx(0)} x2={sx(0)} y1={Tp} y2={H - B} />}
      {y[0] < 0 && y[1] > 0 && <line className="plot-axis" x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} />}
      <g clipPath={`url(#${clipId})`}>
        {marks.map((m, i) => m.x !== undefined
          ? <line key={i} className="plot-mark" x1={sx(m.x)} x2={sx(m.x)} y1={Tp} y2={H - B} />
          : <line key={i} className="plot-mark" x1={L} x2={W - R} y1={sy(m.y!)} y2={sy(m.y!)} />)}
        {lines.map((ln, i) => {
          const pts: Pt[] = ln.pts ?? Array.from({ length: 241 }, (_, k) => { const v = x[0] + (k / 240) * (x[1] - x[0]); return [v, ln.f!(v)] as Pt; });
          return <path key={i} d={pathOf(pts, sx, sy)} fill="none" stroke={ln.color} strokeWidth={ln.width ?? 3.5} strokeDasharray={ln.dash ? '7 6' : undefined} strokeLinejoin="round" strokeLinecap="round" />;
        })}
        {children?.(sx, sy)}
        {points.map((p, i) => <circle key={i} cx={sx(p.at[0])} cy={sy(p.at[1])} r={p.r ?? 7} fill={p.color} stroke="#fff" strokeWidth="2.5" />)}
      </g>
      {marks.filter((m) => m.label).map((m, i) => m.x !== undefined
        ? <text key={i} className="plot-mark-label" x={sx(m.x) + 6} y={Tp + 14}>{m.label}</text>
        : <text key={i} className="plot-mark-label" x={W - R + 8} y={sy(m.y!)} dominantBaseline="middle">{m.label}</text>)}
      {lines.filter((ln) => ln.label).map((ln, i) => {
        const end: Pt = ln.pts ? ln.pts[ln.pts.length - 1] : [x[1], ln.f!(x[1])];
        const yy = Math.max(Tp + 8, Math.min(H - B - 4, sy(end[1])));
        return <text key={i} className="plot-line-label" x={W - R + 10} y={yy} dominantBaseline="middle" fill={ln.color}>{ln.label}</text>;
      })}
      {points.filter((p) => p.label).map((p, i) => <text key={i} className="plot-point-label" x={sx(p.at[0]) + 11} y={sy(p.at[1]) - 11}>{p.label}</text>)}
      {xLabel && <text className="plot-axis-label" x={(L + W - R) / 2} y={H - 6} textAnchor="middle">{xLabel}</text>}
      {yLabel && <text className="plot-axis-label" x={14} y={(Tp + H - B) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(Tp + H - B) / 2})`}>{yLabel}</text>}
    </svg>
  );
}

function fmt(v: number) {
  return Math.abs(v) >= 1000 ? `${v / 1000}k` : String(Number(v.toFixed(2)));
}

export function niceTicks([a, b]: [number, number], count = 5) {
  const span = b - a;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count + 1) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
}
