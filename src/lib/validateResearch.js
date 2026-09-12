import {
  researchLicenseStatuses,
  researchReusePolicies,
  researchSourceTypes,
  researchStatuses,
} from '../data/research/schema.js';

const allowedSourceTypes = new Set(researchSourceTypes);
const allowedStatuses = new Set(researchStatuses);
const allowedLicenseStatuses = new Set(researchLicenseStatuses);
const allowedReusePolicies = new Set(researchReusePolicies);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isHttpUrl(value) {
  return hasText(value) && /^https?:\/\/[^\s]+$/i.test(value);
}

function validateStringList(value, field, label, errors, { minLength = 1 } = {}) {
  if (!Array.isArray(value) || value.length < minLength || value.some((item) => !hasText(item))) {
    errors.push(`${label}.${field} must contain at least ${minLength} non-empty strings`);
  }
}

export function validateResearchReferences(references) {
  const errors = [];
  if (!Array.isArray(references)) return { valid: false, errors: ['references must be an array'] };

  const ids = new Set();
  references.forEach((reference, index) => {
    const label = `reference[${index}]`;
    if (!reference || typeof reference !== 'object') {
      errors.push(`${label} must be an object`);
      return;
    }
    if (!hasText(reference.id)) errors.push(`${label}.id is required`);
    if (hasText(reference.id)) {
      if (ids.has(reference.id)) errors.push(`duplicate research reference id: ${reference.id}`);
      ids.add(reference.id);
    }
    if (!hasText(reference.name)) errors.push(`${label}.name is required`);
    if (!allowedSourceTypes.has(reference.sourceType)) errors.push(`${label}.sourceType is invalid`);
    if (!allowedStatuses.has(reference.researchStatus)) errors.push(`${label}.researchStatus is invalid`);
    if (!allowedLicenseStatuses.has(reference.licenseStatus)) errors.push(`${label}.licenseStatus is invalid`);
    if (!allowedReusePolicies.has(reference.reusePolicy)) errors.push(`${label}.reusePolicy is invalid`);
    if (!isHttpUrl(reference.sourceUrl)) errors.push(`${label}.sourceUrl must be a verified HTTP(S) URL`);
    if (reference.sourceType === 'repository' && !isHttpUrl(reference.repositoryUrl)) {
      errors.push(`${label}.repositoryUrl is required for a repository reference`);
    }
    if (reference.licenseStatus === 'verified' && !hasText(reference.license)) {
      errors.push(`${label}.license is required for a verified license`);
    }
    if (reference.licenseStatus !== 'verified' && hasText(reference.license)) {
      errors.push(`${label}.license must be omitted unless licenseStatus is verified`);
    }
    if (!datePattern.test(reference.verifiedAt ?? '')) errors.push(`${label}.verifiedAt must use YYYY-MM-DD`);
    validateStringList(reference.observedPatterns, 'observedPatterns', label, errors);
    validateStringList(reference.atlasImplications, 'atlasImplications', label, errors);
    if (!hasText(reference.learningValue)) errors.push(`${label}.learningValue is required`);
    if (!hasText(reference.reuseNotes)) errors.push(`${label}.reuseNotes is required`);
  });

  return { valid: errors.length === 0, errors };
}

export function validateResearchRegistry(registry, references = []) {
  const errors = [];
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    return { valid: false, errors: ['registry must be an object'] };
  }
  for (const reference of references) {
    if (registry[reference.id] !== reference) errors.push(`registry does not point to ${reference.id}`);
  }
  if (Object.keys(registry).length !== references.length) errors.push('registry size does not match references');
  return { valid: errors.length === 0, errors };
}
