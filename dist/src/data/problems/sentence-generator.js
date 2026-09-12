const sharedControls = {
  subject: [
    { value: 'he', label: 'He' },
    { value: 'they', label: 'They' },
  ],
  tense: [
    { value: 'present', label: 'Present' },
    { value: 'past', label: 'Past' },
  ],
  negative: [
    { value: false, label: 'Affirmative' },
    { value: true, label: 'Negative' },
  ],
};

const sharedSentenceModel = {
  subjects: {
    he: { label: 'He', number: 'singular' },
    they: { label: 'They', number: 'plural' },
  },
  verb: { base: 'play', past: 'played' },
  object: 'tennis',
  punctuation: '.',
};

export const sentenceGeneratorProblems = [
  {
    id: 'SG-001',
    type: 'sentence-generator',
    prompt: '目標に合う英文を組み立て、Generateで確かめてください。',
    goal: {
      title: 'Present affirmative',
      description: 'He を主語にして、現在形の肯定文を作る。',
    },
    controls: structuredClone(sharedControls),
    targetStates: [{ subject: 'he', tense: 'present', negative: false }],
    sentenceModel: structuredClone(sharedSentenceModel),
    explanation: '三人称単数の現在形では、主語 He に合わせて動詞に -s が付きます。',
  },
  {
    id: 'SG-002',
    type: 'sentence-generator',
    prompt: '目標に合う英文を組み立て、Generateで確かめてください。',
    goal: {
      title: 'Past negative',
      description: 'They を主語にして、過去形の否定文を作る。',
    },
    controls: structuredClone(sharedControls),
    targetStates: [{ subject: 'they', tense: 'past', negative: true }],
    sentenceModel: structuredClone(sharedSentenceModel),
    explanation: '過去形の否定文では did not の後ろに動詞の原形 play を置きます。',
  },
  {
    id: 'SG-003',
    type: 'sentence-generator',
    prompt: '目標に合う英文を組み立て、複数の許容状態を確かめてください。',
    goal: {
      title: 'Past negative for either subject',
      description: 'He または They を主語にして、過去形の否定文を作る。',
    },
    controls: structuredClone(sharedControls),
    targetStates: [
      { subject: 'he', tense: 'past', negative: true },
      { subject: 'they', tense: 'past', negative: true },
    ],
    sentenceModel: structuredClone(sharedSentenceModel),
    explanation: '主語が変わっても、過去形の否定では did not の後ろに動詞の原形を置きます。',
  },
];

export const sentenceGeneratorProblem = sentenceGeneratorProblems[0];
