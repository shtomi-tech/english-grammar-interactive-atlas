import { grammarClassifierProblems } from './grammar-classifier.js';
import { markPartsProblems } from './mark-parts.js';
import { sentenceTransformerProblems } from './sentence-transformer.js';
import { sentencePatternDiagramProblems } from './sentence-pattern-diagram.js';
import { modifierConnectionViewerProblems } from './modifier-connection-viewer.js';
import { sentenceComparisonProblems } from './sentence-comparison.js';
import { errorCorrectorProblems } from './error-corrector.js';
import { contextGrammarProblems } from './context-grammar.js';
import { sentenceGeneratorProblems } from './sentence-generator.js';
import { wordOrderProblems } from './word-order.js';
import { modifierPositionerProblems } from './modifier-positioner.js';
import { examMultipleChoiceProblems } from './exam-multiple-choice.js';

export const problemSets = {
  'word-order': wordOrderProblems,
  'mark-parts': markPartsProblems,
  'grammar-classifier': grammarClassifierProblems,
  'sentence-transformer': sentenceTransformerProblems,
  'sentence-pattern-diagram': sentencePatternDiagramProblems,
  'modifier-connection-viewer': modifierConnectionViewerProblems,
  'sentence-comparison': sentenceComparisonProblems,
  'error-corrector': errorCorrectorProblems,
  'context-grammar': contextGrammarProblems,
  'sentence-generator': sentenceGeneratorProblems,
  'modifier-positioner': modifierPositionerProblems,
  'exam-multiple-choice': examMultipleChoiceProblems,
};

export const problems = Object.values(problemSets).flat();
export const problemRegistry = Object.fromEntries(problems.map((problem) => [problem.id, problem]));

export function getProblemById(problemId) {
  return problemRegistry[problemId];
}

export function getProblemsByType(type) {
  return problemSets[type] ? [...problemSets[type]] : [];
}

export {
  grammarClassifierProblems,
  markPartsProblems,
  sentenceTransformerProblems,
  sentencePatternDiagramProblems,
  modifierConnectionViewerProblems,
  sentenceComparisonProblems,
  errorCorrectorProblems,
  contextGrammarProblems,
  sentenceGeneratorProblems,
  wordOrderProblems,
  modifierPositionerProblems,
  examMultipleChoiceProblems,
};
