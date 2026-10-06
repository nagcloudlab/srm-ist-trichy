import { useMemo, useState } from 'react';
import { makeRng, randn, TinyGan } from './tiny-gan';

/** Trains the Session 4 GAN to 3000 epochs (a few ms), then draws 10 samples from fresh noise. */
export function S4SamplesLab() {
  const gan = useMemo(() => {
    const g = new TinyGan({ seed: 11 });
    for (let i = 0; i < 3000; i++) g.step();
    return g;
  }, []);
  const [draw, setDraw] = useState(5);
  const samples = useMemo(() => {
    const rng = makeRng(draw);
    return Array.from({ length: 10 }, () => {
      const z = randn(rng);
      return { z, out: gan.generate(z) };
    });
  }, [draw, gan]);
  const mean = samples.reduce((a, s) => a + s.out, 0) / samples.length;

  return (
    <div className="s4-samples">
      <div className="s4-samples-grid">
        {samples.map((s, i) => (
          <div key={i} className="s4-sample">
            <small>noise z = {s.z.toFixed(2)}</small>
            <strong>{s.out.toFixed(3)}</strong>
          </div>
        ))}
      </div>
      <div className="s4-samples-foot">
        <span>Trained G (3000 epochs, seed 11) · mean of these 10 = <b>{mean.toFixed(3)}</b></span>
        <button className="lab-btn primary" onClick={() => setDraw((d) => d + 1)}>Draw 10 new noises</button>
      </div>
    </div>
  );
}
