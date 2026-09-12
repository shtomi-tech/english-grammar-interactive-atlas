export const SUPPORTED_TENSES = new Set(['present', 'past']);
export const SUPPORTED_MODALS = new Set(['can', 'could', 'should', 'must']);

export function getGrammarStateMode(source = {}) {
  const hasTense = source?.tense !== undefined;
  const hasModal = source?.modal !== undefined;
  if (hasTense && hasModal) return 'invalid';
  if (hasModal) return 'modal';
  return 'tense';
}
