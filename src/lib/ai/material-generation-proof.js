import { validateMaterialGenerationProof } from '../validateMaterialGenerationProof.js';

export function runMaterialGenerationProof(input = {}) {
  const result = validateMaterialGenerationProof(input);
  const materialPlan = result.outputs.materialPlan;
  const problemGenerations = result.outputs.problemGenerations;
  const lessonGeneration = result.outputs.lessonGeneration;
  const summary = {
    learningPointCount: input.learningRequirements?.learningPoints?.length ?? 0,
    materialPlanItemCount: materialPlan?.items?.length ?? 0,
    reusedProblemIds: materialPlan?.items
      ?.filter((item) => item.problemDecision?.action === 'reuse')
      .map((item) => item.problemDecision.problemSelection.selected.canonicalRef.id)
      ?? [],
    generatedProblemIds: problemGenerations
      .map((generation) => generation.candidateProblem.id),
    unresolvedItemIds: materialPlan?.items
      ?.filter((item) => item.problemDecision?.action === 'unresolved')
      .map((item) => item.id)
      ?? [],
    candidateLessonId: lessonGeneration?.candidateLesson?.id ?? input.candidateLesson?.id ?? null,
  };
  const proof = {
    version: '1',
    id: input.proofId ?? 'E2E-PROOF-001',
    valid: result.valid,
    grammarReference: structuredClone(input.grammarReference ?? null),
    outputs: structuredClone(result.outputs),
    summary,
    validation: {
      sourceTraceability: result.stages.sourceTraceability,
      learningRequirements: result.stages.learningRequirements,
      materialPlan: result.stages.materialPlan,
      problemGenerations: result.stages.problemGenerations,
      lessonGeneration: result.stages.lessonGeneration,
    },
  };
  return {
    ...result,
    proof,
  };
}
