import {
  problemGenerationActionValues,
  problemGenerationAlignmentFields,
  problemGenerationMaterialPlanRefFields,
  problemGenerationSourceEvidenceRefFields,
  problemGenerationTopLevelFields,
  problemGenerationVersion,
} from '../data/ai/problem-generation-schema.js';
import { learningRequirementLocatorFields } from '../data/ai/learning-requirements-schema.js';
import { validateLearningRequirements } from './validateLearningRequirements.js';
import { validateMaterialPlan } from './validateMaterialPlan.js';
import { validateProblems } from './validateProblems.js';
import { createProblemGenerationContext, resolveCanonicalProblem } from './ai/problem-generation.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function sameLocator(left, right) {
  if (!isObject(left) || !isObject(right)) return false;
  return learningRequirementLocatorFields.every((field) => left[field] === right[field]);
}

function locatorKey(locator) {
  return learningRequirementLocatorFields
    .map((field) => `${field}:${JSON.stringify(locator?.[field])}`)
    .join('|');
}

function addUnknownFields(value, allowedFields, path, errors) {
  if (!isObject(value)) return;
  Object.keys(value)
    .filter((field) => !allowedFields.includes(field))
    .forEach((field) => errors.push(`Unknown Problem Generation field: ${path ? `${path}.` : ''}${field}`));
}

function requireNonEmptyString(value, path, errors) {
  if (typeof value !== 'string' || value.trim() === '') errors.push(`${path} must be a non-empty string`);
}

function validateRef(value, path, errors) {
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  addUnknownFields(value, problemGenerationMaterialPlanRefFields, path, errors);
  requireNonEmptyString(value.id, `${path}.id`, errors);
  requireNonEmptyString(value.version, `${path}.version`, errors);
}

function validateLocator(locator, path, errors) {
  if (!isObject(locator) || Object.keys(locator).length === 0) {
    errors.push(`${path} must be a non-empty object`);
    return;
  }
  addUnknownFields(locator, learningRequirementLocatorFields, path, errors);
}

function validateSourceEvidenceRefs(refs, learningPoint, errors) {
  if (!Array.isArray(refs) || refs.length === 0) {
    errors.push('alignment.sourceEvidenceRefs must be a non-empty array');
    return;
  }
  const seen = new Set();
  refs.forEach((ref, index) => {
    const path = `alignment.sourceEvidenceRefs[${index}]`;
    if (!isObject(ref)) {
      errors.push(`${path} must be an object`);
      return;
    }
    addUnknownFields(ref, problemGenerationSourceEvidenceRefFields, path, errors);
    requireNonEmptyString(ref.sourceId, `${path}.sourceId`, errors);
    validateLocator(ref.locator, `${path}.locator`, errors);
    const key = `${ref.sourceId}:${locatorKey(ref.locator)}`;
    if (seen.has(key)) errors.push(`${path} must not duplicate a source evidence reference`);
    seen.add(key);
    const matchesSourceEvidence = learningPoint?.sourceEvidence?.some((evidence) => (
      evidence.sourceId === ref.sourceId && sameLocator(evidence.locator, ref.locator)
    ));
    if (!matchesSourceEvidence) errors.push(`${path} must reference Learning Requirements sourceEvidence`);
  });
}

