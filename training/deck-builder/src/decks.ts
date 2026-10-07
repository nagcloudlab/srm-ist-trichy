import type { DeckDef, Part } from './types';
import { deck as d0 } from './decks/u1-genai-gans';
import { deck as d1 } from './decks/u1-neural-networks';
import { deck as d2 } from './decks/u1-build-gans';
import { deck as d3 } from './decks/u1-activations';
import { deck as d4 } from './decks/u2-better-loss';
import { deck as d5 } from './decks/u2-control';
import { deck as d6 } from './decks/deep-dive';

/**
 * Every advanced deck. Each is a standalone topic deck that can be taught in any order
 * and at any pace. One file per deck in src/decks/ (its id is the build mode); `out` is
 * where scripts/publish.mjs writes the single-file build, relative to training/.
 */
export const decks: DeckDef[] = [d0, d1, d2, d3, d4, d5, d6];

/** Contract checks: unique ids, complete presenter notes, no empty titles. */
export function validateDeck(all: Part[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const part of all) {
    if (!part.slides.length) problems.push(`${part.code}: no slides`);
    for (const slide of part.slides) {
      const where = `${part.code}/${slide.id}`;
      if (seen.has(slide.id)) problems.push(`${where}: duplicate id`);
      seen.add(slide.id);
      if (!/^[a-z0-9-]+$/.test(slide.id)) problems.push(`${where}: id must be kebab-case`);
      if (!slide.title.trim()) problems.push(`${where}: empty title`);
      if (!slide.section.trim() || !slide.kicker.trim()) problems.push(`${where}: missing section or kicker`);
      for (const key of ['time', 'say', 'ask'] as const) if (!slide.notes?.[key]?.trim()) problems.push(`${where}: missing notes.${key}`);
    }
  }
  return problems;
}
