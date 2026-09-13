import { interactions } from '../interactions.js';
import { lessons } from '../lessons.js';
import { problems } from '../problems/index.js';
import { sentenceComparisonProblems } from '../problems/sentence-comparison.js';
import { wordOrderProblems } from '../problems/word-order.js';
import { interactionRetrievalMetadata } from './interaction-retrieval.js';
import { createAiRetrievalIndex } from '../../lib/ai/retrieval-index.js';
import {
  captureRetrievalSelection,
  createInteractionQueryForLearningPoint,
} from '../../lib/ai/material-planning.js';
import { createProblemGeneration } from '../../lib/ai/problem-generation.js';
import {
  createLessonGeneration,
  createLessonGenerationContext,
} from '../../lib/ai/lesson-generation.js';

const retrievalIndex = createAiRetrievalIndex({
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});

export const lessonGenerationLearningRequirements = {
  version: '1',
  id: 'LR-MIX-001',
  topic: 'synthetic mixed lesson generation',
  sourceReferences: [
    { id: 'SOURCE-MIX-001', type: 'user-provided', title: 'Synthetic mixed Lesson source' },
  ],
  learningPoints: [
    {
      id: 'LP-MIX-A',
      concept: 'meaning comparison',
      summary: 'Compare two meanings created by different verb forms.',
      importance: 'core',
      desiredOutcomes: ['compare-meaning'],
      sourceEvidence: [{
        sourceId: 'SOURCE-MIX-001',
        locator: { section: 'Mixed reuse point' },
        summary: 'The source compares two meanings.',
      }],
    },
    {
      id: 'LP-MIX-B',
      concept: 'a-new-synthetic-form',
      summary: 'Produce a synthetic form that has no matching canonical Problem content.',
      importance: 'core',
      desiredOutcomes: ['produce-form'],
      sourceEvidence: [{
        sourceId: 'SOURCE-MIX-001',
        locator: { section: 'Mixed generate point' },
        summary: 'The source requires a new sentence-building activity.',
      }],
    },
    {
      id: 'LP-MIX-C',
      concept: 'stopped smoking',
      summary: 'Adapt a comparison Problem to the source-backed example.',
      importance: 'supporting',
      desiredOutcomes: ['compare-meaning'],
      sourceEvidence: [{
        sourceId: 'SOURCE-MIX-001',
        locator: { section: 'Mixed adapt point' },
        summary: 'The source compares meanings made by different verb forms.',
      }],
    },
  ],
};

const reusePoint = lessonGenerationLearningRequirements.learningPoints[0];
const generatePoint = lessonGenerationLearningRequirements.learningPoints[1];
const adaptPoint = lessonGenerationLearningRequirements.learningPoints[2];
const comparisonInteractionQuery = createInteractionQueryForLearningPoint(reusePoint, { includeTerms: false });
const generationInteractionQuery = createInteractionQueryForLearningPoint(generatePoint, { includeTerms: false });
const adaptInteractionQuery = createInteractionQueryForLearningPoint(adaptPoint, { includeTerms: false });
const comparisonProblemQuery = {
  kinds: ['problem'],
  demoTypes: ['sentence-comparison'],
  includeTerms: ['stopped smoking', 'stopped to smoke'],
  limit: 5,
};

export const lessonGenerationMaterialPlan = {
  version: '1',
  id: 'MATPLAN-MIX-001',
  learningRequirementsRef: {
    id: lessonGenerationLearningRequirements.id,
    version: lessonGenerationLearningRequirements.version,
  },
  items: [
    {
      id: 'MPI-MIX-A',
      learningPointId: reusePoint.id,
      interactionSelection: captureRetrievalSelection(retrievalIndex, comparisonInteractionQuery, {
        kind: 'interaction',
        id: 'GRAM-INT-008',
      }),
      problemDecision: {
        action: 'reuse',
        problemSelection: captureRetrievalSelection(retrievalIndex, comparisonProblemQuery, {
          kind: 'problem',
          id: 'SC-001',
          type: 'sentence-comparison',
        }),
      },
      rationale: '既存のSentence Comparisonで二つの意味を比較する。',
    },
    {
      id: 'MPI-MIX-B',
      learningPointId: generatePoint.id,
      interactionSelection: captureRetrievalSelection(retrievalIndex, generationInteractionQuery, {
        kind: 'interaction',
        id: 'GRAM-INT-001',
      }),
      problemDecision: {
        action: 'generate',
        reason: 'Existing Problems do not cover the synthetic source-backed form.',
      },
      rationale: '新しい文をWord Orderで組み立てる。',
    },
    {
      id: 'MPI-MIX-C',
      learningPointId: adaptPoint.id,
      interactionSelection: captureRetrievalSelection(retrievalIndex, adaptInteractionQuery, {
        kind: 'interaction',
        id: 'GRAM-INT-008',
      }),
      problemDecision: {
        action: 'adapt',
        reason: 'Adapt the existing comparison Problem to the source-backed example.',
        sourceProblemSelection: captureRetrievalSelection(retrievalIndex, comparisonProblemQuery, {
          kind: 'problem',
          id: 'SC-001',
          type: 'sentence-comparison',
        }),
      },
      rationale: '既存の比較形式を新しい例文へ適応する。',
    },
  ],
};

