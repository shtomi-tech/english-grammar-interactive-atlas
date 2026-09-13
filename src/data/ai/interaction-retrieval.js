export const interactionRetrievalMetadata = {
  'GRAM-INT-001': {
    learningIntents: ['assemble-sentence', 'practice-word-order'],
    bestFor: ['reconstructing-sentence-order', 'checking-sequence-constraints'],
    notBestFor: ['free-form-generation'],
  },
  'GRAM-INT-002': {
    learningIntents: ['explore-placement', 'connect-position-and-meaning'],
    bestFor: ['placing-a-phrase-in-context', 'observing-slot-effects'],
    notBestFor: ['assembling-an-entire-sentence'],
  },
  'GRAM-INT-003': {
    learningIntents: ['identify-element', 'identify-role'],
    bestFor: ['finding-sentence-roles', 'role-based-reading'],
    notBestFor: ['free-form-generation'],
  },
  'GRAM-INT-004': {
    learningIntents: ['classify-form', 'classify-function', 'classify-role'],
    bestFor: ['classifying-phrase-function', 'comparing-grammatical-roles'],
    notBestFor: ['assembling-sentence-order'],
  },
  'GRAM-INT-005': {
    learningIntents: ['observe-transformation', 'observe-state-change', 'connect-form-and-meaning'],
    bestFor: ['comparing-grammar-states', 'tracing-form-changes'],
    notBestFor: ['open-ended-sentence-authoring'],
  },
  'GRAM-INT-006': {
    learningIntents: ['visualize-structure', 'visualize-relation'],
    bestFor: ['inspecting-sentence-hierarchy', 'tracing-syntax-relations'],
    notBestFor: ['correcting-surface-errors'],
  },
  'GRAM-INT-007': {
    learningIntents: ['generate-from-conditions', 'connect-form-and-meaning'],
    bestFor: ['generating-a-controlled-sentence', 'testing-grammar-state'],
    notBestFor: ['unstructured-free-text-generation'],
  },
  'GRAM-INT-008': {
    learningIntents: ['compare-form', 'compare-meaning'],
    bestFor: ['comparing-contrasting-sentences', 'linking-form-to-meaning'],
    notBestFor: ['building-a-single-sentence'],
  },
  'GRAM-INT-009': {
    learningIntents: ['correct-form', 'diagnose-error'],
    bestFor: ['diagnosing-a-patterned-error', 'explaining-a-correction'],
    notBestFor: ['open-ended-proofreading'],
  },
  'GRAM-INT-010': {
    learningIntents: ['choose-in-context', 'match-form-to-purpose', 'connect-context-and-form'],
    bestFor: ['choosing-a-contextual-response', 'comparing-goal-fit'],
    notBestFor: ['isolated-form-drills'],
  },
  'GRAM-INT-011': {
    learningIntents: ['assemble-sentence', 'identify-role'],
    bestFor: ['mapping-slots-to-roles', 'building-a-sentence-skeleton'],
    notBestFor: ['paragraph-composition'],
  },
  'GRAM-INT-012': {
    learningIntents: ['assemble-sentence', 'practice-word-order'],
    bestFor: ['building-question-structure', 'tracing-question-word-order'],
    notBestFor: ['evaluating-a-conversation-answer'],
  },
  'GRAM-INT-013': {
    learningIntents: ['assemble-sentence', 'connect-form-and-meaning'],
    bestFor: ['joining-clause-relations', 'building-a-complex-sentence'],
    notBestFor: ['isolated-word-order-drills'],
  },
  'GRAM-INT-014': {
    learningIntents: ['explore-placement', 'compare-placement', 'connect-position-and-meaning'],
    bestFor: ['placement-affects-meaning', 'multiple-valid-placements'],
    notBestFor: ['assembling-an-entire-sentence'],
  },
  'GRAM-INT-015': {
    learningIntents: ['explore-placement', 'compare-placement', 'observe-state-change'],
    bestFor: ['observing-adverb-scope', 'comparing-focus-shifts'],
    notBestFor: ['combining-independent-clauses'],
  },
  'GRAM-INT-016': {
    learningIntents: ['observe-transformation', 'practice-word-order'],
    bestFor: ['reordering-clause-position', 'comparing-punctuation-effects'],
    notBestFor: ['word-level-error-correction'],
  },
  'GRAM-INT-017': {
    learningIntents: ['identify-element', 'identify-role'],
    bestFor: ['finding-specified-sentence-roles', 'role-based-reading'],
    notBestFor: ['word-definition-practice'],
  },
  'GRAM-INT-018': {
    learningIntents: ['identify-element', 'identify-role'],
    bestFor: ['marking-clause-boundaries', 'identifying-clause-structure'],
    notBestFor: ['full-sentence-generation'],
  },
  'GRAM-INT-019': {
    learningIntents: ['identify-element', 'visualize-relation'],
    bestFor: ['finding-modifier-phrases', 'tracing-modifier-targets'],
    notBestFor: ['moving-a-modifier-between-positions'],
  },
  'GRAM-INT-020': {
    learningIntents: ['classify-form', 'classify-role'],
    bestFor: ['classifying-parts-of-speech', 'comparing-form-and-function'],
    notBestFor: ['assembling-sentence-order'],
  },
  'GRAM-INT-021': {
    learningIntents: ['classify-form', 'classify-function'],
    bestFor: ['distinguishing-phrase-and-clause', 'detecting-finite-verbs'],
    notBestFor: ['generating-syntax'],
  },
  'GRAM-INT-022': {
    learningIntents: ['classify-function', 'connect-form-and-meaning'],
    bestFor: ['classifying-verb-valency', 'linking-verbs-to-objects'],
    notBestFor: ['conjugation-drills'],
  },
  'GRAM-INT-023': {
    learningIntents: ['observe-transformation', 'observe-state-change', 'connect-form-and-meaning'],
    bestFor: ['comparing-voice', 'tracking-role-reversal'],
    notBestFor: ['stylistic-free-writing'],
  },
  'GRAM-INT-024': {
    learningIntents: ['observe-transformation', 'connect-form-and-meaning'],
    bestFor: ['tracing-reported-speech-changes', 'comparing-tense-shifts'],
    notBestFor: ['writing-an-open-ended-dialogue'],
  },
  'GRAM-INT-025': {
    learningIntents: ['observe-transformation', 'compare-form', 'compare-meaning'],
    bestFor: ['changing-comparison-degree', 'linking-form-to-comparison'],
    notBestFor: ['ranking-unstated-meaning'],
  },
  'GRAM-INT-026': {
    learningIntents: ['visualize-structure', 'identify-role'],
    bestFor: ['inspecting-sentence-patterns', 'mapping-roles-to-slots'],
    notBestFor: ['creative-sentence-generation'],
  },
  'GRAM-INT-027': {
    learningIntents: ['visualize-relation', 'identify-role'],
    bestFor: ['inspecting-modifier-relations', 'tracing-target-connections'],
    notBestFor: ['changing-modifier-placement'],
  },
  'GRAM-INT-028': {
    learningIntents: ['visualize-structure', 'visualize-relation'],
    bestFor: ['inspecting-clause-hierarchy', 'tracing-nested-clauses'],
    notBestFor: ['correcting-word-forms'],
  },
  'GRAM-INT-029': {
    learningIntents: ['generate-from-conditions', 'observe-state-change'],
    bestFor: ['generating-tense-variants', 'connecting-time-to-form'],
    notBestFor: ['open-ended-writing'],
  },
  'GRAM-INT-030': {
    learningIntents: ['generate-from-conditions', 'observe-transformation'],
    bestFor: ['generating-a-question-from-a-target', 'mapping-question-types'],
    notBestFor: ['simulating-a-whole-conversation'],
  },
  'GRAM-INT-031': {
    learningIntents: ['generate-from-conditions', 'connect-form-and-meaning'],
    bestFor: ['building-condition-result-pairs', 'connecting-tense-to-condition'],
    notBestFor: ['open-ended-argument-writing'],
  },
  'GRAM-INT-032': {
    learningIntents: ['compare-form', 'compare-meaning'],
    bestFor: ['comparing-verb-patterns', 'distinguishing-infinitive-and-gerund'],
    notBestFor: ['full-sentence-construction'],
  },
  'GRAM-INT-033': {
    learningIntents: ['compare-form', 'compare-meaning'],
    bestFor: ['comparing-voice-choices', 'mapping-agent-and-patient'],
    notBestFor: ['open-ended-style-editing'],
  },
  'GRAM-INT-034': {
    learningIntents: ['compare-form', 'compare-meaning'],
    bestFor: ['comparing-time-frames', 'connecting-tense-to-meaning'],
    notBestFor: ['spontaneous-sentence-generation'],
  },
  'GRAM-INT-035': {
    learningIntents: ['correct-form', 'diagnose-error'],
    bestFor: ['diagnosing-subject-verb-agreement', 'correcting-inflection'],
    notBestFor: ['free-form-proofreading'],
  },
  'GRAM-INT-036': {
    learningIntents: ['correct-form', 'diagnose-error', 'connect-form-and-meaning'],
    bestFor: ['diagnosing-tense-mismatch', 'aligning-time-cues-and-form'],
    notBestFor: ['stylistic-editing'],
  },
  'GRAM-INT-037': {
    learningIntents: ['correct-form', 'diagnose-error', 'practice-word-order'],
    bestFor: ['diagnosing-order-errors', 'reconstructing-sentence-order'],
    notBestFor: ['meaning-only-comparison'],
  },
  'GRAM-INT-038': {
    learningIntents: ['choose-in-context', 'match-form-to-purpose', 'connect-context-and-form'],
    bestFor: ['choosing-a-polite-request', 'matching-register-to-situation'],
    notBestFor: ['isolated-conjugation'],
  },
  'GRAM-INT-039': {
    learningIntents: ['choose-in-context', 'match-form-to-purpose', 'connect-context-and-form'],
    bestFor: ['practicing-travel-dialogue', 'choosing-a-purpose-fit-response'],
    notBestFor: ['sentence-diagramming'],
  },
  'GRAM-INT-040': {
    learningIntents: ['choose-in-context', 'match-form-to-purpose', 'connect-context-and-form'],
    bestFor: ['selecting-tense-from-time-cues', 'aligning-context-and-tense'],
    notBestFor: ['generating-all-tense-forms'],
  },
};
