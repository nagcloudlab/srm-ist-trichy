import { useMemo, useState } from 'react';
import { Plot, type Pt } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

/* ---------- earth mover's distance vs JS ---------- */

type Mass = { x: number; m: number };

const REAL: Mass[] = [{ x: 1, m: 0.25 }, { x: 2, m: 0.5 }, { x: 3, m: 0.25 }];
const fakeAt = (theta: number): Mass[] => [{ x: theta, m: 0.5 }, { x: theta + 1, m: 0.5 }];

/** Optimal 1-D transport: match mass in sorted order. Returns W1 and the flows. */
function transport(real: Mass[], fake: Mass[]) {
  const r = real.map((p) => ({ ...p })).sort((a, b) => a.x - b.x);
  const f = fake.map((p) => ({ ...p })).sort((a, b) => a.x - b.x);
  const flows: { from: number; to: number; m: number }[] = [];
  let i = 0, j = 0, w = 0;
  while (i < r.length && j < f.length) {
    const m = Math.min(r[i].m, f[j].m);
    if (m > 1e-12) {
      flows.push({ from: f[j].x, to: r[i].x, m });
      w += m * Math.abs(f[j].x - r[i].x);
    }
    r[i].m -= m; f[j].m -= m;
    if (r[i].m <= 1e-12) i++;
    if (f[j].m <= 1e-12) j++;
  }
  return { w, flows };
}

/** Jensen–Shannon divergence (natural log) of two discrete distributions. */
function js(real: Mass[], fake: Mass[]) {
  const keys = new Map<number, { p: number; q: number }>();
  real.forEach(({ x, m }) => keys.set(x, { p: (keys.get(x)?.p ?? 0) + m, q: keys.get(x)?.q ?? 0 }));
  fake.forEach(({ x, m }) => keys.set(x, { p: keys.get(x)?.p ?? 0, q: (keys.get(x)?.q ?? 0) + m }));
  let d = 0;
  keys.forEach(({ p, q }) => {
    const mid = (p + q) / 2;
    if (p > 0) d += 0.5 * p * Math.log(p / mid);
    if (q > 0) d += 0.5 * q * Math.log(q / mid);
  });
  return d;
}

const THETAS = Array.from({ length: 25 }, (_, i) => -3 + i * 0.5);

export function EmdLab() {
  const [theta, setTheta] = useState(7);
  const [view, setView] = useState<'piles' | 'curves'>('piles');
  const fake = fakeAt(theta);
  const { w, flows } = transport(REAL, fake);
  const jsd = js(REAL, fake);
  const byDistance = new Map<number, number>();
  flows.forEach((fl) => { const d = Math.abs(fl.from - fl.to); if (d > 1e-9) byDistance.set(d, (byDistance.get(d) ?? 0) + fl.m); });
  const planText = [...byDistance].sort((a, b) => b[0] - a[0]).map(([d, m]) => `${m.toFixed(2)}×${d.toFixed(1)}`).join(' + ') || 'nothing to move';
  const curves = useMemo(() => ({
    w: THETAS.map((t) => [t, transport(REAL, fakeAt(t)).w] as Pt),
    js: THETAS.map((t) => [t, js(REAL, fakeAt(t))] as Pt),
  }), []);

  return (
    <Lab
      controls={<>
        <Slider label="Fake pile position θ" value={theta} min={-3} max={9} step={0.5} onChange={setTheta} format={(v) => v.toFixed(1)} tone="coral" />
        <Segmented label="View" options={[{ value: 'piles', label: 'Piles + plan' }, { value: 'curves', label: 'W vs JS' }]} value={view} onChange={setView} />
        <div className="lab-row">
          <LabButton onClick={() => setTheta(7)}>Far</LabButton>
          <LabButton onClick={() => setTheta(1.5)}>Close</LabButton>
          <LabButton onClick={() => setTheta(1)}>Overlap</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="W₁ (earth mover)" value={w.toFixed(3)} tone="blue" />
        <Metric label="JS divergence" value={jsd.toFixed(3)} tone="coral" />
        <Metric label="Plan · mass × distance" value={planText} />
        <Metric label="JS stuck at log 2 (0.693)?" value={Math.abs(jsd - Math.log(2)) < 1e-9 ? 'yes' : 'no'} tone={Math.abs(jsd - Math.log(2)) < 1e-9 ? 'coral' : 'mint'} />
      </>}
      foot={<>Real: ¼ · ½ · ¼ at x = 1, 2, 3. Fake: ½ · ½ at θ and θ + 1. W₁ uses the cheapest plan — in 1-D, match the piles in sorted order.</>}
    >
      {view === 'piles' ? (
        <Plot
          ariaLabel={`Real and fake piles with fake at ${theta}; W1 ${w.toFixed(2)}, JS ${jsd.toFixed(3)}`}
          x={[-3.5, 10.5]} y={[-0.75, 0.75]} xTicks={[-3, -1, 1, 3, 5, 7, 9]} yTicks={[-0.5, 0, 0.5]}
          xLabel="position x" yLabel="mass (real ↑ · fake ↓)" height={290}
        >
          {(sx, sy) => <>
            {REAL.map((p) => <rect key={`r${p.x}`} x={sx(p.x) - 14} y={sy(p.m)} width={28} height={sy(0) - sy(p.m)} rx={4} fill="#3157d5" opacity={0.85} />)}
            {fake.map((p) => <rect key={`f${p.x}`} x={sx(p.x) - 14} y={sy(0)} width={28} height={sy(-p.m) - sy(0)} rx={4} fill="#eb5a46" opacity={0.85} />)}
            {flows.map((fl, i) => {
              const x1 = sx(fl.from), x2 = sx(fl.to), y = sy(0);
              const lift = 22 + i * 16;
              const d = `M${x1},${y + 6} C${x1},${y + lift + 20} ${x2},${y + lift + 20} ${x2},${y + 6}`;
              return Math.abs(fl.from - fl.to) < 1e-9 ? null : <path key={i} d={d} fill="none" stroke="#111827" strokeWidth={1.5 + fl.m * 5} strokeDasharray="6 5" opacity={0.55} />;
            })}
            <line x1={sx(-3.5)} x2={sx(10.5)} y1={sy(0)} y2={sy(0)} stroke="rgba(17,24,39,.35)" strokeWidth={1.5} />
          </>}
        </Plot>
      ) : (
        <Plot
          ariaLabel="W1 and JS as the fake pile slides"
          x={[-3, 9]} y={[0, 6]} xTicks={[-3, -1, 1, 3, 5, 7, 9]} yTicks={[0, 1, 2, 3, 4, 5, 6]}
          xLabel="fake pile position θ" yLabel="distance" height={290}
          lines={[{ pts: curves.w, color: '#3157d5', label: 'W₁' }, { pts: curves.js, color: '#eb5a46', label: 'JS' }]}
          marks={[{ y: Math.log(2), label: 'log 2' }]}
          points={[{ at: [theta, w], color: '#3157d5' }, { at: [theta, jsd], color: '#eb5a46' }]}
        />
      )}
    </Lab>
  );
}

