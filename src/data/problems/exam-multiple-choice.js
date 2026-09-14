export const examMultipleChoiceProblems = [
  {
    id: 'EMC-001',
    type: 'exam-multiple-choice',
    prompt: '空所に入る最も適切なものを選びなさい。',
    stem: 'I (     ) him since last year.',
    choices: [
      {
        id: 'c1',
        text: "don't see",
        explanation: 'since last year は過去から現在まで続く期間を示すため、単純現在では表しません。',
      },
      {
        id: 'c2',
        text: "didn't see",
        explanation: '過去形は過去の一点・完結した出来事を表すため、現在まで続く since と合いません。',
      },
      {
        id: 'c3',
        text: "haven't seen",
        explanation: 'since last year は過去から現在までの継続を表すため、現在完了が適切です。',
      },
      {
        id: 'c4',
        text: "won't see",
        explanation: '未来を表す will は、since last year が示す過去から現在までの時間関係と合いません。',
      },
    ],
    answerChoiceId: 'c3',
    explanation: 'since + 過去の起点は、過去から現在までの継続を表す現在完了とよく結び付きます。',
    difficulty: 'standard',
  },
];

export const examMultipleChoiceProblem = examMultipleChoiceProblems[0];
