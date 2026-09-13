import assert from 'node:assert/strict';
import { interactions } from '../src/data/interactions.js';
import { getLessonById, getLessonBySlug, lessons } from '../src/data/lessons.js';
import { grammarClassifierProblems } from '../src/data/problems/grammar-classifier.js';
import { markPartsProblems } from '../src/data/problems/mark-parts.js';
import { getProblemById, problemRegistry, problems } from '../src/data/problems/index.js';
import { sentenceTransformerProblem, sentenceTransformerProblems } from '../src/data/problems/sentence-transformer.js';
import { sentencePatternDiagramProblems } from '../src/data/problems/sentence-pattern-diagram.js';
import { modifierConnectionViewerProblems } from '../src/data/problems/modifier-connection-viewer.js';
import { modifierPositionerProblems } from '../src/data/problems/modifier-positioner.js';
import { sentenceComparisonProblems } from '../src/data/problems/sentence-comparison.js';
import { errorCorrectorProblems } from '../src/data/problems/error-corrector.js';
import { contextGrammarProblems } from '../src/data/problems/context-grammar.js';
import { sentenceGeneratorProblems } from '../src/data/problems/sentence-generator.js';
import { wordOrderProblems } from '../src/data/problems/word-order.js';
import { filterInteractions, getAtlasStats, searchInteractions } from '../src/lib/atlas.js';
import { grammarClassifierProblem } from '../src/data/demo-problems.js';
import { demoRegistry, getDemoProblem } from '../src/components/demos/registry.js';
import { validateInteractions } from '../src/lib/validateInteractions.js';
import { validateLessons } from '../src/lib/validateLessons.js';
import { validateDemoRegistry, validateProblems } from '../src/lib/validateProblems.js';
import { checkClassification } from '../src/lib/grammar/classification.js';
import { checkWordOrder, shuffleWordIds } from '../src/lib/grammar/word-order.js';
import { checkTokenSelection } from '../src/lib/grammar/parts.js';
import { generateSentence } from '../src/lib/grammar/generateSentence.js';
import { getGrammarStateMode, SUPPORTED_MODALS, SUPPORTED_TENSES, SUPPORTED_VOICES } from '../src/lib/grammar/grammar-state.js';
import { getControlLabel } from '../src/lib/grammar/grammar-controls.js';
import {
  createInitialExploration,
  hasCompletedTransformerExploration,
  recordExploredValue,
} from '../src/lib/grammar/transformer-exploration.js';
import { buildPatternSlots, getExploredRoles, hasExploredAllChunks } from '../src/lib/grammar/sentence-pattern.js';
import { getRelatedChunkIds, getRelationsForChunk, hasExploredAllRelations } from '../src/lib/grammar/modifier-relations.js';
import {
  buildModifierPlacementSentence,
  getModifierPlacement,
  getPlacementRelation,
  isGoalMatchingPlacement,
} from '../src/lib/grammar/modifier-placement.js';
import {
  getChunkIdsForDifference,
  getDifferenceByChunkId,
  hasExploredAllDifferences,
} from '../src/lib/grammar/sentence-comparison.js';
import {
  getCorrectionByTokenId,
  hasCompletedAllCorrections,
  isAcceptedCorrection,
} from '../src/lib/grammar/error-correction.js';
import {
  getScenarioChoice,
  getScenarioStep,
  hasCompletedScenario,
  isAcceptedScenarioChoice,
} from '../src/lib/grammar/context-grammar.js';
import {
  findMatchingTargetState,
  hasCompleteGenerationState,
  matchesGenerationTarget,
} from '../src/lib/grammar/generation-goal.js';
import {
  researchReferences,
  researchReferenceRegistry,
} from '../src/data/research/index.js';
import { validateResearchReferences, validateResearchRegistry } from '../src/lib/validateResearch.js';
import { getLessonProgress, isLessonStepComplete, markLessonStepComplete } from '../src/lib/lesson-progress.js';
import {
  interactionRetrievalMetadata,
  learningRequirementsContract,
  learningRequirementsFixtures,
  lessonGenerationContract,
  lessonGenerationContexts,
  lessonGenerationFixtures,
  materialPlanContract,
  materialPlanFixtures,
  outcomeRetrievalProfiles,
  problemGenerationContract,
  problemGenerationContexts,
  problemGenerationFixtures,
  e2eMaterialGenerationFixture,
  retrievalBenchmarks,
  validateRetrievalQuery,
} from '../src/data/ai/index.js';
import { createAiRetrievalIndex } from '../src/lib/ai/retrieval-index.js';
import { evaluateRetrievalBenchmarks } from '../src/lib/ai/retrieval-evaluation.js';
import { searchRetrievalIndex } from '../src/lib/ai/retrieval-search.js';
import {
  captureRetrievalSelection,
  createInteractionQueryForLearningPoint,
  hasProblemContentMatch,
  validateOutcomeRetrievalProfiles,
} from '../src/lib/ai/material-planning.js';
import { createProblemGeneration, createProblemGenerationContext, resolveCanonicalProblem } from '../src/lib/ai/problem-generation.js';
import { validateAiRetrieval } from '../src/lib/validateAiRetrieval.js';
import { validateLearningRequirements } from '../src/lib/validateLearningRequirements.js';
import { validateMaterialPlan } from '../src/lib/validateMaterialPlan.js';
import { sameLocator, validateProblemGeneration } from '../src/lib/validateProblemGeneration.js';
import {
  createLessonGeneration,
  createLessonGenerationContext,
  createResolvedProblemRegistry,
  resolveMaterialPlanProblems,
} from '../src/lib/ai/lesson-generation.js';
import { validateLessonGeneration } from '../src/lib/validateLessonGeneration.js';
import { runMaterialGenerationProof } from '../src/lib/ai/material-generation-proof.js';
import { validateMaterialGenerationProof, validateSyntheticSourceTraceability } from '../src/lib/validateMaterialGenerationProof.js';
import { createRuntimePreviewModel } from '../src/lib/ai/runtime-preview.js';

assert.equal(interactions.length, 40);
assert.deepEqual(
  interactions.map((entry) => entry.id),
  Array.from({ length: 40 }, (_, index) => `GRAM-INT-${String(index + 1).padStart(3, '0')}`),
);
assert.equal(new Set(interactions.map((entry) => entry.category)).size, 10);
assert.equal(filterInteractions(interactions, 'transform').length, 4);
assert.equal(filterInteractions(interactions, 'all', { reusability: 'S' }).length, 29);
assert.equal(filterInteractions(interactions, 'all', { reusability: 'A' }).length, 11);
assert.equal(filterInteractions(interactions, 'all', { reusability: 'B' }).length, 0);
assert.equal(filterInteractions(interactions, 'all', { demo: 'available' }).length, 11);
assert.equal(filterInteractions(interactions, 'all', { demo: 'planned' }).length, 29);
assert.equal(searchInteractions(interactions, 'relative').length, 2);
assert.equal(searchInteractions(interactions, '  RELATIVE  ').length, 2);
assert.equal(searchInteractions(interactions, 'conditional').length, 1);
assert.equal(
  searchInteractions(filterInteractions(interactions, 'generate', { reusability: 'S', demo: 'planned' }), 'generator').length,
  2,
);
assert.deepEqual(getAtlasStats(interactions, demoRegistry), {
  catalogEntries: 40,
  interactionFamilies: 10,
  workingDemos: 11,
});

assert.equal(problems.length, 53);
assert.deepEqual(
  Object.fromEntries(Object.entries({
    'word-order': wordOrderProblems,
    'mark-parts': markPartsProblems,
    'grammar-classifier': grammarClassifierProblems,
    'sentence-transformer': sentenceTransformerProblems,
    'sentence-pattern-diagram': sentencePatternDiagramProblems,
    'modifier-connection-viewer': modifierConnectionViewerProblems,
    'modifier-positioner': modifierPositionerProblems,
    'sentence-comparison': sentenceComparisonProblems,
    'error-corrector': errorCorrectorProblems,
    'context-grammar': contextGrammarProblems,
    'sentence-generator': sentenceGeneratorProblems,
  }).map(([type, entries]) => [type, entries.length])),
  { 'word-order': 8, 'mark-parts': 4, 'grammar-classifier': 5, 'sentence-transformer': 3, 'sentence-pattern-diagram': 3, 'modifier-connection-viewer': 3, 'modifier-positioner': 4, 'sentence-comparison': 4, 'error-corrector': 7, 'context-grammar': 7, 'sentence-generator': 5 },
);
assert.equal(problemRegistry['WO-001'], wordOrderProblems[0]);
assert.equal(problemRegistry['SPD-001'], sentencePatternDiagramProblems[0]);
assert.equal(problemRegistry['MCV-001'], modifierConnectionViewerProblems[0]);
assert.equal(problemRegistry['MPO-001'], modifierPositionerProblems[0]);
assert.equal(problemRegistry['SC-001'], sentenceComparisonProblems[0]);
assert.equal(problemRegistry['EC-001'], errorCorrectorProblems[0]);
assert.equal(problemRegistry['CG-001'], contextGrammarProblems[0]);
assert.equal(problemRegistry['SG-001'], sentenceGeneratorProblems[0]);
assert.equal(problemRegistry['ST-002'], sentenceTransformerProblems[1]);
assert.equal(problemRegistry['WO-005'], wordOrderProblems[4]);
assert.equal(problemRegistry['EC-004'], errorCorrectorProblems[3]);
assert.equal(problemRegistry['SC-004'], sentenceComparisonProblems[3]);
assert.equal(problemRegistry['SG-004'], sentenceGeneratorProblems[3]);
assert.equal(problemRegistry['CG-004'], contextGrammarProblems[3]);
assert.equal(problemRegistry['ST-003'], sentenceTransformerProblems[2]);
assert.equal(problemRegistry['WO-006'], wordOrderProblems[5]);
assert.equal(problemRegistry['EC-005'], errorCorrectorProblems[4]);
assert.equal(problemRegistry['SG-005'], sentenceGeneratorProblems[4]);
assert.equal(problemRegistry['CG-005'], contextGrammarProblems[4]);
assert.equal(problemRegistry['WO-007'], wordOrderProblems[6]);
assert.equal(problemRegistry['GC-004'], grammarClassifierProblems[3]);
assert.equal(problemRegistry['MPO-004'], modifierPositionerProblems[3]);
assert.equal(problemRegistry['EC-006'], errorCorrectorProblems[5]);
assert.equal(problemRegistry['CG-006'], contextGrammarProblems[5]);
assert.equal(problemRegistry['WO-008'], wordOrderProblems[7]);
assert.equal(problemRegistry['MP-004'], markPartsProblems[3]);
assert.equal(problemRegistry['GC-005'], grammarClassifierProblems[4]);
assert.equal(problemRegistry['EC-007'], errorCorrectorProblems[6]);
assert.equal(problemRegistry['CG-007'], contextGrammarProblems[6]);
assert.equal(validateProblems(problems).valid, true);
assert.equal(validateDemoRegistry(demoRegistry, problemRegistry).valid, true);
for (const demo of Object.values(demoRegistry)) {
  assert.equal(typeof demo.mount, 'function');
  assert.equal(problemRegistry[demo.demoProblemId].type, Object.keys(demoRegistry).find((type) => demoRegistry[type] === demo));
}
assert.equal(getDemoProblem('word-order', 'WO-002').id, 'WO-002');
assert.equal(getDemoProblem('sentence-pattern-diagram', 'SPD-003').id, 'SPD-003');
assert.equal(getDemoProblem('modifier-connection-viewer', 'MCV-003').id, 'MCV-003');
assert.equal(getDemoProblem('modifier-positioner', 'MPO-003').id, 'MPO-003');
assert.equal(getDemoProblem('sentence-comparison', 'SC-003').id, 'SC-003');
assert.equal(getDemoProblem('error-corrector', 'EC-003').id, 'EC-003');
assert.equal(getDemoProblem('context-grammar', 'CG-003').id, 'CG-003');
assert.equal(getDemoProblem('sentence-generator', 'SG-003').id, 'SG-003');
assert.throws(() => getDemoProblem('word-order', 'MP-001'), /type mismatch/);

