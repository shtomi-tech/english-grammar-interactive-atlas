export const errorCorrectorProblems = [
  {
    id: 'EC-001',
    type: 'error-corrector',
    prompt: '誤っている部分を選び、正しい英文に直してください。',
    tokens: [
      { id: 't1', text: 'He' },
      { id: 't2', text: 'play', correctionId: 'agreement' },
      { id: 't3', text: 'tennis.' },
    ],
    corrections: [
      {
        id: 'agreement',
        tokenId: 't2',
        options: [
          { id: 'o1', text: 'play' },
          { id: 'o2', text: 'plays' },
          { id: 'o3', text: 'played' },
        ],
        acceptedOptionIds: ['o2'],
        ruleLabel: 'Subject–verb agreement',
        explanation: '主語 He は三人称単数なので、現在形では動詞に -s を付けます。',
      },
    ],
    explanation: '主語の人称・数と動詞の形を対応させます。',
  },
  {
    id: 'EC-002',
    type: 'error-corrector',
    prompt: '時間を表す語句に合う動詞の形を選んでください。',
    tokens: [
      { id: 't1', text: 'Yesterday' },
      { id: 't2', text: 'I' },
      { id: 't3', text: 'go', correctionId: 'past-tense' },
      { id: 't4', text: 'to' },
      { id: 't5', text: 'school.' },
    ],
    corrections: [
      {
        id: 'past-tense',
        tokenId: 't3',
        options: [
          { id: 'o1', text: 'go' },
          { id: 'o2', text: 'went' },
          { id: 'o3', text: 'goes' },
        ],
        acceptedOptionIds: ['o2'],
        ruleLabel: 'Past tense with a finished time',
        explanation: 'Yesterday は過去の時点を表すので、動詞 go は過去形 went にします。',
      },
    ],
    explanation: '過去の時点を示す時間表現に合わせて、動詞の時制を選びます。',
  },
  {
    id: 'EC-003',
    type: 'error-corrector',
    prompt: '2箇所の誤りを見つけ、それぞれ正しい形に直してください。',
    tokens: [
      { id: 't1', text: 'She' },
      { id: 't2', text: 'have', correctionId: 'auxiliary-agreement' },
      { id: 't3', text: 'finish', correctionId: 'past-participle' },
      { id: 't4', text: 'her' },
      { id: 't5', text: 'homework.' },
    ],
    corrections: [
      {
        id: 'auxiliary-agreement',
        tokenId: 't2',
        options: [
          { id: 'o1', text: 'have' },
          { id: 'o2', text: 'has' },
          { id: 'o3', text: 'had' },
        ],
        acceptedOptionIds: ['o2'],
        ruleLabel: 'Subject–auxiliary agreement',
        explanation: '主語 She は三人称単数なので、現在完了の助動詞は has にします。',
      },
      {
        id: 'past-participle',
        tokenId: 't3',
        options: [
          { id: 'o4', text: 'finish' },
          { id: 'o5', text: 'finished' },
          { id: 'o6', text: 'finishing' },
        ],
        acceptedOptionIds: ['o5'],
        ruleLabel: 'Past participle after have / has',
        explanation: '現在完了では have / has の後ろに過去分詞を置くため、finish は finished にします。',
      },
    ],
    explanation: '現在完了では、主語に合う助動詞と、その後ろの過去分詞を組み合わせます。',
  },
  {
    id: 'EC-004',
    type: 'error-corrector',
    prompt: '助動詞の後ろの動詞の形を正しく直してください。',
    tokens: [
      { id: 't1', text: 'He' },
      { id: 't2', text: 'can' },
      { id: 't3', text: 'plays', correctionId: 'modal-base-form' },
      { id: 't4', text: 'tennis.' },
    ],
    corrections: [
      {
        id: 'modal-base-form',
        tokenId: 't3',
        options: [
          { id: 'o7', text: 'play' },
          { id: 'o8', text: 'plays' },
          { id: 'o9', text: 'playing' },
        ],
        acceptedOptionIds: ['o7'],
        ruleLabel: 'Base verb after a modal',
        explanation: '助動詞 can の後ろでは、三単現の -s を付けずに動詞の原形 play を使います。',
      },
    ],
    explanation: '助動詞の後ろには、主語が三人称単数でも動詞の原形を置きます。',
  },
];

export const errorCorrectorProblem = errorCorrectorProblems[0];
