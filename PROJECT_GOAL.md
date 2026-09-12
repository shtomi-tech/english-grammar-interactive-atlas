# 英文法インタラクティブ図鑑プロジェクト

## 1. プロジェクトの目的

英文法学習に役立つインタラクティブなUI・機能・教材表現を収集・整理し、実際に操作して確認できる「英文法インタラクティブ図鑑」を構築する。

この図鑑は、単なるWebサイトやGitHubリポジトリのリンク集ではない。

最終的な目的は、

**優れたインタラクションを研究する
→ 共通化できる学習機能として整理する
→ 再利用可能なコンポーネントとして実装する
→ 実際の英文法教材に組み込む**

という流れを作ることである。

---

# 2. 最終ゴール

最終的には、英文法教材を

```text
教材 = 文法コンテンツ + インタラクション
```

として構築できる状態を目指す。

例えば「語順並べ替え」という1つのインタラクションを作れば、

```text
I / play / tennis.
```

のような基礎英文だけでなく、

```text
What / do / you / usually / do / after school?
```

や、

```text
The book / which / I / bought / yesterday / was / interesting.
```

のような異なる文法単元でも再利用できるようにする。

つまり、問題ごとにUIを作るのではなく、

**インタラクションを再利用可能な学習部品として蓄積すること**

がこのプロジェクトの中心思想である。

---

# 3. 今回作るもの

最初に作るのは、完成した英文法教材ではない。

まず、

# 「英文法インタラクティブ図鑑」

を作る。

図鑑では、英文法学習に使えるインタラクションを一覧表示し、それぞれを実際に操作して確認できるようにする。

想定するコンテンツ数は、初期段階で約40種類。

---

# 4. 図鑑の基本単位

サイト単位ではなく、

**インタラクション単位**

で管理する。

悪い例：

```text
H5P
British Council
GrammarGolf
Sentence Builder
```

良い例：

```text
GRAM-INT-001 Word Order Builder
GRAM-INT-002 Drag into Blank
GRAM-INT-003 Mark the Subject
GRAM-INT-004 Syntax Tree Builder
GRAM-INT-005 Tense Transformer
```

外部サイトやGitHubリポジトリは、それぞれのインタラクションの

* 参考元
* 実装参考
* UI参考
* コード流用候補

として紐付ける。

---

# 5. 主なインタラクション分類

現時点では、以下の10カテゴリを基本とする。

```text
1. Build
2. Move
3. Select
4. Classify
5. Transform
6. Visualize
7. Generate
8. Compare
9. Correct
10. Simulate
```

## Build

英文を組み立てる。

例：

* 単語並べ替え
* 文型ビルダー
* 疑問文ビルダー
* 節の組み合わせ

---

## Move

語句や文の要素を移動する。

例：

* Drag & Drop
* 空欄への語句配置
* 修飾語の移動
* 語順変化

---

## Select

英文の特定部分を選択する。

例：

* 主語をクリック
* 動詞をクリック
* 関係詞を選択
* 節を選択

---

## Classify

英文の要素を分類する。

例：

* 名詞 / 形容詞 / 副詞
* S / V / O / C
* 句 / 節
* 自動詞 / 他動詞

---

## Transform

英文を変形する。

例：

```text
He plays tennis.
↓
They play tennis.
```

```text
Active
↓
Passive
```

```text
Present
↓
Past
```

など。

---

## Visualize

英文の構造を視覚化する。

例：

* Syntax Tree
* 文型図
* 修飾関係
* 節の階層
* 色分け

---

## Generate

条件から英文を生成する。

例：

```text
Subject: He
Tense: Past
Negative: ON
```

↓

```text
He did not play tennis.
```

---

## Compare

複数の英文を比較する。

例：

```text
I stopped smoking.
I stopped to smoke.
```

の違いをインタラクティブに比較する。

---

## Correct

誤った英文を修正する。

例：

```text
He play tennis.
```