/* ---------- weight clipping caps the critic's slope ---------- */

const REAL_X = [0, 2];
const FAKE_X = [1, 5];
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function ClipLab() {
  const [mode, setMode] = useState<'clip' | 'free'>('clip');
  const [c, setC] = useState(0.5);
  const [w, setW] = useState(-0.3);
  const limit = mode === 'clip' ? c : 20;
  const wEff = Math.max(-limit, Math.min(limit, w));
  const f = (x: number) => wEff * x;
  const gap = mean(REAL_X.map(f)) - mean(FAKE_X.map(f));
  const yMax = Math.max(2, Math.abs(wEff) * 6);

  return (
    <Lab
      controls={<>
        <Segmented label="Critic constraint" options={[{ value: 'clip', label: 'Clip weights' }, { value: 'free', label: 'No clipping' }]} value={mode} onChange={(m) => { setMode(m); setW((v) => (m === 'clip' ? Math.max(-c, Math.min(c, v)) : v)); }} />
        {mode === 'clip' && <Slider label="Clip value c" value={c} min={0.01} max={2} step={0.01} onChange={(v) => { setC(v); setW((x) => Math.max(-v, Math.min(v, x))); }} format={(v) => v.toFixed(2)} tone="violet" />}
        <Slider label="Critic weight w" value={wEff} min={-limit} max={limit} step={mode === 'clip' ? 0.01 : 0.1} onChange={setW} format={(v) => v.toFixed(2)} />
        <div className="lab-row">
          <LabButton primary onClick={() => setW(-limit)}>Best critic</LabButton>
          <LabButton onClick={() => setW(0)}>w = 0</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="Slope K = |w|" value={Math.abs(wEff).toFixed(2)} tone="violet" />
        <Metric label="Gap E[C(real)] − E[C(fake)]" value={gap.toFixed(2)} tone="blue" />
        <Metric label="True W₁" value="2.00" />
        <Metric label="Gap ÷ K" value={Math.abs(wEff) > 1e-9 ? (gap / Math.abs(wEff)).toFixed(2) : '—'} tone={mode === 'clip' ? 'mint' : 'coral'} />
      </>}
      foot={mode === 'clip'
        ? <>Clipping caps the slope at c, so the best gap is 2c = K·W₁ — a scaled distance, still fine for gradients.</>
        : <>No limit: the gap is −2w and grows without bound. Without Lipschitz, “the best critic” has no finite answer.</>}
    >
      <Plot
        ariaLabel={`Linear critic with weight ${wEff.toFixed(2)}; gap ${gap.toFixed(2)}`}
        x={[-1, 6]} y={[-yMax, yMax]} xTicks={[0, 1, 2, 3, 4, 5]}
        xLabel="input x" yLabel="critic score C(x) = w·x" height={330}
        lines={[{ f, color: '#7353bd', label: 'C(x)' }]}
        points={[
          ...REAL_X.map((x) => ({ at: [x, f(x)] as Pt, color: '#3157d5', r: 8, label: 'real' })),
          ...FAKE_X.map((x) => ({ at: [x, f(x)] as Pt, color: '#eb5a46', r: 8, label: 'fake' })),
        ]}
      />
    </Lab>
  );
}
