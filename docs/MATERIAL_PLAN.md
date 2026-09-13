# Material Plan v1

Material Planは、Learning Requirementsに含まれる各Learning Pointへ、Atlasの学習活動と既存Problemの扱いを割り当てる契約です。文法内容や出典根拠を再定義せず、後段の教材設計だけを記録します。

```text
Grammar Reference
        ↓
Learning Requirements
        ↓ desiredOutcomes
Outcome Retrieval Profile
        ↓ learningIntents
Retrieval Query
        ↓
Retrieval evidence
        ↓
Material Plan
```

## 責務の境界

Learning Requirementsは、何を教えるか、何を理解・判断できるようにするか、ユーザー資料のどこが根拠かを持ちます。Material Planは、どのLearning PointをどのInteractionで扱うか、既存Problemをreuse / adaptするか、Problem生成が必要かを持ちます。

Material PlanにはInteractionのtitle・description、Problem本文、Lesson本文をコピーしません。保存するのはquery、実際の検索結果から得たrank・score・reasons・canonicalRef、判断、短いrationaleです。

## Material Plan Item

各itemは「1つのLearning Point × 1つの学習活動」です。同じLearning Pointを複数itemで扱えます。全Learning Pointは、core・supporting・extensionを問わず少なくとも1回coverageします。

```js
{
  version: '1',
  id: 'MATPLAN-001',
  learningRequirementsRef: { id: 'LR-001', version: '1' },
  items: [
    {
      id: 'MPI-001',
      learningPointId: 'LP-001',
      interactionSelection: {
        query: {
          kinds: ['interaction'],
          learningIntents: ['assemble-sentence'],
          limit: 5
        },
          selected: {
            canonicalRef: { kind: 'interaction', id: 'GRAM-INT-001' },
            rank: 1,
            score: 8,
            reasons: [{ field: 'learningIntents', value: 'assemble-sentence', score: 8 }]
        }
      },
      problemDecision: {
        action: 'reuse',
        problemSelection: {
          query: {
            kinds: ['problem'],
            demoTypes: ['word-order'],
            includeTerms: ['to'],
            limit: 5
          },
          selected: {
            canonicalRef: { kind: 'problem', id: 'WO-007', type: 'word-order' },
            rank: 1,
            score: 5,
            reasons: [
              { field: 'demoTypes', value: 'word-order', score: 3 },
              { field: 'searchText', value: 'to', score: 2 }
            ]
          }
        }
      },
      rationale: '学習点を既存の操作で確認する。'
    }
  ]
}
```

上のscoreやreasonsは形の例です。実際のPlanでは `searchRetrievalIndex()` の結果から取得し、validatorが同じqueryを再実行して一致を確認します。

## Outcome Retrieval Profile

`desiredOutcomes`をAtlas側の`learningIntents`へ接続する対応表を `src/data/ai/outcome-retrieval-profiles.js` に固定します。これは自由な自然言語変換ではなく、12種類すべてをcoverageするmany-to-many mappingです。`concept`は必要に応じてincludeTermsへ補助的に渡しますが、主signalはdesiredOutcomeから得たlearningIntentsです。

`createInteractionQueryForLearningPoint()` はDOM、filesystem、network、randomを使わず、`kinds: ['interaction']`、profile由来のlearningIntents、Learning Pointのconcept、limitからQueryを組み立てます。tokenizer、stemming、Embeddingは追加しません。

## InteractionとProblemの選択

`demoTypes`はComponent互換性のfilterであり、教材内容の一致証拠ではありません。`reuse`には、同じdemoTypeに加えて`includeTerms`由来の`searchText` content matchが少なくとも1件必要です。該当しない場合は無関係なProblemをreuseせず、原則`generate`または明示的な`adapt`へ進めます。

40 Interactionは検索対象ですが、実際にrenderできるInteractionだけをreuse・adapt・generateの対象にします。実装済みの判定はRetrieval recordの `demoTypes.length === 1` です。未実装Interactionが最適な場合は、無理に別候補へ置き換えず `unresolved` と理由を記録できます。この場合Problem selectionは持てません。

Problem queryには原則 `kinds: ['problem']` と選択したInteractionの `demoTypes` を含めます。ProblemのtypeがInteractionのdemoTypeと一致しないselectionは無効です。

`problemDecision.action` は次の4値です。

- `reuse`: 既存Problemをそのまま使う。`problemSelection`が必須です。
- `adapt`: 既存Problemを元に後のPhaseで変更する。`sourceProblemSelection`が必須です。Phase 8Bでは新Problemを生成しません。
- `generate`: 既存Problemでは不足することを理由付きで記録します。Problem DataはPhase 8Cで生成します。
- `unresolved`: 実装済みInteractionで十分な活動を表現できない状態です。Problem selectionは禁止です。

PROJECT_GOALの `Search → Reuse → Adapt → Generate` を優先し、`generate` には既存Problemを使わない理由を必須にします。

## Retrieval evidence

`captureRetrievalSelection()` はQueryを実行し、指定したCanonical referenceが結果にあることを確認して、次を保存します。

```text
query
selected.canonicalRef
selected.rank
selected.score
selected.reasons
```

`validateMaterialPlan()` はこの証拠を再実行結果と比較します。rank、score、reasonsのいずれかをAIが作り替えた場合はinvalidです。

## Fixturesと境界

`src/data/ai/material-plan-fixtures.js` には、Phase 8Aの不定詞・動名詞Learning Requirementsから生成した2件の合成Planがあります。全Learning Pointをcoverageし、既存Problemが見つかる場合はreuseします。SC-001については、`compare-meaning` → Sentence Comparison → `SC-001` のreuse経路をテストで固定します。

Phase 8BではProblem Data、Lesson Data、LLM、OCR、PDF/Word parser、外部DB、UI editorを追加しません。`action: 'generate'` は必要性の記録までで、生成契約と `validateProblems()` への接続はPhase 8Cの責務です。

machine-readable契約は `dist/ai/contracts/material-plan.json` です。手動編集せず、`src/data/ai/material-plan-schema.js` からbuildで生成します。

Contract exampleのQueryは実際のRetrieval Query vocabularyで構成し、validatorで妥当性を確認します。
