import { errorCorrectorProblems } from '../problems/error-corrector.js';
import { wordOrderProblems } from '../problems/word-order.js';

export const syntheticGrammarReference = {
  id: 'GRAMMAR-REF-E2E-001',
  sourceId: 'SOURCE-E2E-001',
  title: 'Verb Patterns — stop / decide / avoid',
  type: 'synthetic-text',
  sections: [
    {
      id: 'SECTION-E2E-STOP',
      heading: 'Stop patterns',
      content: 'stop + -ing はその行為をやめることを表し、stop + to-infinitive は別の行為をするために立ち止まることを表す。',
    },
    {
      id: 'SECTION-E2E-DECIDE',
      heading: 'Decide pattern',
      content: 'decide の後ろでは to-infinitive を用いて、何かをすることを決める意味を表す。',
    },
    {
      id: 'SECTION-E2E-AVOID',
      heading: 'Avoid pattern',
      content: 'avoid の後ろでは gerund を用いる。',
    },
  ],
};

export const e2eLearningRequirements = {
  version: '1',
  id: 'LR-E2E-001',
  topic: 'verb patterns: stop, decide, avoid',
  sourceReferences: [
    { id: 'SOURCE-E2E-001', type: 'user-provided', title: syntheticGrammarReference.title },
  ],
  learningPoints: [
    {
      id: 'LP-E2E-001',
      concept: 'stopped smoking',
      summary: 'stop + gerund と stop + to-infinitive の意味を比較する。',
      importance: 'core',
      desiredOutcomes: ['compare-meaning'],
      sourceEvidence: [{
        sourceId: 'SOURCE-E2E-001',
        locator: { section: 'Stop patterns' },
        summary: 'stopの後ろの形による意味の違いが説明されている。',
      }],
    },
    {
      id: 'LP-E2E-002',
      concept: 'decide + to-infinitive',
      summary: 'decideの後ろにto-infinitiveを置いて、決定の内容を表す。',
      importance: 'core',
      desiredOutcomes: ['produce-form'],
      sourceEvidence: [{
        sourceId: 'SOURCE-E2E-001',
        locator: { section: 'Decide pattern' },
        summary: 'decideの後ろではto-infinitiveを使うと説明されている。',
      }],
    },
    {
      id: 'LP-E2E-003',
      concept: 'avoid + gerund',
      summary: 'avoidの後ろにgerundを置く形を、誤りの訂正で確認する。',
      importance: 'supporting',
      desiredOutcomes: ['correct-error'],
      sourceEvidence: [{
        sourceId: 'SOURCE-E2E-001',
        locator: { section: 'Avoid pattern' },
        summary: 'avoidの後ろではgerundを使うと説明されている。',
      }],
    },
  ],
};

const generatedWordOrderProblem = structuredClone(wordOrderProblems[6]);
generatedWordOrderProblem.id = 'E2E-WO-001';
generatedWordOrderProblem.prompt = 'decide の後ろの to-infinitive に注目して、英文を組み立ててください。';
generatedWordOrderProblem.words = [
  { id: 'they', text: 'They' },
  { id: 'decided', text: 'decided' },
  { id: 'to', text: 'to' },
  { id: 'study', text: 'study' },
  { id: 'english', text: 'English' },
];
generatedWordOrderProblem.acceptedAnswers = [['they', 'decided', 'to', 'study', 'english']];
generatedWordOrderProblem.explanation = 'decideの後ろでは、to + 動詞の原形で決めた内容を表します。';
generatedWordOrderProblem.grammar = ['infinitive', 'base-verb', 'word-order'];

const generatedErrorCorrectorProblem = structuredClone(errorCorrectorProblems[6]);
generatedErrorCorrectorProblem.id = 'E2E-EC-001';
generatedErrorCorrectorProblem.prompt = 'avoid の後ろの動詞の形を正しく直してください。';
generatedErrorCorrectorProblem.tokens = [
  { id: 't1', text: 'They' },
  { id: 't2', text: 'avoid' },
  { id: 't3', text: 'to waste', correctionId: 'gerund-after-avoid' },
  { id: 't4', text: 'water.' },
];
generatedErrorCorrectorProblem.corrections = [{
  id: 'gerund-after-avoid',
  tokenId: 't3',
  options: [
    { id: 'o19', text: 'wasting' },
    { id: 'o20', text: 'to waste' },
    { id: 'o21', text: 'waste' },
  ],
  acceptedOptionIds: ['o19'],
  ruleLabel: 'Gerund after avoid',
  explanation: 'avoidの後ろでは、to不定詞ではなく動名詞を使うため、to wasteではなくwastingにします。',
}];
generatedErrorCorrectorProblem.explanation = 'avoidは後ろに動名詞を取る動詞なので、avoid + gerundの形にします。';

export const generatedProblemCandidates = Object.freeze([
  { learningPointId: 'LP-E2E-002', candidateProblem: generatedWordOrderProblem },
  { learningPointId: 'LP-E2E-003', candidateProblem: generatedErrorCorrectorProblem },
]);

export const candidateLesson = {
  id: 'E2E-LESSON-001',
  slug: 'verb-patterns-proof',
  label: 'E2E Verb Patterns Proof',
  title: '動詞の後ろの形を比べて使う',
  description: 'stop・decide・avoidの後ろに続く形を、比較・語順・訂正で確認します。',
  learningGoal: '動詞ごとの後続形式を意味と結び付け、正しい英文を組み立てたり誤りを直したりできるようにする。',
  steps: [
    {
      id: 'E2E-LESSON-001-STEP-01',
      interactionType: 'sentence-comparison',
      problemId: 'SC-001',
      title: 'stopの後ろの意味を比べる',
      instruction: 'stop + gerundとstop + to-infinitiveの二つの意味を、左右の英文で比較します。',
    },
    {
      id: 'E2E-LESSON-001-STEP-02',
      interactionType: 'word-order',
      problemId: 'E2E-WO-001',
      title: 'decide + to-infinitiveを組み立てる',
      instruction: 'decideの後ろにtoと動詞の原形を置き、英文を完成させます。',
    },
    {
      id: 'E2E-LESSON-001-STEP-03',
      interactionType: 'error-corrector',
      problemId: 'E2E-EC-001',
      title: 'avoid + gerundへ訂正する',
      instruction: 'avoidの後ろを動名詞に直し、正しい形を確認します。',
    },
  ],
};

export const e2eMaterialGenerationFixture = Object.freeze({
  grammarReference: syntheticGrammarReference,
  learningRequirements: e2eLearningRequirements,
  generatedProblemCandidates,
  candidateLesson,
});
