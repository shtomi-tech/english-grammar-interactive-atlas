import {
  learningRequirementAudienceFields,
  learningRequirementAudienceStages,
  learningRequirementConstraintFields,
  learningRequirementDesiredOutcomes,
  learningRequirementImportanceValues,
  learningRequirementLearningPointFields,
  learningRequirementLocatorFields,
  learningRequirementsVersion,
  learningRequirementSourceEvidenceFields,
  learningRequirementSourceReferenceFields,
  learningRequirementSourceTypes,
  learningRequirementTopLevelFields,
} from '../data/ai/learning-requirements-schema.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function addUnknownFields(value, allowedFields, path, errors) {
  if (!isObject(value)) return;
  Object.keys(value)
    .filter((field) => !allowedFields.includes(field))
    .forEach((field) => errors.push(`Unknown Learning Requirements field: ${path ? `${path}.` : ''}${field}`));
}

function requireNonEmptyString(value, path, errors) {
  if (typeof value !== 'string' || value.trim() === '') errors.push(`${path} must be a non-empty string`);
}

function validatePositiveInteger(value, path, errors) {
  if (!Number.isInteger(value) || value < 1) errors.push(`${path} must be a positive integer`);
}

function validateSourceReferences(sourceReferences, errors) {
  if (!Array.isArray(sourceReferences) || sourceReferences.length === 0) {
    errors.push('sourceReferences must be a non-empty array');
    return new Set();
  }
  const sourceIds = new Set();
  sourceReferences.forEach((source, index) => {
    const path = `sourceReferences[${index}]`;
    if (!isObject(source)) {
      errors.push(`${path} must be an object`);
      return;
    }
    addUnknownFields(source, learningRequirementSourceReferenceFields, path, errors);
    requireNonEmptyString(source.id, `${path}.id`, errors);
    if (typeof source.id === 'string' && source.id.trim() !== '') {
      if (sourceIds.has(source.id)) errors.push(`Duplicate source reference id: ${source.id}`);
      sourceIds.add(source.id);
    }
    if (!learningRequirementSourceTypes.includes(source.type)) {
      errors.push(`${path}.type must be one of: ${learningRequirementSourceTypes.join(', ')}`);
    }
    requireNonEmptyString(source.title, `${path}.title`, errors);
  });
  return sourceIds;
}

function validateAudience(audience, errors) {
  if (audience === undefined) return;
  if (!isObject(audience)) {
    errors.push('audience must be an object');
    return;
  }
  addUnknownFields(audience, learningRequirementAudienceFields, 'audience', errors);
  if (audience.stage !== undefined && !learningRequirementAudienceStages.includes(audience.stage)) {
    errors.push(`audience.stage must be one of: ${learningRequirementAudienceStages.join(', ')}`);
  }
}

function validateConstraints(constraints, errors) {
  if (constraints === undefined) return;
  if (!isObject(constraints)) {
    errors.push('constraints must be an object');
    return;
  }
  addUnknownFields(constraints, learningRequirementConstraintFields, 'constraints', errors);
  if (constraints.durationMinutes !== undefined) validatePositiveInteger(constraints.durationMinutes, 'constraints.durationMinutes', errors);
  if (constraints.maxLearningPoints !== undefined) validatePositiveInteger(constraints.maxLearningPoints, 'constraints.maxLearningPoints', errors);
  if (constraints.language !== undefined) requireNonEmptyString(constraints.language, 'constraints.language', errors);
}

function validateLocator(locator, path, errors) {
  if (!isObject(locator)) {
    errors.push(`${path} must be a non-empty object`);
    return;
  }
  addUnknownFields(locator, learningRequirementLocatorFields, path, errors);
  if (Object.keys(locator).length === 0) errors.push(`${path} must be a non-empty object`);
  ['page', 'paragraph', 'line', 'offset'].forEach((field) => {
    if (locator[field] !== undefined) validatePositiveInteger(locator[field], `${path}.${field}`, errors);
  });
  ['section', 'heading'].forEach((field) => {
    if (locator[field] !== undefined) requireNonEmptyString(locator[field], `${path}.${field}`, errors);
  });
  if (locator.quote !== undefined) requireNonEmptyString(locator.quote, `${path}.quote`, errors);
}

