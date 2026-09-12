export const sentencePatternDiagramProblems = [
  {
    id: 'SPD-001',
    type: 'sentence-pattern-diagram',
    prompt: '英文の各要素を選び、文型の骨格を確認してください。',
    sentence: 'The boy plays soccer.',
    chunks: [
      {
        id: 'subject',
        text: 'The boy',
        role: 'S',
        label: 'Subject',
        explanation: '「だれが・なにが」にあたる文の主語です。',
      },
      {
        id: 'verb',
        text: 'plays',
        role: 'V',
        label: 'Verb',
        explanation: '主語の動作を表す動詞です。',
      },
      {
        id: 'object',
        text: 'soccer',
        role: 'O',
        label: 'Object',
        explanation: 'plays の動作の対象となる目的語です。',
      },
    ],
    pattern: ['S', 'V', 'O'],
    explanation: 'この文の骨格は S + V + O です。',
  },
  {
    id: 'SPD-002',
    type: 'sentence-pattern-diagram',
    prompt: '各要素を選び、主語と補語の関係を確認してください。',
    sentence: 'My brother is kind.',
    chunks: [
      {
        id: 'subject',
        text: 'My brother',
        role: 'S',
        label: 'Subject',
        explanation: '「だれが・なにが」にあたる文の主語です。',
      },
      {
        id: 'verb',
        text: 'is',
        role: 'V',
        label: 'Verb',
        explanation: '主語と補語をつなぐ動詞です。',
      },
      {
        id: 'complement',
        text: 'kind',
        role: 'C',
        label: 'Complement',
        explanation: '主語がどのようなものかを説明する補語です。',
      },
    ],
    pattern: ['S', 'V', 'C'],
    explanation: 'この文の骨格は S + V + C です。',
  },
  {
    id: 'SPD-003',
    type: 'sentence-pattern-diagram',
    prompt: '同じ役割記号が二度現れる文型も、要素ごとに確認してください。',
    sentence: 'The teacher gave the class homework.',
    chunks: [
      {
        id: 'subject',
        text: 'The teacher',
        role: 'S',
        label: 'Subject',
        explanation: '「だれが」にあたる文の主語です。',
      },
      {
        id: 'verb',
        text: 'gave',
        role: 'V',
        label: 'Verb',
        explanation: '与える動作を表す動詞です。',
      },
      {
        id: 'indirect-object',
        text: 'the class',
        role: 'O',
        label: 'Indirect Object',
        explanation: '何を受け取る人・ものかを表す間接目的語です。',
      },
      {
        id: 'direct-object',
        text: 'homework',
        role: 'O',
        label: 'Direct Object',
        explanation: '与えられるものを表す直接目的語です。',
      },
    ],
    pattern: ['S', 'V', 'O', 'O'],
    explanation: 'この文の骨格は S + V + O + O です。2つのOは別々のchunkとして見分けます。',
  },
];

export const sentencePatternDiagramProblem = sentencePatternDiagramProblems[0];
