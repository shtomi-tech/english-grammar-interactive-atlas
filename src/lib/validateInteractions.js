import {
  interactionCategories,
  interactionRanks,
  licenseStatuses,
  researchStatuses,
  reusePolicies,
  sourceTypes,
} from '../data/interaction-schema.js';

const allowedCategories = new Set(interactionCategories);
const allowedRanks = new Set(interactionRanks);
const allowedReusePolicies = new Set(reusePolicies);
const allowedSourceTypes = new Set(sourceTypes);
const allowedResearchStatuses = new Set(researchStatuses);
const allowedLicenseStatuses = new Set(licenseStatuses);
const requiredTextFields = [
  'id',
  'slug',
  'title',
  'description',
  'learningGoal',
  'touchTarget',
  'userAction',
  'changingElement',
  'insight',
];
const requiredArrayFields = ['targetGrammar', 'interactionType', 'feedbackType'];

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateInteractions(entries, { registryKeys } = {}) {
  const errors = [];
  if (!Array.isArray(entries)) return { valid: false, errors: ['entries must be an array'] };

  const ids = new Set();
  const slugs = new Set();
  entries.forEach((entry, index) => {
    const label = `entry[${index}]`;
    if (!entry || typeof entry !== 'object') {
      errors.push(`${label} must be an object`);
      return;
    }

    for (const field of requiredTextFields) {
      if (!hasText(entry[field])) errors.push(`${label}.${field} is required`);
    }
    if (hasText(entry.id)) {
      if (ids.has(entry.id)) errors.push(`duplicate id: ${entry.id}`);
      ids.add(entry.id);
    }
    if (hasText(entry.slug)) {
      if (slugs.has(entry.slug)) errors.push(`duplicate slug: ${entry.slug}`);
      slugs.add(entry.slug);
    }
    if (!allowedCategories.has(entry.category)) errors.push(`${label}.category is invalid`);
    if (!Number.isInteger(entry.implementationDifficulty) || entry.implementationDifficulty < 1 || entry.implementationDifficulty > 5) {
      errors.push(`${label}.implementationDifficulty is invalid`);
    }
    if (!allowedRanks.has(entry.reusability)) errors.push(`${label}.reusability is invalid`);
    if (!allowedReusePolicies.has(entry.reusePolicy)) errors.push(`${label}.reusePolicy is invalid`);
    for (const field of requiredArrayFields) {
      if (!Array.isArray(entry[field])) {
        errors.push(`${label}.${field} must be an array`);
      } else if (entry[field].length === 0 || entry[field].some((value) => !hasText(value))) {
        errors.push(`${label}.${field} must contain non-empty strings`);
      }
    }

    if (!allowedSourceTypes.has(entry.sourceType)) errors.push(`${label}.sourceType is invalid`);
    if (!allowedResearchStatuses.has(entry.researchStatus)) errors.push(`${label}.researchStatus is invalid`);
    if (!allowedLicenseStatuses.has(entry.licenseStatus)) errors.push(`${label}.licenseStatus is invalid`);
    if (entry.researchStatus === 'verified' && entry.sourceType === 'repository' && !hasText(entry.repositoryUrl)) {
      errors.push(`${label}.repositoryUrl is required for a verified repository source`);
    }
    if (entry.researchStatus === 'verified' && entry.sourceType === 'site' && !hasText(entry.sourceUrl)) {
      errors.push(`${label}.sourceUrl is required for a verified site source`);
    }
    if (entry.licenseStatus === 'verified' && !hasText(entry.license)) {
      errors.push(`${label}.license is required for a verified license`);
    }
    if (entry.licenseStatus === 'unknown' && hasText(entry.license)) {
      errors.push(`${label}.license must be omitted when licenseStatus is unknown`);
    }
    if (entry.licenseStatus === 'not-applicable' && hasText(entry.license)) {
      errors.push(`${label}.license must be omitted when licenseStatus is not-applicable`);
    }

    if (entry.demoType !== undefined) {
      if (!hasText(entry.demoType)) errors.push(`${label}.demoType is invalid`);
      if (Array.isArray(registryKeys) && !registryKeys.includes(entry.demoType)) {
        errors.push(`${label}.demoType is not registered: ${entry.demoType}`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
