# Lesson Generation v1

Lesson Generationは、Material Planの各Itemを、既存Lesson Data Contractへ接続する契約です。Phase 8DではLLM APIを組み込まず、Problemの解決、stepの対応付け、既存validatorへの接続を固定します。

## 責務の境界

```text
Learning Requirements
        ↓
Material Plan
        ↓ reuse / generate / adapt
Resolved Problems
        ↓
Lesson Generation
        ↓
既存 Lesson Contract
        ↓
validateLessons()
```

`resolveMaterialPlanProblems()`は、`reuse`ならCanonical Problemを、`generate` / `adapt`なら対応するProblem Generationの`candidateProblem`を解決します。`unresolved`を含むMaterial Planは、Phase 8Dでは完成Lessonにできません。必要なProblem Generationは各`generate` / `adapt` Itemにつきちょうど1件です。

複数のcandidate Problemは、Canonical Problemsへ一時的に加えて次の既存validatorでまとめて検証します。

```js
validateProblems([...canonicalProblems, ...resolvedGeneratedProblems])
```

Canonical Problem、Canonical Lesson、既存Registryは変更しません。Lesson検証では、生成候補を含む一時的なProblem Registryを作り、既存Lessonとcandidate Lessonを一緒に`validateLessons()`へ渡します。Lesson専用にProblemやLessonのschemaを複製しません。

## candidateLessonとstepMappings

`candidateLesson`は既存Lesson Contractそのものです。`id`、`slug`、`label`、`title`、`description`、`learningGoal`と、既存stepの`id`、`interactionType`、`problemId`、`title`、`instruction`を使用します。AI provenanceはcandidateLessonへ追加せず、wrapper外側の`alignment.stepMappings`で管理します。

Phase 8D v1では、Material Plan Item 1件をLesson Step 1件へ、順序を変えずに対応付けます。各stepのProblemは、対応するMaterial Plan Itemから解決されたProblemだけを参照できます。`generate` / `adapt`ではcandidate Problem、`reuse`ではCanonical Problemを参照します。

## 検証範囲

`validateLessonGeneration()`は次を確認します。

- Material PlanとProblem Generationの参照、version、coverage
- 複数candidate Problem間のID衝突
- `validateProblems()`によるResolved Problem全体の検証
- `validateLessons()`によるCanonical Lessonとcandidate Lessonの検証
- 全Material Plan ItemとLesson Stepの一対一対応、順序、Problem一致
- Material Plan外のProblem、unresolved Item、未使用のProblem Generationの混入

生成文章の自然さや説明品質をLLMで評価することは、Phase 8Dの範囲外です。

## Build artifact

buildはCanonical Lesson 6件を [dist/ai/lesson-data.json](../dist/ai/lesson-data.json) として出力します。Retrieval用の`lessons.json`と、既存Lesson Contract / few-shot参照用のsnapshotを分離し、手動編集はしません。Lesson Generationのmachine-readable Contractは [dist/ai/contracts/lesson-generation.json](../dist/ai/contracts/lesson-generation.json) です。

Phase 8Dの次は、synthetic Grammar Referenceを入口にした一気通貫のEnd-to-End証明です。LLM、Embedding、Backend、UI editorはその段階でも別途判断します。
