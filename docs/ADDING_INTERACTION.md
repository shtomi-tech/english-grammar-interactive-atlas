# 新しいインタラクションを追加する

図鑑の基本単位はサイトではなく、再利用可能なインタラクションです。追加は次の順で行います。

## 1. `InteractionEntry` を登録する

`src/data/interactions.js` の `interactions` 配列へ、次の項目を追加します。

```js
{
  id: 'GRAM-INT-011',
  slug: 'new-interaction',
  title: 'New Interaction',
  category: 'build',
  description: '何を学ぶための操作か。',
  learningGoal: '学習者に身につけてほしいこと。',
  touchTarget: '学習者が触る対象',
  userAction: 'タップ / クリック',
  changingElement: '操作で変化するもの',
  insight: '操作の結果から何に気づかせるか。',
  targetGrammar: ['文型'],
  interactionType: ['token-select'],
  feedbackType: ['正誤', '説明'],
  implementationDifficulty: 2,
  reusability: 'A',
  sourceName: 'Original concept',
  license: 'Original implementation',
  reusePolicy: 'idea-only',
  notes: '拡張時の注意点。',
}
```

`id` は安定IDとして一度決めたら変更しません。検索対象は `title`、`description`、`targetGrammar` です。項目を登録するとAtlas一覧と詳細画面へ自動表示されます。

## 2. 問題データを分離する

Demoを作る場合、英文・正答・説明などの教材固有データは `src/data/demo-problems.js` または機能別のデータファイルへ置きます。Demoコンポーネントに大量の問題文を直接書きません。

## 3. Demoコンポーネントを作る

`src/components/demos/` にコンポーネントを追加します。共通Demo枠の中で、次の順序を保ちます。

```text
Instruction
Interactive area
Controls
Feedback
Explanation
```

タップだけで主要操作を完了できるようにし、button要素、focus表示、`aria-live`、文字による正誤表示を用意します。

## 4. Registryへ登録する

`src/components/demos/registry.js` に `demoType` とマウント関数の対応を追加します。

```js
export const demoRegistry = {
  'new-interaction': mountNewInteraction,
};
```

`InteractionEntry.demoType` に同じキーを設定すれば、詳細画面から自動でDemoが表示されます。

## 5. ロジックとテストを追加する

判定や文生成は `src/lib/grammar/` などの純粋な関数としてUIから分離します。`tests/logic.test.js` に、正解・不正解・境界条件を追加してください。

最後に次を実行します。

```bash
npm test
npm run check
npm run build
```

外部Repositoryのコードを導入する場合は、先にライセンス・依存関係・流用範囲を確認し、UI参考とコード流用を記録上も明確に分けます。
