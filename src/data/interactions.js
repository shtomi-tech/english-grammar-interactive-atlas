import {
  interactionCategories,
  interactionCategoryLabels,
  interactionRanks,
  licenseStatuses,
  originalSourceMetadata,
  researchStatuses,
  reusePolicies,
  sourceTypes,
} from './interaction-schema.js';
import { additionalInteractions } from './interactions-additional.js';
import { researchRefsByInteractionId } from './research/mappings.js';

/**
 * @typedef {'build'|'move'|'select'|'classify'|'transform'|'visualize'|'generate'|'compare'|'correct'|'simulate'} InteractionCategory
 * @typedef {'S'|'A'|'B'} InteractionRank
 * @typedef {'code'|'logic'|'ui-reference'|'idea-only'} ReusePolicy
 * @typedef {Object} InteractionEntry
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {InteractionCategory} category
 * @property {string} description
 * @property {string} learningGoal
 * @property {string} touchTarget
 * @property {string} userAction
 * @property {string} changingElement
 * @property {string} insight
 * @property {string[]} targetGrammar
 * @property {string[]} interactionType
 * @property {string[]} feedbackType
 * @property {1|2|3|4|5} implementationDifficulty
 * @property {InteractionRank} reusability
 * @property {string} [sourceName]
 * @property {string} [sourceUrl]
 * @property {string} [repositoryUrl]
 * @property {string} [license]
 * @property {'original'|'repository'|'site'} sourceType
 * @property {'verified'|'unresearched'} researchStatus
 * @property {'verified'|'unknown'|'not-applicable'} licenseStatus
 * @property {ReusePolicy} reusePolicy
 * @property {string[]} [researchRefs]
 * @property {string} [demoType]
 * @property {string} [notes]
 */

export const categoryOptions = [
  { id: 'all', label: 'All' },
  ...interactionCategories.map((id) => ({ id, label: interactionCategoryLabels[id] })),
];

export { interactionRanks, licenseStatuses, researchStatuses, reusePolicies, sourceTypes };

