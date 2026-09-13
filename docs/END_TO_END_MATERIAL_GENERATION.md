# Phase 9 — End-to-End Material Generation Proof

Phase 9は、Phase 8で個別に検証したContractを、新しいsynthetic Grammar ReferenceからLessonまで一つにつなぐデータ／Contract proofです。

```text
Synthetic Grammar Reference
        ↓
Learning Requirements
        ↓
Atlas Retrieval
        ↓
Material Plan
        ↓
Reuse / Generate
        ↓
Problem Generation
        ↓
Lesson Generation
        ↓
既存Problem / Lesson Validator
```

## AI接続との境界

Phase 9のGrammar Referenceは、`type: synthetic-text` の自作fixtureです。Grammar ReferenceからLearning Requirementsを抽出する処理は実装せず、AIが抽出したと仮定したLearning Requirementsをfixtureとして同時に用意します。したがって、実際のLLMが任意のPDF、Word、Markdownを読んで抽出する機能を意味しません。

一方、Learning RequirementsからMaterial Planを作る部分はfixtureを手書きで置き換えず、現行Retrieval Indexと`createMaterialPlan()`を使います。検索結果、SC-001のreuse、既存Problemで不足する項目のgenerateを、Problem GenerationとLesson Generationへ順に渡します。

## Proofの責務

`runMaterialGenerationProof()`は教材内容を発明しません。次の入力と既存helper・validatorを順番に接続します。

- synthetic Grammar ReferenceとLearning Requirementsのsource traceability
- `validateLearningRequirements()`
- `createMaterialPlan()` と `validateMaterialPlan()`
- generate itemに対する `createProblemGeneration()` と `validateProblemGeneration()`
- `createLessonGenerationContext()`、`createLessonGeneration()`、`validateLessonGeneration()`
- 最終的なResolved Problem referencesとcandidate Lesson

生成候補のProblemとLessonは、AI outputを模したfixtureです。Problemは既存Problem Data Contract、Lessonは既存Lesson Data Contractそのものを使います。既存Canonical Data、Component、Problem/Lesson validatorは変更せず、候補を一時的な集合として検証します。

## Proof artifact

buildは [dist/ai/proofs/end-to-end-material-generation.json](../dist/ai/proofs/end-to-end-material-generation.json) を生成します。artifactには、source、各段階のoutput、reuse / generate / unresolvedの集計、candidate Lesson、実際のvalidator結果が含まれます。`validation`やsummaryをfixtureへ直接ハードコードせず、実行結果から組み立てます。timestampやrandom IDは使いません。

Phase 9の受入条件は、source traceability、Learning Requirements、Material Plan、Problem Generation、Lesson Generationの全stageがvalidであり、reuseが1件以上、generateが1件以上、unresolvedが0件であることです。Canonical件数は40 interactions、53 problems、6 lessons、99 documentsのまま維持します。

## Phase 10との境界

Phase 9では新しいLessonを既存routingへ登録したり、ブラウザへ表示したりしません。Phase 10で、transientなcandidate LessonとProblemをCanonical Registryへ書き込まずにExisting Componentsへ渡し、実際のLesson操作を確認します。
