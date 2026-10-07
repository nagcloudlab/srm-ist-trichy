import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './Shell';
import type { DeckDef } from './types';

// The build mode names the deck. MODE is a literal at build time, so every branch but one
// is dropped and each published file contains only its own deck.
function load(mode: string): Promise<{ deck: DeckDef }> {
  if (mode === 'u1-genai-gans') return import('./decks/u1-genai-gans');
  if (mode === 'u1-neural-networks') return import('./decks/u1-neural-networks');
  if (mode === 'u1-build-gans') return import('./decks/u1-build-gans');
  if (mode === 'u1-activations') return import('./decks/u1-activations');
  if (mode === 'u2-better-loss') return import('./decks/u2-better-loss');
  if (mode === 'u2-control') return import('./decks/u2-control');
  if (mode === 'deep-dive') return import('./decks/deep-dive');
  return import('./decks/u1-genai-gans');
}

load(import.meta.env.MODE).then(({ deck }) => {
  document.title = deck.meta.label;
  createRoot(document.getElementById('root')!).render(<StrictMode><Shell parts={deck.parts} meta={deck.meta} /></StrictMode>);
});
