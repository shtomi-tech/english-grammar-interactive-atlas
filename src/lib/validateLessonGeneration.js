import {
  lessonGenerationAlignmentFields,
  lessonGenerationMaterialPlanRefFields,
  lessonGenerationProblemGenerationRefFields,
  lessonGenerationStepMappingFields,
  lessonGenerationTopLevelFields,
  lessonGenerationVersion,
} from '../data/ai/lesson-generation-schema.js';
import { validateLearningRequirements } from './validateLearningRequirements.js';
import { validateMaterialPlan } from './validateMaterialPlan.js';
import { validateProblemGeneration } from './validateProblemGeneration.js';
import { validateProblems } from './validateProblems.js';
import { validateLessons } from './validateLessons.js';
import {
  createResolvedProblemRegistry,
  resolveMaterialPlanProblems,
} from './ai/lesson-generation.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function addUnknownFields(value, allowedFields, path, errors) {
  if (!isObject(value)) return;
  Object.keys(value)
    .filter((field) => !allowedFields.includes(field))
    .forEach((field) => errors.push(`Unknown Lesson Generation field: ${path ? `${path}.` : ''}${field}`));
}

function requireNonEmptyString(value, path, errors) {
  if (typeof value !== 'string' || value.trim() === '') errors.push(`${path} must be a non-empty string`);
}

function validateRef(value, allowedFields, path, errors) {
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  addUnknownFields(value, allowedFields, path, errors);
  requireNonEmptyString(value.id, `${path}.id`, errors);
  requireNonEmptyString(value.version, `${path}.version`, errors);
}

function getProblemTypes(retrievalIndex) {
  return new Set(
    retrievalIndex?.interactions
      ?.filter((record) => Array.isArray(record.demoTypes) && record.demoTypes.length === 1)
      .flatMap((record) => record.demoTypes)
      ?? [],
  );
}

function validateGenerationReferences({
  refs,
  problemGenerations,
  materialPlan,
  context,
  errors,
}) {
  if (!Array.isArray(refs)) {
    errors.push('problemGenerationRefs must be an array');
  }
  if (!Array.isArray(problemGenerations)) {
    errors.push('problemGenerations context is required');
  }

  const referenceIds = new Set();
  (Array.isArray(refs) ? refs : []).forEach((ref, index) => {
    const path = `problemGenerationRefs[${index}]`;
    validateRef(ref, lessonGenerationProblemGenerationRefFields, path, errors);
    if (typeof ref?.id === 'string' && ref.id.trim() !== '') {
      if (referenceIds.has(ref.id)) errors.push(`${path}.id is duplicated: ${ref.id}`);
      referenceIds.add(ref.id);
    }
    const generation = problemGenerations?.find((candidate) => candidate?.id === ref?.id);
    if (!generation) errors.push(`${path} must reference a supplied Problem Generation`);
    else if (generation.version !== ref.version) errors.push(`${path}.version does not match the supplied Problem Generation`);
  });

  const generationIds = new Set();
  const generationCounts = new Map();
  (Array.isArray(problemGenerations) ? problemGenerations : []).forEach((generation, index) => {
    const path = `problemGenerations[${index}]`;
    if (!isObject(generation)) {
      errors.push(`${path} must be an object`);
      return;
    }
    if (typeof generation.id === 'string' && generation.id.trim() !== '') {
      if (generationIds.has(generation.id)) errors.push(`${path}.id is duplicated: ${generation.id}`);
      generationIds.add(generation.id);
    }
    const item = materialPlan?.items?.find((candidate) => candidate.id === generation.materialPlanItemId);
    if (!item) {
      errors.push(`${path}.materialPlanItemId must reference materialPlan.items`);
      return;
    }
    if (!['generate', 'adapt'].includes(item.problemDecision?.action)) {
      errors.push(`${path} is only allowed for generate/adapt Material Plan items`);
      return;
    }
    const count = generationCounts.get(item.id) ?? 0;
    generationCounts.set(item.id, count + 1);
    if (!referenceIds.has(generation.id)) errors.push(`${path} is not referenced by problemGenerationRefs`);
    if (context) {
      const result = validateProblemGeneration(generation, context);
      if (!result.valid) errors.push(`${path} is invalid: ${result.errors.join('; ')}`);
    }
  });

  materialPlan?.items?.forEach((item) => {
    const action = item.problemDecision?.action;
    const count = generationCounts.get(item.id) ?? 0;
    if (['generate', 'adapt'].includes(action) && count !== 1) {
      errors.push(`Material Plan item ${item.id} requires exactly one Problem Generation`);
    }
    if (!['generate', 'adapt'].includes(action) && count > 0) {
      errors.push(`Problem Generation is not allowed for Material Plan item ${item.id} with action ${action}`);
    }
  });

  generationIds.forEach((id) => {
    if (!referenceIds.has(id)) errors.push(`Problem Generation ${id} is not referenced by problemGenerationRefs`);
  });
}

