import type { DeckDef } from '../types';
import { unitMeta } from './meta';
import { l07Part } from '../unit2/l07';
import { l08Part } from '../unit2/l08';
import { l09Part } from '../unit2/l09';

export const deck: DeckDef = { id: 'u2-better-loss', out: 'slide-decks/v2/unit-2/1-better-loss-wgan.html', parts: [l07Part, l08Part, l09Part], meta: unitMeta(2, 'Better loss: from BCE to WGAN-GP', 'u2-better-loss') };
