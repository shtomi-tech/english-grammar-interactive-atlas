# Phase 10 — Runtime E2E Preview

Phase 10 は、Phase 9 の proof artifact に含まれる transient な Problem と Lesson を、Canonical Registryへ登録せずに既存Componentへ渡して、ブラウザ上で一つの学習フローとして操作確認する段階です。

## 入力と境界

プレビューは `dist/ai/proofs/end-to-end-material-generation.json` を同一オリジンから読み込みます。ブラウザでGrammar Referenceから再生成したり、LLM・PDF解析・API・DBへ接続したりはしません。proofが `valid: true` でない場合、またはruntimeで再検証できない場合は `Runtime preview unavailable` を表示し、Componentを部分表示しません。

## transient registry

`createRuntimePreviewModel()` はCanonical Problemsとproofのgenerated Problemsを一時的なRegistryへまとめ、既存の `validateProblems()` と `validateLessons()` で再検証します。Lessonは `SC-001`、`E2E-WO-001`、`E2E-EC-001` の3 Stepを持ちます。generated Problemとcandidate Lessonは `src/data/problems/`、`src/data/lessons.js`、既存Registryへ書き込みません。

`renderLesson()` は通常のCanonical Lessonでは既存の `mountDemo()` を使い、runtime previewだけ `mountDemoProblem()` へ検証済みProblemを直接渡します。Demo component自体は変更していません。

## 操作確認

ローカルでは先に `npm run build` を実行し、次に `npm run test:runtime` を実行します。Playwrightは `tests/browser/e2e-runtime-preview.spec.js` で次を確認します。

- `#preview/e2e-material-generation` がproof由来のLessonを表示する
- Sentence Comparison、Word Order Builder、Error Correctorを順にcorrect completionできる
- 最後に3 / 3、100%とLesson completeを表示する
- Canonical `#lessons/infinitives` の表示がruntime previewと混ざらない
- console errorとpage errorがない

GitHub Actionsでも、`npm ci`、既存の論理検証、build、Chromiumでのruntime test、Pages artifact upload、deployの順に実行します。

## 未実装の範囲

これは生成AIの本番実行や教材のCanonical登録ではありません。ユーザー入力からのGrammar Reference抽出、Problem / Lessonの永続化、LLM接続、runtime previewのCanonical Lesson一覧への追加は、次段階の判断事項です。
