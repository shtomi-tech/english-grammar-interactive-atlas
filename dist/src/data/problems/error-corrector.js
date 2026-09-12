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
  {
    id: 'EC-005',
    type: 'error-corrector',
    prompt: '受動態のbe動詞の後ろに置く動詞の形を正しく直してください。',
    tokens: [
      { id: 't1', text: 'The' },
      { id: 't2', text: 'report' },
      { id: 't3', text: 'was' },
      { id: 't4', text: 'wrote', correctionId: 'passive-participle' },
      { id: 't5', text: 'by the teacher.' },
    ],
    corrections: [
      {
        id: 'passive-participle',
        tokenId: 't4',
        options: [
          { id: 'o7', text: 'write' },
          { id: 'o8', text: 'wrote' },
          { id: 'o9', text: 'written' },
        ],
        acceptedOptionIds: ['o9'],
        ruleLabel: 'Past participle in the passive',
        explanation: '受動態ではbe動詞の後ろに過去形 wrote ではなく、過去分詞 written を置きます。',
      },
    ],
    explanation: '受動態は be + 過去分詞で作ります。過去形と過去分詞が異なる動詞にも注意します。',
  },
  {
    id: 'EC-006',
    type: 'error-corrector',
    prompt: 'to の後ろの動詞を原形に直し、正しい英文を完成させてください。',
    tokens: [
      { id: 't1', text: 'She' },
      { id: 't2', text: 'wants' },
      { id: 't3', text: 'to' },
      { id: 't4', text: 'studies', correctionId: 'infinitive-base-form' },
      { id: 't5', text: 'abroad.' },
    ],
    corrections: [
      {
        id: 'infinitive-base-form',
        tokenId: 't4',
        options: [
          { id: 'o16', text: 'study' },
          { id: 'o17', text: 'studies' },
          { id: 'o18', text: 'studying' },
        ],
        acceptedOptionIds: ['o16'],
        ruleLabel: 'Base verb after to',
        explanation: '不定詞ではtoの後ろに動詞の原形を置くため、studiesではなくstudyを使います。',
      },
    ],
    explanation: 'to不定詞の基本形は to + 動詞原形です。主語が三人称単数でも、toの後ろに -s は付けません。',
  },
  {
    id: 'EC-007',
    type: 'error-corrector',
    prompt: 'enjoy の後ろの動詞の形を正しく直してください。',
    tokens: [
      { id: 't1', text: 'She' },
      { id: 't2', text: 'enjoys' },
      { id: 't3', text: 'to read', correctionId: 'gerund-after-enjoy' },
      { id: 't4', text: 'novels.' },
    ],
    corrections: [
      {
        id: 'gerund-after-enjoy',
        tokenId: 't3',
        options: [
          { id: 'o19', text: 'reading' },
          { id: 'o20', text: 'to read' },
          { id: 'o21', text: 'read' },
        ],
        acceptedOptionIds: ['o19'],
        ruleLabel: 'Gerund after enjoy',
        explanation: 'enjoy の後ろでは、通常 to不定詞ではなく動名詞を使うため、to read ではなく reading にします。',
      },
    ],
    explanation: '動詞によって、後ろに動名詞を取るか不定詞を取るかが異なります。enjoy は動名詞を取る代表例です。-ing が常に正しいわけではありません。',
  },
];

export const errorCorrectorProblem = errorCorrectorProblems[0];
