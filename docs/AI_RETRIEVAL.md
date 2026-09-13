# AI Retrieval Index

現在のIndex contractは **v2**。v1で一つにまとめていた検索タグから、適用しやすい候補と不向きな候補を分離している。

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

生成されるInteraction recordでは、検索上の極性を次のように保持する。

```js
{
  learningIntents: ['compare-placement'],
  bestFor: ['placement-affects-meaning'],
  notBestFor: ['assembling-an-entire-sentence'],
  positiveTags: ['compare-placement', 'placement-affects-meaning'],
  negativeTags: ['assembling-an-entire-sentence'],
  tags: ['compare-placement', 'placement-affects-meaning']
}
```

`notBestFor` / `negativeTags` は通常の `searchText` やpositive `tags`へ混ぜない。不向きな用途が検索語に一致しても、適合候補として加点されないようにするためである。

## Indexの関係

- Interactionの `relations.problemIds` は `interaction.demoType === problem.type` から生成する。
- Problemの `relations.interactionIds` はProblem Typeから生成する。
- Problemの `relations.lessonIds` は `lesson.steps[].problemId` から生成する。
- Lessonの `relations.problemIds` と `demoTypes` はLesson Dataから生成する。既存利用者向けに同じ値の `interactionTypes` deprecated aliasも保持する。
- Interactionの `demoTypes` は `demoType`（Component / Problem Type）を表し、`interactionPatterns` は `interactionType`（操作パターン）を表す。
- `searchText` はProblemの各schema専用処理を増やさず、検索価値のある文字列を汎用的に収集して重複除去する。

## Generated files

```text
dist/ai/interactions.json
dist/ai/problems.json
dist/ai/lessons.json
dist/ai/catalog.json
dist/ai/contracts/learning-requirements.json
dist/ai/contracts/material-plan.json
```

`catalog.json` はMetadata、Interaction / Problem / Lessonのrecords、統合した `documents` を含む。各recordとunified documentには、Canonical Dataへ戻るための `canonicalRef` を持たせる。統合documentは次の形を持つ。

```json
{
  "kind": "problem",
  "id": "SC-001",
  "title": "SC-001",
  "canonicalRef": {
    "kind": "problem",
    "id": "SC-001",
    "type": "sentence-comparison"
  },
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

## Structured Retrieval Query

Phase 7Bでは、自然言語を自動解析せず、AIがLearning Requirementsから作る構造化Queryだけを受け付ける。

```js
{
  kinds: ['interaction'],
  learningIntents: ['compare-placement'],
  includeTerms: ['modifier', 'position', 'meaning'],
  preferredTags: ['placement-affects-meaning'],
  avoidTags: [],
  demoTypes: [],
  interactionPatterns: [],
  interactionTypes: [], // deprecated alias for demoTypes
  limit: 5
}
```

利用できるfieldは `kinds`、`learningIntents`、`includeTerms`、`preferredTags`、`avoidTags`、`demoTypes`、`interactionPatterns`、deprecatedな `interactionTypes`、`limit`。`demoTypes` はComponent / Problem Type、`interactionPatterns` はUI操作パターンの検索に使う。`interactionTypes` は後方互換のために残しており、意味は `demoTypes` と同じである。新しいQueryとbenchmarkでは `demoTypes` を使う。全fieldは任意だが、空のQuery、未知のlearningIntent、未知のkind、不正なlimit、空の配列要素はValidatorで拒否する。

`src/lib/ai/retrieval-search.js` の `searchRetrievalIndex(index, query)` は、同じIndexとQueryに対して同じ結果順を返すpure functionである。現在の重みは、learning intent一致が+8、preferred tag一致が+5、検索本文の一致が+2、demo type / interaction pattern一致が+3、avoid tag一致が-10。不向きな `negativeTags` へのpositive要求は加点せず、-10と理由へ記録する。positive条件を含むQueryは、少なくとも一つのpositive signalに一致したdocumentだけを返すため、no-matchは空配列になる。`avoidTags` だけのQueryは除外候補の順位確認用としてscore 0のdocumentも返す。結果には `score`、`reasons`、`matchedPositiveSignals`、`canonicalRef` を含める。

`src/data/ai/retrieval-benchmarks.js` のdata-driven fixtureを `src/lib/ai/retrieval-evaluation.js` で評価し、Interaction、Problem、Lessonの検索例とno-matchを回帰検証する。ID順のCanonical Data順をtie-breakに使い、random、network、filesystem、Embedding、Vector DB、LLM APIは使わない。

## Learning Requirements v1

Phase 8Aでは、教材生成の入力を既存AtlasのIDへ直接結び付けず、学習内容と出典根拠を表すLearning Requirements契約として定義する。正本は `src/data/ai/learning-requirements-schema.js`、合成検証用fixtureは `src/data/ai/learning-requirements-fixtures.js`、validatorは `src/lib/validateLearningRequirements.js` に置く。

契約の必須要素は `version`、`id`、`topic`、`sourceReferences`、`learningPoints`。各Learning Pointには `concept`、`summary`、`importance`、`desiredOutcomes`、`sourceEvidence` を必須とし、source evidenceの `sourceId` は既知の `sourceReferences.id` を参照する。Locatorは `page`、`section`、`paragraph`、`line`、`heading`、`offset` のみを受け付ける。v1のsource typeは `user-provided` に限定する。

`desiredOutcomes` は教材内容側の語彙であり、Retrieval Indexの `learningIntents` とは別の契約である。Learning Requirementsには `interactionId`、`problemId`、`lessonId`、`demoType` を含めない。AI、OCR、PDF/Word parser、外部BackendはPhase 8Aの範囲外である。

buildはスキーマ定数から [dist/ai/contracts/learning-requirements.json](../dist/ai/contracts/learning-requirements.json) を生成する。合成fixtureは実教材や著作権テキストの代替ではなく、契約検証のためだけに使う。

Phase 8A後も、既存教材の件数、UI、Component、Research Dataは変更しない。
