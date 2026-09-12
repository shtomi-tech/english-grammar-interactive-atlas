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
  {
    id: 'LESSON-003',
    slug: 'modal-verbs',
    label: 'Lesson 03',
    title: '助動詞を形と場面から使う',
    description: '助動詞の後ろに動詞の原形を置く基本形を確認し、can / should / must などの意味を場面に応じて使い分けます。',
    learningGoal: '助動詞 + 動詞原形という形を理解し、能力・助言・義務などの意味と場面を対応づけて適切な助動詞を選べるようにする。',
    steps: [
      {
        id: 'LESSON-003-STEP-01',
        interactionType: 'sentence-transformer',
        problemId: 'ST-002',
        title: '助動詞を変えて形を見る',
        instruction: 'can / could / should / must を切り替え、助動詞の後ろが動詞の原形のまま変わらないことを観察します。',
      },
      {
        id: 'LESSON-003-STEP-02',
        interactionType: 'word-order',
        problemId: 'WO-005',
        title: '助動詞を含む語順を組み立てる',
        instruction: 'Subject + Modal + Base Verb の順に単語を並べ、助動詞の後ろの形を確かめます。',
      },
      {
        id: 'LESSON-003-STEP-03',
        interactionType: 'error-corrector',
        problemId: 'EC-004',
        title: '助動詞後の動詞を直す',
        instruction: '助動詞の後ろに三単現の -s を付けない規則を、誤文の訂正で確認します。',
      },
      {
        id: 'LESSON-003-STEP-04',
        interactionType: 'sentence-comparison',
        problemId: 'SC-004',
        title: '助動詞で意味を比べる',
        instruction: 'can と must の形の差を、許可・可能と義務という意味の差に対応づけます。',
      },
      {
        id: 'LESSON-003-STEP-05',
        interactionType: 'sentence-generator',
        problemId: 'SG-004',
        title: '目標に合う助動詞を生成する',
        instruction: '助言というGoalに合う文法状態を選び、英文を生成して確かめます。',
      },
      {
        id: 'LESSON-003-STEP-06',
        interactionType: 'context-grammar',
        problemId: 'CG-004',
        title: '場面に合う助動詞を選ぶ',
        instruction: '相談の助言と安全規則の義務を、会話の場面に合う助動詞で表します。',
      },
    ],
  },
  {
    id: 'LESSON-004',
    slug: 'passive-voice',
    label: 'Lesson 04',
    title: '能動態と受動態で視点を変える',
    description: '同じ出来事でも、何を主語として見るかによって英文の形が変わることを確認します。',
    learningGoal: '能動態と受動態の形の違いを理解し、動作主と動作を受ける対象のどちらを主語として焦点化するかに応じて使い分ける。',
    steps: [
      {
        id: 'LESSON-004-STEP-01',
        interactionType: 'sentence-comparison',
        problemId: 'SC-003',
        title: '能動態と受動態を比べる',
        instruction: '同じ出来事を表す2つの文を比べ、主語と動詞の形がどう変わるかを確認します。',
      },
      {
        id: 'LESSON-004-STEP-02',
        interactionType: 'sentence-transformer',
        problemId: 'ST-003',
        title: 'Voiceを切り替えて形を見る',
        instruction: 'Active と Passive を切り替え、agent と patient の文中での役割と動詞の形を観察します。',
      },
      {
        id: 'LESSON-004-STEP-03',
        interactionType: 'word-order',
        problemId: 'WO-006',
        title: '受動態の語順を組み立てる',
        instruction: 'Subject + be + Past Participle の中心語順に、必要なby句を続けて文を完成させます。',
      },
      {
        id: 'LESSON-004-STEP-04',
        interactionType: 'error-corrector',
        problemId: 'EC-005',
        title: '過去分詞の誤りを直す',
        instruction: 'be動詞の後ろに過去形ではなく過去分詞を置く規則を、誤文の訂正で確認します。',
      },
      {
        id: 'LESSON-004-STEP-05',
        interactionType: 'sentence-generator',
        problemId: 'SG-005',
        title: '目標に合う受動態を生成する',
        instruction: '対象を主語にした過去の受動態を目標として選び、英文を生成して確かめます。',
      },
      {
        id: 'LESSON-004-STEP-06',
        interactionType: 'context-grammar',
        problemId: 'CG-005',
        title: '場面に合う視点を選ぶ',
        instruction: '動作主が不明な場面や対象に焦点を置く場面で、受動態が合う理由を会話の中で確認します。',
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
