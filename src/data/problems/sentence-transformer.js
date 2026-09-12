export const sentenceTransformerProblems = [
  {
    id: 'ST-001',
    type: 'sentence-transformer',
    prompt: '条件を変えると、英文の形がどう変わるか観察してください。',
    controls: {
      subject: [
        { value: 'he', label: 'He' },
        { value: 'they', label: 'They' },
      ],
      tense: [
        { value: 'present', label: 'Present' },
        { value: 'past', label: 'Past' },
      ],
      negative: [
        { value: false, label: 'OFF' },
        { value: true, label: 'ON' },
      ],
    },
    defaults: {
      subject: 'he',
      tense: 'present',
      negative: false,
    },
    sentenceModel: {
      subjects: {
        he: { label: 'He', number: 'singular' },
        they: { label: 'They', number: 'plural' },
      },
      verb: { base: 'play', past: 'played' },
      object: 'tennis',
      punctuation: '.',
    },
  },
];

export const sentenceTransformerProblem = sentenceTransformerProblems[0];
export const transformerDefaults = sentenceTransformerProblem.defaults;
