# Interaction Component API

Phase 3Aでは、教材固有のProblem Dataと表示・操作ロジックを分離します。

```text
Problem Data
    ↓ problemIdで取得
Problem Registry
    ↓ typeを確認
Reusable Component(root, problem, options)
    ↓
Demo / Lesson
```

## Mount signature

8つのComponentは次の形を実装します。

```js
const cleanup = mountInteraction(root, problem, {
  onComplete(result) {},
});
```

`root`はDOM要素、`problem`は対応する `type` を持つProblem、`options`は省略可能です。Problemの型が違う場合はComponentが明示的なエラーを投げます。mount前に同じrootの前回リスナーをcleanupし、返り値のcleanupでリスナーを解除できます。

| Component | type | Problemの主なフィールド |
| --- | --- | --- |
| Word Order Builder | `word-order` | `prompt`, `words`, `acceptedAnswers`, optional `hints`, `explanation` |
| Mark the Parts | `mark-parts` | `prompt`, `tokens`, `answer`, `targetRole`, `explanation` |
| Grammar Classifier | `grammar-classifier` | `sentence`, `categories`, `items`, `explanation` |
| Sentence Transformer | `sentence-transformer` | `controls`, `defaults`, `sentenceModel` |
| Sentence Pattern Diagram | `sentence-pattern-diagram` | `prompt`, `sentence`, `chunks`, `pattern`, `explanation` |
| Modifier Connection Viewer | `modifier-connection-viewer` | `prompt`, `sentence`, `chunks`, `relations`, `explanation` |
| Sentence Comparison | `sentence-comparison` | `prompt`, `sentences`, `differences`, `explanation` |
| Error Corrector | `error-corrector` | `prompt`, `tokens`, `corrections`, `explanation` |

## Options and onComplete

判定を持つ3つのComponentはCheck時に、Sentence Transformerは選択変更時にcallbackを呼びます。探索型のSentence Pattern Diagram、Modifier Connection Viewer、Sentence Comparisonは必要な要素をすべて確認した時にcallbackを呼びます。

```js
onComplete({
  correct: true,
  problemId: 'WO-001',
  // Componentごとの結果フィールド
});
```

今回のLessonはcallbackを表示上の「Step complete」にだけ使います。学習履歴、点数、LocalStorage、DBには保存しません。

## Reset and lifecycle

ResetはProblemの初期状態へ戻します。LessonがStepを切り替えるときは、前のComponentのcleanupを呼び、同じrootへ新しいProblemをmountします。globalな `document` / `window` へのイベント登録は行いません。

## Accessibility expectations

- 主要操作には `button`、選択状態には `aria-pressed`、正誤には文字と `aria-live` を使う。
- 操作対象のfocus-visible表示を維持する。
- Sentence Transformerの選択肢はlabelとfieldset/legendで関連付ける。
- Lessonの現在Stepは `Step n / total` の文字でも表示し、Step切り替え後はStep見出しへfocusを移す。
- 44px以上を目安にタップ領域を確保し、320px幅で横スクロールを発生させない。

## Problem Registry

`src/data/problems/index.js` が全ProblemをIDで引けるRegistryです。Demo Registryには各Demo Typeの代表Problem IDを登録し、LessonはProblem IDだけを持ちます。`npm run check` はProblemの構造、Demo Registryの型一致、Lessonの存在・型一致を検証します。

## Word Order multiple answers and hints

Word Orderの正答は `acceptedAnswers` を正本とし、1問に1つ以上のID配列を持たせます。`checkWordOrder` と `shuffleWordIds` は複数の許容順序を扱い、判定ロジックは `src/lib/grammar/word-order.js` に置きます。

```js
{
  acceptedAnswers: [
    ['they', 'visit', 'the-museum', 'on-sundays'],
    ['on-sundays', 'they', 'visit', 'the-museum'],
  ],
  hints: [
    'まず主語を探してみましょう。',
    '時間を表す語句は文の最初にも置けます。',
  ],
}
```

