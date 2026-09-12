# Interactive Grammar Atlas

英文法の構造を、操作の変化から理解するためのインタラクション図鑑です。

このプロジェクトでは、教材の問題ごとに画面を作るのではなく、次の単位で機能を蓄積します。

```text
学習者が触る
      ↓
英文の何かが変わる
      ↓
文法規則との関係に気づく
```

プロジェクト全体の方針は [PROJECT_GOAL.md](./PROJECT_GOAL.md) を正本とします。

## 起動

依存パッケージはありません。Node.jsで構文確認・テスト・静的ビルドを実行できます。

```bash
npm test
npm run check
npm run build
npm start
```

ブラウザで `http://localhost:4173` を開きます。

## 現在の構成

- `src/data/interactions.js`: 図鑑データと `InteractionEntry` のJSDoc定義
- `src/data/demo-problems.js`: Demoで使う問題データ
- `src/components/atlas/`: 一覧カードとカテゴリフィルタ
- `src/components/demos/`: 共通Demo枠、4つのDemo、Demo Registry
- `src/lib/grammar/`: 正誤判定、分類判定、文法状態からの英文生成
- `src/lib/validateInteractions.js`: 図鑑データの整合性検証
- `tests/logic.test.js`: 検索・フィルタ・正誤判定・分類・英文生成のテスト
- `docs/ADDING_INTERACTION.md`: 新しい図鑑項目とDemoの追加手順

## 現在の実装範囲

Phase 1の基盤に、Phase 2AのGrammar Classifierを加えています。10件のカタログ、カテゴリ絞り込み、部分一致検索、ハッシュURLによる詳細画面、次の4つのDemoを含みます。

1. Word Order Builder
2. Mark the Parts
3. Sentence Transformer
4. Grammar Classifier

画面は、スマートフォンのタップ操作とキーボード操作で利用できるようにしています。BackendやDBはまだ導入していません。
