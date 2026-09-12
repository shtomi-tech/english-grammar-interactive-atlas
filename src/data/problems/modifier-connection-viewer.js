export const modifierConnectionViewerProblems = [
  {
    id: 'MCV-001',
    type: 'modifier-connection-viewer',
    prompt: '修飾語を選び、どの語句にかかっているか確認してください。',
    sentence: 'The boy with a red cap plays soccer.',
    chunks: [
      { id: 'the-boy', text: 'The boy', kind: 'core' },
      { id: 'with-a-red-cap', text: 'with a red cap', kind: 'modifier' },
      { id: 'plays', text: 'plays', kind: 'core' },
      { id: 'soccer', text: 'soccer', kind: 'core' },
    ],
    relations: [
      {
        id: 'relation-1',
        modifierId: 'with-a-red-cap',
        targetId: 'the-boy',
        relationType: 'modifies',
        label: 'The boyを説明',
        explanation: 'with a red cap は The boy に追加情報を与えています。',
      },
    ],
    explanation: '修飾語は、文中の別の語句に情報を付け加えます。',
  },
  {
    id: 'MCV-002',
    type: 'modifier-connection-viewer',
    prompt: '時間を表す修飾語と、説明している動作のつながりを確認してください。',
    sentence: 'She studies English after dinner.',
    chunks: [
      { id: 'she', text: 'She', kind: 'core' },
      { id: 'studies', text: 'studies', kind: 'core' },
      { id: 'english', text: 'English', kind: 'core' },
      { id: 'after-dinner', text: 'after dinner', kind: 'modifier' },
    ],
    relations: [
      {
        id: 'relation-1',
        modifierId: 'after-dinner',
        targetId: 'studies',
        relationType: 'modifies',
        label: 'studiesの時間を説明',
        explanation: 'after dinner は studies がいつ行われるかを説明しています。',
      },
    ],
    explanation: '副詞句は、動作がいつ・どこで・どのように行われるかを説明できます。',
  },
  {
    id: 'MCV-003',
    type: 'modifier-connection-viewer',
    prompt: '関係詞節が、どの名詞に追加情報を与えているか確認してください。',
    sentence: 'The student who studies hard passed the exam.',
    chunks: [
      { id: 'the-student', text: 'The student', kind: 'core' },
      { id: 'who-studies-hard', text: 'who studies hard', kind: 'modifier' },
      { id: 'passed', text: 'passed', kind: 'core' },
      { id: 'the-exam', text: 'the exam', kind: 'core' },
    ],
    relations: [
      {
        id: 'relation-1',
        modifierId: 'who-studies-hard',
        targetId: 'the-student',
        relationType: 'modifies',
        label: 'The studentを説明',
        explanation: 'who studies hard は The student がどのような生徒かを説明しています。',
      },
    ],
    explanation: '関係詞節は、前にある名詞へ説明を加えるまとまりとして働きます。',
  },
];

export const modifierConnectionViewerProblem = modifierConnectionViewerProblems[0];
