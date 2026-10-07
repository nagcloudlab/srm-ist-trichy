import type { DeckDef } from '../types';
import { unitMeta } from './meta';
import { actPart } from '../unit1/act';

export const deck: DeckDef = { id: 'u1-activations', out: 'slide-decks/v2/unit-1/4-activations-in-gans.html', parts: [actPart], meta: unitMeta(1, 'Activation functions in GANs', 'u1-activations') };
