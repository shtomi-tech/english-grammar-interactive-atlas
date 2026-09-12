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
- `src/data/lessons.js`: Lesson Data ModelとLesson Registry
- `src/data/research/`: 外部調査のReference、紐付け、検証用スキーマ
- `src/components/atlas/`: 一覧カードとカテゴリフィルタ
- `src/components/demos/`: 共通Demo枠、4つのDemo、Demo Registry
- `src/lib/grammar/`: 正誤判定、分類判定、文法状態からの英文生成
- `src/lib/validateInteractions.js`: 図鑑データと出典メタデータの整合性検証
- `src/lib/validateProblems.js`, `src/lib/validateLessons.js`: Problem/Lessonの整合性検証
- `src/lib/validateResearch.js`: Research ReferenceとInteractionの参照整合性検証
- `tests/logic.test.js`: カタログ、Registry、Problem/Lesson、正誤判定・分類・英文生成のテスト
- `docs/ADDING_INTERACTION.md`: 新しい図鑑項目とDemoの追加手順
- `docs/INTERACTION_SCHEMA.md`: データ契約、出典メタデータ、ランク基準
- `docs/INTERACTION_COMPONENT_API.md`: 再利用可能Componentのmount契約

## 現在の実装範囲

Phase 1の基盤とPhase 2AのGrammar Classifierをもとに、Phase 2Bで40件のカタログへ拡張し、Phase 3Aで教材Problem DataとReusable Componentsを分離しました。Phase 3Bでは、7件の一次ソースをResearch Referenceとして記録し、31件のInteractionへ参照IDを紐付けています。Phase 4AではResearch結果を既存Word Order Builderへ還元し、4件のProblem（複数正答1件を含む）と任意Hintをデータ駆動で扱います。カテゴリ・検索・再利用性ランク・Demo状態をAND条件で絞り込め、ハッシュURLによる詳細画面では元の出典メタデータと外部調査の含意を分けて確認できます。実際に操作できるDemoは4つです。

1. Word Order Builder
2. Mark the Parts
3. Sentence Transformer
4. Grammar Classifier

Lesson 01「文の骨格を見抜く」は [#lessons/basic-sentence-structure](#lessons/basic-sentence-structure) から開けます。LessonはProblem IDで問題を参照し、同じComponentへ別のProblem Dataを渡せます。ProblemとLessonの検証は `npm run check` に含まれます。

画面は、スマートフォンのタップ操作とキーボード操作で利用できるようにしています。BackendやDBはまだ導入していません。外部Repositoryやサイトのコード・教材を推測で取り込まず、未調査の出典は明示的に未調査として扱います。

外部調査の採用基準とライセンス境界は [docs/RESEARCH_METHOD.md](./docs/RESEARCH_METHOD.md) にまとめています。Research Referenceは比較のための記録であり、外部コードや教材の取り込みを意味しません。
