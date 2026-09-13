import { lessonGenerationVersion } from '../../data/ai/lesson-generation-schema.js';
import { resolveCanonicalProblem } from './problem-generation.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function requireContext(value, name) {
  if (!value || typeof value !== 'object') throw new TypeError(`${name} is required`);
}

function toProblemRef(problem) {
  return { kind: 'problem', id: problem.id, type: problem.type };
}

function findProblemGenerations(problemGenerations, materialPlanItemId) {
  return problemGenerations.filter((generation) => generation?.materialPlanItemId === materialPlanItemId);
}

export function createResolvedProblemRegistry({ canonicalProblems, generatedProblems = [] } = {}) {
  if (!Array.isArray(canonicalProblems)) throw new TypeError('canonicalProblems is required');
  if (!Array.isArray(generatedProblems)) throw new TypeError('generatedProblems must be an array');
  const registry = {};
  [...canonicalProblems, ...generatedProblems].forEach((problem) => {
    if (!isObject(problem) || typeof problem.id !== 'string' || problem.id.trim() === '') {
      throw new TypeError('Resolved Problems must have non-empty ids');
    }
    if (registry[problem.id]) throw new RangeError(`Resolved Problem id is duplicated: ${problem.id}`);
    registry[problem.id] = problem;
  });
  return registry;
}

export function resolveMaterialPlanProblems({
  learningRequirements,
  materialPlan,
  problemGenerations = [],
  retrievalIndex,
  canonicalProblems,
} = {}) {
  requireContext(learningRequirements, 'learningRequirements');
  requireContext(materialPlan, 'materialPlan');
  requireContext(retrievalIndex, 'retrievalIndex');
  if (!Array.isArray(materialPlan.items)) throw new TypeError('materialPlan.items is required');
  if (!Array.isArray(problemGenerations)) throw new TypeError('problemGenerations must be an array');
  if (!Array.isArray(canonicalProblems)) throw new TypeError('canonicalProblems is required');

  const materialPlanItemIds = new Set(materialPlan.items.map((item) => item.id));
  problemGenerations.forEach((generation) => {
    if (!isObject(generation) || !materialPlanItemIds.has(generation.materialPlanItemId)) {
      throw new RangeError('Problem Generation must reference a Material Plan item');
    }
  });

  const resolvedItems = [];
  const generatedProblemRefs = [];
  const generatedProblems = [];
  const unresolvedItemIds = [];

  materialPlan.items.forEach((item) => {
    const action = item.problemDecision?.action;
    if (action === 'unresolved') {
      unresolvedItemIds.push(item.id);
      resolvedItems.push({
        materialPlanItemId: item.id,
        learningPointId: item.learningPointId,
        action,
      });
      return;
    }

    if (action === 'reuse') {
      const problem = resolveCanonicalProblem(
        canonicalProblems,
        item.problemDecision?.problemSelection?.selected?.canonicalRef,
      );
      if (!problem) throw new RangeError(`Canonical Problem could not be resolved for Material Plan item: ${item.id}`);
      resolvedItems.push({
        materialPlanItemId: item.id,
        learningPointId: item.learningPointId,
        action,
        problemRef: toProblemRef(problem),
      });
      return;
    }

    if (action !== 'generate' && action !== 'adapt') {
      throw new RangeError(`Unsupported Material Plan action: ${action}`);
    }
    const matches = findProblemGenerations(problemGenerations, item.id);
    if (matches.length !== 1 || !isObject(matches[0].candidateProblem)) {
      throw new RangeError(`Material Plan item ${item.id} requires exactly one Problem Generation`);
    }
    const generation = matches[0];
    const generatedProblem = generation.candidateProblem;
    generatedProblemRefs.push({ id: generation.id, version: generation.version });
    generatedProblems.push(generatedProblem);
    resolvedItems.push({
      materialPlanItemId: item.id,
      learningPointId: item.learningPointId,
      action,
      problemRef: toProblemRef(generatedProblem),
    });
  });

  return {
    materialPlanRef: { id: materialPlan.id, version: materialPlan.version },
    resolvedItems,
    generatedProblemRefs,
    generatedProblems,
    unresolvedItemIds,
  };
}

export function createLessonGenerationContext({
  learningRequirements,
  materialPlan,
  problemGenerations,
  retrievalIndex,
  canonicalProblems,
  canonicalLessons,
} = {}) {
  requireContext(canonicalLessons, 'canonicalLessons');
  const resolved = resolveMaterialPlanProblems({
    learningRequirements,
    materialPlan,
    problemGenerations,
    retrievalIndex,
    canonicalProblems,
  });
  return {
    materialPlanRef: structuredClone(resolved.materialPlanRef),
    resolvedItems: structuredClone(resolved.resolvedItems),
    generatedProblemRefs: structuredClone(resolved.generatedProblemRefs),
    unresolvedItemIds: [...resolved.unresolvedItemIds],
  };
}

export function createLessonGeneration({
  context,
  candidateLesson,
  id = 'LGEN-GENERATED',
  rationale = 'Material Planの各活動を順番にLessonへ配置する。',
} = {}) {
  requireContext(context, 'context');
  if (!isObject(candidateLesson)) throw new TypeError('candidateLesson is required');
  const steps = Array.isArray(candidateLesson.steps) ? candidateLesson.steps : [];
  return {
    version: lessonGenerationVersion,
    id,
    materialPlanRef: structuredClone(context.materialPlanRef),
    problemGenerationRefs: structuredClone(context.generatedProblemRefs ?? []),
    candidateLesson: structuredClone(candidateLesson),
    alignment: {
      stepMappings: context.resolvedItems.map((item, index) => ({
        materialPlanItemId: item.materialPlanItemId,
        lessonStepId: steps[index]?.id,
      })),
      rationale,
    },
  };
}
