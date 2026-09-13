export const outcomeRetrievalProfiles = Object.freeze({
  'recognize-form': { learningIntents: ['identify-element', 'compare-form'] },
  'produce-form': { learningIntents: ['assemble-sentence', 'generate-from-conditions'] },
  'identify-role': { learningIntents: ['identify-role'] },
  'classify-function': { learningIntents: ['classify-function'] },
  'understand-meaning': { learningIntents: ['connect-form-and-meaning'] },
  'compare-meaning': { learningIntents: ['compare-meaning'] },
  'understand-rule': { learningIntents: ['connect-form-and-meaning'] },
  'apply-rule': { learningIntents: ['assemble-sentence', 'connect-form-and-meaning'] },
  'diagnose-error': { learningIntents: ['diagnose-error'] },
  'correct-error': { learningIntents: ['correct-form'] },
  'choose-in-context': { learningIntents: ['choose-in-context'] },
  'explain-choice': { learningIntents: ['match-form-to-purpose', 'connect-context-and-form'] },
});
