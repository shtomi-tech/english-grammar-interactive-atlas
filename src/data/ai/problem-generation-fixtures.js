import { sentenceComparisonProblems } from '../problems/sentence-comparison.js';
import { wordOrderProblems } from '../problems/word-order.js';
import { interactions } from '../interactions.js';
import { lessons } from '../lessons.js';
import { problems } from '../problems/index.js';
import { interactionRetrievalMetadata } from './interaction-retrieval.js';
import { learningRequirementsFixtures } from './learning-requirements-fixtures.js';
import { createAiRetrievalIndex } from '../../lib/ai/retrieval-index.js';
import { createMaterialPlan } from '../../lib/ai/material-planning.js';
import { createProblemGeneration } from '../../lib/ai/problem-generation.js';

const retrievalIndex = createAiRetrievalIndex({
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});

function createSinglePointRequirements(sourceFixture, {
  id,
  sourceId,
  learningPoint,
}) {
  const requirements = structuredClone(sourceFixture);
  requirements.id = id;
  requirements.sourceReferences = [
    { id: sourceId, type: 'user-provided', title: 'Synthetic source for Problem Generation' },
  ];
  requirements.learningPoints = [{
    ...learningPoint,
    sourceEvidence: learningPoint.sourceEvidence.map((evidence) => ({ ...evidence, sourceId })),
  }];
  return requirements;
}

const generateLearningRequirements = createSinglePointRequirements(learningRequirementsFixtures[0], {
  id: 'LR-GEN-001',
  sourceId: 'SOURCE-GEN-001',
  learningPoint: {
    id: 'LP-GEN-001',
    concept: 'a-clearly-nonexistent-grammar-concept',
    summary: 'A synthetic concept with no matching canonical Problem content.',
    importance: 'core',
    desiredOutcomes: ['produce-form'],
    sourceEvidence: [{
      sourceId: 'SOURCE-GEN-001',
      locator: { section: 'Synthetic generation case' },
      summary: 'The synthetic source requires a new word-order activity.',
    }],
  },
});
const generateMaterialPlan = createMaterialPlan({
  learningRequirements: generateLearningRequirements,
  retrievalIndex,
  id: 'MATPLAN-GEN-001',
});
if (generateMaterialPlan.items[0].problemDecision.action !== 'generate') {
  throw new Error('Generate fixture must exercise the generate Material Plan action');
}

const adaptLearningRequirements = createSinglePointRequirements(learningRequirementsFixtures[0], {
  id: 'LR-ADAPT-001',
  sourceId: 'SOURCE-ADAPT-001',
  learningPoint: {
    id: 'LP-ADAPT-001',
    concept: 'stopped smoking',
    summary: 'A synthetic source-backed point that can use an existing comparison Problem as a template.',
    importance: 'core',
    desiredOutcomes: ['compare-meaning'],
    sourceEvidence: [{
      sourceId: 'SOURCE-ADAPT-001',
      locator: { section: 'Synthetic adaptation case' },
      summary: 'The source compares two meanings created by different verb forms.',
    }],
  },
});
const adaptMaterialPlan = createMaterialPlan({
  learningRequirements: adaptLearningRequirements,
  retrievalIndex,
  id: 'MATPLAN-ADAPT-001',
});
const adaptItem = adaptMaterialPlan.items[0];
if (adaptItem.problemDecision.action !== 'reuse') {
  throw new Error('Adapt fixture needs an existing Problem source selection');
}
adaptItem.problemDecision = {
  action: 'adapt',
  reason: 'Use the existing comparison Problem as a template for a new source-backed example.',
  sourceProblemSelection: adaptItem.problemDecision.problemSelection,
};

const generateProblem = structuredClone(wordOrderProblems[6]);
generateProblem.id = 'GEN-WO-001';
generateProblem.prompt = 'Synthetic generation case: arrange the infinitive sentence.';
const adaptProblem = structuredClone(sentenceComparisonProblems[0]);
adaptProblem.id = 'GEN-SC-001';
adaptProblem.prompt = 'Synthetic adaptation case: compare the two verb-form meanings.';

const generateContext = {
  learningRequirements: generateLearningRequirements,
  materialPlan: generateMaterialPlan,
  materialPlanItemId: generateMaterialPlan.items[0].id,
  retrievalIndex,
  canonicalProblems: problems,
};
const adaptContext = {
  learningRequirements: adaptLearningRequirements,
  materialPlan: adaptMaterialPlan,
  materialPlanItemId: adaptMaterialPlan.items[0].id,
  retrievalIndex,
  canonicalProblems: problems,
};

export const problemGenerationContexts = Object.freeze([generateContext, adaptContext]);
export const problemGenerationFixtures = Object.freeze([
  createProblemGeneration({ ...generateContext, candidateProblem: generateProblem, id: 'PGEN-001' }),
  createProblemGeneration({ ...adaptContext, candidateProblem: adaptProblem, id: 'PGEN-002' }),
]);