export function validateProblemGeneration(generation, {
  learningRequirements,
  materialPlan,
  retrievalIndex,
  canonicalProblems,
} = {}) {
  const errors = [];
  if (!isObject(generation)) return { valid: false, errors: ['Problem Generation must be an object'] };
  addUnknownFields(generation, problemGenerationTopLevelFields, '', errors);
  if (generation.version !== problemGenerationVersion) errors.push('version must be 1');
  requireNonEmptyString(generation.id, 'id', errors);
  validateRef(generation.materialPlanRef, 'materialPlanRef', errors);
  requireNonEmptyString(generation.materialPlanItemId, 'materialPlanItemId', errors);

  if (!learningRequirements) errors.push('learningRequirements context is required');
  else {
    const result = validateLearningRequirements(learningRequirements);
    if (!result.valid) errors.push(`learningRequirements is invalid: ${result.errors.join('; ')}`);
  }
  if (!materialPlan) errors.push('materialPlan context is required');
  else {
    const result = validateMaterialPlan(materialPlan, { learningRequirements, retrievalIndex });
    if (!result.valid) errors.push(`materialPlan is invalid: ${result.errors.join('; ')}`);
  }
  if (!retrievalIndex || !Array.isArray(retrievalIndex.documents)) errors.push('retrievalIndex context with documents is required');
  if (!Array.isArray(canonicalProblems)) errors.push('canonicalProblems context is required');

  const item = materialPlan?.items?.find((candidate) => candidate.id === generation.materialPlanItemId);
  if (!item) errors.push('materialPlanItemId must reference materialPlan.items');
  if (item && generation.materialPlanRef?.id !== materialPlan.id) errors.push('materialPlanRef.id does not match materialPlan');
  if (item && generation.materialPlanRef?.version !== materialPlan.version) errors.push('materialPlanRef.version does not match materialPlan');

  const action = item?.problemDecision?.action;
  if (action && !problemGenerationActionValues.includes(action)) {
    errors.push(`Problem Generation is only allowed for actions: ${problemGenerationActionValues.join(', ')}`);
  }
  if (item && !problemGenerationActionValues.includes(action)) {
    errors.push('Problem Generation requires a Material Plan action of generate or adapt');
  }

  let context = null;
  if (learningRequirements && materialPlan && retrievalIndex && Array.isArray(canonicalProblems) && item) {
    try {
      context = createProblemGenerationContext({
        learningRequirements,
        materialPlan,
        materialPlanItemId: generation.materialPlanItemId,
        retrievalIndex,
        canonicalProblems,
      });
    } catch (error) {
      errors.push(`Problem Generation context could not be resolved: ${error.message}`);
    }
  }

  const selectedInteraction = context?.interactionRef;
  const interactionRecord = retrievalIndex?.interactions?.find((record) => record.id === selectedInteraction?.id);
  const targetDemoType = interactionRecord?.demoTypes?.length === 1 ? interactionRecord.demoTypes[0] : null;
  if (item && (!interactionRecord || interactionRecord.demoTypes?.length !== 1)) {
    errors.push('Problem Generation requires an implemented selected Interaction');
  }

  if (!isObject(generation.candidateProblem)) {
    errors.push('candidateProblem must be an object');
  } else if (targetDemoType && generation.candidateProblem.type !== targetDemoType) {
    errors.push('candidateProblem.type must match selected Interaction demoType');
  }

  if (!isObject(generation.alignment)) {
    errors.push('alignment must be an object');
  } else {
    addUnknownFields(generation.alignment, problemGenerationAlignmentFields, 'alignment', errors);
    requireNonEmptyString(generation.alignment.learningPointId, 'alignment.learningPointId', errors);
    requireNonEmptyString(generation.alignment.rationale, 'alignment.rationale', errors);
    if (item && generation.alignment.learningPointId !== item.learningPointId) {
      errors.push('alignment.learningPointId must match materialPlan item');
    }
    const learningPoint = learningRequirements?.learningPoints?.find((point) => point.id === generation.alignment.learningPointId);
    if (!learningPoint) errors.push('alignment.learningPointId must reference learningRequirements');
    validateSourceEvidenceRefs(generation.alignment.sourceEvidenceRefs, learningPoint, errors);
  }

  if (context?.action === 'adapt') {
    const sourceProblem = resolveCanonicalProblem(canonicalProblems, context.sourceProblemRef);
    if (!sourceProblem) errors.push('adapt requires a resolvable source Problem selection');
    else {
      if (sourceProblem.type !== targetDemoType) errors.push('adapt source Problem type must match selected Interaction demoType');
      if (generation.candidateProblem?.id === sourceProblem.id) errors.push('adapt candidateProblem.id must differ from source Problem id');
    }
  }

  if (Array.isArray(canonicalProblems)) {
    const canonicalValidation = validateProblems(canonicalProblems);
    if (!canonicalValidation.valid) errors.push(`canonicalProblems is invalid: ${canonicalValidation.errors.join('; ')}`);
    if (isObject(generation.candidateProblem)) {
      const candidateValidation = validateProblems([...canonicalProblems, generation.candidateProblem]);
      if (!candidateValidation.valid) errors.push(`candidateProblem is invalid: ${candidateValidation.errors.join('; ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
