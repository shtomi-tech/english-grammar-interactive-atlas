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
  {
    id: 'LESSON-002',
    slug: 'structural-reading',
    label: 'Lesson 02',
    title: '英文の構造を読む',
    description: '文の骨格と、そこへ加わる修飾情報を順に見分けます。',
    learningGoal: '英文の骨格と修飾部分を分け、文の中心と追加情報を構造として理解する。',
    steps: [
      {
        id: 'LESSON-002-STEP-01',
        interactionType: 'mark-parts',
        problemId: 'MP-001',
        title: 'まず文の中心を見つける',
        instruction: '最初に、文の「だれが・なにが」にあたる中心部分を選びます。',
      },
      {
        id: 'LESSON-002-STEP-02',
        interactionType: 'sentence-pattern-diagram',
        problemId: 'SPD-001',
        title: '骨格をS・V・Oで見る',
        instruction: '中心部分を確認したら、The boy plays soccer. の骨格をS・V・Oの配置として見てみましょう。',
      },
      {
        id: 'LESSON-002-STEP-03',
        interactionType: 'sentence-pattern-diagram',
        problemId: 'SPD-002',
        title: '別の文型と比べる',
        instruction: '次にS・V・Cの文を見て、動詞の後ろが主語を説明する場合も確認します。',
      },
      {
        id: 'LESSON-002-STEP-04',
        interactionType: 'modifier-connection-viewer',
        problemId: 'MCV-001',
        title: '追加情報のかかり先を見る',
        instruction: '骨格に with a red cap が加わりました。修飾語がThe boyへ追加情報を与える関係を確認します。',
      },
      {
        id: 'LESSON-002-STEP-05',
        interactionType: 'modifier-connection-viewer',
        problemId: 'MCV-002',
        title: '動作への修飾を見る',
        instruction: '今度は after dinner が studies の時間を説明します。修飾先が変わることに注目します。',
      },
      {
        id: 'LESSON-002-STEP-06',
        interactionType: 'grammar-classifier',
        problemId: 'GC-002',
        title: '句と節として整理する',
        instruction: '最後に句と節を分類し、語句のまとまりが文の構造を作ることを整理します。',
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
