# 新しいインタラクションを追加する

図鑑の基本単位はサイトではなく、再利用可能なインタラクションです。追加は次の順で行います。

## 1. `InteractionEntry` を登録する

`src/data/interactions.js` または `src/data/interactions-additional.js` の配列へ、次の項目を追加します。データ契約の詳細は [INTERACTION_SCHEMA.md](./INTERACTION_SCHEMA.md) を参照してください。

```js
{
  id: 'GRAM-INT-011',
  slug: 'new-interaction',
  title: 'New Interaction',
  category: 'build',
  description: '何を学ぶための操作か。',
  learningGoal: '学習者に身につけてほしいこと。',
  touchTarget: '学習者が触る対象',
  userAction: 'タップ / クリック',
  changingElement: '操作で変化するもの',
  insight: '操作の結果から何に気づかせるか。',
  targetGrammar: ['文型'],
  interactionType: ['token-select'],
  feedbackType: ['正誤', '説明'],
  implementationDifficulty: 2,
  reusability: 'A',
  sourceType: 'original',
  researchStatus: 'verified',
  sourceName: 'Original catalog concept',
  licenseStatus: 'not-applicable',
  reusePolicy: 'idea-only',
  notes: '拡張時の注意点。',
}
```

`id` は安定IDとして一度決めたら変更しません。必須の学習フィールドと配列フィールドは空にできません。検索対象は `title`、`description`、`targetGrammar` です。項目を登録するとAtlas一覧と詳細画面へ自動表示されます。外部出典を登録する場合は、確認したURLと実在するライセンスだけを記録し、分からない場合は `researchStatus: 'unresearched'` または `licenseStatus: 'unknown'` とします。`Original implementation` のような説明文をライセンス名として登録しません。

## 2. 問題データを分離する

Demoを作る場合、英文・正答・説明などの教材固有データは `src/data/problems/` の機能別ファイルへ置きます。Demoコンポーネントに問題文を直接書きません。分類Demoなら、`categories` と `items` の `answer` をデータ側に持たせ、分類軸を差し替えられる形にします。互換用の `src/data/demo-problems.js` は代表Problemの再エクスポートだけを行います。

Problemは `type` と安定した `id` を持ち、`src/data/problems/index.js` のRegistryから `getProblemById('WO-001')` のように取得できます。現在のProblem数は Word Order 6、Mark the Parts 3、Grammar Classifier 3、Sentence Transformer 3、Sentence Pattern Diagram 3、Modifier Connection Viewer 3、Modifier Positioner 3、Sentence Comparison 4、Error Corrector 5、Context Grammar 5、Sentence Generator 5（計43件）です。Phase 6DのMPO-001〜003は、既存のModifier Connection Viewerとは別の、位置変更と関係変化を扱うProblem Dataの例です。Word Orderの正答は `acceptedAnswers`（許容順序の配列）を正本とし、任意で段階的な `hints` を指定できます。複数正答の判定は `src/lib/grammar/word-order.js` に置き、UIへ重複実装しません。

Sentence Pattern Diagramでは、英文のまとまりを `chunks`、文型の役割順を `pattern` としてProblem Dataへ置きます。chunkの `id` はrole記号とは別の一意な識別子です。SVOOのように同じroleが複数ある問題でも、英文chunkと図のnodeをchunk IDで対応づけます。`mountSentencePatternDiagram` はSVO専用にせず、Problem DataからSVC・SVO・SVOOなどの配置を生成します。

## 3. 再利用可能なDemoコンポーネントを作る

コンポーネントは教材Problemをimportせず、`mount(root, problem, options)` として受け取ります。11種類のAPIとcallbackの詳細は [INTERACTION_COMPONENT_API.md](./INTERACTION_COMPONENT_API.md) を参照してください。

Modifier Connection Viewerでは、英文のまとまりを `chunks`、修飾関係を `relations` としてProblem Dataへ置きます。各relationは `modifierId` と `targetId` でchunkを参照し、`relationType: 'modifies'`、短い表示label、説明を持ちます。Componentは特定の英文や語句を条件分岐せず、関係データから英文側と関係カードを生成します。

Sentence Comparisonでは、比較する2文を `sentences`、教材として説明したい差分を `differences` としてProblem Dataへ置きます。各differenceは左右のchunk ID、差分label、説明、`meaningLeft`、`meaningRight` を持ちます。差分は汎用文字列diffで推定せず、文法上の対応をデータとして明示します。差分chunkのどちらを選んでも左右を強調し、全差分を確認すると完了callbackを一度だけ呼びます。

Error Correctorでは、誤文の語句を `tokens`、語句ごとの訂正候補を `corrections` としてProblem Dataへ置きます。各correctionは `tokenId`、`options`、`acceptedOptionIds`、`ruleLabel`、`explanation` を持ちます。複数箇所を訂正するProblemにも対応し、全correctionが正解になった時だけ完了callbackを呼びます。語順訂正や自由入力の自動判定はこのComponentへ追加しません。

