export const wordOrderProblems = [
  {
    id: 'WO-001',
    type: 'word-order',
    prompt: '単語カードをタップして、英文を完成させてください。',
    words: [
      { id: 'i', text: 'I' },
      { id: 'play', text: 'play' },
      { id: 'tennis', text: 'tennis' },
    ],
    answer: ['i', 'play', 'tennis'],
    explanation: '英語の基本語順は Subject + Verb + Object です。',
    grammar: ['SVO', 'present-simple'],
  },
  {
    id: 'WO-002',
    type: 'word-order',
    prompt: '主語に合わせて、自然な英文を組み立ててください。',
    words: [
      { id: 'she', text: 'She' },
      { id: 'likes', text: 'likes' },
      { id: 'music', text: 'music' },
    ],
    answer: ['she', 'likes', 'music'],
    explanation: '三人称単数の主語 She の現在形では、動詞に s がつきます。',
    grammar: ['SVO', 'third-person-singular', 'present-simple'],
  },
  {
    id: 'WO-003',
    type: 'word-order',
    prompt: '主語・動詞・補語の順に、英文を組み立ててください。',
    words: [
      { id: 'my-brother', text: 'My brother' },
      { id: 'is', text: 'is' },
      { id: 'kind', text: 'kind' },
    ],
    answer: ['my-brother', 'is', 'kind'],
    explanation: 'be動詞の後ろの補語が、主語の状態を説明する SVC の文です。',
    grammar: ['SVC', 'be-verb', 'complement'],
  },
];

export const wordOrderProblem = wordOrderProblems[0];
