import {
  materialPlanActionValues,
  materialPlanInteractionCanonicalRefFields,
  materialPlanInteractionSelectionFields,
  materialPlanItemFields,
  materialPlanLearningRequirementsRefFields,
  materialPlanProblemCanonicalRefFields,
  materialPlanProblemDecisionFields,
  materialPlanReasonFields,
  materialPlanSelectedInteractionFields,
  materialPlanSelectedProblemFields,
  materialPlanSelectionFields,
  materialPlanTopLevelFields,
  materialPlanVersion,
} from '../data/ai/material-plan-schema.js';
import { validateRetrievalQuery } from '../data/ai/retrieval-query-schema.js';
import { validateLearningRequirements } from './validateLearningRequirements.js';
import { searchRetrievalIndex } from './ai/retrieval-search.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function addUnknownFields(value, allowedFields, path, errors) {
  if (!isObject(value)) return;
  Object.keys(value)
    .filter((field) => !allowedFields.includes(field))
    .forEach((field) => errors.push(`Unknown Material Plan field: ${path}.${field}`));
}

function requireNonEmptyString(value, path, errors) {
  if (typeof value !== 'string' || value.trim() === '') errors.push(`${path} must be a non-empty string`);
}

function requirePositiveInteger(value, path, errors) {
  if (!Number.isInteger(value) || value < 1) errors.push(`${path} must be a positive integer`);
}

function requireFiniteNumber(value, path, errors) {
  if (typeof value !== 'number' || !Number.isFinite(value)) errors.push(`${path} must be a finite number`);
}

function validateReasons(reasons, path, errors) {
  if (!Array.isArray(reasons) || reasons.length === 0) {
    errors.push(`${path} must be a non-empty array`);
    return;
  }
  reasons.forEach((reason, index) => {
    const reasonPath = `${path}[${index}]`;
    if (!isObject(reason)) {
      errors.push(`${reasonPath} must be an object`);
      return;
    }
    addUnknownFields(reason, materialPlanReasonFields, reasonPath, errors);
    requireNonEmptyString(reason.field, `${reasonPath}.field`, errors);
    requireNonEmptyString(reason.value, `${reasonPath}.value`, errors);
    requireFiniteNumber(reason.score, `${reasonPath}.score`, errors);
  });
}

function validateCanonicalRef(canonicalRef, kind, path, errors) {
  const allowedFields = kind === 'interaction'
    ? materialPlanInteractionCanonicalRefFields
    : materialPlanProblemCanonicalRefFields;
  if (!isObject(canonicalRef)) {
    errors.push(`${path} must be an object`);
    return;
  }
  addUnknownFields(canonicalRef, allowedFields, path, errors);
  requireNonEmptyString(canonicalRef.kind, `${path}.kind`, errors);
  requireNonEmptyString(canonicalRef.id, `${path}.id`, errors);
  if (canonicalRef.kind !== kind) errors.push(`${path}.kind must be ${kind}`);
  if (kind === 'problem') requireNonEmptyString(canonicalRef.type, `${path}.type`, errors);
}

function validateSelected(value, kind, path, retrievalIndex, errors) {
  const allowedFields = kind === 'interaction'
    ? materialPlanSelectedInteractionFields
    : materialPlanSelectedProblemFields;
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return null;
  }
  addUnknownFields(value, allowedFields, path, errors);
  validateCanonicalRef(value.canonicalRef, kind, `${path}.canonicalRef`, errors);
  requirePositiveInteger(value.rank, `${path}.rank`, errors);
  requireFiniteNumber(value.score, `${path}.score`, errors);
  validateReasons(value.reasons, `${path}.reasons`, errors);
  if (!retrievalIndex || !Array.isArray(retrievalIndex.documents)) return null;

  const document = retrievalIndex.documents.find((entry) => sameValue(entry.canonicalRef, value.canonicalRef));
  if (!document) {
    errors.push(`${path}.canonicalRef must reference a document in retrievalIndex`);
    return null;
  }
  if (document.kind !== kind) errors.push(`${path}.canonicalRef resolves to the wrong kind`);
  if (kind === 'problem' && document.type !== value.canonicalRef.type) {
    errors.push(`${path}.canonicalRef.type does not match the selected document`);
  }
  return document;
}