const sentencePatternProblem = sentencePatternDiagramProblems[0];
assert.deepEqual(buildPatternSlots(sentencePatternProblem.chunks, sentencePatternProblem.pattern), [
  { chunkId: 'subject', role: 'S' },
  { chunkId: 'verb', role: 'V' },
  { chunkId: 'object', role: 'O' },
]);
assert.equal(hasExploredAllChunks(sentencePatternProblem.chunks, new Set(['subject', 'verb'])), false);
assert.equal(hasExploredAllChunks(sentencePatternProblem.chunks, new Set(['subject', 'verb', 'object'])), true);
assert.deepEqual(
  getExploredRoles(sentencePatternDiagramProblems[2].chunks, new Set(['subject', 'indirect-object', 'direct-object'])),
  ['S', 'O'],
);

const modifierProblem = modifierConnectionViewerProblems[0];
assert.deepEqual(getRelationsForChunk(modifierProblem.relations, 'with-a-red-cap').map((relation) => relation.id), ['relation-1']);
assert.deepEqual(getRelationsForChunk(modifierProblem.relations, 'the-boy').map((relation) => relation.id), ['relation-1']);
assert.deepEqual(getRelationsForChunk(modifierProblem.relations, 'plays'), []);
assert.deepEqual(getRelatedChunkIds(modifierProblem.relations, 'with-a-red-cap'), ['the-boy']);
assert.deepEqual(getRelatedChunkIds(modifierProblem.relations, 'the-boy'), ['with-a-red-cap']);
assert.equal(hasExploredAllRelations(modifierProblem.relations, new Set()), false);
assert.equal(hasExploredAllRelations(modifierProblem.relations, new Set(['relation-1'])), true);

const modifierPositionerProblem = modifierPositionerProblems[0];
assert.equal(buildModifierPlacementSentence(modifierPositionerProblem, 'after-subject'), 'The students in the library are studying.');
assert.equal(buildModifierPlacementSentence(modifierPositionerProblem, 'sentence-end'), 'The students are studying in the library.');
assert.equal(isGoalMatchingPlacement(modifierPositionerProblem, 'after-subject'), true);
assert.equal(isGoalMatchingPlacement(modifierPositionerProblem, 'sentence-end'), false);
assert.equal(getModifierPlacement(modifierPositionerProblem, 'missing-placement'), null);
assert.equal(buildModifierPlacementSentence(modifierPositionerProblem, 'missing-placement'), null);
assert.equal(getPlacementRelation(modifierPositionerProblem, 'after-subject').targetId, 'the-students');
assert.equal(isGoalMatchingPlacement(modifierPositionerProblems[2], 'sentence-start'), true);
assert.equal(isGoalMatchingPlacement(modifierPositionerProblems[2], 'sentence-end'), true);
assert.equal(buildModifierPlacementSentence(modifierPositionerProblems[2], 'sentence-start'), 'On Sundays, they visit the museum.');
assert.equal(buildModifierPlacementSentence(modifierPositionerProblems[2], 'sentence-end'), 'They visit the museum on Sundays.');
assert.equal(buildModifierPlacementSentence(modifierPositionerProblems[3], 'sentence-start'), 'To learn English, I watch movies.');
assert.equal(buildModifierPlacementSentence(modifierPositionerProblems[3], 'sentence-end'), 'I watch movies to learn English.');
assert.equal(isGoalMatchingPlacement(modifierPositionerProblems[3], 'sentence-start'), true);
assert.equal(isGoalMatchingPlacement(modifierPositionerProblems[3], 'sentence-end'), true);

const comparisonProblem = sentenceComparisonProblems[0];
assert.equal(getDifferenceByChunkId(comparisonProblem.differences, 'a-2').id, 'purpose-action');
assert.equal(getDifferenceByChunkId(comparisonProblem.differences, 'b-2').id, 'purpose-action');
assert.equal(getDifferenceByChunkId(comparisonProblem.differences, 'a-1'), null);
assert.deepEqual(getChunkIdsForDifference(comparisonProblem.differences, 'purpose-action'), ['a-2', 'b-2']);
assert.deepEqual(getChunkIdsForDifference(comparisonProblem.differences, 'missing-difference'), []);
assert.equal(hasExploredAllDifferences(comparisonProblem.differences, new Set()), false);
assert.equal(hasExploredAllDifferences(comparisonProblem.differences, new Set(['purpose-action'])), true);
assert.equal(hasExploredAllDifferences(sentenceComparisonProblems[2].differences, new Set(['voice-form'])), false);
assert.equal(hasExploredAllDifferences(sentenceComparisonProblems[2].differences, new Set(['voice-form', 'subject-agent'])), true);

const errorProblem = errorCorrectorProblems[0];
const agreementCorrection = errorProblem.corrections[0];
assert.equal(getCorrectionByTokenId(errorProblem.corrections, 't2'), agreementCorrection);
assert.equal(getCorrectionByTokenId(errorProblem.corrections, 'missing-token'), null);
assert.equal(isAcceptedCorrection(agreementCorrection, 'o2'), true);
assert.equal(isAcceptedCorrection(agreementCorrection, 'o1'), false);
assert.equal(isAcceptedCorrection(null, 'o2'), false);
assert.equal(hasCompletedAllCorrections(errorProblem.corrections, new Map()), false);
assert.equal(hasCompletedAllCorrections(errorProblem.corrections, new Map([['agreement', 'o2']])), true);
assert.equal(hasCompletedAllCorrections(errorCorrectorProblems[2].corrections, new Map([['auxiliary-agreement', 'o2']])), false);
assert.equal(hasCompletedAllCorrections(errorCorrectorProblems[2].corrections, new Map([['auxiliary-agreement', 'o2'], ['past-participle', 'o5']])), true);
assert.equal(isAcceptedCorrection(errorCorrectorProblems[5].corrections[0], 'o16'), true);
assert.equal(isAcceptedCorrection(errorCorrectorProblems[5].corrections[0], 'o17'), false);
assert.equal(hasCompletedAllCorrections(errorCorrectorProblems[5].corrections, new Map([['infinitive-base-form', 'o16']])), true);
assert.equal(isAcceptedCorrection(errorCorrectorProblems[6].corrections[0], 'o19'), true);
assert.equal(isAcceptedCorrection(errorCorrectorProblems[6].corrections[0], 'o20'), false);
assert.equal(hasCompletedAllCorrections(errorCorrectorProblems[6].corrections, new Map([['gerund-after-enjoy', 'o19']])), true);
const errorStateTransition = new Map([['agreement', 'o2']]);
assert.equal(hasCompletedAllCorrections(errorProblem.corrections, errorStateTransition), true);
errorStateTransition.set('agreement', 'o1');
assert.equal(hasCompletedAllCorrections(errorProblem.corrections, errorStateTransition), false);
errorStateTransition.set('agreement', 'o2');
assert.equal(hasCompletedAllCorrections(errorProblem.corrections, errorStateTransition), true);

const contextProblem = contextGrammarProblems[0];
const contextStep = getScenarioStep(contextProblem.steps, 'cg001-step-1');
assert.equal(contextStep, contextProblem.steps[0]);
assert.equal(getScenarioStep(contextProblem.steps, 0), contextStep);
assert.equal(getScenarioStep(contextProblem.steps, 'missing-step'), null);
assert.equal(getScenarioChoice(contextStep, 'cg001-choice-1a'), contextStep.choices[0]);
assert.equal(getScenarioChoice(contextStep, 'missing-choice'), null);
assert.equal(isAcceptedScenarioChoice(contextStep, 'cg001-choice-1a'), true);
assert.equal(isAcceptedScenarioChoice(contextStep, 'cg001-choice-1b'), false);
assert.equal(hasCompletedScenario(contextProblem.steps, new Set()), false);
assert.equal(hasCompletedScenario(contextProblem.steps, new Set(['cg001-step-1'])), false);
assert.equal(hasCompletedScenario(contextProblem.steps, new Set(['cg001-step-1', 'cg001-step-2'])), true);
assert.equal(hasCompletedScenario(contextProblem.steps, new Set(['unknown-step'])), false);
const infinitiveContextProblem = contextGrammarProblems[5];
assert.equal(infinitiveContextProblem.steps.length, 3);
assert.equal(isAcceptedScenarioChoice(infinitiveContextProblem.steps[0], 'cg006-choice-1a'), true);
assert.equal(isAcceptedScenarioChoice(infinitiveContextProblem.steps[1], 'cg006-choice-2b'), false);
assert.equal(hasCompletedScenario(infinitiveContextProblem.steps, new Set(['cg006-step-1', 'cg006-step-2'])), false);
assert.equal(hasCompletedScenario(infinitiveContextProblem.steps, new Set(['cg006-step-1', 'cg006-step-2', 'cg006-step-3'])), true);
const gerundContextProblem = contextGrammarProblems[6];
assert.equal(gerundContextProblem.steps.length, 3);
assert.equal(isAcceptedScenarioChoice(gerundContextProblem.steps[0], 'cg007-choice-1a'), true);
assert.equal(isAcceptedScenarioChoice(gerundContextProblem.steps[1], 'cg007-choice-2a'), true);
assert.equal(isAcceptedScenarioChoice(gerundContextProblem.steps[2], 'cg007-choice-3a'), true);
assert.equal(isAcceptedScenarioChoice(gerundContextProblem.steps[2], 'cg007-choice-3b'), false);
assert.match(gerundContextProblem.steps[2].choices[1].explanation, /文法的/);
assert.equal(hasCompletedScenario(gerundContextProblem.steps, new Set(['cg007-step-1', 'cg007-step-2'])), false);
assert.equal(hasCompletedScenario(gerundContextProblem.steps, new Set(['cg007-step-1', 'cg007-step-2', 'cg007-step-3'])), true);

const generationProblem = sentenceGeneratorProblems[0];
assert.equal(hasCompleteGenerationState({}, generationProblem.controls), false);
assert.equal(
  hasCompleteGenerationState({ subject: 'he', tense: 'present', negative: false }, generationProblem.controls),
  true,
);
assert.equal(
  matchesGenerationTarget(
    { subject: 'he', tense: 'present', negative: false },
    generationProblem.targetStates[0],
    Object.keys(generationProblem.controls),
  ),
  true,
);
assert.equal(
  matchesGenerationTarget(
    { subject: 'they', tense: 'past', negative: false },
    generationProblem.targetStates[0],
    Object.keys(generationProblem.controls),
  ),
  false,
);
assert.equal(
  matchesGenerationTarget(
    { subject: 'he', tense: 'future', negative: false },
    generationProblem.targetStates[0],
    Object.keys(generationProblem.controls),
  ),
  false,
);
assert.equal(
  findMatchingTargetState(
    { subject: 'they', tense: 'past', negative: true },
    sentenceGeneratorProblems[2].targetStates,
    Object.keys(sentenceGeneratorProblems[2].controls),
  ),
  1,
);
assert.equal(findMatchingTargetState({}, generationProblem.targetStates, Object.keys(generationProblem.controls)), -1);

assert.equal(researchReferences.length, 7);
assert.equal(new Set(researchReferences.map((reference) => reference.id)).size, researchReferences.length);
assert.equal(validateResearchReferences(researchReferences).valid, true);
assert.equal(validateResearchRegistry(researchReferenceRegistry, researchReferences).valid, true);
assert.ok(interactions.filter((entry) => entry.researchRefs?.length).length >= 15);

