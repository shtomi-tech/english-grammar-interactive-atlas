export const markPartsProblems = [
  {
    id: 'MP-001',
    type: 'mark-parts',
    prompt: '「主語を選んでください。」',
    targetRole: 'Subject',
    tokens: [
      { id: 'the', text: 'The', role: 'Subject' },
      { id: 'boy', text: 'boy', role: 'Subject' },
      { id: 'plays', text: 'plays', role: 'Verb' },
      { id: 'soccer', text: 'soccer', role: 'Object' },
    ],
    answer: ['the', 'boy'],
    explanation: '「だれが・なにが」にあたる語句が、この文の主語です。',
  },
  {
    id: 'MP-002',
    type: 'mark-parts',
    prompt: '「動作をする人・もの、つまり主語を選んでください。」',
    targetRole: 'Subject',
    tokens: [
      { id: 'my', text: 'My', role: 'Subject' },
      { id: 'sister', text: 'sister', role: 'Subject' },
      { id: 'likes', text: 'likes', role: 'Verb' },
      { id: 'music', text: 'music', role: 'Object' },
    ],
    answer: ['my', 'sister'],
    explanation: 'My sister が「だれが」にあたり、動作 likes の主語です。',
  },
  {
    id: 'MP-003',
    type: 'mark-parts',
    prompt: '「主語の状態を説明する補語を選んでください。」',
    targetRole: 'Complement',
    tokens: [
      { id: 'tom', text: 'Tom', role: 'Subject' },
      { id: 'is', text: 'is', role: 'Verb' },
      { id: 'happy', text: 'happy', role: 'Complement' },
    ],
    answer: ['happy'],
    explanation: 'happy は be動詞 is の後ろで、Tom の状態を説明する補語です。',
  },
];

export const markPartsProblem = markPartsProblems[0];
