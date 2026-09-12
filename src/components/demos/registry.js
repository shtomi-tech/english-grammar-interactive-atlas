import { mountWordOrderBuilder } from './wordOrderBuilder.js';
import { mountMarkTheParts } from './markTheParts.js';
import { mountSentenceTransformer } from './sentenceTransformer.js';
import { mountGrammarClassifier } from './grammarClassifier.js';

export const demoRegistry = {
  'word-order': mountWordOrderBuilder,
  'mark-parts': mountMarkTheParts,
  'sentence-transformer': mountSentenceTransformer,
  'grammar-classifier': mountGrammarClassifier,
};