const lessonValidation = validateLessons(lessons, {
  problemRegistry,
  problemTypes: new Set(Object.keys(demoRegistry)),
});
assert.equal(lessonValidation.valid, true, lessonValidation.errors.join('; '));
assert.equal(lessons.length, 6);
assert.equal(getLessonById('LESSON-002').slug, 'structural-reading');
assert.equal(getLessonBySlug('structural-reading').id, 'LESSON-002');
assert.equal(getLessonBySlug('structural-reading').steps.length, 6);
assert.equal(lessons[0].steps.length, 6);
assert.equal(getLessonById('LESSON-003').slug, 'modal-verbs');
assert.equal(getLessonBySlug('modal-verbs').steps.length, 6);
assert.equal(getLessonById('LESSON-004').slug, 'passive-voice');
assert.equal(getLessonBySlug('passive-voice').steps.length, 6);
assert.equal(getLessonById('LESSON-005').slug, 'infinitives');
assert.deepEqual(
  getLessonBySlug('infinitives').steps.map((step) => step.problemId),
  ['WO-007', 'GC-004', 'MPO-004', 'SC-001', 'EC-006', 'CG-006'],
);
assert.equal(getLessonById('LESSON-006').slug, 'gerunds');
assert.deepEqual(
  getLessonBySlug('gerunds').steps.map((step) => step.problemId),
  ['WO-008', 'MP-004', 'GC-005', 'SC-001', 'EC-007', 'CG-007'],
);
assert.equal(getLessonBySlug('gerunds').steps.length, 6);
assert.equal(getLessonBySlug('infinitives').steps[3].problemId, 'SC-001');
assert.equal(getLessonBySlug('gerunds').steps[3].problemId, 'SC-001');

