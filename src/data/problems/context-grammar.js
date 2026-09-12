export const contextGrammarProblems = [
  {
    id: 'CG-001',
    type: 'context-grammar',
    prompt: '場面に合う表現を選び、ホテルとの会話を進めてください。',
    scenario: {
      title: 'Late checkout',
      setting: 'ホテルのチェックアウト時刻を少し遅らせたい場面です。',
      learnerRole: 'Guest',
      goal: 'ホテルのスタッフに、丁寧にレイトチェックアウトを依頼する。',
    },
    steps: [
      {
        id: 'cg001-step-1',
        speaker: 'Hotel staff',
        line: 'Good morning. How can I help you?',
        instruction: 'チェックアウトを遅らせたいと、丁寧に依頼してください。',
        choices: [
          {
            id: 'cg001-choice-1a',
            text: 'Could I get a late checkout, please?',
            reply: 'Certainly. We can extend your checkout until noon.',
            grammarLabel: 'Polite request with could',
            explanation: 'Could I ...? は許可や依頼を丁寧に尋ねる表現です。',
          },
          {
            id: 'cg001-choice-1b',
            text: 'Give me a late checkout.',
            grammarLabel: 'Imperative',
            explanation: '命令形なので、この場面では相手への依頼として直接的すぎます。',
          },
        ],
        acceptedChoiceIds: ['cg001-choice-1a'],
      },
      {
        id: 'cg001-step-2',
        speaker: 'Hotel staff',
        line: 'What time would you like to check out?',
        instruction: '希望する時刻を、丁寧な依頼として伝えてください。',
        choices: [
          {
            id: 'cg001-choice-2a',
            text: 'Could we check out at noon, please?',
            reply: 'Yes, noon will be fine. I will note it on your reservation.',
            grammarLabel: 'Could for a polite request',
            explanation: 'Could we ...? は相手への配慮を含む丁寧な依頼に使えます。',
          },
          {
            id: 'cg001-choice-2b',
            text: 'We check out at noon.',
            grammarLabel: 'Present statement',
            explanation: '希望を尋ねられているので、単なる事実の断定より依頼表現が適切です。',
          },
        ],
        acceptedChoiceIds: ['cg001-choice-2a'],
      },
    ],
    explanation: '依頼表現は、文法的に正しいだけでなく、場面や相手との関係に合わせて選びます。',
  },
  {
    id: 'CG-002',
    type: 'context-grammar',
    prompt: '時間の手がかりに合う表現を選び、学校での会話を進めてください。',
    scenario: {
      title: 'Yesterday after school',
      setting: '昨日の放課後にしたことを先生へ説明する場面です。',
      learnerRole: 'Student',
      goal: '終わった過去の出来事を、適切な過去形で説明する。',
    },
    steps: [
      {
        id: 'cg002-step-1',
        speaker: 'Teacher',
        line: 'What did you do after school yesterday?',
        instruction: 'Yesterday に合う過去形で答えてください。',
        choices: [
          {
            id: 'cg002-choice-1a',
            text: 'I practiced the piano.',
            reply: 'That sounds like a productive afternoon.',
            grammarLabel: 'Past tense with yesterday',
            explanation: 'Yesterday は終わった過去の時点なので、practice の過去形 practiced を使います。',
          },
          {
            id: 'cg002-choice-1b',
            text: 'I practice the piano.',
            grammarLabel: 'Present tense',
            explanation: 'Yesterday という過去の手がかりには、現在形より過去形が合います。',
          },
        ],
        acceptedChoiceIds: ['cg002-choice-1a'],
      },
      {
        id: 'cg002-step-2',
        speaker: 'Teacher',
        line: 'Did you finish your science report?',
        instruction: '昨夜に終えたことを、過去形で答えてください。',
        choices: [
          {
            id: 'cg002-choice-2a',
            text: 'Yes, I finished it last night.',
            reply: 'Excellent. Please put it on my desk before class.',
            grammarLabel: 'Past tense with last night',
            explanation: 'Last night は終わった過去の時点なので、finish の過去形 finished を使います。',
          },
          {
            id: 'cg002-choice-2b',
            text: 'Yes, I finish it last night.',
            grammarLabel: 'Present tense with a finished time',
            explanation: 'Last night と一緒に使う動詞は、終わった過去を表す finished にします。',
          },
        ],
        acceptedChoiceIds: ['cg002-choice-2a'],
      },
    ],
    explanation: 'Yesterday や last night のような時間情報は、終わった出来事を表す過去形の手がかりになります。',
  },
  {
    id: 'CG-003',
    type: 'context-grammar',
    prompt: '経験と具体的な過去時点を区別し、旅行の会話を進めてください。',
    scenario: {
      title: 'Talking about a trip',
      setting: '旅行経験について友人と話し、いつ行ったかを続けて説明する場面です。',
      learnerRole: 'Traveler',
      goal: '経験には現在完了、具体的な過去時点には過去形を使い分ける。',
    },
    steps: [
      {
        id: 'cg003-step-1',
        speaker: 'Friend',
        line: 'Have you ever been to Kyoto?',
        instruction: '経験があるかどうかを、現在完了を使って答えてください。',
        choices: [
          {
            id: 'cg003-choice-1a',
            text: 'Yes, I have.',
            reply: 'When did you go there?',
            grammarLabel: 'Present perfect for experience',
            explanation: 'Have you ever ...? という経験の質問には、Yes, I have. と現在完了で答えます。',
          },
          {
            id: 'cg003-choice-1b',
            text: 'Yes, I went there last year.',
            grammarLabel: 'Past detail too early',
            explanation: 'この質問はまず経験の有無を聞いているので、最初は Yes, I have. が焦点に合います。',
          },
        ],
        acceptedChoiceIds: ['cg003-choice-1a'],
      },
      {
        id: 'cg003-step-2',
        speaker: 'Friend',
        line: 'When did you go there?',
        instruction: '具体的な過去時点に合う過去形で答えてください。',
        choices: [
          {
            id: 'cg003-choice-2a',
            text: 'I went there last year.',
            reply: 'That must have been a memorable trip.',
            grammarLabel: 'Past tense with a finished time',
            explanation: 'Last year は具体的な過去時点なので、go の過去形 went を使います。',
          },
          {
            id: 'cg003-choice-2b',
            text: 'I have gone there last year.',
            grammarLabel: 'Present perfect with a finished time',
            explanation: 'Last year のような具体的に終わった時点には、現在完了ではなく過去形を使います。',
          },
        ],
        acceptedChoiceIds: ['cg003-choice-2a'],
      },
    ],
    explanation: '経験を尋ねるときは現在完了、いつ起きたかを示す具体的な過去時点には過去形を使います。',
  },
];

export const contextGrammarProblem = contextGrammarProblems[0];
