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
    acceptedAnswers: [['i', 'play', 'tennis']],
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
    acceptedAnswers: [['she', 'likes', 'music']],
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
    acceptedAnswers: [['my-brother', 'is', 'kind']],
    explanation: 'be動詞の後ろの補語が、主語の状態を説明する SVC の文です。',
    grammar: ['SVC', 'be-verb', 'complement'],
  },
  {
    id: 'WO-004',
    type: 'word-order',
    prompt: 'どちらも自然な語順になるように、英文を組み立ててください。',
    words: [
      { id: 'they', text: 'They' },
      { id: 'visit', text: 'visit' },
      { id: 'the-museum', text: 'the museum' },
      { id: 'on-sundays', text: 'on Sundays' },
    ],
    acceptedAnswers: [
      ['they', 'visit', 'the-museum', 'on-sundays'],
      ['on-sundays', 'they', 'visit', 'the-museum'],
    ],
    hints: [
      'まず、だれが行うかを表す主語を探してみましょう。',
      '時間を表す語句は、文の最後にも文の最初にも置けます。',
    ],
    explanation: 'They visit the museum on Sundays. と On Sundays they visit the museum. は、どちらも自然な語順です。',
    grammar: ['SVO', 'adverbial-phrase', 'word-order'],
  },
  {
    id: 'WO-005',
    type: 'word-order',
    prompt: '助動詞を含む英文を、自然な語順に組み立ててください。',
    words: [
      { id: 'you', text: 'You' },
      { id: 'should', text: 'should' },
      { id: 'study', text: 'study' },
      { id: 'today', text: 'today' },
    ],
    acceptedAnswers: [['you', 'should', 'study', 'today']],
    explanation: '助動詞の後ろには動詞の原形を置きます。基本語順は Subject + Modal + Base Verb です。',
    grammar: ['modal', 'base-verb', 'word-order'],
  },
];

export const wordOrderProblem = wordOrderProblems[0];
