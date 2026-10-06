import type { Part } from '../types';
import { closePart, introPart } from './intro';
import { gdPart } from './gd';
import { optPart } from './opt';
import { fnPart } from './fn';
import { lossPart } from './loss';
import { advPart } from './adv';

/** Deep dive: how neural networks learn — the math behind every GAN lesson. */
export const deepParts: Part[] = [introPart, gdPart, optPart, fnPart, lossPart, advPart, closePart];
