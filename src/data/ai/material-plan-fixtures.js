import { interactions } from '../interactions.js';
import { lessons } from '../lessons.js';
import { problems } from '../problems/index.js';
import { interactionRetrievalMetadata } from './interaction-retrieval.js';
import { learningRequirementsFixtures } from './learning-requirements-fixtures.js';
import { createAiRetrievalIndex } from '../../lib/ai/retrieval-index.js';
import { createMaterialPlan } from '../../lib/ai/material-planning.js';

const retrievalIndex = createAiRetrievalIndex({
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});

export const materialPlanFixtures = Object.freeze([
  createMaterialPlan({
    learningRequirements: learningRequirementsFixtures[0],
    retrievalIndex,
    id: 'MATPLAN-001',
  }),
  createMaterialPlan({
    learningRequirements: learningRequirementsFixtures[1],
    retrievalIndex,
    id: 'MATPLAN-002',
  }),
]);