function validateSelection(value, kind, path, retrievalIndex, errors, { required = true } = {}) {
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return null;
  }
  addUnknownFields(value, materialPlanSelectionFields, path, errors);
  const queryPath = `${path}.query`;
  const queryValidation = validateRetrievalQuery(value.query);
  if (!queryValidation.valid) errors.push(`${queryPath} is invalid: ${queryValidation.errors.join('; ')}`);
  if (isObject(value.query) && !value.query.kinds?.includes(kind)) {
    errors.push(`${queryPath}.kinds must include ${kind}`);
  }
  if (value.selected === undefined) {
    if (required) errors.push(`${path}.selected is required`);
    return null;
  }
  let selectedDocument = validateSelected(value.selected, kind, `${path}.selected`, retrievalIndex, errors);
  if (!selectedDocument || !queryValidation.valid || !retrievalIndex) return selectedDocument;
  let results;
  try {
    results = searchRetrievalIndex(retrievalIndex, value.query);
  } catch (error) {
    errors.push(`${queryPath} could not be executed: ${error.message}`);
    return selectedDocument;
  }
  const expected = results.find((result) => sameValue(result.canonicalRef, value.selected.canonicalRef));
  if (!expected) {
    errors.push(`${path}.selected.canonicalRef is not present in the query results`);
    return selectedDocument;
  }
  if (value.selected.rank !== results.indexOf(expected) + 1) errors.push(`${path}.selected.rank does not match the query result`);
  if (value.selected.score !== expected.score) errors.push(`${path}.selected.score does not match the query result`);
  if (!sameValue(value.selected.reasons, expected.reasons)) errors.push(`${path}.selected.reasons do not match the query result`);
  return selectedDocument;
}

function validateLearningRequirementsReference(reference, learningRequirements, errors) {
  if (!isObject(reference)) {
    errors.push('learningRequirementsRef must be an object');
    return;
  }
  addUnknownFields(reference, materialPlanLearningRequirementsRefFields, 'learningRequirementsRef', errors);
  requireNonEmptyString(reference.id, 'learningRequirementsRef.id', errors);
  requireNonEmptyString(reference.version, 'learningRequirementsRef.version', errors);
  if (learningRequirements) {
    if (reference.id !== learningRequirements.id || reference.version !== learningRequirements.version) {
      errors.push('learningRequirementsRef does not match learningRequirements');
    }
  }
}

function validateProblemDecision(decision, path, interactionDocument, retrievalIndex, errors) {
  if (!isObject(decision)) {
    errors.push(`${path} must be an object`);
    return;
  }
  addUnknownFields(decision, materialPlanProblemDecisionFields, path, errors);
  const action = decision.action;
  if (!materialPlanActionValues.includes(action)) {
    errors.push(`${path}.action must be one of: ${materialPlanActionValues.join(', ')}`);
    return;
  }
  if (['adapt', 'generate', 'unresolved'].includes(action)) requireNonEmptyString(decision.reason, `${path}.reason`, errors);
  const hasProblemSelection = decision.problemSelection !== undefined;
  const hasSourceProblemSelection = decision.sourceProblemSelection !== undefined;
  if (action === 'reuse') {
    if (!hasProblemSelection) errors.push(`${path}.problemSelection is required for reuse`);
    if (hasSourceProblemSelection) errors.push(`${path}.sourceProblemSelection is not allowed for reuse`);
  }
  if (action === 'adapt') {
    if (!hasSourceProblemSelection) errors.push(`${path}.sourceProblemSelection is required for adapt`);
    if (hasProblemSelection) errors.push(`${path}.problemSelection is not allowed for adapt`);
  }
  if (['generate', 'unresolved'].includes(action) && (hasProblemSelection || hasSourceProblemSelection)) {
    errors.push(`${path} must not contain a Problem selection for ${action}`);
  }

  let selectedInteractionImplemented = false;
  if (interactionDocument) {
    const interactionRecord = retrievalIndex?.interactions?.find((record) => record.id === interactionDocument.id);
    selectedInteractionImplemented = Array.isArray(interactionRecord?.demoTypes) && interactionRecord.demoTypes.length === 1;
    if (['reuse', 'adapt', 'generate'].includes(action) && !selectedInteractionImplemented) {
      errors.push(`${path}.action ${action} requires an implemented Interaction`);
    }
  } else if (['reuse', 'adapt', 'generate'].includes(action)) {
    errors.push(`${path}.action ${action} requires a selected Interaction`);
  }

  const selection = action === 'adapt' ? decision.sourceProblemSelection : decision.problemSelection;
  if (selection !== undefined && interactionDocument) {
    const problemDocument = validateSelection(selection, 'problem', `${path}.${action === 'adapt' ? 'sourceProblemSelection' : 'problemSelection'}`, retrievalIndex, errors, { required: true });
    const expectedDemoType = interactionDocument.demoTypes?.[0];
    if (problemDocument && expectedDemoType && problemDocument.type !== expectedDemoType) {
      errors.push(`${path} selected Problem type must match selected Interaction demoType`);
    }
  }
  if (action === 'reuse' && hasProblemSelection && !interactionDocument) {
    validateSelection(decision.problemSelection, 'problem', `${path}.problemSelection`, retrievalIndex, errors);
  }
  if (action === 'adapt' && hasSourceProblemSelection && !interactionDocument) {
    validateSelection(decision.sourceProblemSelection, 'problem', `${path}.sourceProblemSelection`, retrievalIndex, errors);
  }
  if (action === 'generate' && !selectedInteractionImplemented) {
    errors.push(`${path}.action generate requires an implemented Interaction`);
  }
}

