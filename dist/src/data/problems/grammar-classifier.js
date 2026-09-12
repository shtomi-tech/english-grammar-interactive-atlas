export const grammarClassifierProblems = [
  {
    id: 'GC-001',
    type: 'grammar-classifier',
    classificationAxis: 'Sentence role',
    prompt: '語句カードを、英文の中での役割ごとに分類してください。',
    sentence: 'The young boy plays soccer after school.',
    categories: [
      { id: 'subject', label: 'Subject', explanation: '「だれが・なにが」にあたる主語です。' },
      { id: 'verb', label: 'Verb', explanation: '主語の動作や状態を表す動詞です。' },
      { id: 'object', label: 'Object', explanation: '動作の対象を表す目的語です。' },
      { id: 'modifier', label: 'Modifier', explanation: 'いつ・どこでなど、文に情報を加える修飾語です。' },
    ],
    items: [
      {
        id: 'young-boy',
        text: 'The young boy',
        answer: 'subject',
        explanation: '「だれが」にあたり、文の主語です。',
      },
      {
        id: 'plays',
        text: 'plays',
        answer: 'verb',
        explanation: '主語の動作を表す動詞です。',
      },
      {
        id: 'soccer',
        text: 'soccer',
        answer: 'object',
        explanation: 'play の動作の対象となる目的語です。',
      },
      {
        id: 'after-school',
        text: 'after school',
        answer: 'modifier',
        explanation: '動作がいつ起きるかを加える修飾語です。',
      },
    ],
    explanation: '英文は単語の列ではなく、役割を持つ語句のまとまりとして見ることができます。',
  },
  {
    id: 'GC-002',
    type: 'grammar-classifier',
    classificationAxis: 'Phrase / Clause',
    prompt: '語句カードを、句（Phrase）と節（Clause）に分類してください。',
    sentence: 'I know that she studies.',
    categories: [
      { id: 'phrase', label: 'Phrase', explanation: '主語と動詞の組み合わせを含まない語句のまとまりです。' },
      { id: 'clause', label: 'Clause', explanation: '主語と動詞を含む節のまとまりです。' },
    ],
    items: [
      { id: 'i', text: 'I', answer: 'phrase', explanation: 'I は主語として働く語句です。' },
      { id: 'know', text: 'know', answer: 'phrase', explanation: 'know は動詞として働く語句です。' },
      {
        id: 'that-she-studies',
        text: 'that she studies',
        answer: 'clause',
        explanation: 'she と studies を含む節です。',
      },
    ],
    explanation: '句と節は、主語・動詞の組み合わせがあるかどうかに注目すると見分けられます。',
  },
  {
    id: 'GC-003',
    type: 'grammar-classifier',
    classificationAxis: 'Part of speech',
    prompt: '語句カードを、品詞ごとに分類してください。',
    sentence: 'Bright birds sing loudly.',
    categories: [
      { id: 'noun', label: 'Noun', explanation: '人・もの・ことの名前を表す名詞です。' },
      { id: 'verb', label: 'Verb', explanation: '動作や状態を表す動詞です。' },
      { id: 'adjective', label: 'Adjective', explanation: '名詞の性質や状態を説明する形容詞です。' },
      { id: 'adverb', label: 'Adverb', explanation: '動作の様子などを説明する副詞です。' },
    ],
    items: [
      { id: 'bright', text: 'Bright', answer: 'adjective', explanation: 'Bright は birds の性質を説明します。' },
      { id: 'birds', text: 'birds', answer: 'noun', explanation: 'birds は生き物の名前を表します。' },
      { id: 'sing', text: 'sing', answer: 'verb', explanation: 'sing は動作を表します。' },
      { id: 'loudly', text: 'loudly', answer: 'adverb', explanation: 'loudly は歌う様子を説明します。' },
    ],
    explanation: '品詞を分類すると、英文の中でそれぞれの語が担う役割を整理できます。',
  },
];

export const grammarClassifierProblem = grammarClassifierProblems[0];
