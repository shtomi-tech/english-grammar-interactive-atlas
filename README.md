# Interactive Grammar Atlas

英文法の構造を、操作の変化から理解するためのインタラクション図鑑です。

このプロジェクトでは、教材の問題ごとに画面を作るのではなく、次の単位で機能を蓄積します。

```text
学習者が触る
      ↓
英文の何かが変わる
      ↓
文法規則との関係に気づく
```

プロジェクト全体の方針は [PROJECT_GOAL.md](./PROJECT_GOAL.md) を正本とします。

## 起動

依存パッケージはありません。Node.jsで構文確認・テスト・静的ビルドを実行できます。

```bash
npm test
npm run check
npm run build
npm start
```

ブラウザで `http://localhost:4173` を開きます。

## 現在の構成

- `src/data/interactions.js`: 図鑑データと `InteractionEntry` のJSDoc定義
- `src/data/interaction-schema.js`: カテゴリ、ランク、再利用性、出典メタデータの定義
- `src/data/interactions-additional.js`: GRAM-INT-011〜040のカタログ項目
- `src/data/problems/`: Interaction Typeごとの教材Problem Data
- `src/data/problems/index.js`: Problem RegistryとID検索
- `src/data/lessons.js`: Lesson Data Model、Lesson Registry、Lesson一覧
- `src/data/research/`: 外部調査のReference、紐付け、検証用スキーマ
- `src/components/atlas/`: 一覧カードとカテゴリフィルタ
- `src/components/demos/`: 共通Demo枠、10個のDemo、Demo Registry
- `src/lib/grammar/`: 正誤判定、分類判定、文型図生成、修飾関係検索、比較・訂正判定、場面文法判定、生成目標判定、時制・助動詞を含む文法状態からの英文生成、文法状態・control label契約
- `src/lib/validateInteractions.js`: 図鑑データと出典メタデータの整合性検証
- `src/lib/validateProblems.js`, `src/lib/validateLessons.js`: Problem/Lessonの整合性検証
- `src/lib/validateResearch.js`: Research ReferenceとInteractionの参照整合性検証
- `tests/logic.test.js`: カタログ、Registry、Problem/Lesson、正誤判定・分類・英文生成のテスト
- `docs/ADDING_INTERACTION.md`: 新しい図鑑項目とDemoの追加手順
- `docs/INTERACTION_SCHEMA.md`: データ契約、出典メタデータ、ランク基準
- `docs/INTERACTION_COMPONENT_API.md`: 再利用可能Componentのmount契約

## 現在の実装範囲

Phase 1の基盤とPhase 2AのGrammar Classifierをもとに、Phase 2Bで40件のカタログへ拡張し、Phase 3Aで教材Problem DataとReusable Componentsを分離しました。Phase 3Bでは、7件の一次ソースをResearch Referenceとして記録し、31件のInteractionへ参照IDを紐付けています。Phase 4AではResearch結果を既存Word Order Builderへ還元し、4件のProblem（複数正答1件を含む）と任意Hintをデータ駆動で扱います。Phase 4BではResearchで候補化したSentence Pattern Diagramを追加し、3件のProblemからSVO・SVC・SVOOの文型図を生成します。Phase 4CではModifier Connection Viewerを追加し、3件のProblemから名詞修飾・動詞修飾・関係詞節による修飾関係を表示します。Phase 5Aではこれらの既存ComponentをLesson 02「英文の構造を読む」へ組み合わせ、骨格から修飾関係へ進む学習フローを構成します。Phase 5BではSentence Comparisonを追加し、教材データに定義した差分を左右の英文と意味へ対応づけます。Phase 5CではError Correctorを追加し、語句単位の修正候補と文法上の理由をデータ駆動で表示します。Phase 5DではContext Grammarを追加し、場面・会話履歴・選択肢から文法形式と目的の関係を段階的に確認します。Phase 5EではSentence Generatorを追加し、目標となる文法状態を学習者が組み立ててから、既存の生成ロジックで英文を生成・照合します。Phase 5Fでは既存のSentence Transformer、Word Order Builder、Error Corrector、Sentence Comparison、Sentence Generator、Context Grammarを再利用して、助動詞の形・意味・場面をLesson 03「助動詞を形と場面から使う」へ組み込みました。助動詞は `can`、`could`、`should`、`must` の最小範囲に限定し、時制とは同じProblem内で混在させません。Phase 6Aでは文法状態の対応値、tense/modalモード、文法モデルの必須項目、control labelを共有契約へ整理しました。これにより、時制Problemだけが過去形を要求し、助動詞Problemは原形だけで成立する境界を検証できます。カテゴリ・検索・再利用性ランク・Demo状態をAND条件で絞り込め、ハッシュURLによる詳細画面では元の出典メタデータと外部調査の含意を分けて確認できます。実際に操作できるDemoは10個です。

1. Word Order Builder
2. Mark the Parts
3. Sentence Transformer
4. Grammar Classifier
5. Sentence Pattern Diagram
6. Modifier Connection Viewer
7. Sentence Comparison
8. Error Corrector
9. Context Grammar
10. Sentence Generator

Lesson 01「文の骨格を見抜く」、Lesson 02「英文の構造を読む」、Lesson 03「助動詞を形と場面から使う」はCatalogのGuided lessonsから開けます。LessonはProblem IDで問題を参照し、同じComponentへ別のProblem Dataを渡せます。ProblemとLessonの検証は `npm run check` に含まれます。助動詞の対応範囲は [docs/MODAL_SUPPORT.md](./docs/MODAL_SUPPORT.md)、文法状態の共通契約は [docs/GRAMMAR_STATE_CONTRACT.md](./docs/GRAMMAR_STATE_CONTRACT.md) に記録しています。

画面は、スマートフォンのタップ操作とキーボード操作で利用できるようにしています。BackendやDBはまだ導入していません。外部Repositoryやサイトのコード・教材を推測で取り込まず、未調査の出典は明示的に未調査として扱います。

外部調査の採用基準とライセンス境界は [docs/RESEARCH_METHOD.md](./docs/RESEARCH_METHOD.md) にまとめています。Research Referenceは比較のための記録であり、外部コードや教材の取り込みを意味しません。
