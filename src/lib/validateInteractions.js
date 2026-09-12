import { categoryOptions } from '../data/interactions.js';

const allowedCategories = new Set(categoryOptions.filter((option) => option.id !== 'all').map((option) => option.id));
const allowedRanks = new Set(['S', 'A', 'B']);
const allowedReusePolicies = new Set(['code', 'logic', 'ui-reference', 'idea-only']);

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

    for (const field of ['id', 'slug', 'title', 'touchTarget', 'changingElement', 'insight']) {
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
    if (!Array.isArray(entry.targetGrammar)) errors.push(`${label}.targetGrammar must be an array`);

    if (entry.demoType !== undefined) {
      if (!hasText(entry.demoType)) errors.push(`${label}.demoType is invalid`);
      if (Array.isArray(registryKeys) && !registryKeys.includes(entry.demoType)) {
        errors.push(`${label}.demoType is not registered: ${entry.demoType}`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
