import { actPart } from './sessions/act';
import { openPart, wrapPart } from './sessions/day';
import { s1Part } from './sessions/s1';
import { s2Part } from './sessions/s2';
import { s3Part } from './sessions/s3';
import { s4Part } from './sessions/s4';
import { s5Part } from './sessions/s5';
import type { Part } from './types';

export const parts: Part[] = [openPart, s1Part, s2Part, s3Part, s4Part, s5Part, actPart, wrapPart];

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