function validateSourceEvidence(sourceEvidence, sourceIds, path, errors) {
  if (!Array.isArray(sourceEvidence) || sourceEvidence.length === 0) {
    errors.push(`${path} must be a non-empty array`);
    return;
  }
  sourceEvidence.forEach((evidence, index) => {
    const evidencePath = `${path}[${index}]`;
    if (!isObject(evidence)) {
      errors.push(`${evidencePath} must be an object`);
      return;
    }
    addUnknownFields(evidence, learningRequirementSourceEvidenceFields, evidencePath, errors);
    requireNonEmptyString(evidence.sourceId, `${evidencePath}.sourceId`, errors);
    if (typeof evidence.sourceId === 'string' && !sourceIds.has(evidence.sourceId)) {
      errors.push(`${evidencePath}.sourceId must reference a known sourceReferences id`);
    }
    validateLocator(evidence.locator, `${evidencePath}.locator`, errors);
    requireNonEmptyString(evidence.summary, `${evidencePath}.summary`, errors);
  });
}

function validateLearningPoints(learningPoints, sourceIds, errors) {
  if (!Array.isArray(learningPoints) || learningPoints.length === 0) {
    errors.push('learningPoints must be a non-empty array');
    return;
  }
  const pointIds = new Set();
  learningPoints.forEach((point, index) => {
    const path = `learningPoints[${index}]`;
    if (!isObject(point)) {
      errors.push(`${path} must be an object`);
      return;
    }
    addUnknownFields(point, learningRequirementLearningPointFields, path, errors);
    requireNonEmptyString(point.id, `${path}.id`, errors);
    if (typeof point.id === 'string' && point.id.trim() !== '') {
      if (pointIds.has(point.id)) errors.push(`Duplicate learning point id: ${point.id}`);
      pointIds.add(point.id);
    }
    requireNonEmptyString(point.concept, `${path}.concept`, errors);
    requireNonEmptyString(point.summary, `${path}.summary`, errors);
    if (!learningRequirementImportanceValues.includes(point.importance)) {
      errors.push(`${path}.importance must be one of: ${learningRequirementImportanceValues.join(', ')}`);
    }
    if (!Array.isArray(point.desiredOutcomes) || point.desiredOutcomes.length === 0) {
      errors.push(`${path}.desiredOutcomes must be a non-empty array`);
    } else {
      const outcomes = new Set();
      point.desiredOutcomes.forEach((outcome) => {
        if (!learningRequirementDesiredOutcomes.includes(outcome)) {
          errors.push(`${path}.desiredOutcomes contains an unknown outcome: ${outcome}`);
        }
        if (outcomes.has(outcome)) errors.push(`${path}.desiredOutcomes must not contain duplicates`);
        outcomes.add(outcome);
      });
    }
    validateSourceEvidence(point.sourceEvidence, sourceIds, `${path}.sourceEvidence`, errors);
  });
}

export function validateLearningRequirements(requirements) {
  const errors = [];
  if (!isObject(requirements)) return { valid: false, errors: ['Learning Requirements must be an object'] };
  addUnknownFields(requirements, learningRequirementTopLevelFields, '', errors);
  if (requirements.version !== learningRequirementsVersion) errors.push('version must be 1');
  requireNonEmptyString(requirements.id, 'id', errors);
  requireNonEmptyString(requirements.topic, 'topic', errors);
  const sourceIds = validateSourceReferences(requirements.sourceReferences, errors);
  validateAudience(requirements.audience, errors);
  validateConstraints(requirements.constraints, errors);
  validateLearningPoints(requirements.learningPoints, sourceIds, errors);
  if (
    Number.isInteger(requirements.constraints?.maxLearningPoints)
    && Array.isArray(requirements.learningPoints)
    && requirements.learningPoints.length > requirements.constraints.maxLearningPoints
  ) {
    errors.push('learningPoints must not exceed constraints.maxLearningPoints');
  }
  return { valid: errors.length === 0, errors };
}
