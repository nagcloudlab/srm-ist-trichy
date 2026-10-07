import type { DeckDef } from '../types';
import { unitMeta } from './meta';
import { s1Part } from '../unit1/s1';
import { s2Part } from '../unit1/s2';

export const deck: DeckDef = { id: 'u1-genai-gans', out: 'slide-decks/v2/unit-1/1-generative-ai-and-gans.html', parts: [s1Part, s2Part], meta: unitMeta(1, 'Generative AI and the GAN idea', 'u1-genai-gans') };
