import { demoRegistry } from '../components/demos/registry.js';
import { createMaterialPlan } from './ai/material-planning.js';
import {
  createLessonGeneration,
  createLessonGenerationContext,
  resolveMaterialPlanProblems,
} from './ai/lesson-generation.js';
import { createProblemGeneration } from './ai/problem-generation.js';
import { validateLearningRequirements } from './validateLearningRequirements.js';
import { validateLessonGeneration } from './validateLessonGeneration.js';
import { validateMaterialPlan } from './validateMaterialPlan.js';
import { validateProblemGeneration } from './validateProblemGeneration.js';
import { sameLocator } from './validateProblemGeneration.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function addErrors(errors, prefix, result) {
  if (!result.valid) errors.push(`${prefix}: ${result.errors.join('; ')}`);
}

export function validateSyntheticSourceTraceability(grammarReference, learningRequirements) {
  const errors = [];
  if (!isObject(grammarReference)) return { valid: false, errors: ['grammarReference must be an object'] };
  if (grammarReference.type !== 'synthetic-text') errors.push('grammarReference.type must be synthetic-text');
  if (typeof grammarReference.sourceId !== 'string' || grammarReference.sourceId.trim() === '') {
    errors.push('grammarReference.sourceId must be a non-empty string');
  }
  if (!Array.isArray(grammarReference.sections) || grammarReference.sections.length === 0) {
    errors.push('grammarReference.sections must be a non-empty array');
  }
  const sectionHeadings = new Set();
  (grammarReference.sections ?? []).forEach((section, index) => {
    if (!isObject(section) || typeof section.heading !== 'string' || section.heading.trim() === '') {
      errors.push(`grammarReference.sections[${index}] needs a heading`);
      return;
    }
    if (sectionHeadings.has(section.heading)) errors.push(`Duplicate grammar reference section heading: ${section.heading}`);
    sectionHeadings.add(section.heading);
  });
  if (!isObject(learningRequirements)) {
    errors.push('learningRequirements must be an object');
    return { valid: errors.length === 0, errors };
  }
  const sourceId = grammarReference.sourceId;
  const sourceReferences = learningRequirements.sourceReferences ?? [];
  if (!sourceReferences.some((reference) => reference?.id === sourceId)) {
    errors.push('Learning Requirements must reference grammarReference.sourceId');
  }
  (learningRequirements.learningPoints ?? []).forEach((point, pointIndex) => {
    (point.sourceEvidence ?? []).forEach((evidence, evidenceIndex) => {
      const path = `learningPoints[${pointIndex}].sourceEvidence[${evidenceIndex}]`;
      if (evidence.sourceId !== sourceId) errors.push(`${path}.sourceId does not match grammarReference.sourceId`);
      const matchingSection = (grammarReference.sections ?? []).find((section) => (
        sameLocator(evidence.locator, { section: section.heading })
      ));
      if (!matchingSection) errors.push(`${path}.locator.section does not reference a grammarReference section`);
    });
  });
  return { valid: errors.length === 0, errors };
}

function findCandidate(candidates, materialPlanItemId) {
  return candidates.find((candidate) => candidate?.materialPlanItemId === materialPlanItemId)?.candidateProblem ?? null;
}

function getActionCounts(materialPlan) {
  return (materialPlan?.items ?? []).reduce((counts, item) => {
    const action = item.problemDecision?.action;
    if (action === 'reuse') counts.reuse += 1;
    if (action === 'generate') counts.generate += 1;
    if (action === 'adapt') counts.adapt += 1;
    if (action === 'unresolved') counts.unresolved += 1;
    return counts;
  }, { reuse: 0, generate: 0, adapt: 0, unresolved: 0 });
}