↓

```text
He plays tennis.
```

---

## Simulate

状況・文脈の中で英文法を使用する。

例：

* 店
* 空港
* 学校
* 会話
* 旅行

などの場面で、適切な文法表現を選ぶ。

---

# 6. 各図鑑項目に持たせる情報

各インタラクションには最低限、以下の情報を持たせる。

```text
id
title
category
description
learningGoal
targetGrammar
interactionType
userAction
changingElement
feedbackType
difficulty
implementationDifficulty
reusability
source
repository
license
reusePolicy
notes
```

表示上は例えば以下のようにする。

| 項目       | 内容                    |
| -------- | --------------------- |
| ID       | GRAM-INT-001          |
| タイトル     | Word Order Builder    |
| 分類       | Build                 |
| 学習者が触るもの | 単語カード                 |
| 操作       | タップ / ドラッグ            |
| 変化するもの   | 英文の語順                 |
| 学習目的     | 英語の基本語順を理解する          |
| 対象文法     | 文型・疑問文・関係詞など          |
| フィードバック  | 正誤・ヒント                |
| 実装難易度    | ★★                    |
| 再利用性     | S                     |
| 元ネタ      | Sentence Builder      |
| ライセンス    | MIT等                  |
| 利用方法     | UI参考 / ロジック参考 / コード流用 |

---

# 7. 外部リポジトリ・サイトの扱い

研究対象として、

* GitHubリポジトリ
* オープンソース教材
* 英語学習サイト
* 文法学習アプリ
* H5P等の教育用インタラクション
* 英文生成ライブラリ

などを調査する。

ただし、

**「参考」と「コード流用」を明確に区別する。**

---

## コード流用候補

MIT、Apache、BSD等、再利用可能なライセンスのもの。

例：

```text
MIT
Apache-2.0
BSD
```

---

## UI / アイデア参考のみ

商用学習サービスや著作権のある教材。

これらについては、

* UI構造
* インタラクション
* 学習フロー
* フィードバック方法

のみを研究し、問題文・画像・音声等をコピーしない。

---

# 8. 最初に研究対象とする候補

優先的に調査する候補：

```text
H5P
Sentence Builder
GrammarGolf
jsRealB
Fluentcards Grammar
British Council LearnEnglish Grammar
```

これらから、

「どのサイトが良いか」

ではなく、

**「どのインタラクションが英文法学習に使えるか」**

を抽出する。

---

# 9. 図鑑UI

最終的な図鑑では、カード形式でインタラクションを一覧できるようにする。

イメージ：

```text
┌─────────────────────────┐
│ Word Order Builder      │
│ Build                   │
│                         │
│ 単語を並べ替えて英文を │
│ 作る                    │
│                         │
│ [ Demo ] [ Details ]    │
└─────────────────────────┘
```

一覧画面から、

```text
カテゴリ
対象文法
実装難易度
再利用性
操作方法
```

などで絞り込めるようにする。

---

# 10. Demoを重視する

図鑑は説明だけのサイトにしない。

可能なものについては、

**実際に触れる小さなDemo**

を用意する。

例えばWord Order Builderなら、

```text
play
I
tennis
```

を並べ替えて、

```text
I play tennis.
```

を作れるようにする。

目的は、

「この機能が実際の教材でどう感じられるか」

をすぐ確認できること。

---

# 11. コンポーネント化

インタラクションは可能な限り再利用可能なコンポーネントとして作る。

例えば、

```text
WordOrderBuilder
DragToBlank
WordHighlighter
SentenceTransformer
SyntaxTree
GrammarClassifier
ErrorCorrector
SentenceGenerator
```

など。

教材固有の英文や問題データをコンポーネント内部へ直接書かない。

---

# 12. データ駆動設計

コンポーネントと問題データを分離する。

例えば：