export function validateMaterialPlan(plan, { learningRequirements, retrievalIndex } = {}) {
  const errors = [];
  if (!isObject(plan)) return { valid: false, errors: ['Material Plan must be an object'] };
  addUnknownFields(plan, materialPlanTopLevelFields, '', errors);
  if (plan.version !== materialPlanVersion) errors.push('version must be 1');
  requireNonEmptyString(plan.id, 'id', errors);
  validateLearningRequirementsReference(plan.learningRequirementsRef, learningRequirements, errors);
  if (!learningRequirements) errors.push('learningRequirements context is required');
  else {
    const learningRequirementsValidation = validateLearningRequirements(learningRequirements);
    if (!learningRequirementsValidation.valid) errors.push(`learningRequirements is invalid: ${learningRequirementsValidation.errors.join('; ')}`);
  }
  if (!retrievalIndex || !Array.isArray(retrievalIndex.documents)) errors.push('retrievalIndex context with documents is required');

  if (!Array.isArray(plan.items) || plan.items.length === 0) {
    errors.push('items must be a non-empty array');
    return { valid: errors.length === 0, errors };
  }
  const learningPointIds = new Set(learningRequirements?.learningPoints?.map((point) => point.id) ?? []);
  const coveredLearningPointIds = new Set();
  const itemIds = new Set();
  plan.items.forEach((item, index) => {
    const path = `items[${index}]`;
    if (!isObject(item)) {
      errors.push(`${path} must be an object`);
      return;
    }
    addUnknownFields(item, materialPlanItemFields, path, errors);
    requireNonEmptyString(item.id, `${path}.id`, errors);
    if (typeof item.id === 'string' && item.id.trim() !== '') {
      if (itemIds.has(item.id)) errors.push(`Duplicate Material Plan item id: ${item.id}`);
      itemIds.add(item.id);
    }
    requireNonEmptyString(item.learningPointId, `${path}.learningPointId`, errors);
    if (typeof item.learningPointId === 'string' && learningPointIds.has(item.learningPointId)) coveredLearningPointIds.add(item.learningPointId);
    else if (typeof item.learningPointId === 'string') errors.push(`${path}.learningPointId must reference learningRequirements`);
    const interactionSelection = validateSelection(item.interactionSelection, 'interaction', `${path}.interactionSelection`, retrievalIndex, errors, {
      required: item.problemDecision?.action !== 'unresolved',
    });
    const interactionDocument = interactionSelection;
    validateProblemDecision(item.problemDecision, `${path}.problemDecision`, interactionDocument, retrievalIndex, errors);
    requireNonEmptyString(item.rationale, `${path}.rationale`, errors);
  });
  learningPointIds.forEach((learningPointId) => {
    if (!coveredLearningPointIds.has(learningPointId)) errors.push(`Learning Point is not covered: ${learningPointId}`);
  });
  return { valid: errors.length === 0, errors };
}
