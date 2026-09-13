# AI Retrieval Index

このプロジェクトでは、文法の内容と学習操作を分離する。

```text
Grammar Reference
        ↓ 文法内容・学習目標
Learning Requirements
        ↓ 検索条件
Interaction Atlas
        ↓ Interaction / Problem / Lesson
AI Retrieval Index
```

## 正本

人間向けのCanonical Dataは次のファイル群に置く。

```text
src/data/interactions.js
src/data/interactions-additional.js
src/data/problems/
src/data/lessons.js
```

AI向けのJSONは手動編集せず、build時にCanonical Dataから生成する。

```text
Canonical Data
        ↓
src/data/ai/interaction-retrieval.js の補助Metadata
        ↓
src/lib/ai/retrieval-index.js
        ↓
dist/ai/*.json
```

## Retrieval Metadata

`interaction-retrieval.js` は、既存Interactionの説明をコピーせず、AIが学習目的から候補を探すための不足情報だけをIDごとに持つ。

```js
{
  learningIntents: ['compare-placement'],
  bestFor: ['placement-affects-meaning'],
  notBestFor: ['assembling-an-entire-sentence']
}
```

`learningIntents` は `schema.js` のcontrolled vocabularyを使い、タグはlowercase-kebab-caseで統一する。

## Indexの関係

- Interactionの `relations.problemIds` は `interaction.demoType === problem.type` から生成する。
- Problemの `relations.interactionIds` はProblem Typeから生成する。
- Problemの `relations.lessonIds` は `lesson.steps[].problemId` から生成する。
- Lessonの `relations.problemIds` と `interactionTypes` はLesson Dataから生成する。
- `searchText` はProblemの各schema専用処理を増やさず、検索価値のある文字列を汎用的に収集して重複除去する。

## Generated files

```text
dist/ai/interactions.json
dist/ai/problems.json
dist/ai/lessons.json
dist/ai/catalog.json
```

`catalog.json` はMetadata、Interaction / Problem / Lessonのrecords、統合した `documents` を含む。統合documentは次の最小形を持つ。

```json
{
  "kind": "problem",
  "id": "SC-001",
  "title": "SC-001",
  "searchText": "...",
  "tags": ["sentence-comparison"],
  "relations": {}
}
```

現在のIndex件数は、Canonical Dataの現状態に合わせて次のとおり。

```text
40 interaction records
53 problem records
6 lesson records
99 unified documents
```

## 利用方針

AI教材生成では、次の順で判断する。

```text
Search
↓
Reuse
↓
Adapt
↓
Generate
```

Phase 7Aでは検索Engine、Vector DB、Embedding、LLM API、Backendは実装しない。portableなJSON Indexの生成とValidatorによる整合性確認だけを担当する。
