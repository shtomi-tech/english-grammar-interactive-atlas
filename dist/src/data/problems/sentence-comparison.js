export const sentenceComparisonProblems = [
  {
    id: 'SC-001',
    type: 'sentence-comparison',
    prompt: '2つの英文の違う部分を選び、意味の違いを確認してください。',
    sentences: [
      {
        id: 'a',
        text: 'I stopped smoking.',
        chunks: [
          { id: 'a-1', text: 'I stopped', matchKey: 'shared-1' },
          { id: 'a-2', text: 'smoking', differenceId: 'purpose-action' },
        ],
      },
      {
        id: 'b',
        text: 'I stopped to smoke.',
        chunks: [
          { id: 'b-1', text: 'I stopped', matchKey: 'shared-1' },
          { id: 'b-2', text: 'to smoke', differenceId: 'purpose-action' },
        ],
      },
    ],
    differences: [
      {
        id: 'purpose-action',
        leftChunkId: 'a-2',
        rightChunkId: 'b-2',
        label: '動名詞 / 不定詞',
        explanation: '動名詞は「喫煙をやめた」、不定詞は「喫煙するために立ち止まった」という違いを作ります。',
        meaningLeft: '私は喫煙をやめた。',
        meaningRight: '私は喫煙するために立ち止まった。',
      },
    ],
    explanation: '動詞の後ろの形が変わると、動作をやめたのか、その目的のために止まったのかが変わります。',
  },
  {
    id: 'SC-002',
    type: 'sentence-comparison',
    prompt: '比較表現の違う部分を選び、比較の強さと意味を確認してください。',
    sentences: [
      {
        id: 'a',
        text: 'This bag is as light as that one.',
        chunks: [
          { id: 'a-1', text: 'This bag is', matchKey: 'subject' },
          { id: 'a-2', text: 'as light as', differenceId: 'degree-comparison' },
          { id: 'a-3', text: 'that one', matchKey: 'object' },
        ],
      },
      {
        id: 'b',
        text: 'This bag is lighter than that one.',
        chunks: [
          { id: 'b-1', text: 'This bag is', matchKey: 'subject' },
          { id: 'b-2', text: 'lighter than', differenceId: 'degree-comparison' },
          { id: 'b-3', text: 'that one', matchKey: 'object' },
        ],
      },
    ],
    differences: [
      {
        id: 'degree-comparison',
        leftChunkId: 'a-2',
        rightChunkId: 'b-2',
        label: 'as ... as / 比較級',
        explanation: 'as ... as は2つが同じ程度だと比べ、比較級は一方が他方より上回ることを示します。',
        meaningLeft: 'このバッグはあのバッグと同じくらい軽い。',
        meaningRight: 'このバッグはあのバッグより軽い。',
      },
    ],
    explanation: '比較する対象が同じでも、原級を使うか比較級を使うかで、伝わる関係が変わります。',
  },
  {
    id: 'SC-003',
    type: 'sentence-comparison',
    prompt: '能動態と受動態の違う部分を順に選び、視点の変化を確認してください。',
    sentences: [
      {
        id: 'a',
        text: 'The chef cooks the meal.',
        chunks: [
          { id: 'a-1', text: 'The chef', differenceId: 'subject-agent' },
          { id: 'a-2', text: 'cooks', differenceId: 'voice-form' },
          { id: 'a-3', text: 'the meal', matchKey: 'meal' },
        ],
      },
      {
        id: 'b',
        text: 'The meal is cooked by the chef.',
        chunks: [
          { id: 'b-1', text: 'The meal', matchKey: 'meal' },
          { id: 'b-2', text: 'is cooked', differenceId: 'voice-form' },
          { id: 'b-3', text: 'by the chef', differenceId: 'subject-agent' },
        ],
      },
    ],
    differences: [
      {
        id: 'voice-form',
        leftChunkId: 'a-2',
        rightChunkId: 'b-2',
        label: 'cooks / is cooked',
        explanation: '能動態は主語が動作を行う形、受動態は主語が動作を受ける形です。',
        meaningLeft: '料理人がその料理を作る。',
        meaningRight: 'その料理が料理人によって作られる。',
      },
      {
        id: 'subject-agent',
        leftChunkId: 'a-1',
        rightChunkId: 'b-3',
        label: '主語 / by句',
        explanation: '能動態の主語は、受動態ではby句に移り、動作を受ける対象が主語になります。',
        meaningLeft: 'The chef が文の主語です。',
        meaningRight: 'by the chef は動作主を補足しています。',
      },
    ],
    explanation: '同じ出来事でも、文の主語を誰・何にするかで、文の視点と動詞の形が変わります。',
  },
  {
    id: 'SC-004',
    type: 'sentence-comparison',
    prompt: '助動詞の違う部分を選び、話し手の意味の違いを確認してください。',
    sentences: [
      {
        id: 'a',
        text: 'You can leave now.',
        chunks: [
          { id: 'a-1', text: 'You', matchKey: 'subject' },
          { id: 'a-2', text: 'can', differenceId: 'modal-meaning' },
          { id: 'a-3', text: 'leave now.', matchKey: 'action' },
        ],
      },
      {
        id: 'b',
        text: 'You must leave now.',
        chunks: [
          { id: 'b-1', text: 'You', matchKey: 'subject' },
          { id: 'b-2', text: 'must', differenceId: 'modal-meaning' },
          { id: 'b-3', text: 'leave now.', matchKey: 'action' },
        ],
      },
    ],
    differences: [
      {
        id: 'modal-meaning',
        leftChunkId: 'a-2',
        rightChunkId: 'b-2',
        label: 'can / must',
        explanation: 'can は許可や可能を、must は強い必要や義務を表します。',
        meaningLeft: '今、帰ってもよい。',
        meaningRight: '今、帰らなければならない。',
      },
    ],
    explanation: '助動詞の小さな形の差が、許可・可能と義務という意味の差を作ります。',
  },
];

export const sentenceComparisonProblem = sentenceComparisonProblems[0];
