export const lessons = [
  {
    id: 'LESSON-001',
    slug: 'basic-sentence-structure',
    label: 'Lesson 01',
    title: '文の骨格を見抜く',
    description: '英文を単語の列ではなく、役割を持つまとまりとして捉えます。',
    learningGoal: '主語・動詞・目的語・補語などの役割に注目して、英文の基本構造を理解する。',
    steps: [
      {
        id: 'LESSON-001-STEP-01',
        interactionType: 'mark-parts',
        problemId: 'MP-001',
        title: '文の主語と動詞を見つける',
        instruction: 'まず、文の「だれが・なにが」にあたる部分を探します。',
      },
      {
        id: 'LESSON-001-STEP-02',
        interactionType: 'grammar-classifier',
        problemId: 'GC-001',
        title: '語句を文中の役割に分類する',
        instruction: '見つけた語句を、Subject・Verb・Object・Modifierに分類します。',
      },
      {
        id: 'LESSON-001-STEP-03',
        interactionType: 'word-order',
        problemId: 'WO-001',
        title: '役割を意識して英文を組み立てる',
        instruction: '主語から始まる英語の語順を意識して、文を完成させます。',
      },
      {
        id: 'LESSON-001-STEP-04',
        interactionType: 'word-order',
        problemId: 'WO-002',
        title: '主語に合う動詞の形を確かめる',
        instruction: '同じ語順でも、主語が変わると動詞の形が変わることに注目します。',
      },
      {
        id: 'LESSON-001-STEP-05',
        interactionType: 'word-order',
        problemId: 'WO-003',
        title: '補語を使う文型を組み立てる',
        instruction: '動詞の後ろが目的語ではなく、主語を説明する補語になる文も組み立てます。',
      },
      {
        id: 'LESSON-001-STEP-06',
        interactionType: 'grammar-classifier',
        problemId: 'GC-002',
        title: '句と節のまとまりを見分ける',
        instruction: '最後に、主語と動詞を含む節という別の構造にも目を向けます。',
      },
    ],
  },
];

export const lessonRegistry = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));

export function getLessonById(id) {
  return lessonRegistry[id];
}

export function getLessonBySlug(slug) {
  return lessons.find((lesson) => lesson.slug === slug);
}
