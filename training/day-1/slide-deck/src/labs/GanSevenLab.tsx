import { useCallback, useEffect, useRef, useState } from 'react';
import { Plot, type Pt } from '../components/art';
import { Lab, LabButton, Metric, Segmented } from './lab-kit';
import { TinyGan, type GanSnapshot } from './tiny-gan';

const MAX = 3000;
const PROBE_NOISE = [-1.6, -1.1, -0.6, -0.2, 0.2, 0.6, 1.1, 1.6];

/**
 * Trains the real Session 4 GAN in the browser, epoch by epoch.
 * mode 'trace' plots the generated value over time; 'judge' shows D's opinion across the number line.
 */
export function GanSevenLab({ initialView = 'trace' }: { initialView?: 'trace' | 'judge' }) {
  const gan = useRef(new TinyGan());
  const [history, setHistory] = useState<GanSnapshot[]>([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<'1' | '5' | '20'>('5');
  const [view, setView] = useState<'trace' | 'judge'>(initialView);
  const [seed, setSeed] = useState(11);

  const reset = useCallback((nextSeed = seed) => {
    gan.current = new TinyGan({ seed: nextSeed });
    setHistory([]);
    setRunning(false);
  }, [seed]);

  const advance = useCallback((n: number) => {
    const batch: GanSnapshot[] = [];
    for (let i = 0; i < n && gan.current.epoch < MAX; i++) batch.push(gan.current.step());
    if (batch.length) setHistory((h) => h.concat(batch));
    if (gan.current.epoch >= MAX) setRunning(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = () => {
      advance(Number(speed));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [advance, running, speed]);

  const last = history[history.length - 1];
  const epoch = last?.epoch ?? 0;
  const trace: Pt[] = history.filter((_, i) => i % 3 === 0 || i === history.length - 1).map((s) => [s.epoch, s.sample]);
  const samples = PROBE_NOISE.map((z) => gan.current.generate(z));
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;

  return (
    <Lab
      controls={<>
        <div className="lab-row">
          <LabButton primary onClick={() => { if (epoch >= MAX) reset(); setRunning((r) => !r); }}>{running ? 'Pause' : epoch >= MAX ? 'Train again' : epoch ? 'Resume' : 'Train'}</LabButton>
          <LabButton onClick={() => advance(1)} disabled={running || epoch >= MAX}>+1 epoch</LabButton>
          <LabButton onClick={() => reset()}>Reset</LabButton>
        </div>
        <Segmented label="Epochs per frame" options={[{ value: '1', label: '1×' }, { value: '5', label: '5×' }, { value: '20', label: '20×' }]} value={speed} onChange={setSpeed} />
        <Segmented label="View" options={[{ value: 'trace', label: 'G output over time' }, { value: 'judge', label: "D's opinion" }]} value={view} onChange={setView} />
        <div className="lab-row lab-seed">
          <small>Random seed {seed}</small>
          <LabButton onClick={() => { const s = seed + 1; setSeed(s); reset(s); }}>New run</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="Epoch" value={`${epoch} / ${MAX}`} />
        <Metric label="G output · avg" value={epoch ? avg.toFixed(2) : '—'} tone={epoch && Math.abs(avg - 7) < 0.4 ? 'mint' : 'blue'} />
        <Metric label="D(real 7)" value={last ? last.dReal.toFixed(3) : '—'} tone="coral" />
        <Metric label="D loss · G loss" value={last ? `${last.dLoss.toFixed(3)} · ${last.gLoss.toFixed(3)}` : '—'} />
      </>}
      foot={<>Equilibrium: D loss → 2 ln 2 ≈ 1.386, G loss → ln 2 ≈ 0.693, D → 0.5 everywhere G can reach.</>}
    >
      {view === 'trace' ? (
        <Plot
          ariaLabel={`Generator output over ${epoch} training epochs`}
          x={[0, MAX]} y={[-2, 12]} xTicks={[0, 500, 1000, 1500, 2000, 2500, 3000]} yTicks={[-2, 0, 2, 4, 6, 8, 10, 12]}
          xLabel="epoch" yLabel="generated value"
          height={340}
          marks={[{ y: 7, label: 'real = 7' }]}
          lines={trace.length > 1 ? [{ pts: trace, color: '#277a59', width: 2.5, label: 'G(noise)' }] : []}
          points={last ? [{ at: [last.epoch, last.sample], color: '#277a59', r: 7 }] : []}
        />
      ) : (
        <Plot
          ariaLabel="Discriminator probability of real across the number line, with generator samples"
          x={[-2, 12]} y={[0, 1]} xTicks={[-2, 0, 2, 4, 6, 7, 8, 10, 12]} yTicks={[0, .25, .5, .75, 1]}
          xLabel="a number shown to D" yLabel="D says: P(real)"
          height={340}
          marks={[{ x: 7, label: 'real' }, { y: 0.5 }]}
          lines={[{ f: (x) => gan.current.judge(x), color: '#c8432f', label: 'D(x)' }]}
          points={samples.map((s, i) => ({ at: [Math.max(-2, Math.min(12, s)), 0.03 + i * 0.022] as Pt, color: '#277a59', r: 6 }))}
        />
      )}
    </Lab>
  );
}