function validateAlignment({ generation, materialPlan, resolved, learningRequirements, errors }) {
  const alignment = generation.alignment;
  if (!isObject(alignment)) {
    errors.push('alignment must be an object');
    return;
  }
  addUnknownFields(alignment, lessonGenerationAlignmentFields, 'alignment', errors);
  requireNonEmptyString(alignment.rationale, 'alignment.rationale', errors);
  if (!Array.isArray(alignment.stepMappings)) {
    errors.push('alignment.stepMappings must be an array');
    return;
  }

  const candidateSteps = Array.isArray(generation.candidateLesson?.steps)
    ? generation.candidateLesson.steps
    : [];
  if (candidateSteps.length !== materialPlan.items.length) {
    errors.push('candidateLesson.steps length must match materialPlan.items length');
  }
  if (alignment.stepMappings.length !== materialPlan.items.length) {
    errors.push('alignment.stepMappings length must match materialPlan.items length');
  }

  const mappedItemIds = new Set();
  const mappedStepIds = new Set();
  const resolvedByItemId = new Map(resolved?.resolvedItems?.map((item) => [item.materialPlanItemId, item]) ?? []);
  alignment.stepMappings.forEach((mapping, index) => {
    const path = `alignment.stepMappings[${index}]`;
    if (!isObject(mapping)) {
      errors.push(`${path} must be an object`);
      return;
    }
    addUnknownFields(mapping, lessonGenerationStepMappingFields, path, errors);
    requireNonEmptyString(mapping.materialPlanItemId, `${path}.materialPlanItemId`, errors);
    requireNonEmptyString(mapping.lessonStepId, `${path}.lessonStepId`, errors);
    if (mappedItemIds.has(mapping.materialPlanItemId)) errors.push(`${path}.materialPlanItemId is duplicated`);
    mappedItemIds.add(mapping.materialPlanItemId);
    if (mappedStepIds.has(mapping.lessonStepId)) errors.push(`${path}.lessonStepId is duplicated`);
    mappedStepIds.add(mapping.lessonStepId);

    const item = materialPlan.items[index];
    const step = candidateSteps[index];
    if (item && mapping.materialPlanItemId !== item.id) errors.push(`${path} is out of Material Plan item order`);
    if (step && mapping.lessonStepId !== step.id) errors.push(`${path} is out of candidate Lesson step order`);
    if (!resolvedByItemId.has(mapping.materialPlanItemId)) {
      errors.push(`${path}.materialPlanItemId must reference a resolved Material Plan item`);
      return;
    }
    const resolvedItem = resolvedByItemId.get(mapping.materialPlanItemId);
    if (step && resolvedItem.problemRef) {
      if (step.problemId !== resolvedItem.problemRef.id) {
        errors.push(`${path} step.problemId does not match the resolved Problem`);
      }
      if (step.interactionType !== resolvedItem.problemRef.type) {
        errors.push(`${path} step.interactionType does not match the resolved Problem type`);
      }
    }
  });

  const planItemIds = new Set(materialPlan.items.map((item) => item.id));
  mappedItemIds.forEach((id) => {
    if (!planItemIds.has(id)) errors.push(`alignment.stepMappings references unknown Material Plan item: ${id}`);
  });
  const stepIds = new Set(candidateSteps.map((step) => step?.id));
  mappedStepIds.forEach((id) => {
    if (!stepIds.has(id)) errors.push(`alignment.stepMappings references unknown Lesson step: ${id}`);
  });

  const resolvedProblemIds = new Set(
    resolved?.resolvedItems?.filter((item) => item.problemRef).map((item) => item.problemRef.id) ?? [],
  );
  candidateSteps.forEach((step, index) => {
    if (isObject(step) && !resolvedProblemIds.has(step.problemId)) {
      errors.push(`candidateLesson.steps[${index}].problemId is not authorized by Material Plan`);
    }
  });

  if (learningRequirements?.learningPoints) {
    const coveredLearningPointIds = new Set(
      resolved?.resolvedItems
        ?.filter((item) => item.problemRef)
        .map((item) => item.learningPointId)
      ?? [],
    );
    learningRequirements.learningPoints.forEach((point) => {
      if (!coveredLearningPointIds.has(point.id)) errors.push(`Learning Point is not mapped to a Lesson step: ${point.id}`);
    });
  }
}

