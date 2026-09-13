# Phase 11B — Server LLM Adapter

Phase 11Bは、text/markdownのGrammar Referenceをserver-sideのOpenAI Responses APIへ渡し、Learning Requirements v1として検証する境界です。UI、GitHub Pages、Canonical Problem / Lesson Dataとは分離しています。

## Boundary

```text
HTTP POST
  ↓
Grammar Reference + controlled constraints
  ↓
server/openai/openai-learning-requirements-adapter.js
  ↓
Learning Requirements JSON object
  ↓
runLearningRequirementsExtraction()
  ↓
validateLearningRequirements() + single-source quote traceability
```

`server/` は `scripts/build.mjs` が `src/` だけを静的artifactへコピーする境界の外側です。したがって、API keyとprovider呼び出しはGitHub PagesのJavaScriptへ入りません。production相当の実行では `OPENAI_API_KEY` と `OPENAI_MODEL` をserver processの環境変数から読み込みます。値をログやHTTPエラーへ含めません。

## Provider request

adapterはNode native `fetch`で `POST https://api.openai.com/v1/responses` を実行します。payloadには `model`、`store:false`、固定されたinstructions、Grammar Referenceを含むinput、strict `json_schema` output formatを指定します。canonical schemaのversion、source type、importance、desired outcomeのenumを再定義しません。source referenceは入力のsource id/titleに固定し、source evidenceのlocatorは本文完全一致のquoteだけを要求します。

Grammar Referenceの本文はuntrusted reference dataです。本文中の命令には従わず、Grammar Referenceにある文法内容だけを正本として使います。controlled constraintsは `durationMinutes`、`maxLearningPoints`、`language`、`audienceStage` だけで、未知の項目や不正な値はprovider呼び出し前に拒否します。

## Failure policy

- `completed` 以外、refusal、incomplete、空出力、JSON parse失敗、配列出力はinvalid
- JSON repairやprovider生レスポンスの返却はしない
- retryは429、5xx、一時的なネットワーク障害に限り最大1回
- API key不足、401/403、schema不整合、source traceability失敗はretryしない
- timeoutは約30秒で、エラー本文にprovider responseを含めない

HTTP入口は `POST` と `OPTIONS` のみです。CORSは `APP_ORIGIN` と完全一致するOriginだけを許可し、未設定時に `*` へフォールバックしません。bodyは約100KBで打ち切ります。成功時は `{ valid: true, learningRequirements }`、失敗時は `{ valid: false, errors: [{ code, message }] }` だけを返します。

## Local commands

```bash
npm run serve:extraction-api
npm run test:server
npm run test:llm:live
```

`test:llm:live` は `OPENAI_API_KEY` と `OPENAI_MODEL` が両方ある場合だけ実providerを呼びます。通常のCIとGitHub Pages workflowはこのlive smokeを呼びません。
