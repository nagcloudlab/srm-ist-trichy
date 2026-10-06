import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { parts, validateDeck } from './deck';
import { Shell } from './Shell';

if (import.meta.env.DEV) {
  const problems = validateDeck(parts);
  if (problems.length) console.error('Deck problems:\n' + problems.join('\n'));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell
      parts={parts}
      meta={{
        brand: 'D1',
        label: 'GAN Mastery · Day 1',
        mapKicker: 'GAN MASTERY · DAY 1',
        mapTitle: 'Day map',
        mapBlurb: 'From generative AI to your first working GAN',
        storageKey: 'gan-day1-deck-slide',
        lessonLabel: (part) => (part.id === 'day' || part.id === 'wrap' ? `DAY 1 · ${part.label}` : `SESSION ${part.code}`),
      }}
    />
  </StrictMode>,
);
