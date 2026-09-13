import { problemGenerationActionValues, problemGenerationVersion } from '../../data/ai/problem-generation-schema.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireContext(value, name) {
  if (!value || typeof value !== 'object') throw new TypeError(`${name} is required`);
}

export function resolveCanonicalProblem(canonicalProblems, canonicalRef) {
  if (!Array.isArray(canonicalProblems) || !isObject(canonicalRef) || canonicalRef.kind !== 'problem') return null;
  const problem = canonicalProblems.find((entry) => entry?.id === canonicalRef.id);
  if (!problem || (canonicalRef.type !== undefined && problem.type !== canonicalRef.type)) return null;
  return problem;
}

function getMaterialPlanItem(materialPlan, materialPlanItemId) {
  return materialPlan.items.find((item) => item.id === materialPlanItemId) ?? null;
}

function getInteractionRecord(retrievalIndex, canonicalRef) {
  if (!isObject(canonicalRef) || canonicalRef.kind !== 'interaction') return null;
  return retrievalIndex.interactions?.find((record) => record.id === canonicalRef.id) ?? null;
}

function toProblemRef(problem) {
  return { kind: 'problem', id: problem.id, type: problem.type };
}

export function createProblemGenerationContext({
  learningRequirements,
  materialPlan,
  materialPlanItemId,
  retrievalIndex,
  canonicalProblems,
} = {}) {
  requireContext(learningRequirements, 'learningRequirements');
  requireContext(materialPlan, 'materialPlan');
  requireContext(retrievalIndex, 'retrievalIndex');
  if (!Array.isArray(canonicalProblems)) throw new TypeError('canonicalProblems is required');
  if (!Array.isArray(materialPlan.items)) throw new TypeError('materialPlan.items is required');

  const item = getMaterialPlanItem(materialPlan, materialPlanItemId);
  if (!item) throw new RangeError(`Material Plan item was not found: ${materialPlanItemId}`);
  const learningPoint = learningRequirements.learningPoints?.find((point) => point.id === item.learningPointId);
  if (!learningPoint) throw new RangeError(`Learning Point was not found: ${item.learningPointId}`);

  const interactionRef = item.interactionSelection?.selected?.canonicalRef;
  const interactionRecord = getInteractionRecord(retrievalIndex, interactionRef);
  if (!interactionRecord) throw new RangeError(`Selected Interaction was not found: ${JSON.stringify(interactionRef)}`);

  const sourceProblemRef = item.problemDecision?.action === 'adapt'
    ? structuredClone(item.problemDecision.sourceProblemSelection?.selected?.canonicalRef ?? null)
    : null;
  const exampleProblemRefs = (interactionRecord.relations?.problemIds ?? [])
    .map((problemId) => resolveCanonicalProblem(canonicalProblems, { kind: 'problem', id: problemId }))
    .filter(Boolean)
    .map(toProblemRef);

  return {
    learningPoint: {
      id: learningPoint.id,
      concept: learningPoint.concept,
      summary: learningPoint.summary,
      desiredOutcomes: [...learningPoint.desiredOutcomes],
    },
    interactionRef: structuredClone(interactionRef),
    demoType: interactionRecord.demoTypes?.length === 1 ? interactionRecord.demoTypes[0] : null,
    action: item.problemDecision?.action,
    sourceProblemRef,
    exampleProblemRefs,
    materialPlanRef: { id: materialPlan.id, version: materialPlan.version },
    materialPlanItemId: item.id,
    sourceEvidence: structuredClone(learningPoint.sourceEvidence),
  };
}

export function createProblemGeneration({
  learningRequirements,
  materialPlan,
  materialPlanItemId,
  retrievalIndex,
  canonicalProblems,
  candidateProblem,
  id = 'PGEN-GENERATED',
  rationale = 'このProblemで対象Learning Pointを練習する。',
} = {}) {
  const context = createProblemGenerationContext({
    learningRequirements,
    materialPlan,
    materialPlanItemId,
    retrievalIndex,
    canonicalProblems,
  });
  if (!problemGenerationActionValues.includes(context.action)) {
    throw new TypeError(`Problem Generation requires generate or adapt action: ${context.action}`);
  }
  if (!isObject(candidateProblem)) throw new TypeError('candidateProblem is required');
  if (context.demoType && candidateProblem.type !== context.demoType) {
    throw new TypeError('candidateProblem.type must match the selected Interaction demoType');
  }

  return {
    version: problemGenerationVersion,
    id,
    materialPlanRef: structuredClone(context.materialPlanRef),
    materialPlanItemId: context.materialPlanItemId,
    candidateProblem: structuredClone(candidateProblem),
    alignment: {
      learningPointId: context.learningPoint.id,
      sourceEvidenceRefs: context.sourceEvidence.map(({ sourceId, locator }) => ({
        sourceId,
        locator: structuredClone(locator),
      })),
      rationale,
    },
  };
}
