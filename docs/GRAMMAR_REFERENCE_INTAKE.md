# Phase 11A/11B — Grammar Reference Intake

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

## Phase 11B — server-side LLM adapter

Phase 11Bでは、実providerとしてOpenAI Responses APIをserver-side adapterへ接続します。`server/openai/` と `server/http/` は静的ビルド対象の `src/` の外に置き、GitHub Pages artifactへ入りません。ブラウザからproviderへ直接接続せず、API keyは `OPENAI_API_KEY` 環境変数だけから読み込みます。

adapterは `store:false`、strict JSON Schema、約30秒のtimeout、429/5xx/一時的なネットワーク障害に限る最大1回のretryを使います。レスポンスは `completed`、拒否なし、空でないstructured JSON objectを満たさなければinvalidです。JSON repairは行いません。

HTTP入口は `POST` と `OPTIONS` だけを受け付け、`APP_ORIGIN` と完全一致するOriginだけをCORSで許可します。入力はGrammar Referenceと次の制約に限定します。

- `durationMinutes`: 正の整数
- `maxLearningPoints`: 正の整数
- `language`: 空でない文字列
- `audienceStage`: `middle-school` / `high-school` / `adult`

出力は既存の `runLearningRequirementsExtraction()` へ渡し、Learning Requirements v1、単一の `user-provided` source reference、各Learning Pointの本文完全一致quoteを再検証します。providerの生レスポンスやHTTP headerは返しません。ローカルAPIは `npm run serve:extraction-api` で別起動し、実provider smokeは `npm run test:llm:live` で明示的に実行します。通常のCIとPages deployはlive APIを呼びません。