```json
{
  "id": "word-order-001",
  "type": "word-order",
  "prompt": "英文を完成させてください。",
  "words": [
    "I",
    "play",
    "tennis"
  ],
  "answer": [
    "I",
    "play",
    "tennis"
  ],
  "grammar": [
    "SV",
    "present-simple"
  ]
}
```

これを、

```text
WordOrderBuilder
```

へ渡せば問題として動く設計を目指す。

---

# 13. 将来的な教材構造

最終的には、

```text
Interactive Grammar Atlas
        ↓
Reusable Components
        ↓
Grammar Question Data
        ↓
Lessons
```

という構造にする。

例えば、

```text
Lesson 01 文型
Lesson 02 時制
Lesson 03 助動詞
Lesson 04 受動態
Lesson 05 不定詞
Lesson 06 動名詞
Lesson 07 分詞
Lesson 08 比較
Lesson 09 関係詞
Lesson 10 仮定法
```

それぞれで図鑑のインタラクションを再利用する。

---

# 14. このプロジェクトで重視すること

優先順位は以下。

```text
1. 学習効果
2. 再利用性
3. 操作の分かりやすさ
4. 実装のシンプルさ
5. 見た目
```

「派手だが学習効果が低い機能」よりも、

**英文の構造や文法変化を理解しやすくする機能**

を優先する。

---

# 15. 特に重要な設計思想

インタラクティブ教材の価値は、

「クリックできること」

そのものではない。

重要なのは、

```text
学習者が何かを操作する
        ↓
英文の何かが変化する
        ↓
文法規則との関係に気づく
```

という構造を作ることである。

したがって各インタラクションについて必ず、

```text
何を触るか
何が変化するか
何に気づかせるか
```

を定義する。

---

# 16. 初期目標

Phase 1では、まず40程度のインタラクション候補を収集する。

それぞれについて、

```text
タイトル
カテゴリ
触る対象
操作
変化するもの
気づかせたいこと
対象文法
参考サイト / Repository
ライセンス
実装難易度
再利用性
```

を整理する。

---

# 17. 評価

各機能を、

```text
S
A
B
```

で評価する。

評価基準：

```text
学習効果
実装難易度
再利用性
教材への展開可能性
```

Sランクのインタラクションから優先的にDemo化する。

---

# 18. 実装フェーズ

想定する開発順序：

```text
Phase 1
Research
↓
インタラクション候補収集

Phase 2
Catalog
↓
40コンテンツを図鑑化

Phase 3
Prototype
↓
Sランク機能をDemo実装

Phase 4
Component
↓
再利用可能コンポーネント化

Phase 5
Grammar Data
↓
英文法問題データを分離

Phase 6
Lesson
↓
実際の英文法教材へ導入
```

---

# 19. Codexへの実装方針

Codexは実装を進める際、以下を優先すること。

1. 既存コード・ディレクトリ構造を確認してから変更する。
2. 大規模な書き換えより、小さく安全な変更を優先する。
3. 図鑑機能と教材機能を密結合させない。
4. インタラクションは再利用可能なコンポーネントとして設計する。
5. 問題データをUIコンポーネントへハードコードしない。
6. 各Demoは単独で動作確認できるようにする。
7. 外部コードを使用する場合は必ずライセンスを確認する。
8. 外部サービスのUIをそのままコピーしない。
9. PCだけでなくスマートフォン・タブレット操作も考慮する。
10. 教員が後から問題データを追加しやすい構造を優先する。

---

# 20. 完成状態の定義

このプロジェクトの最初の完成状態は、

**英文法学習に利用できる約40種類のインタラクションを一覧でき、そのうち主要なものを実際に操作して試せる図鑑**

が存在することである。

その次の完成状態は、

**図鑑で作ったインタラクションを使い、英文法教材をデータだけ差し替えて作成できる状態**

である。

最終的には、

```text
インタラクションを選ぶ
↓
英文法問題データを入れる
↓
教材が完成する
```

という教材制作環境を実現する。
