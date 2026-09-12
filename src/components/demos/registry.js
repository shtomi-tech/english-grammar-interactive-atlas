import { mountWordOrderBuilder } from './wordOrderBuilder.js';
import { mountMarkTheParts } from './markTheParts.js';
import { mountSentenceTransformer } from './sentenceTransformer.js';

export const demoRegistry = {
  'word-order': mountWordOrderBuilder,
  'mark-parts': mountMarkTheParts,
  'sentence-transformer': mountSentenceTransformer,
};
