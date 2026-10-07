import type { DeckMeta } from '../types';

/** Labels for a unit topic deck — no day or session framing. */
export const unitMeta = (unit: 1 | 2, title: string, id: string): DeckMeta => ({
  brand: `U${unit}`,
  label: `GAN Mastery · Unit ${unit} · ${title}`,
  mapKicker: `GAN MASTERY · UNIT ${unit}`,
  mapTitle: title,
  mapBlurb: `Unit ${unit} · ${title}`,
  storageKey: `gan-deck-${id}`,
  lessonLabel: (part) => `UNIT ${unit} · ${part.label}`,
});
