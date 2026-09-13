# Problem Generation v1

Problem Generationは、Material Planで`generate`または`adapt`と判断されたLearning Pointについて、既存Componentで利用できるProblem Data候補を表す契約です。Phase 8CでもLLM APIは組み込まず、AIが返す値の境界と検証経路だけを固定します。

## 責務の境界

```text
Learning Requirements
        ↓
Material Plan
        ↓ generate / adapt
Problem Generation
        ↓
既存 Problem Contract
        ↓
validateProblems()
```

Material Planが選んだ`materialPlanItemId`から、selected Interaction、demoType、adapt元Problemを導出します。Problem Generation側で`interactionId`、`demoType`、action、source Problem IDを自由入力させません。Canonical Problem Dataは変更せず、candidate Problemは生成候補のfixtureとして扱います。

## 対象と契約

`generate`は既存Problemにcontent matchがなく、新しいProblemが必要な場合です。`adapt`は既存Problemを参考に新しいProblemを作る場合です。`reuse`と`unresolved`はProblem Generationの対象外です。

契約本体は次の参照と候補を持ちます。

- `materialPlanRef` / `materialPlanItemId`: 生成の根拠
- `candidateProblem`: 既存53 Problemと同じProblem Data Contract
- `alignment`: Learning Point、source evidence、短いrationale

`candidateProblem.type`はMaterial Planのselected InteractionのdemoTypeと一致しなければなりません。`adapt`ではcandidateのIDはsource ProblemのIDと異なる必要があります。

## validateProblems()を最終境界にする

Problem Generation validatorはProblem schemaを複製しません。Canonical Problemsへ候補を一時的に加え、次の既存validatorへ委譲します。

```js
validateProblems([...canonicalProblems, candidateProblem])
```

これにより、typeごとの必須データ、choice・correction・reference、ID重複などを既存の正本ルールで検証します。生成都合で既存validatorを緩めることはありません。

## source provenanceとfew-shot data

`alignment.sourceEvidenceRefs`はLearning Requirementsに存在するsource evidenceだけを参照します。参考資料本文をコピーせず、source ID、locator、短いrationaleだけを保持します。

AIが既存Componentのデータ構造を推測しないよう、build時にCanonical Problem Dataを [dist/ai/problem-data.json](../dist/ai/problem-data.json) として出力します。これはRetrieval用の`problems.json`とは別で、既存53 Problemの実データとfew-shot参照の正本です。手動編集はしません。

`resolveCanonicalProblem()`はcanonical referenceから型一致するProblemを解決し、`createProblemGenerationContext()`はMaterial PlanとRetrieval Indexからtarget demoType、adapt元、同Componentのexample Problem referencesを決定的に組み立てます。

## Fixturesと検証

合成fixtureでは、既存Problemにcontent matchがないword-orderの`generate`と、SC-001を元にしたsentence-comparisonの`adapt`を検証します。候補ProblemはCanonical 53件へ追加しません。

machine-readable契約は [dist/ai/contracts/problem-generation.json](../dist/ai/contracts/problem-generation.json) です。`npm run check`では、2 fixture、Material Planとの参照整合、source evidence、candidate type、ID衝突、既存`validateProblems()`、Canonical Problem snapshot 53件を検証します。

Phase 8Cの後は、生成済み・適応済みProblemと既存ProblemをLesson Generation Contractへ接続します。Lesson生成と実際のGrammar Reference解析は次段階の責務です。
