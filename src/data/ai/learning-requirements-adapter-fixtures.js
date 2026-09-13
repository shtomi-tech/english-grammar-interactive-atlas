export const plainTextGrammarReference = Object.freeze({
  id: 'GRAMMAR-REF-AI-PLAIN-001',
  sourceId: 'SOURCE-AI-PLAIN-001',
  title: 'Comparison Notes — plain text',
  format: 'text',
  content: 'This box is bigger than that one.\nas ... as は同程度を表す。\n比較級 + than は差を表す。',
});

export const markdownGrammarReference = Object.freeze({
  id: 'GRAMMAR-REF-AI-001',
  sourceId: 'SOURCE-AI-001',
  title: 'Comparison Notes',
  format: 'markdown',
  content: '# 同程度\nas ... as は同程度を表す。\n\n## 比較級\n比較級 + than は差を表す。',
});

export const comparisonLearningRequirements = Object.freeze({
  version: '1',
  id: 'LR-AI-001',
  topic: 'comparatives and equal comparison',
  sourceReferences: [
    { id: 'SOURCE-AI-001', type: 'user-provided', title: 'Comparison Notes' },
  ],
  audience: { stage: 'high-school' },
  constraints: { durationMinutes: 10, language: 'ja' },
  learningPoints: [
    {
      id: 'LP-AI-001',
      concept: 'as ... as',
      summary: 'as ... as は2つが同じ程度であることを表す。',
      importance: 'core',
      desiredOutcomes: ['compare-meaning'],
      sourceEvidence: [{
        sourceId: 'SOURCE-AI-001',
        locator: { section: '同程度' },
        summary: '同程度を表すas ... asの説明がある。',
      }],
    },
    {
      id: 'LP-AI-002',
      concept: 'comparative + than',
      summary: '比較級 + than は一方が他方より上回ることを表す。',
      importance: 'supporting',
      desiredOutcomes: ['compare-meaning'],
      sourceEvidence: [{
        sourceId: 'SOURCE-AI-001',
        locator: { quote: '比較級 + than は差を表す。' },
        summary: '比較級とthanで差を表す説明がある。',
      }],
    },
  ],
});

export const plainTextLearningRequirements = Object.freeze({
  version: '1',
  id: 'LR-AI-PLAIN-001',
  topic: 'comparatives',
  sourceReferences: [
    { id: 'SOURCE-AI-PLAIN-001', type: 'user-provided', title: 'Comparison Notes — plain text' },
  ],
  learningPoints: [
    {
      id: 'LP-AI-PLAIN-001',
      concept: 'bigger than',
      summary: '比較級 + than は一方が他方より大きいことを表す。',
      importance: 'core',
      desiredOutcomes: ['compare-meaning'],
      sourceEvidence: [{
        sourceId: 'SOURCE-AI-PLAIN-001',
        locator: { quote: 'This box is bigger than that one.' },
        summary: '比較級を含む例文がある。',
      }],
    },
  ],
});

export function createFixtureLearningRequirementsAdapter(learningRequirements = comparisonLearningRequirements) {
  return {
    async extractLearningRequirements() {
      return structuredClone(learningRequirements);
    },
  };
}
