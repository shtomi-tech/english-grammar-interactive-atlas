import { grammarClassifierProblems } from './grammar-classifier.js';
import { markPartsProblems } from './mark-parts.js';
import { sentenceTransformerProblems } from './sentence-transformer.js';
import { wordOrderProblems } from './word-order.js';

export const problemSets = {
  'word-order': wordOrderProblems,
  'mark-parts': markPartsProblems,
  'grammar-classifier': grammarClassifierProblems,
  'sentence-transformer': sentenceTransformerProblems,
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
  wordOrderProblems,
};
