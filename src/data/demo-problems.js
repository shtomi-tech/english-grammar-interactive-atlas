export const wordOrderProblem = {
  id: 'word-order-basic-001',
  prompt: '単語カードをタップして、英文を完成させてください。',
  words: [
    { id: 'i', text: 'I' },
    { id: 'play', text: 'play' },
    { id: 'tennis', text: 'tennis' },
  ],
  initialOrder: ['tennis', 'i', 'play'],
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

export const transformerDefaults = {
  subject: 'he',
  verb: 'play',
  tense: 'present',
  negative: false,
};
