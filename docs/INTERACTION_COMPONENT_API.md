# Interaction Component API

Phase 3Aでは、教材固有のProblem Dataと表示・操作ロジックを分離します。

```text
Problem Data
    ↓ problemIdで取得
Problem Registry
    ↓ typeを確認
Reusable Component(root, problem, options)
    ↓
Demo / Lesson
```

## Mount signature

4つのComponentは次の形を実装します。

```js
const cleanup = mountInteraction(root, problem, {
  onComplete(result) {},
});
```

`root`はDOM要素、`problem`は対応する `type` を持つProblem、`options`は省略可能です。Problemの型が違う場合はComponentが明示的なエラーを投げます。mount前に同じrootの前回リスナーをcleanupし、返り値のcleanupでリスナーを解除できます。

| Component | type | Problemの主なフィールド |
| --- | --- | --- |
| Word Order Builder | `word-order` | `prompt`, `words`, `answer`, `explanation` |
| Mark the Parts | `mark-parts` | `prompt`, `tokens`, `answer`, `targetRole`, `explanation` |
| Grammar Classifier | `grammar-classifier` | `sentence`, `categories`, `items`, `explanation` |
| Sentence Transformer | `sentence-transformer` | `controls`, `defaults`, `sentenceModel` |

## Options and onComplete

判定を持つ3つのComponentはCheck時に、Sentence Transformerは選択変更時にcallbackを呼びます。

```js
onComplete({
  correct: true,
  problemId: 'WO-001',
  // Componentごとの結果フィールド
});
```

今回のLessonはcallbackを表示上の「Step complete」にだけ使います。学習履歴、点数、LocalStorage、DBには保存しません。

## Reset and lifecycle

ResetはProblemの初期状態へ戻します。LessonがStepを切り替えるときは、前のComponentのcleanupを呼び、同じrootへ新しいProblemをmountします。globalな `document` / `window` へのイベント登録は行いません。

## Accessibility expectations

- 主要操作には `button`、選択状態には `aria-pressed`、正誤には文字と `aria-live` を使う。
- 操作対象のfocus-visible表示を維持する。
- Sentence Transformerの選択肢はlabelとfieldset/legendで関連付ける。
- Lessonの現在Stepは `Step n / total` の文字でも表示し、Step切り替え後はStep見出しへfocusを移す。
- 44px以上を目安にタップ領域を確保し、320px幅で横スクロールを発生させない。

## Problem Registry

`src/data/problems/index.js` が全ProblemをIDで引けるRegistryです。Demo Registryには各Demo Typeの代表Problem IDを登録し、LessonはProblem IDだけを持ちます。`npm run check` はProblemの構造、Demo Registryの型一致、Lessonの存在・型一致を検証します。
