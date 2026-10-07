import type { DeckDef } from '../types';
import { unitMeta } from './meta';
import { l10Part } from '../unit2/l10';
import { l11Part } from '../unit2/l11';

export const deck: DeckDef = { id: 'u2-control', out: 'slide-decks/v2/unit-2/2-control.html', parts: [l10Part, l11Part], meta: unitMeta(2, 'Control: conditional and controllable GANs', 'u2-control') };