const aiRetrievalIndex = createAiRetrievalIndex({
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});
const aiRetrievalValidation = validateAiRetrieval(aiRetrievalIndex, {
  interactions,
  problems,
  lessons,
  interactionRetrievalMetadata,
});
assert.equal(aiRetrievalValidation.valid, true, aiRetrievalValidation.errors.join('; '));
assert.equal(aiRetrievalIndex.version, '2');
assert.equal(aiRetrievalIndex.interactions.length, 40);
assert.equal(aiRetrievalIndex.problems.length, 53);
assert.equal(aiRetrievalIndex.lessons.length, 6);
assert.equal(aiRetrievalIndex.documents.length, 99);
assert.deepEqual(
  aiRetrievalIndex.interactions.find((record) => record.id === 'GRAM-INT-001').relations.problemIds,
  ['WO-001', 'WO-002', 'WO-003', 'WO-004', 'WO-005', 'WO-006', 'WO-007', 'WO-008'],
);
assert.deepEqual(
  aiRetrievalIndex.interactions.find((record) => record.id === 'GRAM-INT-014').relations.problemIds,
  ['MPO-001', 'MPO-002', 'MPO-003', 'MPO-004'],
);
const sentenceComparisonInteraction = aiRetrievalIndex.interactions.find((record) => record.id === 'GRAM-INT-008');
assert.deepEqual(sentenceComparisonInteraction.demoTypes, ['sentence-comparison']);
assert.deepEqual(sentenceComparisonInteraction.interactionPatterns, sentenceComparisonInteraction.interactionType);
const sentenceComparisonRecord = aiRetrievalIndex.problems.find((record) => record.id === 'SC-001');
assert.deepEqual(sentenceComparisonRecord.demoTypes, ['sentence-comparison']);
assert.deepEqual(sentenceComparisonRecord.relations.interactionIds, ['GRAM-INT-008']);
assert.deepEqual(sentenceComparisonRecord.relations.lessonIds, ['LESSON-005', 'LESSON-006']);
assert.deepEqual(aiRetrievalIndex.lessons.find((record) => record.id === 'LESSON-006').demoTypes, [
  'word-order',
  'mark-parts',
  'grammar-classifier',
  'sentence-comparison',
  'error-corrector',
  'context-grammar',
]);
assert.match(sentenceComparisonRecord.searchText, /stopped smoking/);
assert.match(sentenceComparisonRecord.searchText, /stopped to smoke/);
const modifierPositionerRecord = aiRetrievalIndex.interactions.find((record) => record.id === 'GRAM-INT-014');
assert.match(modifierPositionerRecord.searchText, /modifier/i);
assert.match(modifierPositionerRecord.searchText, /placement/i);
aiRetrievalIndex.interactions.forEach((record) => {
  assert.deepEqual(record.negativeTags, record.notBestFor);
  assert.deepEqual(record.tags, record.positiveTags);
  assert.equal(record.positiveTags.some((tag) => record.negativeTags.includes(tag)), false);
  record.negativeTags.forEach((tag) => assert.equal(record.searchText.includes(tag), false));
  assert.deepEqual(record.canonicalRef, { kind: 'interaction', id: record.id });
});
aiRetrievalIndex.documents.forEach((document) => {
  assert.deepEqual(document.canonicalRef, {
    kind: document.kind,
    id: document.id,
    ...(document.kind === 'problem' ? { type: document.type } : {}),
  });
});
const modifierPositionerDocument = aiRetrievalIndex.documents.find((document) => document.id === 'GRAM-INT-014');
assert.deepEqual(modifierPositionerDocument.negativeTags, modifierPositionerRecord.negativeTags);
const retrievalEvaluation = evaluateRetrievalBenchmarks(aiRetrievalIndex, retrievalBenchmarks);
assert.equal(retrievalEvaluation.failed, 0, JSON.stringify(retrievalEvaluation.results, null, 2));
assert.equal(retrievalEvaluation.results.filter((result) => result.id.startsWith('interaction-')).length, 6);
retrievalBenchmarks.forEach((benchmark) => {
  const results = searchRetrievalIndex(aiRetrievalIndex, benchmark.query);
  if (benchmark.expectEmpty) assert.equal(results.length, 0, benchmark.id);
  else assert.ok(results.length > 0, benchmark.id);
  assert.equal(results.every((result) => result.reasons.length > 0), true, benchmark.id);
});
const modifierQuery = retrievalBenchmarks.find((benchmark) => benchmark.id === 'interaction-modifier-placement').query;
assert.deepEqual(searchRetrievalIndex(aiRetrievalIndex, modifierQuery), searchRetrievalIndex(aiRetrievalIndex, modifierQuery));
const negativeRegressionResults = searchRetrievalIndex(aiRetrievalIndex, {
  kinds: ['interaction'],
  preferredTags: ['free-form-generation'],
  limit: 100,
});
assert.deepEqual(negativeRegressionResults, []);
assert.deepEqual(
  searchRetrievalIndex(aiRetrievalIndex, {
    kinds: ['interaction'],
    demoTypes: ['sentence-comparison'],
  }).map((result) => result.id),
  ['GRAM-INT-008'],
);
assert.deepEqual(
  searchRetrievalIndex(aiRetrievalIndex, {
    kinds: ['problem'],
    demoTypes: ['sentence-comparison'],
  }).map((result) => result.id),
  sentenceComparisonProblems.map((problem) => problem.id),
);
assert.deepEqual(
  searchRetrievalIndex(aiRetrievalIndex, {
    kinds: ['problem'],
    interactionTypes: ['sentence-comparison'],
  }),
  searchRetrievalIndex(aiRetrievalIndex, {
    kinds: ['problem'],
    demoTypes: ['sentence-comparison'],
  }),
);
assert.deepEqual(searchRetrievalIndex(aiRetrievalIndex, {
  kinds: ['interaction'],
  includeTerms: ['this-concept-does-not-exist-anywhere'],
}), []);
assert.equal(validateRetrievalQuery({}).valid, false);
assert.equal(validateRetrievalQuery({ kinds: ['unknown'] }).valid, false);
assert.equal(validateRetrievalQuery({ learningIntents: ['unknown-intent'] }).valid, false);
assert.equal(validateRetrievalQuery({ includeTerms: ['  '] }).valid, false);
assert.equal(validateRetrievalQuery({ kinds: ['interaction'], limit: 0 }).valid, false);
assert.equal(validateRetrievalQuery({ demoTypes: ['sentence-comparison'] }).valid, true);
assert.equal(validateRetrievalQuery({ interactionPatterns: ['side-by-side'] }).valid, true);
assert.equal(validateRetrievalQuery({ demoTypes: ['not a tag'] }).valid, false);
assert.equal(learningRequirementsContract.version, '1');
assert.equal(learningRequirementsFixtures.length, 2);
learningRequirementsFixtures.forEach((fixture) => {
  assert.deepEqual(validateLearningRequirements(fixture), validateLearningRequirements(fixture));
  assert.equal(validateLearningRequirements(fixture).valid, true);
});
const invalidLearningRequirementCases = [
  ['duplicate source id', (value) => { value.sourceReferences.push({ ...value.sourceReferences[0] }); }],
  ['duplicate learning point id', (value) => { value.learningPoints[1].id = value.learningPoints[0].id; }],
  ['unknown source id', (value) => { value.learningPoints[0].sourceEvidence[0].sourceId = 'SOURCE-UNKNOWN'; }],
  ['empty source evidence', (value) => { value.learningPoints[0].sourceEvidence = []; }],
  ['unknown importance', (value) => { value.learningPoints[0].importance = 'essential'; }],
  ['unknown outcome', (value) => { value.learningPoints[0].desiredOutcomes = ['memorize-fact']; }],
  ['empty locator', (value) => { value.learningPoints[0].sourceEvidence[0].locator = {}; }],
  ['max learning points', (value) => { value.constraints.maxLearningPoints = 2; }],
  ['atlas linkage', (value) => {
    value.interactionId = 'GRAM-INT-001';
    value.interactionIds = ['GRAM-INT-001'];
    value.problemId = 'WO-001';
    value.problemIds = ['WO-001'];
    value.lessonId = 'LESSON-001';
    value.lessonIds = ['LESSON-001'];
    value.demoType = 'word-order';
  }],
];
invalidLearningRequirementCases.forEach(([name, mutate]) => {
  const invalidFixture = structuredClone(learningRequirementsFixtures[0]);
  mutate(invalidFixture);
  assert.equal(validateLearningRequirements(invalidFixture).valid, false, name);
});
assert.deepEqual(learningRequirementsContract.requiredFields, ['version', 'id', 'topic', 'sourceReferences', 'learningPoints']);
assert.deepEqual(learningRequirementsContract.optionalFields, ['audience', 'constraints']);
assert.equal(learningRequirementsContract.fieldDefinitions.topic.type, 'string');
assert.equal(learningRequirementsContract.fieldDefinitions.topic.required, true);
assert.equal(typeof learningRequirementsContract.fieldDefinitions.topic.description, 'string');
assert.ok(learningRequirementsContract.example.learningPoints.length > 0);
assert.equal(validateOutcomeRetrievalProfiles(outcomeRetrievalProfiles).valid, true);
assert.equal(Object.keys(outcomeRetrievalProfiles).length, 12);
assert.equal(materialPlanContract.version, '1');
assert.deepEqual(materialPlanContract.actionValues, ['reuse', 'adapt', 'generate', 'unresolved']);
assert.equal(materialPlanContract.fieldDefinitions.items.type, 'array');
materialPlanFixtures.forEach((fixture, index) => {
  const validationResult = validateMaterialPlan(fixture, {
    learningRequirements: learningRequirementsFixtures[index],
    retrievalIndex: aiRetrievalIndex,
  });
  assert.equal(validationResult.valid, true, validationResult.errors.join('; '));
  assert.deepEqual(
    new Set(fixture.items.map((item) => item.learningPointId)),
    new Set(learningRequirementsFixtures[index].learningPoints.map((point) => point.id)),
  );
});
const comparisonLearningRequirements = structuredClone(learningRequirementsFixtures[0]);
comparisonLearningRequirements.learningPoints = [comparisonLearningRequirements.learningPoints[2]];
comparisonLearningRequirements.learningPoints[0].desiredOutcomes = ['compare-meaning'];
comparisonLearningRequirements.learningPoints[0].concept = 'meaning comparison';
const comparisonInteractionQuery = createInteractionQueryForLearningPoint(comparisonLearningRequirements.learningPoints[0], { includeTerms: false });
const comparisonProblemQuery = {
  kinds: ['problem'],
  demoTypes: ['sentence-comparison'],
  includeTerms: ['stopped smoking', 'stopped to smoke'],
  limit: 5,
};
const comparisonPlan = {
  version: '1',
  id: 'MATPLAN-SC-001',
  learningRequirementsRef: { id: comparisonLearningRequirements.id, version: comparisonLearningRequirements.version },
  items: [{
    id: 'MPI-SC-001',
    learningPointId: comparisonLearningRequirements.learningPoints[0].id,
    interactionSelection: captureRetrievalSelection(aiRetrievalIndex, comparisonInteractionQuery, {
      kind: 'interaction',
      id: 'GRAM-INT-008',
    }),
    problemDecision: {
      action: 'reuse',
      problemSelection: captureRetrievalSelection(aiRetrievalIndex, comparisonProblemQuery, {
        kind: 'problem',
        id: 'SC-001',
        type: 'sentence-comparison',
      }),
    },
    rationale: '意味の違いを左右の英文で比較する。',
  }],
};
assert.equal(validateMaterialPlan(comparisonPlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, true);
const evidenceMismatchPlan = structuredClone(materialPlanFixtures[0]);
evidenceMismatchPlan.items[0].interactionSelection.selected.score += 1;
assert.equal(validateMaterialPlan(evidenceMismatchPlan, {
  learningRequirements: learningRequirementsFixtures[0],
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const duplicateMaterialItemPlan = structuredClone(materialPlanFixtures[0]);
duplicateMaterialItemPlan.items[1].id = duplicateMaterialItemPlan.items[0].id;
assert.equal(validateMaterialPlan(duplicateMaterialItemPlan, {
  learningRequirements: learningRequirementsFixtures[0],
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const unknownLearningPointPlan = structuredClone(materialPlanFixtures[0]);
unknownLearningPointPlan.items[0].learningPointId = 'LP-UNKNOWN';
assert.equal(validateMaterialPlan(unknownLearningPointPlan, {
  learningRequirements: learningRequirementsFixtures[0],
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const noProblemForReusePlan = structuredClone(comparisonPlan);
delete noProblemForReusePlan.items[0].problemDecision.problemSelection;
assert.equal(validateMaterialPlan(noProblemForReusePlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const generateWithProblemPlan = structuredClone(comparisonPlan);
generateWithProblemPlan.items[0].problemDecision.action = 'generate';
generateWithProblemPlan.items[0].problemDecision.reason = '既存Problemでは不足する。';
assert.equal(validateMaterialPlan(generateWithProblemPlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const validGeneratePlan = structuredClone(comparisonPlan);
validGeneratePlan.items[0].problemDecision.action = 'generate';
validGeneratePlan.items[0].problemDecision.reason = '既存Problemでは不足する。';
delete validGeneratePlan.items[0].problemDecision.problemSelection;
assert.equal(validateMaterialPlan(validGeneratePlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, true);
const unresolvedWithProblemPlan = structuredClone(comparisonPlan);
unresolvedWithProblemPlan.items[0].problemDecision.action = 'unresolved';
unresolvedWithProblemPlan.items[0].problemDecision.reason = '実装済みComponentでは扱えない。';
assert.equal(validateMaterialPlan(unresolvedWithProblemPlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const adaptWithoutSourcePlan = structuredClone(comparisonPlan);
adaptWithoutSourcePlan.items[0].problemDecision.action = 'adapt';
delete adaptWithoutSourcePlan.items[0].problemDecision.problemSelection;
assert.equal(validateMaterialPlan(adaptWithoutSourcePlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const missingInteractionPlan = structuredClone(materialPlanFixtures[0]);
missingInteractionPlan.items[0].interactionSelection.selected.canonicalRef.id = 'GRAM-INT-999';
assert.equal(validateMaterialPlan(missingInteractionPlan, {
  learningRequirements: learningRequirementsFixtures[0],
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const unimplementedInteraction = aiRetrievalIndex.interactions.find((record) => record.demoTypes.length === 0);
assert.ok(unimplementedInteraction);
const unimplementedInteractionQuery = {
  kinds: ['interaction'],
  includeTerms: [unimplementedInteraction.title],
  limit: 100,
};
const unimplementedPlan = structuredClone(materialPlanFixtures[0]);
unimplementedPlan.items[0].interactionSelection = captureRetrievalSelection(
  aiRetrievalIndex,
  unimplementedInteractionQuery,
  unimplementedInteraction.canonicalRef,
);
assert.equal(validateMaterialPlan(unimplementedPlan, {
  learningRequirements: learningRequirementsFixtures[0],
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const mismatchedProblemTypePlan = structuredClone(comparisonPlan);
mismatchedProblemTypePlan.items[0].problemDecision.problemSelection.selected.canonicalRef.type = 'word-order';
assert.equal(validateMaterialPlan(mismatchedProblemTypePlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const fakeRankPlan = structuredClone(comparisonPlan);
fakeRankPlan.items[0].interactionSelection.selected.rank = 99;
assert.equal(validateMaterialPlan(fakeRankPlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const fakeScorePlan = structuredClone(comparisonPlan);
fakeScorePlan.items[0].interactionSelection.selected.score += 1;
assert.equal(validateMaterialPlan(fakeScorePlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
const fakeReasonsPlan = structuredClone(comparisonPlan);
fakeReasonsPlan.items[0].interactionSelection.selected.reasons = [];
assert.equal(validateMaterialPlan(fakeReasonsPlan, {
  learningRequirements: comparisonLearningRequirements,
  retrievalIndex: aiRetrievalIndex,
}).valid, false);
assert.deepEqual(
  createAiRetrievalIndex({ interactions, problems, lessons, interactionRetrievalMetadata }),
  aiRetrievalIndex,
);

assert.equal(validateRetrievalQuery(materialPlanContract.example.items[0].interactionSelection.query).valid, true);
const generatedProblemContext = problemGenerationContexts[0];
const adaptedProblemContext = problemGenerationContexts[1];
assert.equal(generatedProblemContext.materialPlan.items[0].problemDecision.action, 'generate');
const generatedProblemQuery = {
  kinds: ['problem'],
  demoTypes: ['word-order'],
  includeTerms: [generatedProblemContext.learningRequirements.learningPoints[0].concept],
  limit: 5,
};
const generatedProblemResults = searchRetrievalIndex(aiRetrievalIndex, generatedProblemQuery);
assert.equal(generatedProblemResults.some(hasProblemContentMatch), false);
assert.equal(problemGenerationContract.version, '1');
assert.deepEqual(problemGenerationContract.actionValues, ['generate', 'adapt']);
assert.deepEqual(problemGenerationContract.example, problemGenerationFixtures[0]);
assert.equal(validateProblemGeneration(problemGenerationContract.example, problemGenerationContexts[0]).valid, true);
problemGenerationFixtures.forEach((fixture, index) => {
  const result = validateProblemGeneration(fixture, problemGenerationContexts[index]);
  assert.equal(result.valid, true, result.errors.join('; '));
});
assert.deepEqual(
  createProblemGeneration({
    ...generatedProblemContext,
    candidateProblem: problemGenerationFixtures[0].candidateProblem,
    id: problemGenerationFixtures[0].id,
  }),
  problemGenerationFixtures[0],
);
assert.equal(createProblemGenerationContext(generatedProblemContext).action, 'generate');
assert.ok(createProblemGenerationContext(adaptedProblemContext).sourceProblemRef);
assert.equal(resolveCanonicalProblem(problems, { kind: 'problem', id: 'PROBLEM-UNKNOWN' }), null);
assert.equal(resolveCanonicalProblem(problems, { kind: 'problem', id: 'WO-001', type: 'error-corrector' }), null);
assert.equal(validateProblems([...problems, problemGenerationFixtures[0].candidateProblem]).valid, true);

const invalidGenerationCases = [
  ['wrong material plan reference', (value) => { value.materialPlanRef.id = 'MATPLAN-UNKNOWN'; }],
  ['unknown material plan item', (value) => { value.materialPlanItemId = 'MPI-UNKNOWN'; }],
  ['wrong learning point', (value) => { value.alignment.learningPointId = 'LP-UNKNOWN'; }],
  ['unknown source evidence', (value) => { value.alignment.sourceEvidenceRefs[0].sourceId = 'SOURCE-UNKNOWN'; }],
  ['candidate type mismatch', (value) => { value.candidateProblem.type = 'error-corrector'; }],
  ['candidate id collision', (value) => { value.candidateProblem.id = problems[0].id; }],
  ['candidate schema error', (value) => { delete value.candidateProblem.prompt; }],
];
invalidGenerationCases.forEach(([name, mutate]) => {
  const invalidGeneration = structuredClone(problemGenerationFixtures[0]);
  mutate(invalidGeneration);
  const result = validateProblemGeneration(invalidGeneration, generatedProblemContext);
  assert.equal(result.valid, false, name);
});

const reuseGenerationContext = structuredClone(adaptedProblemContext);
reuseGenerationContext.materialPlan.items[0].problemDecision = {
  action: 'reuse',
  problemSelection: structuredClone(adaptedProblemContext.materialPlan.items[0].problemDecision.sourceProblemSelection),
};
assert.equal(validateProblemGeneration(problemGenerationFixtures[1], reuseGenerationContext).valid, false);
const unresolvedGenerationContext = structuredClone(adaptedProblemContext);
unresolvedGenerationContext.materialPlan.items[0].problemDecision = {
  action: 'unresolved',
  reason: 'No implemented activity is available.',
};
assert.equal(validateProblemGeneration(problemGenerationFixtures[1], unresolvedGenerationContext).valid, false);

const invalidAdaptId = structuredClone(problemGenerationFixtures[1]);
invalidAdaptId.candidateProblem.id = adaptedProblemContext.materialPlan.items[0].problemDecision.sourceProblemSelection.selected.canonicalRef.id;
assert.equal(validateProblemGeneration(invalidAdaptId, adaptedProblemContext).valid, false);
const invalidAdaptType = structuredClone(problemGenerationFixtures[1]);
invalidAdaptType.candidateProblem.type = 'word-order';
assert.equal(validateProblemGeneration(invalidAdaptType, adaptedProblemContext).valid, false);
const canonicalProblemsBeforeGenerationValidation = structuredClone(problems);
assert.equal(validateProblemGeneration(problemGenerationFixtures[0], generatedProblemContext).valid, true);
assert.deepEqual(problems, canonicalProblemsBeforeGenerationValidation);
assert.deepEqual(
  createProblemGenerationContext(adaptedProblemContext).exampleProblemRefs[0],
  { kind: 'problem', id: 'SC-001', type: 'sentence-comparison' },
);

assert.equal(sameLocator({ section: 'A', page: 2 }, { page: 2, section: 'A' }), true);
const orderedLocatorGeneration = structuredClone(problemGenerationFixtures[0]);
const orderedLocatorContext = structuredClone(problemGenerationContexts[0]);
orderedLocatorContext.learningRequirements.learningPoints[0].sourceEvidence[0].locator = {
  section: 'Synthetic generation case',
  page: 2,
};
orderedLocatorGeneration.alignment.sourceEvidenceRefs[0].locator = {
  page: 2,
  section: 'Synthetic generation case',
};
assert.equal(validateProblemGeneration(orderedLocatorGeneration, orderedLocatorContext).valid, true);

assert.equal(lessonGenerationContract.version, '1');
assert.deepEqual(lessonGenerationContract.requiredFields, [
  'version',
  'id',
  'materialPlanRef',
  'problemGenerationRefs',
  'candidateLesson',
  'alignment',
]);
assert.equal(lessonGenerationContract.fieldDefinitions.candidateLesson.type, 'object');
assert.deepEqual(lessonGenerationContract.example, lessonGenerationFixtures[0]);
const lessonGenerationFixture = lessonGenerationFixtures[0];
const lessonGenerationContext = lessonGenerationContexts[0];
assert.equal(validateLessonGeneration(lessonGenerationFixture, lessonGenerationContext).valid, true);
assert.deepEqual(
  createLessonGenerationContext(lessonGenerationContext),
  createLessonGenerationContext(lessonGenerationContext),
);
assert.deepEqual(
  createLessonGeneration({
    context: createLessonGenerationContext(lessonGenerationContext),
    candidateLesson: lessonGenerationFixture.candidateLesson,
    id: lessonGenerationFixture.id,
    rationale: lessonGenerationFixture.alignment.rationale,
  }),
  lessonGenerationFixture,
);
const resolvedMixedProblems = resolveMaterialPlanProblems(lessonGenerationContext);
assert.deepEqual(resolvedMixedProblems.resolvedItems.map((item) => item.problemRef.id), [
  'SC-001',
  'GEN-MIX-WO-001',
  'GEN-MIX-SC-001',
]);
assert.deepEqual(resolvedMixedProblems.generatedProblemRefs.map((reference) => reference.id), ['PGEN-MIX-B', 'PGEN-MIX-C']);
assert.equal(validateProblems([...problems, ...resolvedMixedProblems.generatedProblems]).valid, true);
const resolvedProblemRegistry = createResolvedProblemRegistry({
  canonicalProblems: problems,
  generatedProblems: resolvedMixedProblems.generatedProblems,
});
assert.equal(validateLessons([...lessons, lessonGenerationFixture.candidateLesson], {
  problemRegistry: resolvedProblemRegistry,
  problemTypes: new Set(Object.keys(demoRegistry)),
}).valid, true);

function assertInvalidLessonGeneration(name, mutateGeneration = () => {}, mutateContext = () => {}) {
  const invalidGeneration = structuredClone(lessonGenerationFixture);
  const invalidContext = structuredClone(lessonGenerationContext);
  mutateGeneration(invalidGeneration);
  mutateContext(invalidContext);
  assert.equal(validateLessonGeneration(invalidGeneration, invalidContext).valid, false, name);
}

assertInvalidLessonGeneration('unresolved item', () => {}, (context) => {
  context.materialPlan.items[0].problemDecision = {
    action: 'unresolved',
    reason: 'No implemented activity is available.',
  };
});
assertInvalidLessonGeneration('missing Problem Generation', () => {}, (context) => {
  context.problemGenerations = [context.problemGenerations[1]];
});
assertInvalidLessonGeneration('duplicate Problem Generation for same item', () => {}, (context) => {
  const duplicate = structuredClone(context.problemGenerations[0]);
  duplicate.id = 'PGEN-MIX-B-DUP';
  context.problemGenerations.push(duplicate);
});
assertInvalidLessonGeneration('Problem Generation ref version mismatch', (generation) => {
  generation.problemGenerationRefs[0].version = '2';
});
assertInvalidLessonGeneration('extra unused Problem Generation ref', (generation) => {
  generation.problemGenerationRefs.push({ id: 'PGEN-UNUSED', version: '1' });
});
assertInvalidLessonGeneration('cross-generated Problem ID collision', () => {}, (context) => {
  context.problemGenerations[1].candidateProblem.id = context.problemGenerations[0].candidateProblem.id;
});
assertInvalidLessonGeneration('candidate Lesson ID collision with Canonical', (generation) => {
  generation.candidateLesson.id = lessons[0].id;
});
assertInvalidLessonGeneration('candidate Lesson slug collision with Canonical', (generation) => {
  generation.candidateLesson.slug = lessons[0].slug;
});
assertInvalidLessonGeneration('unknown Problem in step', (generation) => {
  generation.candidateLesson.steps[0].problemId = 'PROBLEM-UNKNOWN';
});
assertInvalidLessonGeneration('Problem type and interactionType mismatch', (generation) => {
  generation.candidateLesson.steps[0].interactionType = 'word-order';
});
assertInvalidLessonGeneration('unauthorized Material Plan outside Problem', (generation) => {
  generation.candidateLesson.steps[0].problemId = 'WO-001';
});
assertInvalidLessonGeneration('stepMappings missing', (generation) => {
  delete generation.alignment.stepMappings;
});
assertInvalidLessonGeneration('duplicate step mapping', (generation) => {
  generation.alignment.stepMappings[1].materialPlanItemId = generation.alignment.stepMappings[0].materialPlanItemId;
});
assertInvalidLessonGeneration('unknown materialPlanItemId', (generation) => {
  generation.alignment.stepMappings[0].materialPlanItemId = 'MPI-UNKNOWN';
});
assertInvalidLessonGeneration('unknown lessonStepId', (generation) => {
  generation.alignment.stepMappings[0].lessonStepId = 'STEP-UNKNOWN';
});
assertInvalidLessonGeneration('step order mismatch', (generation) => {
  [generation.candidateLesson.steps[0], generation.candidateLesson.steps[1]] = [
    generation.candidateLesson.steps[1],
    generation.candidateLesson.steps[0],
  ];
});
assertInvalidLessonGeneration('generated item uses canonical Problem', (generation) => {
  generation.candidateLesson.steps[1].problemId = 'WO-007';
});
assertInvalidLessonGeneration('reuse item uses different Problem', (generation) => {
  generation.candidateLesson.steps[0].problemId = 'SC-002';
});
assertInvalidLessonGeneration('candidateLesson steps count mismatch', (generation) => {
  generation.candidateLesson.steps.pop();
});
const canonicalProblemsBeforeLessonGeneration = structuredClone(problems);
const canonicalLessonsBeforeLessonGeneration = structuredClone(lessons);
assert.equal(validateLessonGeneration(lessonGenerationFixture, lessonGenerationContext).valid, true);
assert.deepEqual(problems, canonicalProblemsBeforeLessonGeneration);
assert.deepEqual(lessons, canonicalLessonsBeforeLessonGeneration);

const e2eInput = {
  ...structuredClone(e2eMaterialGenerationFixture),
  retrievalIndex: aiRetrievalIndex,
  canonicalProblems: problems,
  canonicalLessons: lessons,
};
const e2eSourceTraceability = validateSyntheticSourceTraceability(
  e2eInput.grammarReference,
  e2eInput.learningRequirements,
);
assert.equal(e2eSourceTraceability.valid, true, e2eSourceTraceability.errors.join('; '));
const e2eValidation = validateMaterialGenerationProof(e2eInput);
assert.equal(e2eValidation.valid, true, e2eValidation.errors.join('; '));
const e2eProof = runMaterialGenerationProof(e2eInput);
assert.equal(e2eProof.valid, true, e2eProof.errors.join('; '));
assert.deepEqual(e2eProof, runMaterialGenerationProof(e2eInput));
assert.equal(e2eProof.proof.grammarReference.type, 'synthetic-text');
assert.equal(e2eProof.proof.grammarReference.sourceId, 'SOURCE-E2E-001');
assert.deepEqual(e2eProof.proof.summary.reusedProblemIds, ['SC-001']);
assert.deepEqual(e2eProof.proof.summary.generatedProblemIds, ['E2E-WO-001', 'E2E-EC-001']);
assert.deepEqual(e2eProof.proof.summary.unresolvedItemIds, []);
assert.equal(e2eProof.proof.summary.learningPointCount, 3);
assert.equal(e2eProof.proof.summary.materialPlanItemCount, 3);
assert.equal(e2eProof.proof.summary.candidateLessonId, 'E2E-LESSON-001');
assert.deepEqual(e2eProof.proof.validation, {
  sourceTraceability: true,
  learningRequirements: true,
  materialPlan: true,
  problemGenerations: true,
  lessonGeneration: true,
});
assert.deepEqual(e2eProof.resolved.problemRefs.map((reference) => reference.id), [
  'SC-001',
  'E2E-WO-001',
  'E2E-EC-001',
]);
assert.deepEqual(
  e2eInput.generatedProblemCandidates.map((candidate) => candidate.materialPlanItemId),
  ['MPI-002', 'MPI-003'],
);
e2eProof.resolved.candidateLesson.steps.forEach((step) => assert.ok(demoRegistry[step.interactionType]));
assert.equal(e2eProof.outputs.materialPlan.items.some((item) => item.problemDecision.action === 'reuse'), true);
assert.equal(e2eProof.outputs.materialPlan.items.some((item) => item.problemDecision.action === 'generate'), true);
assert.equal(validateProblems([
  ...problems,
  ...e2eProof.outputs.problemGenerations.map((generation) => generation.candidateProblem),
]).valid, true);
assert.equal(getLessonBySlug('verb-patterns-proof'), undefined);
assert.equal(getProblemById('E2E-WO-001'), undefined);
assert.equal(getProblemById('E2E-EC-001'), undefined);
const runtimePreviewModel = createRuntimePreviewModel(e2eProof.proof, {
  canonicalProblems: problems,
  canonicalLessons: lessons,
  problemTypes: new Set(Object.keys(demoRegistry)),
});
assert.deepEqual(runtimePreviewModel, createRuntimePreviewModel(e2eProof.proof, {
  canonicalProblems: problems,
  canonicalLessons: lessons,
  problemTypes: new Set(Object.keys(demoRegistry)),
}));
assert.equal(runtimePreviewModel.lesson.id, 'E2E-LESSON-001');
assert.deepEqual(Object.keys(runtimePreviewModel.transientProblemRegistry).filter((id) => id.startsWith('E2E-')), [
  'E2E-WO-001',
  'E2E-EC-001',
]);
assert.deepEqual(runtimePreviewModel.lesson.steps.map((step) => runtimePreviewModel.transientProblemRegistry[step.problemId]?.id ?? step.problemId), [
  'SC-001',
  'E2E-WO-001',
  'E2E-EC-001',
]);
assert.throws(() => createRuntimePreviewModel({ ...e2eProof.proof, valid: false }, {
  canonicalProblems: problems,
  canonicalLessons: lessons,
  problemTypes: new Set(Object.keys(demoRegistry)),
}), /valid proof/);
assert.throws(() => createRuntimePreviewModel({
  ...e2eProof.proof,
  outputs: { ...e2eProof.proof.outputs, lessonGeneration: { ...e2eProof.proof.outputs.lessonGeneration, candidateLesson: null } },
}, {
  canonicalProblems: problems,
  canonicalLessons: lessons,
  problemTypes: new Set(Object.keys(demoRegistry)),
}), /outputs are incomplete/);
const runtimeTypeMismatchProof = structuredClone(e2eProof.proof);
runtimeTypeMismatchProof.outputs.problemGenerations[0].candidateProblem.type = 'error-corrector';
assert.throws(() => createRuntimePreviewModel(runtimeTypeMismatchProof, {
  canonicalProblems: problems,
  canonicalLessons: lessons,
  problemTypes: new Set(Object.keys(demoRegistry)),
}), /Runtime Problems are invalid/);
const runtimeUnresolvedStepProof = structuredClone(e2eProof.proof);
runtimeUnresolvedStepProof.outputs.lessonGeneration.candidateLesson.steps[1].problemId = 'E2E-MISSING-001';
assert.throws(() => createRuntimePreviewModel(runtimeUnresolvedStepProof, {
  canonicalProblems: problems,
  canonicalLessons: lessons,
  problemTypes: new Set(Object.keys(demoRegistry)),
}), /Runtime Lesson is invalid/);
const runtimeSummaryMismatchProof = structuredClone(e2eProof.proof);
runtimeSummaryMismatchProof.summary.materialPlanItemCount = 2;
assert.throws(() => createRuntimePreviewModel(runtimeSummaryMismatchProof, {
  canonicalProblems: problems,
  canonicalLessons: lessons,
  problemTypes: new Set(Object.keys(demoRegistry)),
}), /Material Plan summary/);

function assertInvalidE2eProof(name, mutate) {
  const invalidInput = {
    ...structuredClone(e2eMaterialGenerationFixture),
    retrievalIndex: structuredClone(aiRetrievalIndex),
    canonicalProblems: structuredClone(problems),
    canonicalLessons: structuredClone(lessons),
  };
  mutate(invalidInput);
  assert.equal(runMaterialGenerationProof(invalidInput).valid, false, name);
}

assertInvalidE2eProof('negative source traceability', (input) => {
  input.learningRequirements.learningPoints[0].sourceEvidence[0].locator.section = 'Missing E2E section';
});
assertInvalidE2eProof('negative unresolved Material Plan', (input) => {
  input.retrievalIndex.interactions.forEach((record) => { record.demoTypes = []; });
});
assertInvalidE2eProof('negative generated Problem schema', (input) => {
  delete input.generatedProblemCandidates[0].candidateProblem.prompt;
});
assertInvalidE2eProof('negative candidate Problem ID collision', (input) => {
  input.generatedProblemCandidates[0].candidateProblem.id = 'SC-001';
});
assertInvalidE2eProof('negative candidate unknown Material Plan item', (input) => {
  input.generatedProblemCandidates[0].materialPlanItemId = 'MPI-UNKNOWN';
});
assertInvalidE2eProof('negative duplicate candidate for Material Plan item', (input) => {
  input.generatedProblemCandidates.push(structuredClone(input.generatedProblemCandidates[0]));
});
assertInvalidE2eProof('negative candidate Lesson unauthorized Problem', (input) => {
  input.candidateLesson.steps[0].problemId = 'WO-001';
});
const canonicalProblemsBeforeE2e = structuredClone(problems);
const canonicalLessonsBeforeE2e = structuredClone(lessons);
assert.deepEqual(e2eProof.outputs.learningRequirements, e2eInput.learningRequirements);
assert.deepEqual(problems, canonicalProblemsBeforeE2e);
assert.deepEqual(lessons, canonicalLessonsBeforeE2e);

const lessonProgress = lessons[0];
const emptyLessonProgress = new Set();
assert.deepEqual(getLessonProgress(lessonProgress, emptyLessonProgress), {
  completedCount: 0,
  totalCount: 6,
  percentage: 0,
  allComplete: false,
});
const firstStepProgress = markLessonStepComplete(emptyLessonProgress, lessonProgress.steps[0].id);
assert.equal(emptyLessonProgress.has(lessonProgress.steps[0].id), false);
assert.equal(isLessonStepComplete(firstStepProgress, lessonProgress.steps[0].id), true);
assert.equal(getLessonProgress(lessonProgress, firstStepProgress).completedCount, 1);
const repeatedStepProgress = markLessonStepComplete(firstStepProgress, lessonProgress.steps[0].id);
assert.equal(getLessonProgress(lessonProgress, repeatedStepProgress).completedCount, 1);
const twoStepProgress = markLessonStepComplete(repeatedStepProgress, lessonProgress.steps[1].id);
assert.equal(getLessonProgress(lessonProgress, twoStepProgress).completedCount, 2);
assert.equal(getLessonProgress(lessonProgress, twoStepProgress).percentage, 33);
const allStepProgress = lessonProgress.steps.reduce(
  (completedStepIds, step) => markLessonStepComplete(completedStepIds, step.id),
  emptyLessonProgress,
);
assert.deepEqual(getLessonProgress(lessonProgress, allStepProgress), {
  completedCount: 6,
  totalCount: 6,
  percentage: 100,
  allComplete: true,
});
assert.equal(getLessonProgress(lessonProgress, new Set(['unknown-step'])).completedCount, 0);

assert.equal(checkWordOrder(['i', 'play', 'tennis'], [['i', 'play', 'tennis']]), true);
assert.equal(checkWordOrder(['play', 'i', 'tennis'], [['i', 'play', 'tennis']]), false);
assert.equal(checkTokenSelection(['boy', 'the'], ['the', 'boy']), true);
assert.equal(checkTokenSelection(['the', 'plays'], ['the', 'boy']), false);

const shuffled = shuffleWordIds(['i', 'play', 'tennis'], [['i', 'play', 'tennis']], () => 0.5);
assert.deepEqual([...shuffled].sort(), ['i', 'play', 'tennis']);
assert.notDeepEqual(shuffled, ['i', 'play', 'tennis']);
assert.deepEqual(shuffleWordIds(['only'], ['only'], () => 0), ['only']);

for (const problem of wordOrderProblems) {
  assert.equal(checkWordOrder(problem.acceptedAnswers[0], problem.acceptedAnswers), true);
  assert.equal(shuffleWordIds(problem.words.map((word) => word.id), problem.acceptedAnswers).length, problem.words.length);
}

const multipleAnswerProblem = wordOrderProblems.find((problem) => problem.id === 'WO-004');
assert.equal(checkWordOrder(multipleAnswerProblem.acceptedAnswers[0], multipleAnswerProblem.acceptedAnswers), true);
assert.equal(checkWordOrder(multipleAnswerProblem.acceptedAnswers[1], multipleAnswerProblem.acceptedAnswers), true);
assert.equal(checkWordOrder(['they', 'the-museum', 'visit', 'on-sundays'], multipleAnswerProblem.acceptedAnswers), false);
assert.equal(checkWordOrder(['they', 'visit', 'the-museum'], multipleAnswerProblem.acceptedAnswers), false);
assert.equal(checkWordOrder(['they', 'visit', 'the-museum', 'on-sundays', 'extra'], multipleAnswerProblem.acceptedAnswers), false);
const shuffledMultiple = shuffleWordIds(
  multipleAnswerProblem.words.map((word) => word.id),
  multipleAnswerProblem.acceptedAnswers,
  () => 0.5,
);
assert.deepEqual([...shuffledMultiple].sort(), multipleAnswerProblem.words.map((word) => word.id).sort());
assert.equal(multipleAnswerProblem.acceptedAnswers.some((answer) => answer.join('|') === shuffledMultiple.join('|')), false);
for (const problem of markPartsProblems) {
  assert.equal(checkTokenSelection(problem.answer, problem.answer), true);
}
assert.equal(checkTokenSelection(markPartsProblems[3].answer, ['reading', 'books']), true);
assert.equal(checkTokenSelection(['reading'], markPartsProblems[3].answer), false);

const correctAssignments = Object.fromEntries(grammarClassifierProblem.items.map((item) => [item.id, item.answer]));
assert.equal(checkClassification(correctAssignments, grammarClassifierProblem.items), true);
assert.equal(checkClassification({ ...correctAssignments, plays: 'object' }, grammarClassifierProblem.items), false);
const incompleteAssignments = { ...correctAssignments };
delete incompleteAssignments['after-school'];
assert.equal(checkClassification(incompleteAssignments, grammarClassifierProblem.items), false);
assert.equal(checkClassification({ ...correctAssignments, extra: 'subject' }, grammarClassifierProblem.items), false);
const gerundClassifierProblem = grammarClassifierProblems[4];
const gerundAssignments = Object.fromEntries(gerundClassifierProblem.items.map((item) => [item.id, item.answer]));
assert.equal(checkClassification(gerundAssignments, gerundClassifierProblem.items), true);
assert.equal(checkClassification({ ...gerundAssignments, cooking: 'subject' }, gerundClassifierProblem.items), false);

const validInteractions = validateInteractions(interactions, {
  registryKeys: Object.keys(demoRegistry),
  researchRegistry: researchReferenceRegistry,
});
assert.equal(validInteractions.valid, true, validInteractions.errors.join('; '));
const cloneInteractions = () => interactions.map((entry) => ({ ...entry, targetGrammar: [...entry.targetGrammar] }));
const duplicateId = cloneInteractions();
duplicateId[1].id = duplicateId[0].id;
assert.equal(validateInteractions(duplicateId).valid, false);
const duplicateSlug = cloneInteractions();
duplicateSlug[1].slug = duplicateSlug[0].slug;
assert.equal(validateInteractions(duplicateSlug).valid, false);
const invalidCategory = cloneInteractions();
invalidCategory[0].category = 'unknown';
assert.equal(validateInteractions(invalidCategory).valid, false);
const invalidDifficulty = cloneInteractions();
invalidDifficulty[0].implementationDifficulty = 6;
assert.equal(validateInteractions(invalidDifficulty).valid, false);
const invalidRank = cloneInteractions();
invalidRank[0].reusability = 'X';
assert.equal(validateInteractions(invalidRank).valid, false);
const missingDescription = cloneInteractions();
missingDescription[0].description = '';
assert.equal(validateInteractions(missingDescription).valid, false);
const emptyTargetGrammar = cloneInteractions();
emptyTargetGrammar[0].targetGrammar = [];
assert.equal(validateInteractions(emptyTargetGrammar).valid, false);
const blankInteractionType = cloneInteractions();
blankInteractionType[0].interactionType = [''];
assert.equal(validateInteractions(blankInteractionType).valid, false);
const invalidResearchStatus = cloneInteractions();
invalidResearchStatus[0].researchStatus = 'pending';
assert.equal(validateInteractions(invalidResearchStatus).valid, false);
const verifiedLicenseWithoutName = cloneInteractions();
verifiedLicenseWithoutName[0].licenseStatus = 'verified';
assert.equal(validateInteractions(verifiedLicenseWithoutName).valid, false);
const unknownLicenseWithName = cloneInteractions();
unknownLicenseWithName[0].licenseStatus = 'unknown';
unknownLicenseWithName[0].license = 'MIT';
assert.equal(validateInteractions(unknownLicenseWithName).valid, false);
const repositoryWithoutUrl = cloneInteractions();
repositoryWithoutUrl[0].sourceType = 'repository';
assert.equal(validateInteractions(repositoryWithoutUrl).valid, false);
const missingDemo = cloneInteractions();
missingDemo[0].demoType = 'missing-demo';
assert.equal(validateInteractions(missingDemo, { registryKeys: Object.keys(demoRegistry) }).valid, false);
const unknownResearchReference = cloneInteractions();
unknownResearchReference[0].researchRefs = ['REF-MISSING'];
assert.equal(validateInteractions(unknownResearchReference, { researchRegistry: researchReferenceRegistry }).valid, false);

const invalidResearchLicense = structuredClone(researchReferences);
delete invalidResearchLicense[0].license;
assert.equal(validateResearchReferences(invalidResearchLicense).valid, false);
const invalidResearchRepositoryUrl = structuredClone(researchReferences);
delete invalidResearchRepositoryUrl[0].repositoryUrl;
assert.equal(validateResearchReferences(invalidResearchRepositoryUrl).valid, false);
const invalidObservedPatterns = structuredClone(researchReferences);
invalidObservedPatterns[0].observedPatterns = [];
assert.equal(validateResearchReferences(invalidObservedPatterns).valid, false);
const invalidVerifiedAt = structuredClone(researchReferences);
invalidVerifiedAt[0].verifiedAt = '2026/09/13';
assert.equal(validateResearchReferences(invalidVerifiedAt).valid, false);

const sentenceCases = [
  [{ subject: 'he', tense: 'present', negative: false }, 'He plays tennis.'],
  [{ subject: 'they', tense: 'present', negative: false }, 'They play tennis.'],
  [{ subject: 'he', tense: 'past', negative: false }, 'He played tennis.'],
  [{ subject: 'they', tense: 'past', negative: false }, 'They played tennis.'],
  [{ subject: 'he', tense: 'present', negative: true }, 'He does not play tennis.'],
  [{ subject: 'they', tense: 'present', negative: true }, 'They do not play tennis.'],
  [{ subject: 'he', tense: 'past', negative: true }, 'He did not play tennis.'],
  [{ subject: 'they', tense: 'past', negative: true }, 'They did not play tennis.'],
  [{ subject: 'he', modal: 'can', negative: false }, 'He can play tennis.'],
  [{ subject: 'he', modal: 'can', negative: true }, 'He cannot play tennis.'],
  [{ subject: 'they', modal: 'should', negative: false }, 'They should play tennis.'],
  [{ subject: 'he', modal: 'must', negative: true }, 'He must not play tennis.'],
  [{ subject: 'they', modal: 'could', negative: false }, 'They could play tennis.'],
];

for (const [state, expected] of sentenceCases) {
  assert.equal(generateSentence(state), expected);
}
assert.equal(
  generateSentence({ subject: 'they', tense: 'past', negative: false }, sentenceTransformerProblem.sentenceModel),
  'They played tennis.',
);
assert.equal(
  generateSentence({ subject: 'he', modal: 'can', negative: false }, sentenceTransformerProblem.sentenceModel),
  'He can play tennis.',
);
assert.equal(
  generateSentence({ subject: 'he', modal: 'can', negative: true }, sentenceTransformerProblem.sentenceModel),
  'He cannot play tennis.',
);
const modalOnlySentenceModel = structuredClone(sentenceTransformerProblems[1].sentenceModel);
assert.equal(Object.hasOwn(modalOnlySentenceModel.verb, 'past'), false);
assert.equal(
  generateSentence({ subject: 'he', modal: 'can', negative: false }, modalOnlySentenceModel),
  'He can play tennis.',
);
assert.equal(getGrammarStateMode({ subject: 'he', tense: 'present' }), 'tense');
assert.equal(getGrammarStateMode({ subject: 'he', modal: 'can' }), 'modal');
assert.equal(getGrammarStateMode({ tense: 'present', modal: 'can' }), 'invalid');
assert.equal(SUPPORTED_TENSES.has('past'), true);
assert.equal(SUPPORTED_MODALS.has('could'), true);
assert.equal(SUPPORTED_VOICES.includes('passive'), true);
assert.equal(getControlLabel('modal'), 'Modal');
assert.equal(getControlLabel('voice'), 'Voice');
assert.throws(() => generateSentence({ subject: 'he', modal: 'might', negative: false }), /Unsupported sentence state/);
assert.throws(() => generateSentence({ subject: 'he', tense: 'past', modal: 'can', negative: false }), /Unsupported sentence state/);

const passiveSentenceModel = sentenceTransformerProblems[2].sentenceModel;
assert.equal(
  generateSentence({ tense: 'present', voice: 'active' }, passiveSentenceModel),
  'The teacher writes the report.',
);
assert.equal(
  generateSentence({ tense: 'past', voice: 'active' }, passiveSentenceModel),
  'The teacher wrote the report.',
);
assert.equal(
  generateSentence({ tense: 'present', voice: 'passive' }, passiveSentenceModel),
  'The report is written by the teacher.',
);
assert.equal(
  generateSentence({ tense: 'past', voice: 'passive' }, passiveSentenceModel),
  'The report was written by the teacher.',
);
const pluralPatientModel = structuredClone(passiveSentenceModel);
pluralPatientModel.roles.patient.label = 'the reports';
pluralPatientModel.roles.patient.number = 'plural';
assert.equal(
  generateSentence({ tense: 'present', voice: 'passive' }, pluralPatientModel),
  'The reports are written by the teacher.',
);
assert.equal(
  generateSentence({ tense: 'past', voice: 'passive' }, pluralPatientModel),
  'The reports were written by the teacher.',
);
assert.throws(() => generateSentence({ tense: 'present', voice: 'future' }, passiveSentenceModel), /Unsupported sentence state/);
assert.throws(() => generateSentence({ tense: 'present', voice: 'passive', modal: 'can' }, passiveSentenceModel), /Unsupported sentence state/);
assert.throws(() => generateSentence({ tense: 'present', voice: 'passive', negative: true }, passiveSentenceModel), /Unsupported sentence state/);
assert.throws(() => generateSentence({ tense: 'present', voice: 'passive' }, sentenceTransformerProblem.sentenceModel), /Unsupported sentence state/);

const invalidWordId = structuredClone(problems);
invalidWordId[0].words[1].id = invalidWordId[0].words[0].id;
assert.equal(validateProblems(invalidWordId).valid, false);
const unknownWordAnswer = structuredClone(problems);
unknownWordAnswer[0].acceptedAnswers = [['missing-word']];
assert.equal(validateProblems(unknownWordAnswer).valid, false);
const duplicateAcceptedAnswer = structuredClone(wordOrderProblems);
duplicateAcceptedAnswer[0].acceptedAnswers.push([...duplicateAcceptedAnswer[0].acceptedAnswers[0]]);
assert.equal(validateProblems(duplicateAcceptedAnswer).valid, false);
const invalidAcceptedAnswers = structuredClone(wordOrderProblems);
invalidAcceptedAnswers[0].acceptedAnswers = [];
assert.equal(validateProblems(invalidAcceptedAnswers).valid, false);
const incompleteAcceptedAnswer = structuredClone(wordOrderProblems);
incompleteAcceptedAnswer[0].acceptedAnswers = [['i', 'play', 'play']];
assert.equal(validateProblems(incompleteAcceptedAnswer).valid, false);
const invalidHintsEmpty = structuredClone(wordOrderProblems);
invalidHintsEmpty[3].hints = [];
assert.equal(validateProblems(invalidHintsEmpty).valid, false);
const invalidHintsBlank = structuredClone(wordOrderProblems);
invalidHintsBlank[3].hints = [''];
assert.equal(validateProblems(invalidHintsBlank).valid, false);
const invalidDuplicateChunkId = structuredClone(sentencePatternDiagramProblems);
invalidDuplicateChunkId[0].chunks[1].id = invalidDuplicateChunkId[0].chunks[0].id;
assert.equal(validateProblems(invalidDuplicateChunkId).valid, false);
const invalidPatternRole = structuredClone(sentencePatternDiagramProblems);
invalidPatternRole[0].pattern[1] = 'X';
assert.equal(validateProblems(invalidPatternRole).valid, false);
const emptyPatternChunks = structuredClone(sentencePatternDiagramProblems);
emptyPatternChunks[0].chunks = [];
assert.equal(validateProblems(emptyPatternChunks).valid, false);
const invalidModifierChunkId = structuredClone(modifierConnectionViewerProblems);
invalidModifierChunkId[0].chunks[1].id = invalidModifierChunkId[0].chunks[0].id;
assert.equal(validateProblems(invalidModifierChunkId).valid, false);
const invalidRelationId = structuredClone(modifierConnectionViewerProblems);
invalidRelationId[1].relations[0].id = 'missing-relation-id';
invalidRelationId[1].relations.push({ ...invalidRelationId[1].relations[0] });
assert.equal(validateProblems(invalidRelationId).valid, false);
const unknownModifierReference = structuredClone(modifierConnectionViewerProblems);
unknownModifierReference[0].relations[0].modifierId = 'missing-modifier';
assert.equal(validateProblems(unknownModifierReference).valid, false);
const selfModifierReference = structuredClone(modifierConnectionViewerProblems);
selfModifierReference[0].relations[0].targetId = selfModifierReference[0].relations[0].modifierId;
assert.equal(validateProblems(selfModifierReference).valid, false);
assert.equal(validateProblems(modifierPositionerProblems).valid, true);
const invalidPositionerChunkId = structuredClone(modifierPositionerProblems);
invalidPositionerChunkId[0].chunks[1].id = invalidPositionerChunkId[0].chunks[0].id;
assert.equal(validateProblems(invalidPositionerChunkId).valid, false);
const invalidPositionerPlacementId = structuredClone(modifierPositionerProblems);
invalidPositionerPlacementId[0].placements[1].id = invalidPositionerPlacementId[0].placements[0].id;
assert.equal(validateProblems(invalidPositionerPlacementId).valid, false);
const invalidPositionerLowPosition = structuredClone(modifierPositionerProblems);
invalidPositionerLowPosition[0].placements[0].position = -1;
assert.equal(validateProblems(invalidPositionerLowPosition).valid, false);
const invalidPositionerHighPosition = structuredClone(modifierPositionerProblems);
invalidPositionerHighPosition[0].placements[0].position = invalidPositionerHighPosition[0].chunks.length + 1;
assert.equal(validateProblems(invalidPositionerHighPosition).valid, false);
const invalidPositionerTarget = structuredClone(modifierPositionerProblems);
invalidPositionerTarget[0].placements[0].relation.targetId = 'missing-target';
assert.equal(validateProblems(invalidPositionerTarget).valid, false);
const invalidPositionerModifier = structuredClone(modifierPositionerProblems);
invalidPositionerModifier[0].placements[0].relation.modifierId = 'missing-modifier';
assert.equal(validateProblems(invalidPositionerModifier).valid, false);
const invalidPositionerRelation = structuredClone(modifierPositionerProblems);
delete invalidPositionerRelation[0].placements[0].relation;
assert.equal(validateProblems(invalidPositionerRelation).valid, false);
const invalidPositionerMeaning = structuredClone(modifierPositionerProblems);
delete invalidPositionerMeaning[0].placements[0].meaning;
assert.equal(validateProblems(invalidPositionerMeaning).valid, false);
const invalidPositionerGoal = structuredClone(modifierPositionerProblems);
invalidPositionerGoal[0].placements.forEach((placement) => { placement.matchesGoal = false; });
assert.equal(validateProblems(invalidPositionerGoal).valid, false);
const invalidPositionerGrammatical = structuredClone(modifierPositionerProblems);
invalidPositionerGrammatical[0].placements[0].grammatical = 'true';
assert.equal(validateProblems(invalidPositionerGrammatical).valid, false);
const invalidPositionerMatchesGoal = structuredClone(modifierPositionerProblems);
invalidPositionerMatchesGoal[0].placements[0].matchesGoal = 'true';
assert.equal(validateProblems(invalidPositionerMatchesGoal).valid, false);
assert.equal(modifierPositionerProblems[2].placements.filter((placement) => placement.grammatical && placement.matchesGoal).length, 2);
const comparisonSentenceCount = structuredClone(sentenceComparisonProblems);
comparisonSentenceCount[0].sentences.pop();
assert.equal(validateProblems(comparisonSentenceCount).valid, false);
const comparisonDuplicateSentenceId = structuredClone(sentenceComparisonProblems);
comparisonDuplicateSentenceId[0].sentences[1].id = comparisonDuplicateSentenceId[0].sentences[0].id;
assert.equal(validateProblems(comparisonDuplicateSentenceId).valid, false);
const comparisonDuplicateChunkId = structuredClone(sentenceComparisonProblems);
comparisonDuplicateChunkId[0].sentences[1].chunks[0].id = comparisonDuplicateChunkId[0].sentences[0].chunks[0].id;
assert.equal(validateProblems(comparisonDuplicateChunkId).valid, false);
const comparisonDuplicateDifferenceId = structuredClone(sentenceComparisonProblems);
comparisonDuplicateDifferenceId[0].differences.push({ ...comparisonDuplicateDifferenceId[0].differences[0] });
assert.equal(validateProblems(comparisonDuplicateDifferenceId).valid, false);
const comparisonUnknownLeft = structuredClone(sentenceComparisonProblems);
comparisonUnknownLeft[0].differences[0].leftChunkId = 'missing-left';
assert.equal(validateProblems(comparisonUnknownLeft).valid, false);
const comparisonUnknownRight = structuredClone(sentenceComparisonProblems);
comparisonUnknownRight[0].differences[0].rightChunkId = 'missing-right';
assert.equal(validateProblems(comparisonUnknownRight).valid, false);
const comparisonSameSentence = structuredClone(sentenceComparisonProblems);
comparisonSameSentence[0].differences[0].rightChunkId = comparisonSameSentence[0].sentences[0].chunks[0].id;
assert.equal(validateProblems(comparisonSameSentence).valid, false);
const errorUnknownToken = structuredClone(errorCorrectorProblems);
errorUnknownToken[0].corrections[0].tokenId = 'missing-token';
assert.equal(validateProblems(errorUnknownToken).valid, false);
const errorDuplicateToken = structuredClone(errorCorrectorProblems);
errorDuplicateToken[0].tokens[1].id = errorDuplicateToken[0].tokens[0].id;
assert.equal(validateProblems(errorDuplicateToken).valid, false);
const errorDuplicateCorrection = structuredClone(errorCorrectorProblems);
errorDuplicateCorrection[0].corrections.push({ ...errorDuplicateCorrection[0].corrections[0] });
assert.equal(validateProblems(errorDuplicateCorrection).valid, false);
const errorUnknownAcceptedOption = structuredClone(errorCorrectorProblems);
errorUnknownAcceptedOption[0].corrections[0].acceptedOptionIds = ['missing-option'];
assert.equal(validateProblems(errorUnknownAcceptedOption).valid, false);
const errorEmptyOptions = structuredClone(errorCorrectorProblems);
errorEmptyOptions[0].corrections[0].options = [];
assert.equal(validateProblems(errorEmptyOptions).valid, false);
const contextDuplicateStepId = structuredClone(contextGrammarProblems);
contextDuplicateStepId[0].steps[1].id = contextDuplicateStepId[0].steps[0].id;
assert.equal(validateProblems(contextDuplicateStepId).valid, false);
const contextDuplicateChoiceId = structuredClone(contextGrammarProblems);
contextDuplicateChoiceId[0].steps[1].choices[0].id = contextDuplicateChoiceId[0].steps[0].choices[0].id;
assert.equal(validateProblems(contextDuplicateChoiceId).valid, false);
const contextUnknownAcceptedChoice = structuredClone(contextGrammarProblems);
contextUnknownAcceptedChoice[0].steps[0].acceptedChoiceIds = ['missing-choice'];
assert.equal(validateProblems(contextUnknownAcceptedChoice).valid, false);
const contextEmptyAcceptedChoices = structuredClone(contextGrammarProblems);
contextEmptyAcceptedChoices[0].steps[0].acceptedChoiceIds = [];
assert.equal(validateProblems(contextEmptyAcceptedChoices).valid, false);
const contextMissingReply = structuredClone(contextGrammarProblems);
contextMissingReply[0].steps[0].choices[0].reply = '';
assert.equal(validateProblems(contextMissingReply).valid, false);
const contextMissingScenarioField = structuredClone(contextGrammarProblems);
contextMissingScenarioField[0].scenario.goal = '';
assert.equal(validateProblems(contextMissingScenarioField).valid, false);
const generatorMissingGoal = structuredClone(sentenceGeneratorProblems);
generatorMissingGoal[0].goal.description = '';
assert.equal(validateProblems(generatorMissingGoal).valid, false);
const generatorMissingTargetControl = structuredClone(sentenceGeneratorProblems);
delete generatorMissingTargetControl[0].targetStates[0].negative;
assert.equal(validateProblems(generatorMissingTargetControl).valid, false);
const generatorUnknownTargetValue = structuredClone(sentenceGeneratorProblems);
generatorUnknownTargetValue[0].targetStates[0].tense = 'future';
assert.equal(validateProblems(generatorUnknownTargetValue).valid, false);
const generatorUnknownTargetControl = structuredClone(sentenceGeneratorProblems);
generatorUnknownTargetControl[0].targetStates[0].mood = 'indicative';
assert.equal(validateProblems(generatorUnknownTargetControl).valid, false);
const generatorDuplicateTarget = structuredClone(sentenceGeneratorProblems);
generatorDuplicateTarget[2].targetStates.push({ ...generatorDuplicateTarget[2].targetStates[0] });
assert.equal(validateProblems(generatorDuplicateTarget).valid, false);
assert.equal(validateProblems([sentenceTransformerProblems[1]]).valid, true);
assert.equal(validateProblems([sentenceGeneratorProblems[3]]).valid, true);
const modalSentenceModelWithoutPast = structuredClone(sentenceTransformerProblems[1]);
assert.equal(validateProblems([modalSentenceModelWithoutPast]).valid, true);
const tenseSentenceModelWithoutPast = structuredClone(sentenceTransformerProblems[0]);
delete tenseSentenceModelWithoutPast.sentenceModel.verb.past;
assert.equal(validateProblems([tenseSentenceModelWithoutPast]).valid, false);
const modalTransformerUnknown = structuredClone(sentenceTransformerProblems);
modalTransformerUnknown[1].controls.modal[0].value = 'might';
assert.equal(validateProblems(modalTransformerUnknown).valid, false);
const modalGeneratorMissingTargetValue = structuredClone(sentenceGeneratorProblems);
delete modalGeneratorMissingTargetValue[3].targetStates[0].modal;
assert.equal(validateProblems(modalGeneratorMissingTargetValue).valid, false);
const modalGeneratorUnknownTargetValue = structuredClone(sentenceGeneratorProblems);
modalGeneratorUnknownTargetValue[3].targetStates[0].modal = 'might';
assert.equal(validateProblems(modalGeneratorUnknownTargetValue).valid, false);
const modalMixedControls = structuredClone(sentenceTransformerProblems);
modalMixedControls[1].controls.tense = [
  { value: 'present', label: 'Present' },
  { value: 'past', label: 'Past' },
];
assert.equal(validateProblems(modalMixedControls).valid, false);
const controlsWithoutGrammarMode = structuredClone(sentenceTransformerProblems[0]);
delete controlsWithoutGrammarMode.controls.tense;
delete controlsWithoutGrammarMode.defaults.tense;
assert.equal(validateProblems([controlsWithoutGrammarMode]).valid, false);
const generatorControlsWithoutGrammarMode = structuredClone(sentenceGeneratorProblems[0]);
delete generatorControlsWithoutGrammarMode.controls.tense;
delete generatorControlsWithoutGrammarMode.targetStates[0].tense;
assert.equal(validateProblems([generatorControlsWithoutGrammarMode]).valid, false);
assert.equal(validateProblems([sentenceTransformerProblems[2]]).valid, true);
assert.equal(validateProblems([sentenceGeneratorProblems[4]]).valid, true);
const st003Exploration = createInitialExploration(sentenceTransformerProblems[2]);
assert.equal(hasCompletedTransformerExploration(sentenceTransformerProblems[2], st003Exploration), false);
assert.equal(
  hasCompletedTransformerExploration(
    sentenceTransformerProblems[2],
    recordExploredValue(st003Exploration, 'tense', 'past'),
  ),
  false,
);
const st003WithPassive = recordExploredValue(st003Exploration, 'voice', 'passive');
assert.equal(hasCompletedTransformerExploration(sentenceTransformerProblems[2], st003WithPassive), true);
const st002Exploration = createInitialExploration(sentenceTransformerProblems[1]);
assert.equal(hasCompletedTransformerExploration(sentenceTransformerProblems[1], st002Exploration), false);
const st002WithAllModals = ['could', 'should', 'must'].reduce(
  (exploredValues, value) => recordExploredValue(exploredValues, 'modal', value),
  st002Exploration,
);
assert.equal(hasCompletedTransformerExploration(sentenceTransformerProblems[1], st002WithAllModals), true);
assert.equal(
  hasCompletedTransformerExploration(
    sentenceTransformerProblems[1],
    recordExploredValue(st002Exploration, 'modal', 'might'),
  ),
  false,
);
const passiveWithoutTense = structuredClone(sentenceTransformerProblems[2]);
delete passiveWithoutTense.controls.tense;
delete passiveWithoutTense.defaults.tense;
assert.equal(validateProblems([passiveWithoutTense]).valid, false);
const passiveWithNegative = structuredClone(sentenceTransformerProblems[2]);
passiveWithNegative.controls.negative = [
  { value: false, label: 'Affirmative' },
  { value: true, label: 'Negative' },
];
passiveWithNegative.defaults.negative = false;
assert.equal(validateProblems([passiveWithNegative]).valid, false);
const passiveWithModal = structuredClone(sentenceTransformerProblems[2]);
passiveWithModal.controls.modal = [
  { value: 'can', label: 'Can' },
  { value: 'must', label: 'Must' },
];
passiveWithModal.defaults.modal = 'can';
assert.equal(validateProblems([passiveWithModal]).valid, false);
const passiveUnknownVoice = structuredClone(sentenceTransformerProblems[2]);
passiveUnknownVoice.controls.voice[0].value = 'future';
assert.equal(validateProblems([passiveUnknownVoice]).valid, false);
const passiveMissingAgent = structuredClone(sentenceTransformerProblems[2]);
delete passiveMissingAgent.sentenceModel.roles.agent;
assert.equal(validateProblems([passiveMissingAgent]).valid, false);
const passiveMissingPatient = structuredClone(sentenceTransformerProblems[2]);
delete passiveMissingPatient.sentenceModel.roles.patient;
assert.equal(validateProblems([passiveMissingPatient]).valid, false);
const passiveInvalidRoleNumber = structuredClone(sentenceTransformerProblems[2]);
passiveInvalidRoleNumber.sentenceModel.roles.patient.number = 'dual';
assert.equal(validateProblems([passiveInvalidRoleNumber]).valid, false);
const passiveMissingParticiple = structuredClone(sentenceTransformerProblems[2]);
delete passiveMissingParticiple.sentenceModel.verb.pastParticiple;
assert.equal(validateProblems([passiveMissingParticiple]).valid, false);
const completionMissingControl = structuredClone(sentenceTransformerProblems[2]);
delete completionMissingControl.completion.control;
assert.equal(validateProblems([completionMissingControl]).valid, false);
const completionUnknownValue = structuredClone(sentenceTransformerProblems[2]);
completionUnknownValue.completion.requiredValues = ['active', 'passive', 'future'];
assert.equal(validateProblems([completionUnknownValue]).valid, false);
const completionEmptyValues = structuredClone(sentenceTransformerProblems[2]);
completionEmptyValues.completion.requiredValues = [];
assert.equal(validateProblems([completionEmptyValues]).valid, false);
const completionDuplicateValue = structuredClone(sentenceTransformerProblems[2]);
completionDuplicateValue.completion.requiredValues = ['active', 'active'];
assert.equal(validateProblems([completionDuplicateValue]).valid, false);
const completionUnsupportedType = structuredClone(sentenceTransformerProblems[2]);
completionUnsupportedType.completion.type = 'manual';
assert.equal(validateProblems([completionUnsupportedType]).valid, false);
const completionOnOtherProblem = structuredClone(wordOrderProblems[0]);
completionOnOtherProblem.completion = { type: 'explore-control', control: 'words', requiredValues: ['subject'] };
assert.equal(validateProblems([completionOnOtherProblem]).valid, false);
const errorTokenCorrectionMismatch = structuredClone(errorCorrectorProblems);
errorTokenCorrectionMismatch[0].tokens[1].correctionId = 'missing-correction';
assert.equal(validateProblems(errorTokenCorrectionMismatch).valid, false);
const unknownTokenAnswer = structuredClone(problems);
unknownTokenAnswer.find((problem) => problem.id === 'MP-001').answer = ['missing-token'];
assert.equal(validateProblems(unknownTokenAnswer).valid, false);
const unknownClassifierCategory = structuredClone(problems);
unknownClassifierCategory.find((problem) => problem.id === 'GC-001').items[0].answer = 'missing-category';
assert.equal(validateProblems(unknownClassifierCategory).valid, false);
const invalidTransformerDefault = structuredClone(problems);
invalidTransformerDefault.find((problem) => problem.id === 'ST-001').defaults.tense = 'future';
assert.equal(validateProblems(invalidTransformerDefault).valid, false);

const unknownLessonProblem = structuredClone(lessons);
unknownLessonProblem[0].steps[0].problemId = 'MP-999';
assert.equal(validateLessons(unknownLessonProblem, { problemRegistry }).valid, false);
const mismatchedLessonStep = structuredClone(lessons);
mismatchedLessonStep[0].steps[0].interactionType = 'word-order';
assert.equal(validateLessons(mismatchedLessonStep, { problemRegistry }).valid, false);
const emptyLessonSteps = structuredClone(lessons);
emptyLessonSteps[0].steps = [];
assert.equal(validateLessons(emptyLessonSteps, { problemRegistry }).valid, false);
const duplicateStepId = structuredClone(lessons);
duplicateStepId[1].steps[1].id = duplicateStepId[1].steps[0].id;
assert.equal(validateLessons(duplicateStepId, { problemRegistry, problemTypes: new Set(Object.keys(demoRegistry)) }).valid, false);

console.log('Logic tests passed.');