export function validateLessonGeneration(generation, {
  learningRequirements,
  materialPlan,
  problemGenerations,
  retrievalIndex,
  canonicalProblems,
  canonicalLessons,
} = {}) {
  const errors = [];
  if (!isObject(generation)) return { valid: false, errors: ['Lesson Generation must be an object'] };
  addUnknownFields(generation, lessonGenerationTopLevelFields, '', errors);
  if (generation.version !== lessonGenerationVersion) errors.push('version must be 1');
  requireNonEmptyString(generation.id, 'id', errors);
  validateRef(generation.materialPlanRef, lessonGenerationMaterialPlanRefFields, 'materialPlanRef', errors);

  if (!learningRequirements) errors.push('learningRequirements context is required');
  else {
    const result = validateLearningRequirements(learningRequirements);
    if (!result.valid) errors.push(`learningRequirements is invalid: ${result.errors.join('; ')}`);
  }
  if (!materialPlan) errors.push('materialPlan context is required');
  else {
    const result = validateMaterialPlan(materialPlan, { learningRequirements, retrievalIndex });
    if (!result.valid) errors.push(`materialPlan is invalid: ${result.errors.join('; ')}`);
    if (generation.materialPlanRef?.id !== materialPlan.id) errors.push('materialPlanRef.id does not match materialPlan');
    if (generation.materialPlanRef?.version !== materialPlan.version) errors.push('materialPlanRef.version does not match materialPlan');
  }
  if (!retrievalIndex || !Array.isArray(retrievalIndex.documents)) errors.push('retrievalIndex context with documents is required');
  if (!Array.isArray(canonicalProblems)) errors.push('canonicalProblems context is required');
  if (!Array.isArray(canonicalLessons)) errors.push('canonicalLessons context is required');

  const problemGenerationContext = {
    learningRequirements,
    materialPlan,
    retrievalIndex,
    canonicalProblems,
  };
  validateGenerationReferences({
    refs: generation.problemGenerationRefs,
    problemGenerations,
    materialPlan,
    context: learningRequirements && materialPlan && retrievalIndex && Array.isArray(canonicalProblems)
      ? problemGenerationContext
      : null,
    errors,
  });

  let resolved = null;
  if (learningRequirements && materialPlan && retrievalIndex && Array.isArray(canonicalProblems)) {
    try {
      resolved = resolveMaterialPlanProblems({
        learningRequirements,
        materialPlan,
        problemGenerations: Array.isArray(problemGenerations) ? problemGenerations : [],
        retrievalIndex,
        canonicalProblems,
      });
    } catch (error) {
      errors.push(`Resolved Problems could not be created: ${error.message}`);
    }
  }
  if (resolved?.unresolvedItemIds.length) {
    errors.push(`Lesson Generation cannot include unresolved Material Plan items: ${resolved.unresolvedItemIds.join(', ')}`);
  }

  const generatedProblems = resolved?.generatedProblems
    ?? (Array.isArray(problemGenerations)
      ? problemGenerations.map((generationItem) => generationItem?.candidateProblem).filter(isObject)
      : []);
  if (Array.isArray(canonicalProblems)) {
    const problemValidation = validateProblems([...canonicalProblems, ...generatedProblems]);
    if (!problemValidation.valid) errors.push(`Resolved Problems are invalid: ${problemValidation.errors.join('; ')}`);
  }

  let resolvedProblemRegistry = null;
  if (Array.isArray(canonicalProblems)) {
    try {
      resolvedProblemRegistry = createResolvedProblemRegistry({ canonicalProblems, generatedProblems });
    } catch (error) {
      errors.push(`Resolved Problem registry is invalid: ${error.message}`);
    }
  }
  if (Array.isArray(canonicalLessons) && resolvedProblemRegistry) {
    const lessonValidation = validateLessons(
      [...canonicalLessons, generation.candidateLesson],
      {
        problemRegistry: resolvedProblemRegistry,
        problemTypes: getProblemTypes(retrievalIndex),
      },
    );
    if (!lessonValidation.valid) errors.push(`candidateLesson is invalid: ${lessonValidation.errors.join('; ')}`);
  }

  if (!isObject(generation.candidateLesson)) errors.push('candidateLesson must be an object');
  if (materialPlan && resolved) validateAlignment({ generation, materialPlan, resolved, learningRequirements, errors });

  return { valid: errors.length === 0, errors };
}
