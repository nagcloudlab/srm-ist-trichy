import type { DeckDef } from '../types';
import { unitMeta } from './meta';
import { s4Part } from '../unit1/s4';
import { s5Part } from '../unit1/s5';

export const deck: DeckDef = { id: 'u1-build-gans', out: 'slide-decks/v2/unit-1/3-build-gans.html', parts: [s4Part, s5Part], meta: unitMeta(1, 'Build GANs: from the number 7 to DCGAN', 'u1-build-gans') };
