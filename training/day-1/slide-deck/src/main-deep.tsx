import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { validateDeck } from './deck';
import { deepParts } from './deep/deck';
import { Shell } from './Shell';

if (import.meta.env.DEV) {
  const problems = validateDeck(deepParts);
  if (problems.length) console.error('Deck problems:\n' + problems.join('\n'));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell
      parts={deepParts}
      meta={{
        brand: 'DD',
        label: 'Deep Dive · How Neural Networks Learn',
        mapKicker: 'GAN MASTERY · DEEP DIVE',
        mapTitle: 'Deep-dive map',
        mapBlurb: 'Gradient descent, optimizers, activations, losses and the training toolkit',
        storageKey: 'gan-deep-dive-slide',
        lessonLabel: (part) => `DEEP DIVE · ${part.code}`,
      }}
    />
  </StrictMode>,
);
