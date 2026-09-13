export const retrievalBenchmarks = Object.freeze([
  {
    id: 'interaction-sentence-assembly',
    description: '英文の語順を組み立てさせたい',
    query: {
      kinds: ['interaction'],
      learningIntents: ['assemble-sentence'],
      includeTerms: ['word order'],
    },
    expectedTopIds: ['GRAM-INT-001'],
    maxRank: 3,
  },
  {
    id: 'interaction-modifier-placement',
    description: '修飾語の位置による意味差に気づかせたい',
    query: {
      kinds: ['interaction'],
      learningIntents: ['compare-placement', 'connect-position-and-meaning'],
      preferredTags: ['placement-affects-meaning'],
    },
    expectedTopIds: ['GRAM-INT-014'],
    maxRank: 3,
  },
  {
    id: 'interaction-contextual-choice',
    description: '文法的に正しいだけでなく、場面の目的に合う表現を選ばせたい',
    query: {
      kinds: ['interaction'],
      learningIntents: ['choose-in-context'],
      preferredTags: ['choosing-a-contextual-response'],
    },
    expectedTopIds: ['GRAM-INT-010'],
    maxRank: 3,
  },
  {
    id: 'interaction-visualize-relation',
    description: '修飾語とかかり先の関係を視覚化したい',
    query: {
      kinds: ['interaction'],
      learningIntents: ['visualize-relation'],
      preferredTags: ['inspecting-modifier-relations'],
    },
    expectedTopIds: ['GRAM-INT-027'],
    maxRank: 3,
  },
  {
    id: 'interaction-gerund-infinitive-comparison',
    description: '動名詞と不定詞の意味差を比較したい',
    query: {
      kinds: ['interaction'],
      learningIntents: ['compare-meaning'],
      preferredTags: ['distinguishing-infinitive-and-gerund'],
    },
    expectedTopIds: ['GRAM-INT-008', 'GRAM-INT-032'],
    maxRank: 3,
  },
  {
    id: 'problem-sentence-comparison',
    description: 'stop + 動名詞とstop + 不定詞の違いを比較する既存Problemを探したい',
    query: {
      kinds: ['problem'],
      interactionTypes: ['sentence-comparison'],
      includeTerms: ['stopped smoking', 'stopped to smoke'],
    },
    expectedTopIds: ['SC-001'],
    maxRank: 1,
  },
  {
    id: 'problem-gerund-example',
    description: 'enjoyと動名詞を扱うLesson 06向けの既存Problemを探したい',
    query: {
      kinds: ['problem'],
      includeTerms: ['enjoy', 'gerund'],
    },
    expectedTopIds: ['WO-008', 'MP-004', 'GC-005', 'EC-007', 'CG-007'],
    maxRank: 3,
  },
  {
    id: 'lesson-gerund',
    description: '動名詞のLessonを探したい',
    query: {
      kinds: ['lesson'],
      includeTerms: ['gerund', '動名詞'],
    },
    expectedTopIds: ['LESSON-006'],
    maxRank: 3,
  },
  {
    id: 'lesson-infinitive',
    description: '不定詞のLessonを探したい',
    query: {
      kinds: ['lesson'],
      includeTerms: ['infinitive', '不定詞'],
    },
    expectedTopIds: ['LESSON-005'],
    maxRank: 3,
  },
]);
