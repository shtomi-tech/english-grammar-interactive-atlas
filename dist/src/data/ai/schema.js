export const learningIntentVocabulary = Object.freeze([
  'assemble-sentence',
  'practice-word-order',
  'identify-element',
  'identify-role',
  'classify-form',
  'classify-function',
  'classify-role',
  'compare-form',
  'compare-meaning',
  'compare-placement',
  'observe-transformation',
  'observe-state-change',
  'visualize-structure',
  'visualize-relation',
  'generate-from-conditions',
  'correct-form',
  'diagnose-error',
  'choose-in-context',
  'match-form-to-purpose',
  'explore-placement',
  'observe-modifier-scope',
  'connect-form-and-meaning',
  'connect-position-and-meaning',
  'connect-context-and-form',
]);

export const kebabTagPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isKebabCaseTag(value) {
  return typeof value === 'string' && kebabTagPattern.test(value);
}

export function isKnownLearningIntent(value) {
  return learningIntentVocabulary.includes(value);
}
