import { isKebabCaseTag, isKnownLearningIntent } from './schema.js';

export const retrievalKinds = Object.freeze(['interaction', 'problem', 'lesson']);
export const retrievalQueryFields = Object.freeze([
  'kinds',
  'learningIntents',
  'includeTerms',
  'preferredTags',
  'avoidTags',
  'demoTypes',
  'interactionPatterns',
  'interactionTypes',
  'limit',
]);
export const retrievalDefaultLimit = 10;
export const retrievalMaxLimit = 100;

function validateNonEmptyStringArray(query, field, errors, { kebabCase = false } = {}) {
  if (query[field] === undefined) return;
  if (!Array.isArray(query[field]) || query[field].length === 0) {
    errors.push(`${field} must be a non-empty array when provided`);
    return;
  }
  query[field].forEach((value) => {
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${field} must contain non-empty strings`);
      return;
    }
    if (kebabCase && !isKebabCaseTag(value)) {
      errors.push(`${field} must contain lowercase-kebab-case tags: ${value}`);
    }
  });
}

export function validateRetrievalQuery(query) {
  const errors = [];
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    return { valid: false, errors: ['Retrieval query must be an object'] };
  }

  Object.keys(query)
    .filter((field) => !retrievalQueryFields.includes(field))
    .forEach((field) => errors.push(`Unknown retrieval query field: ${field}`));

  if (query.kinds !== undefined) {
    if (!Array.isArray(query.kinds) || query.kinds.length === 0) {
      errors.push('kinds must be a non-empty array when provided');
    } else {
      query.kinds.forEach((kind) => {
        if (!retrievalKinds.includes(kind)) errors.push(`Invalid retrieval kind: ${kind}`);
      });
    }
  }

  if (query.learningIntents !== undefined) {
    validateNonEmptyStringArray(query, 'learningIntents', errors);
    if (Array.isArray(query.learningIntents)) query.learningIntents.forEach((intent) => {
      if (typeof intent === 'string' && !isKnownLearningIntent(intent)) {
        errors.push(`Unknown learning intent: ${intent}`);
      }
    });
  }
  validateNonEmptyStringArray(query, 'includeTerms', errors);
  validateNonEmptyStringArray(query, 'preferredTags', errors, { kebabCase: true });
  validateNonEmptyStringArray(query, 'avoidTags', errors, { kebabCase: true });
  validateNonEmptyStringArray(query, 'demoTypes', errors, { kebabCase: true });
  validateNonEmptyStringArray(query, 'interactionPatterns', errors, { kebabCase: true });
  validateNonEmptyStringArray(query, 'interactionTypes', errors, { kebabCase: true });

  if (query.limit !== undefined && (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > retrievalMaxLimit)) {
    errors.push(`limit must be an integer between 1 and ${retrievalMaxLimit}`);
  }

  if (Object.keys(query).length === 0) errors.push('Retrieval query must contain at least one field');
  return { valid: errors.length === 0, errors };
}
