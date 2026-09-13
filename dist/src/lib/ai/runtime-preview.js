import { createResolvedProblemRegistry } from './lesson-generation.js';
import { validateLessons } from '../validateLessons.js';
import { validateProblems } from '../validateProblems.js';

const runtimeProofPath = './ai/proofs/end-to-end-material-generation.json';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sameArray(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export async function loadRuntimeProof(baseURI = globalThis.document?.baseURI) {
  if (typeof baseURI !== 'string' || baseURI.trim() === '') throw new TypeError('A document baseURI is required');
  const response = await fetch(new URL(runtimeProofPath, baseURI));
  if (!response.ok) throw new Error(`Runtime proof could not be loaded: ${response.status}`);
  return response.json();
}

export function createRuntimePreviewModel(proof, {
  canonicalProblems,
  canonicalLessons,
  problemTypes = new Set(),
} = {}) {
  if (!isObject(proof) || proof.valid !== true) throw new TypeError('Runtime preview requires a valid proof');
  if (!Array.isArray(canonicalProblems)) throw new TypeError('canonicalProblems is required');
  if (!Array.isArray(canonicalLessons)) throw new TypeError('canonicalLessons is required');
  const candidateLesson = proof.outputs?.lessonGeneration?.candidateLesson;
  const generatedProblems = proof.outputs?.problemGenerations?.map((generation) => generation?.candidateProblem);
  if (!isObject(candidateLesson) || !Array.isArray(generatedProblems) || generatedProblems.some((problem) => !isObject(problem))) {
    throw new TypeError('Runtime proof outputs are incomplete');
  }
  const materialPlanItems = proof.outputs?.materialPlan?.items;
  const learningPoints = proof.outputs?.learningRequirements?.learningPoints;
  if (!Array.isArray(materialPlanItems) || !Array.isArray(learningPoints)) {
    throw new TypeError('Runtime proof planning outputs are incomplete');
  }
  const generatedProblemIds = generatedProblems.map((problem) => problem.id);
  if (!sameArray(proof.summary?.generatedProblemIds, generatedProblemIds)) {
    throw new Error('Runtime proof generated Problem summary does not match its output');
  }
  if (proof.summary?.candidateLessonId !== candidateLesson.id) {
    throw new Error('Runtime proof candidate Lesson summary does not match its output');
  }
  const reusedProblemIds = materialPlanItems
    .filter((item) => item.problemDecision?.action === 'reuse')
    .map((item) => item.problemDecision?.problemSelection?.selected?.canonicalRef?.id);
  const unresolvedItemIds = materialPlanItems
    .filter((item) => item.problemDecision?.action === 'unresolved')
    .map((item) => item.id);
  if (!sameArray(proof.summary?.reusedProblemIds, reusedProblemIds)) {
    throw new Error('Runtime proof reused Problem summary does not match its output');
  }
  if (!sameArray(proof.summary?.unresolvedItemIds, unresolvedItemIds) || unresolvedItemIds.length !== 0) {
    throw new Error('Runtime proof contains unresolved items');
  }
  if (proof.summary?.learningPointCount !== learningPoints.length) {
    throw new Error('Runtime proof Learning Point summary does not match its output');
  }
  if (proof.summary?.materialPlanItemCount !== materialPlanItems.length) {
    throw new Error('Runtime proof Material Plan summary does not match its output');
  }

  const transientProblemRegistry = createResolvedProblemRegistry({
    canonicalProblems,
    generatedProblems,
  });
  const problemValidation = validateProblems([...canonicalProblems, ...generatedProblems]);
  if (!problemValidation.valid) throw new Error(`Runtime Problems are invalid: ${problemValidation.errors.join('; ')}`);
  const lessonValidation = validateLessons([...canonicalLessons, candidateLesson], {
    problemRegistry: transientProblemRegistry,
    problemTypes,
  });
  if (!lessonValidation.valid) throw new Error(`Runtime Lesson is invalid: ${lessonValidation.errors.join('; ')}`);

  return {
    proof: structuredClone(proof),
    lesson: structuredClone(candidateLesson),
    generatedProblems: structuredClone(generatedProblems),
    transientProblemRegistry: structuredClone(transientProblemRegistry),
  };
}

export { runtimeProofPath };
