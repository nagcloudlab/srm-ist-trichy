import type { ReactNode } from 'react';

/** Part ids are short kebab-case codes; each deck defines its own. */
export type PartId = string;

/** Presenter guidance shown with N. Every slide must have all three. */
export type Note = { time: string; say: string; ask: string };

export type SlideState = { revealed: boolean };

/**
 * One slide. Content lives with its notes so they can never drift apart.
 *
 * layout
 *  - 'standard' (default): the shell prints kicker + takeaway title (+ lede); `render` supplies the body.
 *  - 'cover' | 'bridge' | 'divider': `render` owns the whole canvas.
 */
export type Slide = {
  id: string;
  section: string;
  kicker: string;
  title: string;
  lede?: string;
  layout?: 'standard' | 'cover' | 'bridge' | 'divider';
  /** Content visibly changes in place when R is pressed. */
  reveal?: boolean;
  /** Slides with a live lab get extra width and a LIVE badge. */
  lab?: boolean;
  notes: Note;
  render: (state: SlideState) => ReactNode;
};

export type Part = {
  id: PartId;
  code: string;
  label: string;
  title: string;
  when: string;
  minutes: number;
  slides: Slide[];
};

/** Deck-level labels so one Shell can present several decks. */
export type DeckMeta = {
  brand: string;          // 2–3 letter mark in the top-left square
  label: string;          // top-bar label
  mapKicker: string;      // small label above the map title
  mapTitle: string;
  mapBlurb: string;
  storageKey: string;     // where the last position is remembered
  lessonLabel: (part: Part) => string;
};

/** A publishable deck: build mode id, output path under training/, parts and labels. */
export type DeckDef = { id: string; out: string; parts: Part[]; meta: DeckMeta };
