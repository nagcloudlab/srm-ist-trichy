import type { DeckDef } from '../types';
import { closePart, introPart } from '../deep/intro';
import { gdPart } from '../deep/gd';
import { optPart } from '../deep/opt';
import { fnPart } from '../deep/fn';
import { lossPart } from '../deep/loss';
import { advPart } from '../deep/adv';

export const deck: DeckDef = {
  id: 'deep-dive',
  out: 'slide-decks/v2/deep-dive/index.html',
  parts: [introPart, gdPart, optPart, fnPart, lossPart, advPart, closePart],
  meta: {
    brand: 'DD',
    label: 'Deep dive · How neural networks learn',
    mapKicker: 'GAN MASTERY · DEEP DIVE',
    mapTitle: 'How neural networks learn',
    mapBlurb: 'Gradient descent, optimizers, activations, losses and the training toolkit',
    storageKey: 'gan-deck-deep-dive',
    lessonLabel: (part) => `DEEP DIVE · ${part.code}`,
  },
};
