import { mountWordOrderBuilder } from './wordOrderBuilder.js';
import { mountMarkTheParts } from './markTheParts.js';
import { mountSentenceTransformer } from './sentenceTransformer.js';
import { mountGrammarClassifier } from './grammarClassifier.js';
import { mountSentencePatternDiagram } from './sentencePatternDiagram.js';
import { mountModifierConnectionViewer } from './modifierConnectionViewer.js';
import { getProblemById } from '../../data/problems/index.js';

export const demoRegistry = {
  'word-order': {
    mount: mountWordOrderBuilder,
    demoProblemId: 'WO-001',
  },
  'mark-parts': {
    mount: mountMarkTheParts,
    demoProblemId: 'MP-001',
  },
  'sentence-transformer': {
    mount: mountSentenceTransformer,
    demoProblemId: 'ST-001',
  },
  'grammar-classifier': {
    mount: mountGrammarClassifier,
    demoProblemId: 'GC-001',
  },
  'sentence-pattern-diagram': {
    mount: mountSentencePatternDiagram,
    demoProblemId: 'SPD-001',
  },
  'modifier-connection-viewer': {
    mount: mountModifierConnectionViewer,
    demoProblemId: 'MCV-001',
  },
};

export function getDemoProblem(type, problemId) {
  const entry = demoRegistry[type];
  if (!entry) throw new Error(`Unknown demo type: ${type}`);
  const problem = getProblemById(problemId ?? entry.demoProblemId);
  if (!problem) throw new Error(`Missing demo problem: ${problemId ?? entry.demoProblemId}`);
  if (problem.type !== type) throw new Error(`Demo problem type mismatch: ${problem.type} vs ${type}`);
  return problem;
}

export function mountDemo(type, root, options = {}) {
  const { problemId, ...componentOptions } = options;
  const problem = getDemoProblem(type, problemId);
  const entry = demoRegistry[type];
  return entry.mount(root, problem, componentOptions);
}
