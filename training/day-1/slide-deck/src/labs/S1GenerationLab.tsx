import { useEffect, useState } from 'react';
import { PixelDigit } from '../components/art';
import { Lab, LabButton, Metric, Segmented, Slider } from './lab-kit';

const MS_PER_PASS = 20; // illustrative cost of one network forward pass

/**
 * Generation cost: VAE and GAN each need one forward pass; diffusion needs one pass per denoising step.
 * Drag the step slider to watch diffusion carve a digit out of noise.
 */
export function S1GenerationLab() {
  const [total, setTotal] = useState<'10' | '50' | '100'>('50');
  const N = Number(total);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setT((v) => {
      if (v >= N) { setPlaying(false); return N; }
      return v + 1;
    }), Math.max(30, 1500 / N));
    return () => window.clearInterval(timer);
  }, [playing, N]);

  const progress = t / N;
  const noise = Math.max(0, 1 - progress) ** 0.85;

  return (
    <Lab
      controls={<>
        <Segmented label="Diffusion steps (N)" options={[{ value: '10', label: '10' }, { value: '50', label: '50' }, { value: '100', label: '100' }]} value={total} onChange={(v) => { setTotal(v); setT(0); setPlaying(false); }} />
        <Slider label="Denoising step" value={t} min={0} max={N} step={1} onChange={(v) => { setPlaying(false); setT(v); }} format={(v) => `${v} / ${N}`} tone="blue" />
        <div className="lab-row">
          <LabButton primary onClick={() => { if (t >= N) setT(0); setPlaying((p) => !p); }}>{playing ? 'Pause' : t >= N ? 'Replay' : 'Run diffusion'}</LabButton>
          <LabButton onClick={() => { setPlaying(false); setT(0); }}>Reset</LabButton>
        </div>
      </>}
      metrics={<>
        <Metric label="VAE passes" value="1" tone="violet" />
        <Metric label="GAN passes" value="1" tone="mint" />
        <Metric label="Diffusion passes" value={`${t}`} tone="blue" />
        <Metric label="Diffusion time*" value={`${t * MS_PER_PASS} ms`} tone="coral" />
      </>}
      foot={<>*Illustrative: {MS_PER_PASS} ms per network pass. VAE and GAN finish in {MS_PER_PASS} ms whatever N is.</>}
    >
      <div className="s1-lab-row">
        <figure className="s1-lab-panel">
          <small>VAE · 1 pass</small>
          <PixelDigit digit="7" seed={5} blur={0.9} px={190} label="VAE output: a blurry 7" />
          <figcaption>Instant — but <b>blurry</b></figcaption>
        </figure>
        <figure className="s1-lab-panel s1-lab-gan">
          <small>GAN · 1 pass</small>
          <PixelDigit digit="7" seed={5} wobble={0.03} px={190} label="GAN output: a sharp 7" />
          <figcaption>Instant and <b>sharp</b></figcaption>
        </figure>
        <figure className="s1-lab-panel s1-lab-diff">
          <small>Diffusion · step {t} of {N}</small>
          <PixelDigit digit="7" seed={5} noise={noise} px={190} label={`Diffusion output after ${t} of ${N} steps`} />
          <figcaption>{t === 0 ? 'Pure noise — nothing yet' : t < N ? 'Still removing noise…' : <>Sharp — after <b>{N}</b> passes</>}</figcaption>
        </figure>
      </div>
    </Lab>
  );
}
