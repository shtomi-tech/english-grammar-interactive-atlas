import { researchReferences } from './references.js';

export { researchReferences } from './references.js';
export { researchRefsByInteractionId } from './mappings.js';
export * from './schema.js';

export const researchReferenceRegistry = Object.fromEntries(
  researchReferences.map((reference) => [reference.id, reference]),
);

export function getResearchReferenceById(id) {
  return researchReferenceRegistry[id];
}

export function getResearchReferencesByIds(ids = []) {
  return ids.map((id) => getResearchReferenceById(id)).filter(Boolean);
}
