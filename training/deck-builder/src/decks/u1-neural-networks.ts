import type { DeckDef } from '../types';
import { unitMeta } from './meta';
import { s3Part } from '../unit1/s3';

export const deck: DeckDef = { id: 'u1-neural-networks', out: 'slide-decks/v2/unit-1/2-neural-networks.html', parts: [s3Part], meta: unitMeta(1, 'Neural networks: from one neuron to PyTorch', 'u1-neural-networks') };
