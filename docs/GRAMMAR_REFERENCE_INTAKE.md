# Phase 11A — Grammar Reference Intake

Phase 11A は、ユーザーが提供する文法資料を、Learning Requirements v1へ渡すためのprovider-neutralな境界を定めます。対象は `text` と `markdown` だけです。PDF、Word、OCR、外部LLM、API、保存処理はこの段階では扱いません。

## Internal model

入力は次の最小モデルです。

```js
{
  id: 'GRAMMAR-REF-001',
  sourceId: 'SOURCE-001',
  title: '不定詞 授業プリント',
  format: 'text', // text | markdown
  content: '不定詞はto + 動詞原形で...'
}
```

`validateGrammarReference()` は必須文字列、format、unknown top-level field、50,000文字の上限を検証します。`normalizeGrammarReference()` が行うのはCRLFからLFへの統一と先頭末尾のtrimだけで、本文の言い換え・文法修正・情報追加はしません。Grammar ReferenceはCanonical Problem / Lesson / Interaction Dataではなく、教材生成sessionの入力です。

Markdownのsection locatorは `#` から `###` までのheadingをpure helperで抽出します。text/markdownのquote locatorは、短い引用が本文に存在することをsource traceabilityで再確認します。

## Extraction boundary

`createLearningRequirementsExtractionRequest()` は、既存の `learningRequirementsContract.version` を出力Contractのversionとして参照し、次の方針をrequestへ固定します。

- `sourcePriority: user-provided`
- `doNotAddUnsupportedGrammar: true`
- `requireSourceEvidence: true`

`runLearningRequirementsExtraction()` は、Grammar Reference validation、request生成、adapter呼び出し、`validateLearningRequirements()`、source traceabilityの順で実行します。adapterは `extractLearningRequirements(request)` だけを実装するprovider-neutral interfaceです。Phase 11Aのfixture adapterは外部AIではなく、固定されたLearning Requirements v1を返します。

adapter exception、null/non-object、unknown outcome、欠落したsourceEvidence、sourceId不一致、sourceにないquote/sectionはすべてinvalidです。出力のJSON repair、enum推測、sourceEvidence自動生成は行いません。

## Provenance and security

ユーザー資料が内容の正本です。AIの一般知識でsourceを上書きせず、各Learning Pointの `sourceEvidence` を元のGrammar Referenceへ戻せることを要求します。ブラウザやGitHub PagesへAPI keyを置かず、Phase 11Aでは外部LLM providerを接続しません。

validなfixture結果は既存の `createMaterialPlan()` へ渡せることまでをsmoke testします。その後段のProblem / Lesson生成とruntime previewはPhase 9/10で検証済みです。

## Phase 11Bとの境界

次のPhase 11Bで、server-sideのLLM adapter、provider、秘密情報の保管場所、request timeout、retry、監査ログなどを別途選定します。GitHub Pagesのstatic frontendから直接LLM endpointを呼び出す設計にはしません。