Context Grammarでは、`scenario` と順序付き `steps` をProblem Dataへ置きます。各stepは相手の `speaker`、`line`、学習者への `instruction`、2つ以上の `choices`、`acceptedChoiceIds` を持ち、choiceは `text`、`reply`、`grammarLabel`、`explanation` を持ちます。正答を選んだ後にContinueで履歴へ追加し、最後のStepで完了callbackを一度だけ呼びます。初期実装は線形マルチステップに限定し、分岐エンジン、自由入力、LLM/API、音声は追加しません。

Sentence Generatorでは、`goal`、`controls`、`targetStates`、`sentenceModel` をProblem Dataへ置きます。学習者が未選択状態からすべての文法条件を選び、Generateで明示的に英文を生成します。生成規則は既存の `src/lib/grammar/generateSentence.js` を共有し、目標状態との照合だけを `src/lib/grammar/generation-goal.js` のpure helperで行います。目標と異なるが文法的な状態も表示し、文法的正しさと課題条件の一致を分けて扱います。Sentence TransformerのUIや生成規則を複製せず、Lesson 03では `subject`、`modal`、`negative` の助動詞状態を同じGeneratorへ渡します。対応範囲と時制との境界は [MODAL_SUPPORT.md](./MODAL_SUPPORT.md) を参照してください。

Modifier Positionerでは、完成に近い文の `chunks`、一つの `modifier`、複数の `placements` をProblem Dataへ置きます。各placementはchunk境界の `position`、表示用の任意 `modifierText`、`grammatical`、`matchesGoal`、`relation`、`meaning` を持ちます。`src/lib/grammar/modifier-placement.js` が配置から文と関係を組み立て、Componentはtap/clickでmodifierと位置を選びます。文法的だが課題の焦点と異なる配置も「誤文」とは扱わず、関係・意味の違いを表示します。MPO-003のように複数のgoal-matching placementを許容できます。drag-and-drop、自由入力、LLM/APIは追加しません。

`src/components/demos/` にコンポーネントを追加します。共通Demo枠の中で、次の順序を保ちます。

```text
Instruction
Interactive area
Controls
Feedback
Explanation
```

タップだけで主要操作を完了できるようにし、button要素、focus表示、`aria-live`、文字による正誤表示を用意します。

`npm run check` は、構文確認に加えて、ID・slugの重複、カテゴリ、難易度、再利用性、必須フィールド、出典メタデータ、`demoType` とDemo Registryの対応を検証します。新しい項目を追加したら、まずこの検証を通してください。

## 4. Demo Registryへ登録する

`src/components/demos/registry.js` に `demoType`、マウント関数、代表Problem IDを登録します。

```js
export const demoRegistry = {
  'new-interaction': {
    mount: mountNewInteraction,
    demoProblemId: 'NEW-001',
  },
};
```

`InteractionEntry.demoType` に同じキーを設定すれば、詳細画面から自動でDemoが表示されます。

## 5. Lessonへ組み込む

Lesson UIをハードコードせず、`src/data/lessons.js` に `interactionType` と `problemId` を持つStepを追加します。LessonからはRegistry経由で同じComponentを再利用します。Lessonでは進捗をページ内stateだけに置き、LocalStorageやDBへ保存しません。複数Lessonを一覧表示する場合も、Lesson Registryからリンクを生成します。

Lessonを追加する場合は、各Stepへ一意な `id`、登録済みの `interactionType`、存在して型が一致する `problemId`、学習順序を説明する `title` と `instruction` を設定します。`validateLessons` はLesson/slug/Step IDの重複、Problemの存在、Problem typeとの一致を検証します。Lesson 02では既存のMark the Parts、Sentence Pattern Diagram、Modifier Connection Viewer、Grammar Classifierを再利用し、Lesson 03ではSentence Transformer、Word Order Builder、Error Corrector、Sentence Comparison、Sentence Generator、Context Grammarを再利用します。どちらもLesson専用Componentは作りません。

## 6. ロジックとテストを追加する

判定や文生成は `src/lib/grammar/` などの純粋な関数としてUIから分離します。`tests/logic.test.js` に、正解・不正解・境界条件を追加してください。

Problemの追加時は `validateProblems`、Lessonの追加時は `validateLessons` の異常系もテストします。特に、未知のProblem ID、Problem Typeとの不一致、重複ID、defaultsとcontrolsの不一致を確認します。

最後に次を実行します。

```bash
npm test
npm run check
npm run build
```

Phase 4Aでは、Research Reference `REF-SENTENCE-BUILDER` の示唆を既存Word Order Builderへ反映しています。新しいDemo TypeやLessonを増やさず、複数正答と任意HintというProblem Contractだけを拡張します。

外部Repositoryのコードを導入する場合は、先にライセンス・依存関係・流用範囲を確認し、UI参考とコード流用を記録上も明確に分けます。