`hints` は任意の段階的ヒントです。HintがないProblemではHintボタンを表示しません。Hintは正答そのものを表示せず、Resetで回答・フィードバック・Hint位置を初期化します。

## Sentence Pattern Diagram

`mountSentencePatternDiagram(root, problem, options)` は、Problem Dataの `chunks` と `pattern` から文型図を生成します。各chunkには一意な `id`、表示用の `text`、文中の役割記号 `role`、`label`、`explanation` を持たせます。`pattern` はchunksと同じ順序・件数で役割記号を並べます。SVOOのように同じroleが複数ある場合も、対応づけにはroleではなくchunk IDを使います。

英文側のchunkと文型図のnodeは、どちらを押しても同じchunkが選択されます。選択内容は `aria-pressed` と文字の説明で示し、全chunkを確認した時点で必要なら `onComplete({ correct: true, problemId, exploredRoles })` を一度だけ呼びます。Resetは選択・確認済み状態・説明を初期化します。

## Modifier Connection Viewer

`mountModifierConnectionViewer(root, problem, options)` は、`chunks` と `relations` から修飾語と被修飾語の接続を生成します。relationは一意な `id`、修飾語側の `modifierId`、対象側の `targetId`、`relationType`、`label`、`explanation` を持ちます。chunkの `id` で参照するため、同じ文に複数の修飾関係を置けます。

英文chunkまたは関係カードのModifier/Targetを選ぶと、関係する要素と説明が文字でも示されます。関係を一度以上確認すると `onComplete({ correct: true, problemId, exploredRelationIds })` を一度だけ呼びます。正誤問題ではなく探索型のDemoとして扱い、Resetで選択・探索済み関係・完了状態を初期化します。

## Sentence Comparison

`mountSentenceComparison(root, problem, options)` は、2つの `sentences` と、教材側で定義した `differences` から比較UIを生成します。各sentenceは一意な `id`、表示用の `text`、一意なchunkの配列を持ちます。differenceは一意な `id`、左右のchunk ID、差分label、説明、`meaningLeft`、`meaningRight` を持ちます。文字列の一般的なdiff計算は行いません。

左右どちらの差分chunkを押しても、対応する2つのchunkを強調し、Difference・Meaning A/B・Why it mattersを文字で表示します。全differenceを一度以上確認すると `onComplete({ correct: true, problemId, exploredDifferenceIds })` を一度だけ呼びます。Resetは選択・確認済み差分・完了状態を初期化します。

## Error Corrector

`mountErrorCorrector(root, problem, options)` は、誤文の `tokens` と語句置換型の `corrections` から訂正UIを生成します。各correctionは対象token、2つ以上の修正候補、`acceptedOptionIds`、`ruleLabel`、`explanation` を持ちます。Componentは教材英文や文法説明を内部に持たず、選択した候補で訂正文を再構成します。

誤り候補のtokenを選んでから修正候補を選択し、正誤とDifference・Rule・Why it mattersを文字で表示します。全correctionが正解になった時点で `onComplete({ correct: true, problemId, completedCorrectionIds })` を一度だけ呼びます。Resetは選択・回答・訂正文・feedback・完了状態を初期化します。

## Lesson Registry and Problem injection

`src/data/lessons.js` のLesson Registryは、Lessonの `id`、`slug`、順序付き `steps` を保持します。各Stepは `interactionType` と `problemId` を持ち、Lesson PlayerはDemo Registryから対応Componentを取得してProblemを注入します。Stepの切り替え時には前のComponentをcleanupし、次のStepを新しいProblemでmountします。

Lesson 02は、Mark the Parts → Sentence Pattern Diagram → Modifier Connection Viewer → Grammar Classifierの順で、文の中心、骨格、修飾関係、句と節の整理へ進みます。Lesson専用Componentや進捗保存は追加せず、既存Componentの学習フローへの組み合わせだけをデータとして定義します。