/** @type {InteractionEntry[]} */
const initialInteractions = [
  {
    id: 'GRAM-INT-001',
    slug: 'word-order-builder',
    title: 'Word Order Builder',
    category: 'build',
    description: '単語カードを並べ替えて、英文の骨格を組み立てる。',
    learningGoal: '主語・動詞・目的語の基本語順を、手を動かして理解する。',
    touchTarget: '単語カード',
    userAction: 'タップ / クリック',
    changingElement: '回答欄の語順',
    insight: '英語の基本語順は Subject + Verb + Object で組み立てる。',
    targetGrammar: ['文型', 'SVO', '関係詞 (relative clauses)'],
    interactionType: ['tap-to-place', 'sequence'],
    feedbackType: ['正誤', '説明'],
    implementationDifficulty: 2,
    reusability: 'S',
    sourceName: 'Original prototype',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    demoType: 'word-order',
    notes: '語句単位へ拡張すれば、疑問文や節の組み合わせにも使える。',
  },
  {
    id: 'GRAM-INT-002',
    slug: 'drag-into-blank',
    title: 'Drag into Blank',
    category: 'move',
    description: '語句を空欄へ移動し、文の中での役割を確かめる。',
    learningGoal: '語句の位置と、文全体の意味のつながりを意識する。',
    touchTarget: '選択肢カードと空欄',
    userAction: 'タップ / ドラッグ',
    changingElement: '文中の空欄',
    insight: '同じ語句でも置く場所で文の意味や自然さが変わる。',
    targetGrammar: ['語順', '修飾語', '前置詞'],
    interactionType: ['tap-to-place', 'drag-and-drop'],
    feedbackType: ['正誤', 'ヒント'],
    implementationDifficulty: 3,
    reusability: 'S',
    sourceName: 'Original concept',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    notes: 'ドラッグは補助操作とし、タップでも完結させる。',
  },
  {
    id: 'GRAM-INT-003',
    slug: 'mark-the-parts',
    title: 'Mark the Parts',
    category: 'select',
    description: '英文中の語を選び、主語・動詞・目的語の関係を見つける。',
    learningGoal: '英文を意味のかたまりではなく、文の役割から読めるようにする。',
    touchTarget: '英文中のトークン',
    userAction: 'タップ / クリック',
    changingElement: '選択状態と構造ラベル',
    insight: '文の要素にはそれぞれ役割があり、組み合わせで文ができる。',
    targetGrammar: ['文型', '品詞', 'S / V / O'],
    interactionType: ['token-select', 'role-reveal'],
    feedbackType: ['正誤', '構造表示'],
    implementationDifficulty: 2,
    reusability: 'S',
    sourceName: 'Original prototype',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    demoType: 'mark-parts',
    notes: '将来は補語・修飾語・関係詞節も同じTokenモデルで扱う。',
  },
  {
    id: 'GRAM-INT-004',
    slug: 'grammar-classifier',
    title: 'Grammar Classifier',
    category: 'classify',
    description: '語句を品詞や文の役割ごとのグループへ分類する。',
    learningGoal: '形ではなく、文中での働きによって語句を捉える。',
    touchTarget: '語句カードと分類先',
    userAction: 'タップ / クリック',
    changingElement: '分類先と分類結果',
    insight: '語句の種類と文中の役割を区別して考えられる。',
    targetGrammar: ['品詞', 'S / V / O / C', '句と節'],
    interactionType: ['classification', 'sorting'],
    feedbackType: ['正誤', '分類理由'],
    implementationDifficulty: 3,
    reusability: 'S',
    sourceName: 'Original concept',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    demoType: 'grammar-classifier',
    notes: '分類軸をデータで差し替えられるようにする。',
  },
  {
    id: 'GRAM-INT-005',
    slug: 'sentence-transformer',
    title: 'Sentence Transformer',
    category: 'transform',
    description: '主語・時制・否定の条件を変え、英文の変化を比較する。',
    learningGoal: '文法条件の変更が、動詞や助動詞へどう反映されるかを理解する。',
    touchTarget: '主語・時制・否定のコントロール',
    userAction: '選択 / 切り替え',
    changingElement: '生成された英文',
    insight: '文法情報を組み合わせると、必要な形が決まる。',
    targetGrammar: ['時制', '三単現', '否定文'],
    interactionType: ['state-selection', 'sentence-generation'],
    feedbackType: ['即時変化', '構造ラベル'],
    implementationDifficulty: 3,
    reusability: 'S',
    sourceName: 'Original prototype',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    demoType: 'sentence-transformer',
    notes: '文法状態から生成するため、将来の文生成エンジン差し替えに対応しやすい。',
  },
  {
    id: 'GRAM-INT-006',
    slug: 'syntax-visualizer',
    title: 'Syntax Visualizer',
    category: 'visualize',
    description: '英文を句・節・修飾関係の図として表示する。',
    learningGoal: '目に見えにくい英文の階層構造を、位置関係で捉える。',
    touchTarget: '語句・ノード・関係線',
    userAction: 'クリック / 展開',
    changingElement: '構造図の階層',
    insight: '英文は単語の列ではなく、まとまりが重なった構造である。',
    targetGrammar: ['文型', '句と節', '関係詞 (relative clauses)'],
    interactionType: ['tree-view', 'highlight'],
    feedbackType: ['強調表示', '構造説明'],
    implementationDifficulty: 4,
    reusability: 'A',
    sourceName: 'Original concept',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    notes: 'SVGまたはDOMのノード構造をデータから生成する。',
  },
  {
    id: 'GRAM-INT-007',
    slug: 'sentence-generator',
    title: 'Sentence Generator',
    category: 'generate',
    description: '主語・動詞・時制などの条件から、文法的な英文を生成する。',
    learningGoal: '文法規則を、完成した英文を作る手順として理解する。',
    touchTarget: '文法条件の選択肢',
    userAction: '選択 / 生成',
    changingElement: '生成文と構造情報',
    insight: '英文は単語を並べるだけでなく、条件に応じて形を変える。',
    targetGrammar: ['時制', '助動詞', '態'],
    interactionType: ['form-select', 'generation'],
    feedbackType: ['生成結果', '規則説明'],
    implementationDifficulty: 4,
    reusability: 'A',
    demoType: 'sentence-generator',
    sourceName: 'Original concept',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    notes: '生成器と表示器を分離し、データを追加しやすくする。',
  },
  {
    id: 'GRAM-INT-008',
    slug: 'sentence-comparison',
    title: 'Sentence Comparison',
    category: 'compare',
    description: '似た英文を並べ、形の差と意味の差を対応づける。',
    learningGoal: '似た表現を、文脈と構造の違いから使い分ける。',
    touchTarget: '比較する英文と差分箇所',
    userAction: '切り替え / 強調',
    changingElement: '差分表示と意味メモ',
    insight: '小さな形の差が、動作の捉え方や意味の差になる。',
    targetGrammar: ['不定詞', '動名詞', '比較'],
    interactionType: ['side-by-side', 'diff-highlight'],
    feedbackType: ['差分強調', '意味比較'],
    implementationDifficulty: 2,
    reusability: 'S',
    demoType: 'sentence-comparison',
    sourceName: 'Original concept',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    notes: '比較するペアをJSONデータとして登録する。',
  },
  {
    id: 'GRAM-INT-009',
    slug: 'error-corrector',
    title: 'Error Corrector',
    category: 'correct',
    description: '誤りのある英文を直し、どこをなぜ変えたかを確認する。',
    learningGoal: '文法規則を、誤りを発見して修正する判断へ結びつける。',
    touchTarget: '誤りのある語句',
    userAction: '選択 / 修正',
    changingElement: '誤りの箇所と訂正文',
    insight: '正しい形だけでなく、誤りが生まれた条件まで説明できる。',
    targetGrammar: ['三単現', '時制', '一致'],
    interactionType: ['error-spotting', 'correction'],
    feedbackType: ['正誤', '修正理由'],
    implementationDifficulty: 3,
    reusability: 'S',
    demoType: 'error-corrector',
    sourceName: 'Original concept',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    notes: '許容される別解と、学習上の代表解を分けて管理する。',
  },
  {
    id: 'GRAM-INT-010',
    slug: 'context-grammar',
    title: 'Context Grammar',
    category: 'simulate',
    description: '場面と会話の流れの中で、適切な文法表現を選ぶ。',
    learningGoal: '文法形式を、実際の目的や文脈に合う選択として使う。',
    touchTarget: '会話の選択肢',
    userAction: '選択 / 返答',
    changingElement: '場面の進行と返答',
    insight: '文法の選択は、話し手の目的と場面に結びついている。',
    targetGrammar: ['助動詞', '依頼表現', '時制'],
    interactionType: ['scenario', 'choice'],
    feedbackType: ['会話結果', '場面別ヒント'],
    implementationDifficulty: 4,
    reusability: 'A',
    demoType: 'context-grammar',
    sourceName: 'Original concept',
    ...originalSourceMetadata,
    reusePolicy: 'idea-only',
    notes: '場面・選択肢・結果を独立したデータとして管理する。',
  },
];

export const interactions = [...initialInteractions, ...additionalInteractions].map((entry) => {
  const researchRefs = researchRefsByInteractionId[entry.id];
  return researchRefs ? { ...entry, researchRefs: [...researchRefs] } : entry;
});

export function getInteractionBySlug(slug) {
  return interactions.find((entry) => entry.slug === slug);
}
