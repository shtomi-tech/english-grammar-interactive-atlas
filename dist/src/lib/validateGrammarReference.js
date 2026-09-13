import {
  grammarReferenceFormats,
  grammarReferenceLimits,
  grammarReferenceTopLevelFields,
  normalizeGrammarReference,
} from './ai/grammar-reference.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireNonEmptyString(value, path, errors) {
  if (typeof value !== 'string' || value.trim() === '') errors.push(`${path} must be a non-empty string`);
}

export function validateGrammarReference(grammarReference) {
  if (!isObject(grammarReference)) return { valid: false, errors: ['Grammar Reference must be an object'] };
  const errors = [];
  Object.keys(grammarReference)
    .filter((field) => !grammarReferenceTopLevelFields.includes(field))
    .forEach((field) => errors.push(`Unknown Grammar Reference field: ${field}`));
  const normalized = normalizeGrammarReference(grammarReference);
  requireNonEmptyString(normalized.id, 'id', errors);
  requireNonEmptyString(normalized.sourceId, 'sourceId', errors);
  requireNonEmptyString(normalized.title, 'title', errors);
  if (!grammarReferenceFormats.includes(normalized.format)) {
    errors.push(`format must be one of: ${grammarReferenceFormats.join(', ')}`);
  }
  requireNonEmptyString(normalized.content, 'content', errors);
  if (typeof normalized.content === 'string' && normalized.content.length > grammarReferenceLimits.maxCharacters) {
    errors.push(`content must not exceed ${grammarReferenceLimits.maxCharacters} characters`);
  }
  return { valid: errors.length === 0, errors };
}

export function validateSingleSourceReference(grammarReference, learningRequirements) {
  const errors = [];
  const sourceReferences = learningRequirements?.sourceReferences;
  if (!Array.isArray(sourceReferences) || sourceReferences.length !== 1) {
    errors.push('Learning Requirements must contain exactly one source reference');
    return { valid: false, errors };
  }
  const [sourceReference] = sourceReferences;
  if (sourceReference?.id !== grammarReference?.sourceId) {
    errors.push('sourceReferences[0].id must match grammarReference.sourceId');
  }
  if (sourceReference?.title !== grammarReference?.title) {
    errors.push('sourceReferences[0].title must match grammarReference.title');
  }
  if (sourceReference?.type !== 'user-provided') {
    errors.push("sourceReferences[0].type must be 'user-provided'");
  }
  return { valid: errors.length === 0, errors };
}
