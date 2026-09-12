export const wordOrderProblem = {
  id: 'word-order-basic-001',
  prompt: '単語カードをタップして、英文を完成させてください。',
  words: [
    { id: 'i', text: 'I' },
    { id: 'play', text: 'play' },
    { id: 'tennis', text: 'tennis' },
  ],
  answer: ['i', 'play', 'tennis'],
  explanation: '英語の基本語順は Subject + Verb + Object です。',
};

export const markPartsProblem = {
  id: 'mark-parts-basic-001',
  prompt: '「主語を選んでください。」',
  tokens: [
    { id: 'the', text: 'The', role: 'Subject' },
    { id: 'boy', text: 'boy', role: 'Subject' },
    { id: 'plays', text: 'plays', role: 'Verb' },
    { id: 'soccer', text: 'soccer', role: 'Object' },
  ],
  answer: ['the', 'boy'],
};

export const grammarClassifierProblem = {
  id: 'grammar-classifier-basic-001',
  prompt: '語句カードを、英文の中での役割ごとに分類してください。',
  sentence: 'The young boy plays soccer after school.',
  categories: [
    { id: 'subject', label: 'Subject', explanation: '「だれが・なにが」にあたる主語です。' },
    { id: 'verb', label: 'Verb', explanation: '主語の動作や状態を表す動詞です。' },
    { id: 'object', label: 'Object', explanation: '動作の対象を表す目的語です。' },
    { id: 'modifier', label: 'Modifier', explanation: 'いつ・どこでなど、文に情報を加える修飾語です。' },
  ],
  items: [
    {
      id: 'young-boy',
      text: 'The young boy',
      answer: 'subject',
      explanation: '「だれが」にあたり、文の主語です。',
    },
    {
      id: 'plays',
      text: 'plays',
      answer: 'verb',
      explanation: '主語の動作を表す動詞です。',
    },
    {
      id: 'soccer',
      text: 'soccer',
      answer: 'object',
      explanation: 'play の動作の対象となる目的語です。',
    },
    {
      id: 'after-school',
      text: 'after school',
      answer: 'modifier',
      explanation: '動作がいつ起きるかを加える修飾語です。',
    },
  ],
  explanation: '英文は単語の列ではなく、役割を持つ語句のまとまりとして見ることができます。',
};

export const transformerDefaults = {
  subject: 'he',
  verb: 'play',
  tense: 'present',
  negative: false,
};
