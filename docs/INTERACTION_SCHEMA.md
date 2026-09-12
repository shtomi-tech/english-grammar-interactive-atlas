# InteractionEntry schema

`src/data/interactions.js` と `src/data/interactions-additional.js` は、英文法インタラクションを再利用可能な単位で記録します。`PROJECT_GOAL.md` の「学習効果 → 再利用性 → 明快さ」の優先順位を、項目設計と実装判断の基準にします。

## 必須フィールド

各項目には、次の文字列フィールドを空でない値として持たせます。

`id`, `slug`, `title`, `description`, `learningGoal`, `touchTarget`, `userAction`, `changingElement`, `insight`

次の配列も必須で、要素はすべて空でない文字列にします。

`targetGrammar`, `interactionType`, `feedbackType`

`implementationDifficulty` は1〜5、`reusability` は `S` / `A` / `B` です。`demoType` は実際にRegistryへ登録されたDemoがある場合だけ付けます。

## 中央管理する値

値の正本は `src/data/interaction-schema.js` です。

- Categories: `build`, `move`, `select`, `classify`, `transform`, `visualize`, `generate`, `compare`, `correct`, `simulate`
- Reusability ranks: `S`, `A`, `B`
- Reuse policies: `code`, `logic`, `ui-reference`, `idea-only`
- Source types: `original`, `repository`, `site`
- Research statuses: `verified`, `unresearched`
- License statuses: `verified`, `unknown`, `not-applicable`

`verified` は、ここに記録した出典メタデータを確認済みという意味です。外部Repositoryやサイトのコードを自動的に採用した、という意味ではありません。

## 出典メタデータ

出典に関するフィールドは次の形で統一します。

```js
{
  sourceType: 'original',
  researchStatus: 'verified',
  sourceName: 'Original catalog concept',
  sourceUrl: undefined,
  repositoryUrl: undefined,
  licenseStatus: 'not-applicable',
  reusePolicy: 'idea-only',
}
```

外部Repositoryやサイトを使った場合だけ、確認済みの `sourceUrl` / `repositoryUrl`、実在するライセンス名、適切な `reusePolicy` を記録します。ライセンスが不明な外部資料にはライセンス名を推測で書かず、`licenseStatus: 'unknown'` とします。原案・自作実装には外部ライセンスを付けず、`licenseStatus: 'not-applicable'` とします。

詳細画面では、未設定値を `Not researched`、`Not applicable`、`Not recorded` のいずれかで表示します。

## Research references

`researchRefs` is an optional array of IDs from `src/data/research/references.js`. It records which verified external research informed the Interaction entry. The original `sourceName`, `sourceUrl`, `repositoryUrl`, `licenseStatus`, and `reusePolicy` fields remain the entry's own provenance and reuse boundary.

Research Reference records separately store observed patterns, atlas implications, verification date, and license status. An unknown license must not be guessed. `npm run check` rejects unknown reference IDs and incomplete Research Reference metadata.

## ランク基準

- `S`: 問題データを差し替えて複数単元へ展開しやすく、学習ループも明確
- `A`: 再利用の余地が大きいが、文法状態や教材データに追加設計が必要
- `B`: 特定の教材・場面に依存し、汎用化の範囲が限定的

ランクは見た目の派手さではなく、学習効果と再利用可能な構造を優先して付けます。

## 40件カタログの方針

`GRAM-INT-001`〜`GRAM-INT-040` を1件ずつ保持し、10カテゴリを各4件で構成します。現在の6つのDemoは実働のまま維持し、カタログ拡張で新しいDemoを自動的に増やしません。新しい項目はまず学習目的・触る対象・変化・気づきを記録し、同じ操作概念の重複や、実装されていないDemoのふりを避けます。

検証は `npm test`、`npm run check`、`npm run build` の順で実行します。