const generatedProblem = structuredClone(wordOrderProblems[6]);
generatedProblem.id = 'GEN-MIX-WO-001';
generatedProblem.prompt = 'Synthetic mixed Lesson case: arrange the sentence.';
const adaptedProblem = structuredClone(sentenceComparisonProblems[0]);
adaptedProblem.id = 'GEN-MIX-SC-001';
adaptedProblem.prompt = 'Synthetic mixed Lesson case: compare the meanings.';

const generationContext = {
  learningRequirements: lessonGenerationLearningRequirements,
  materialPlan: lessonGenerationMaterialPlan,
  materialPlanItemId: 'MPI-MIX-B',
  retrievalIndex,
  canonicalProblems: problems,
};
const adaptationContext = {
  learningRequirements: lessonGenerationLearningRequirements,
  materialPlan: lessonGenerationMaterialPlan,
  materialPlanItemId: 'MPI-MIX-C',
  retrievalIndex,
  canonicalProblems: problems,
};

export const lessonGenerationProblemGenerations = Object.freeze([
  createProblemGeneration({ ...generationContext, candidateProblem: generatedProblem, id: 'PGEN-MIX-B' }),
  createProblemGeneration({ ...adaptationContext, candidateProblem: adaptedProblem, id: 'PGEN-MIX-C' }),
]);
export const lessonGenerationCandidateLesson = {
  id: 'GEN-LESSON-MIX-001',
  slug: 'generated-mixed-lesson',
  label: 'Generated Mixed Lesson',
  title: '意味を比べ、文を組み立てる',
  description: '既存Problemの再利用と生成・適応を一つのLessonへまとめるfixture。',
  learningGoal: '文法上の意味を比較し、対応する英文を組み立てられるようにする。',
  steps: [
    {
      id: 'GEN-LESSON-MIX-001-STEP-01',
      interactionType: 'sentence-comparison',
      problemId: 'SC-001',
      title: '既存の意味比較を使う',
      instruction: '二つの英文の意味の違いを比較します。',
    },
    {
      id: 'GEN-LESSON-MIX-001-STEP-02',
      interactionType: 'word-order',
      problemId: 'GEN-MIX-WO-001',
      title: '新しい文を組み立てる',
      instruction: '単語を正しい順序に並べて文を完成させます。',
    },
    {
      id: 'GEN-LESSON-MIX-001-STEP-03',
      interactionType: 'sentence-comparison',
      problemId: 'GEN-MIX-SC-001',
      title: '比較Problemを適応する',
      instruction: '適応したProblemで二つの意味をもう一度比べます。',
    },
  ],
};

const lessonContext = createLessonGenerationContext({
  learningRequirements: lessonGenerationLearningRequirements,
  materialPlan: lessonGenerationMaterialPlan,
  problemGenerations: lessonGenerationProblemGenerations,
  retrievalIndex,
  canonicalProblems: problems,
  canonicalLessons: lessons,
});

export const lessonGenerationContexts = Object.freeze([{
  learningRequirements: lessonGenerationLearningRequirements,
  materialPlan: lessonGenerationMaterialPlan,
  problemGenerations: lessonGenerationProblemGenerations,
  retrievalIndex,
  canonicalProblems: problems,
  canonicalLessons: lessons,
}]);

export const lessonGenerationFixtures = Object.freeze([
  createLessonGeneration({
    context: lessonContext,
    candidateLesson: lessonGenerationCandidateLesson,
    id: 'LGEN-001',
    rationale: 'Learning Requirementsの三つの活動を順番に一つのLessonへ配置する。',
  }),
]);