export function validateMaterialGenerationProof({
  grammarReference,
  learningRequirements,
  retrievalIndex,
  canonicalProblems,
  canonicalLessons,
  generatedProblemCandidates = [],
  candidateLesson,
  materialPlanId = 'MATPLAN-E2E-001',
} = {}) {
  const errors = [];
  const stages = {
    sourceTraceability: false,
    learningRequirements: false,
    materialPlan: false,
    problemGenerations: false,
    lessonGeneration: false,
  };
  let materialPlan = null;
  let problemGenerations = [];
  let lessonGeneration = null;
  let resolved = null;

  const sourceTraceability = validateSyntheticSourceTraceability(grammarReference, learningRequirements);
  stages.sourceTraceability = sourceTraceability.valid;
  addErrors(errors, 'sourceTraceability', sourceTraceability);

  if (learningRequirements) {
    const learningRequirementsValidation = validateLearningRequirements(learningRequirements);
    stages.learningRequirements = learningRequirementsValidation.valid;
    addErrors(errors, 'learningRequirements', learningRequirementsValidation);
  } else {
    errors.push('learningRequirements is required');
  }

  if (learningRequirements && retrievalIndex) {
    try {
      materialPlan = createMaterialPlan({
        learningRequirements,
        retrievalIndex,
        id: materialPlanId,
      });
      const materialPlanValidation = validateMaterialPlan(materialPlan, {
        learningRequirements,
        retrievalIndex,
      });
      const counts = getActionCounts(materialPlan);
      stages.materialPlan = materialPlanValidation.valid
        && counts.reuse >= 1
        && counts.generate + counts.adapt >= 1
        && counts.unresolved === 0;
      addErrors(errors, 'materialPlan', materialPlanValidation);
      if (counts.reuse < 1) errors.push('E2E Material Plan must contain at least one reuse item');
      if (counts.generate + counts.adapt < 1) errors.push('E2E Material Plan must contain at least one generate/adapt item');
      if (counts.unresolved !== 0) errors.push('E2E Material Plan must not contain unresolved items');
    } catch (error) {
      errors.push(`materialPlan could not be created: ${error.message}`);
    }
  } else {
    errors.push('retrievalIndex context is required');
  }

  const generatedItems = materialPlan?.items?.filter((item) => ['generate', 'adapt'].includes(item.problemDecision?.action)) ?? [];
  const candidateList = Array.isArray(generatedProblemCandidates) ? generatedProblemCandidates : [];
  if (!Array.isArray(generatedProblemCandidates)) errors.push('generatedProblemCandidates must be an array');
  const planItemsById = new Map(materialPlan?.items?.map((item) => [item.id, item]) ?? []);
  const candidateCounts = new Map();
  candidateList.forEach((candidate, index) => {
    if (!isObject(candidate)) {
      errors.push(`generatedProblemCandidates[${index}] must be an object`);
      return;
    }
    const item = planItemsById.get(candidate.materialPlanItemId);
    if (!item) {
      errors.push(`generatedProblemCandidates[${index}].materialPlanItemId must reference materialPlan.items`);
      return;
    }
    const count = candidateCounts.get(candidate.materialPlanItemId) ?? 0;
    candidateCounts.set(candidate.materialPlanItemId, count + 1);
    if (count > 0) errors.push(`generatedProblemCandidates has multiple candidates for ${candidate.materialPlanItemId}`);
    if (candidate.learningPointId !== item.learningPointId) {
      errors.push(`generatedProblemCandidates[${index}].learningPointId must match its Material Plan item`);
    }
    if (!['generate', 'adapt'].includes(item.problemDecision?.action)) {
      errors.push(`generatedProblemCandidates[${index}] is not allowed for Material Plan action ${item.problemDecision?.action}`);
    }
  });
  generatedItems.forEach((item) => {
    if ((candidateCounts.get(item.id) ?? 0) !== 1) {
      errors.push(`Material Plan item ${item.id} requires exactly one generated Problem candidate`);
    }
  });
  const problemGenerationResults = [];
  if (materialPlan && learningRequirements && retrievalIndex && Array.isArray(canonicalProblems)) {
    generatedItems.forEach((item) => {
      const candidateProblem = findCandidate(candidateList, item.id);
      if (!candidateProblem) {
        errors.push(`No generated Problem candidate was supplied for ${item.learningPointId}`);
        return;
      }
      try {
        const generation = createProblemGeneration({
          learningRequirements,
          materialPlan,
          materialPlanItemId: item.id,
          retrievalIndex,
          canonicalProblems,
          candidateProblem,
          id: `PGEN-E2E-${String(problemGenerationResults.length + 1).padStart(3, '0')}`,
        });
        const result = validateProblemGeneration(generation, {
          learningRequirements,
          materialPlan,
          retrievalIndex,
          canonicalProblems,
        });
        problemGenerationResults.push({ generation, result });
        addErrors(errors, `problemGeneration[${problemGenerationResults.length - 1}]`, result);
      } catch (error) {
        errors.push(`Problem Generation for ${item.id} could not be created: ${error.message}`);
      }
    });
  }
  problemGenerations = problemGenerationResults.map(({ generation }) => generation);
  stages.problemGenerations = generatedItems.length > 0
    && problemGenerationResults.length === generatedItems.length
    && problemGenerationResults.every(({ result }) => result.valid);

  if (learningRequirements && materialPlan && retrievalIndex && Array.isArray(canonicalProblems) && Array.isArray(canonicalLessons)) {
    try {
      const lessonContext = createLessonGenerationContext({
        learningRequirements,
        materialPlan,
        problemGenerations,
        retrievalIndex,
        canonicalProblems,
        canonicalLessons,
      });
      resolved = resolveMaterialPlanProblems({
        learningRequirements,
        materialPlan,
        problemGenerations,
        retrievalIndex,
        canonicalProblems,
      });
      lessonGeneration = createLessonGeneration({
        context: lessonContext,
        candidateLesson,
        id: 'LGEN-E2E-001',
        rationale: 'Synthetic sourceから得たMaterial Planの活動を順番にLessonへ配置する。',
      });
      const lessonGenerationValidation = validateLessonGeneration(lessonGeneration, {
        learningRequirements,
        materialPlan,
        problemGenerations,
        retrievalIndex,
        canonicalProblems,
        canonicalLessons,
      });
      stages.lessonGeneration = lessonGenerationValidation.valid;
      addErrors(errors, 'lessonGeneration', lessonGenerationValidation);
    } catch (error) {
      errors.push(`Lesson Generation could not be created: ${error.message}`);
    }
  } else {
    errors.push('canonicalProblems and canonicalLessons contexts are required');
  }

  const lessonSteps = candidateLesson?.steps ?? [];
  lessonSteps.forEach((step, index) => {
    if (!demoRegistry[step?.interactionType]) errors.push(`candidateLesson.steps[${index}] uses an unregistered Component type`);
  });

  const valid = Object.values(stages).every(Boolean) && errors.length === 0;
  return {
    valid,
    stages,
    errors,
    outputs: {
      learningRequirements: structuredClone(learningRequirements ?? null),
      materialPlan: structuredClone(materialPlan),
      problemGenerations: structuredClone(problemGenerations),
      lessonGeneration: structuredClone(lessonGeneration),
    },
    resolved: {
      problemRefs: structuredClone(resolved?.resolvedItems?.filter((item) => item.problemRef).map((item) => item.problemRef) ?? []),
      candidateLesson: structuredClone(lessonGeneration?.candidateLesson ?? candidateLesson ?? null),
    },
  };
}
