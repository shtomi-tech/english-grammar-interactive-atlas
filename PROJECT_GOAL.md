# 英文法インタラクティブ図鑑プロジェクト

## 1. プロジェクトの目的

英文法学習に役立つインタラクティブなUI・機能・教材表現を収集・整理し、実際に操作して確認できる

# 「英文法インタラクティブ図鑑」

を構築する。

この図鑑は、単なるWebサイトやGitHubリポジトリのリンク集ではない。

最終的な目的は、

```text
優れたインタラクションを研究する
        ↓
共通化できる学習機能として整理する
        ↓
再利用可能なComponentとして実装する
        ↓
AIが検索しやすい形で蓄積する
        ↓
ユーザーが提供する文法解説と組み合わせる
        ↓
AIが実際の英文法教材を生成する
```

という教材制作基盤を作ることである。

---

# 2. 最終ゴール

最終的には、英文法教材を

```text
教材
=
文法コンテンツ
+
インタラクション
```

として構築できる状態を目指す。

ただし、それぞれの役割を明確に分離する。

```text
文法コンテンツ
        ↓
ユーザーが提供する文法解説・教材・参考資料

インタラクション
        ↓
英文法インタラクティブ図鑑
```

そして、その2つをAIが組み合わせて教材を生成する。

最終的な教材生成フローは、

```text
ユーザーが文法解説を渡す
        ↓
AIが文法内容・学習目標を抽出する
        ↓
AIがInteractive Grammar Atlasを検索する
        ↓
適切なInteractionを選択する
        ↓
既存Problemを検索・再利用する
        ↓
不足しているProblem Dataだけ生成する
        ↓
Validatorで検証する
        ↓
Lessonとして構成する
        ↓
インタラクティブ教材が完成する
```

という形とする。

---

# 3. 文法内容とInteractionの責務を分離する

このプロジェクトでは、

**「何を教えるか」**

と

**「どう学ばせるか」**

を明確に分離する。

## 文法内容

文法内容については、教材作成時にユーザーが提供する

* 文法解説
* 参考書
* 授業プリント
* PDF
* Word
* Markdown
* テキスト
* その他の指定資料

を基準とする。

## Interaction

Interactive Grammar Atlasは、

* 学習者に何を操作させるか
* 何を変化させるか
* 何を比較させるか
* 何に気づかせるか
* どのようなフィードバックを返すか

を提供する。

つまり、

```text
Grammar Reference
        ↓
何を教えるか

Interaction Atlas
        ↓
どう学ばせるか
```

という関係にする。

---

# 4. 教材生成時の情報優先順位

AIが教材を作成するときは、原則として以下の優先順位を使用する。

```text
1. ユーザーが今回提供した文法解説・教材資料
2. ユーザーが明示した教材作成条件
3. Interactive Grammar AtlasのInteraction情報
4. 既存Problem / Lessonの実装例
5. AIの一般的な英文法知識
```

特に、文法内容について、

```text
ユーザー提供資料
```

と

```text
AIの一般知識
```

が異なる場合は、原則としてユーザー提供資料を優先する。

AIの一般知識によって、ユーザーの指定教材を勝手に置き換えない。

---

# 5. Interaction Atlasは「文法辞典」ではない

Interactive Grammar Atlasの主目的は、

```text
文法知識そのものを保存すること
```

ではない。

主目的は、

```text
文法知識を
どのような学習操作へ変換できるか
```

を蓄積することである。

例えば、

```text
to + 動詞原形
```

という文法内容そのものはGrammar Referenceから得る。

その内容を、

```text
Word Order Builder
Grammar Classifier
Modifier Positioner
Sentence Comparison
Error Corrector
Context Grammar
```

などのどのInteractionで学ばせるかをAtlasから取得する。

---

# 6. プロジェクトの中心思想

問題ごとに専用UIを作らない。

例えば、

```text
Word Order Builder
```

を一度実装すれば、

```text
I / play / tennis.
```

だけではなく、

```text
I / want / to / study / English.
```

や、

```text
The report / was / written / by the teacher.
```

や、

```text
The book / which / I / bought / yesterday / was / interesting.
```

など、異なる文法単元でも利用できるようにする。

つまり、

**Interactionを再利用可能な学習部品として蓄積すること**

がこのプロジェクトの中心思想である。

---

# 7. 全体アーキテクチャ

最終的な構造は、

```text
Grammar Reference
        │
        │ 文法内容
        ▼
Learning Requirements
        │
        │ 学習目標
        ▼
AI Retrieval
        │
        │ Interaction検索
        ▼
Interactive Grammar Atlas
        │
        ▼
Reusable Components
        │
        ▼
Grammar Problem Data
        │
        ▼
Lessons
        │
        ▼
Interactive Grammar Material
```

とする。

既存システム側だけを見ると、

```text
Interactive Grammar Atlas
        ↓
Reusable Components
        ↓
Grammar Problem Data
        ↓
Lessons
```

というデータ駆動構造を維持する。

---

# 8. Grammar Reference

教材作成時には、ユーザーが文法解説を提供する。

AIはまずGrammar Referenceから、

```text
重要概念
文法規則
例文
注意事項
例外
対比
誤りやすい点
学習順序
```

などを抽出する。

Grammar Referenceを直接Interactionへ流し込まず、一度

# Learning Requirements

へ変換する。

---

# 9. Learning Requirements

Learning Requirementsは、

**文法資料とInteraction Atlasを接続する中間表現**

である。

例えば、

```json
{
  "topic": "infinitives",
  "learningPoints": [
    {
      "id": "LP-001",
      "concept": "to + base verb",
      "importance": "core",
      "desiredOutcome": "form"
    },
    {
      "id": "LP-002",
      "concept": "noun-like infinitive",
      "importance": "core",
      "desiredOutcome": "classification"
    },
    {
      "id": "LP-003",
      "concept": "infinitive of purpose",
      "importance": "core",
      "desiredOutcome": "meaning-and-position"
    }
  ]
}
```

のように整理する。

AIはこのLearning Requirementsを使ってInteraction Atlasを検索する。

---

# 10. Interaction選択の考え方

Interactionは、

```text
文法名
```

だけで検索しない。

例えば、

```text
不定詞
```

という名前だけでInteractionを決めるのではなく、

```text
形を組み立てたい
役割を分類したい
位置による意味差を見せたい
2文を比較したい
典型的な誤りを直したい
文脈の中で選ばせたい
```

という

**学習者に行わせたい認知活動**

からInteractionを検索する。

例えば、

```text
Learning Requirement:
to + 動詞原形を組み立てられるようにする

→ Word Order Builder
```

```text
Learning Requirement:
名詞・形容詞・副詞的用法を分類する

→ Grammar Classifier
```

```text
Learning Requirement:
位置による意味やかかり先を見る

→ Modifier Positioner
```

```text
Learning Requirement:
2つの表現の意味差を理解する

→ Sentence Comparison
```

という対応を行う。

---

# 11. Interaction Atlasの基本単位

Atlasはサイト単位ではなく、

# Interaction単位

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

外部サイトやRepositoryは、それぞれのInteractionの

* 参考元
* 実装参考
* UI参考
* コード流用候補

として管理する。

---

# 12. Interactionの10カテゴリ

基本カテゴリは以下とする。

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

## Move

語句や文の要素を移動する。

例：

* Drag & Drop
* 空欄への語句配置
* 修飾語の移動
* 語順変化

## Select

英文の特定部分を選択する。

例：

* 主語をクリック
* 動詞をクリック
* 関係詞を選択
* 節を選択

## Classify

英文の要素を分類する。

例：

* 名詞 / 形容詞 / 副詞
* S / V / O / C
* 句 / 節
* 自動詞 / 他動詞

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

## Visualize

英文の構造を視覚化する。

例：

* Syntax Tree
* 文型図
* 修飾関係
* 節の階層
* 色分け

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

## Compare

複数の英文を比較する。

例：

```text
I stopped smoking.
I stopped to smoke.
```

の違いを操作しながら確認する。

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

## Simulate

状況・文脈の中で英文法を使用する。

例：

* 店
* 空港
* 学校
* 会話
* 旅行

などの場面で、目的に合う表現を選ぶ。

---

# 13. Interactionに必要な情報

各Interactionには、人間向け情報だけでなく、

# AI検索用情報

を持たせる。

最低限、

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

を持つ。

さらにAI検索用として、

```text
capabilities
learningPatterns
learnerActions
changes
feedbackCapabilities
bestFor
notBestFor
supports
exampleProblemIds
```

などを段階的に追加する。

---

# 14. AI検索向けInteraction Metadata

例えば、

```json
{
  "id": "GRAM-INT-014",
  "title": "Modifier Positioner",
  "category": "move",

  "capabilities": [
    "move-phrase",
    "compare-placement",
    "show-modifier-target",
    "show-meaning-change"
  ],

  "learningPatterns": [
    "position-affects-meaning",
    "modifier-target-awareness",
    "multiple-valid-answers"
  ],

  "learnerActions": [
    "select",
    "place",
    "compare"
  ],

  "changes": [
    "phrase-position",
    "modifier-target",
    "sentence-meaning"
  ],

  "feedbackCapabilities": [
    "grammaticality",
    "goal-match",
    "relation",
    "meaning"
  ],

  "bestFor": [
    "discovering-placement-differences",
    "comparing-modifier-scope"
  ],

  "notBestFor": [
    "assembling-entire-sentence"
  ],

  "supports": {
    "multipleCorrectAnswers": true
  }
}
```

のような情報を持てる状態を目指す。

特に、

```text
bestFor
notBestFor
```

はAIのInteraction選択精度を高めるため重要とする。

---

# 15. Problem Data

教材固有の英文や問題データはComponentへ書かない。

ComponentとProblem Dataを分離する。

例えば、

```json
{
  "id": "WO-001",
  "type": "word-order",
  "prompt": "英文を完成させてください。",
  "words": [
    "I",
    "play",
    "tennis"
  ],
  "acceptedAnswers": [
    [
      "I",
      "play",
      "tennis"
    ]
  ],
  "explanation": "英語の基本語順を確認します。"
}
```

を

```text
WordOrderBuilder
```

へ渡せば動く構造にする。

---

# 16. 既存Problemの役割

既存Problemは、

```text
単なる練習問題
```

ではない。

AI教材生成において、

# Interactionの使用例

として利用する。

つまり既存Problemは、

* このInteractionで何ができるか
* どの程度の粒度でデータを書くか
* どのようなフィードバックが適切か
* どんな学習目標に使えるか

をAIへ示す

# few-shot example

として機能する。

---

# 17. ProblemもAI検索対象にする

新しい教材を作るたびにProblemを生成するのではなく、

# まず既存Problemを検索する

ことを原則とする。

例えば、

```text
動名詞と不定詞の意味差を教えたい
```

という要求に対して、

```text
SC-001
I stopped smoking.
I stopped to smoke.
```

が既に存在するなら、新規Problemを生成せず再利用する。

基本フロー：

```text
Learning Requirement
        ↓
既存Problem検索
        ↓
利用可能
   YES      NO
    ↓        ↓
 再利用   新規生成
```

---

# 18. ProblemのAI検索Metadata

Problemにも段階的に、

```text
grammarTopics
learningObjectives
concepts
contrast
difficulty
prerequisites
reusableForLessons
interactionType
```

などを持たせる。

例：

```json
{
  "id": "SC-001",
  "type": "sentence-comparison",

  "grammarTopics": [
    "gerund",
    "infinitive",
    "verb-pattern",
    "stop"
  ],

  "learningObjectives": [
    "compare-meaning",
    "distinguish-gerund-and-infinitive"
  ],

  "contrast": {
    "left": "stop + gerund",
    "right": "stop + infinitive"
  },

  "reusableForLessons": [
    "infinitives",
    "gerunds"
  ]
}
```

---

# 19. AI教材生成の標準フロー

教材生成時のAIは以下の順番で処理する。

```text
STEP 1
Grammar Referenceを読む

STEP 2
Learning Requirementsを抽出する

STEP 3
各Learning Requirementについて
Interaction Atlasを検索する

STEP 4
既存Problemを検索する

STEP 5
利用できるProblemは再利用する

STEP 6
不足Problemだけ生成する

STEP 7
Problem Validatorで検証する

STEP 8
学習順序を決める

STEP 9
Lesson Dataを生成する

STEP 10
Reusable ComponentsへProblem Dataを渡す

STEP 11
実際に操作可能な教材としてPreviewする
```

---

# 20. AIは新しいUIを安易に作らない

教材生成時、AIは新しい文法項目が出るたびに、

```text
新しいComponent
新しいDemo Type
新しいInteraction
```

を作らない。

まず既存Interactionで表現できるかを検索する。

優先順位：

```text
1. 既存Problemを再利用
2. 既存Interaction + 新Problem
3. 既存Interactionの汎用拡張
4. 新Interaction
```

新Interactionは、

**既存Interactionでは学習目的を十分に表現できない場合のみ**

検討する。

---

# 21. AI Retrieval Index

将来的には既存のCanonical Dataから、

AIが読みやすい検索用データを生成する。

例えば、

```text
src/data/interactions.js
src/data/problems/
src/data/lessons.js
```

を正本として、

build時に、

```text
dist/ai/interactions.json
dist/ai/problems.json
dist/ai/lessons.json
dist/ai/catalog.json
```

のようなAI検索向けIndexを生成する。

同じ情報を複数箇所で手動管理しない。

---

# 22. AI検索では意味ベースの要求を扱う

AIは、

```text
GRAM-INT-014を使いたい
```

という検索だけでなく、

```text
語句の位置による意味の変化に気づかせたい

複数の正答を比較させたい

文法的には正しいが
場面の目的には合わない表現を比較したい

文構造を視覚化したい

典型的な誤りを直させたい
```

のような教育目的からInteractionを検索できる状態を目指す。

---

# 23. Demoを重視する

Atlasは説明だけのサイトにしない。

可能なInteractionについては、

**実際に触れる小さなDemo**

を用意する。

目的は、

```text
このInteractionが
実際の教材でどのように感じられるか
```

を人間とAIの両方が確認できるようにすることである。

---

# 24. Component化

Interactionは可能な限り再利用可能なComponentとして作る。

例：

```text
WordOrderBuilder
MarkTheParts
GrammarClassifier
SentenceTransformer
SentencePatternDiagram
ModifierConnectionViewer
ModifierPositioner
SentenceComparison
ErrorCorrector
ContextGrammar
SentenceGenerator
```

Component内部に教材固有の英文を直接書かない。

---

# 25. Componentの責務

Componentは、

```text
どの文法を教えるか
```

を知らなくてよい。

Componentが知るべきなのは、

```text
どのデータ構造を受け取るか
学習者が何を操作するか
どの状態変化を起こすか
どう正誤判定するか
どんなfeedbackを返すか
いつcompletionを通知するか
```

である。

---

# 26. Lessonの位置づけ

Lessonは、

```text
複数Problemを
学習目的に応じた順序へ並べたもの
```

とする。

Lesson自体へ文法ロジックを大量に書かない。

例えば、

```text
Build
↓
Classify
↓
Compare
↓
Correct
↓
Simulate
```

のように複数Interactionを組み合わせて学習体験を作る。

---

# 27. Lesson 01〜10について

将来的な教材例として、

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

などが考えられる。

ただし、

**Lesson 01〜10をすべて手作業で実装すること自体をプロジェクトの最終ゴールとはしない。**

これらは、

```text
Reusable Components
Problem Data
AI Retrieval
Lesson Generation
```

が正しく機能することを確認するための教材例である。

将来的には、AIがGrammar Referenceをもとに新Lessonを生成できることを重視する。

---

# 28. 外部Repository・教材の扱い

研究対象として、

* GitHub Repository
* オープンソース教材
* 英語学習サイト
* 文法学習アプリ
* H5P等の教育Interaction
* 英文生成Library

などを調査する。

ただし、

**参考とコード流用を明確に区別する。**

## コード流用候補

MIT、Apache、BSD等、再利用可能なLicenseを持つもの。

## UI / Idea参考

商用学習サービスや著作権のある教材については、

* UI構造
* Interaction
* 学習フロー
* Feedback方法

のみを研究する。

問題文・画像・音声・教材本文等をコピーしない。

---

# 29. Atlas UI

人間向けUIでは、Interactionをカード形式で確認できるようにする。

例：

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

一覧画面では、

```text
category
targetGrammar
implementationDifficulty
reusability
userAction
demo availability
```

などで検索・Filterできるようにする。

人間向けUIとAI向け検索Indexは同じCanonical Dataから生成する。

---

# 30. 重要な設計思想

インタラクティブ教材の価値は、

```text
クリックできること
```

そのものではない。

重要なのは、

```text
学習者が何かを操作する
        ↓
英文の何かが変化する
        ↓
文法規則・意味・構造との関係に気づく
```

という構造を作ることである。

したがって各Interactionについて必ず、

```text
何を触るか
何が変化するか
何に気づかせるか
```

を定義する。

---

# 31. プロジェクトの優先順位

開発判断では以下を優先する。

```text
1. 学習効果
2. 再利用性
3. AIによる検索・選択のしやすさ
4. Problem Dataの生成しやすさ
5. 操作の分かりやすさ
6. 実装のシンプルさ
7. 見た目
```

派手なInteractionより、

**文法の構造・意味・変化を理解しやすいInteraction**

を優先する。

---

# 32. AI検索性を優先する

今後のMetadata設計では、

```text
人間が読める
```

だけではなく、

```text
AIが目的から検索できる
```

ことを重視する。

特に、

```text
learning objective
learner action
changing element
feedback capability
best use case
poor use case
supported interaction pattern
example problem
```

を明示する。

曖昧な長文説明だけに依存しない。

---

# 33. Validator

AIがProblem Dataを生成するため、

Validatorを重要な境界とする。

AIが生成したデータについて、

```text
必須Field
ID
Reference
Answer
Relation
Accepted Choice
Problem Type
Component Contract
```

などを機械的に検証する。

基本思想：

```text
AIが生成する
        ↓
Validatorが検証する
        ↓
Componentが表示する
```

Component側で不正データを推測して補正しすぎない。

---

# 34. AI生成と既存データの関係

AIは毎回すべてをゼロから生成しない。

原則：

```text
Search
↓
Reuse
↓
Adapt
↓
Generate
```

の順で考える。

つまり、

```text
検索して使えるものがあれば再利用
```

し、

```text
足りないものだけ生成
```

する。

これによって、

* 品質の一貫性
* 教材設計の安定性
* 重複Problemの削減
* Interactionの再利用率

を高める。

---

# 35. 人間向けAuthoring GUIについて

人間がフォームへ入力して教材を作る専用GUIは、

現時点ではプロジェクトの中心目標としない。

教材作成の主体は、

# AI

を想定する。

必要であれば将来的に人間向けEditorを追加できるが、

優先するのは、

```text
AIがAtlasを検索し
正しいProblem Dataを生成できる構造
```

である。

---

# 36. 想定するAI教材生成例

ユーザー：

```text
この文法解説を参考に、
高校生向けの15分教材を作成してください。
```

Grammar Reference：

```text
不定詞はto + 動詞原形で作る。
名詞的・形容詞的・副詞的用法がある。
...
```

AI：

```text
1. 文法解説を分析

2. Learning Requirementsを抽出

3. Interaction Atlasを検索

4. Word Order Builder
   Grammar Classifier
   Modifier Positioner
   Sentence Comparison
   Error Corrector
   Context Grammar
   を選択

5. SC-001など既存Problemを検索

6. 再利用できないProblemだけ生成

7. Validator

8. Lesson Data生成

9. Interactive Lesson完成
```

この流れをコード変更なし、または最小限のコード変更で実行できる状態を目指す。

---

# 37. 実装フェーズ

これまでの流れ：

```text
Phase 1
Research
↓
Interaction候補収集

Phase 2
Catalog
↓
40 Interactionを図鑑化

Phase 3
Prototype
↓
主要InteractionをDemo実装

Phase 4
Component
↓
Reusable Components化

Phase 5
Grammar Data
↓
Problem DataをUIから分離

Phase 6
Lesson
↓
複数Componentを教材へ組み込む
```

ここからは、

```text
Phase 7
AI Retrieval
↓
AIがInteraction / Problemを検索できるMetadataとIndex

Phase 8
AI Generation Contract
↓
Grammar Reference
→ Learning Requirements
→ Problem Data
→ Lesson Data
の生成契約

Phase 9
AI-assisted Lesson Generation
↓
ユーザー提供資料 + Atlasから
新しい教材を生成

Phase 10
End-to-End Verification
↓
既存Componentを変更せず、
新しい文法教材をAIだけで構成できることを確認
```

へ進む。

---

# 38. Codexへの実装方針

Codexは実装を進める際、以下を優先する。

1. `PROJECT_GOAL.md`を正本として確認する。
2. 既存コード・Directory構造を確認してから変更する。
3. 大規模な書き換えより、小さく安全な変更を優先する。
4. Interactionと教材内容を密結合させない。
5. Problem DataをComponentへハードコードしない。
6. 既存Interactionで実現できる場合、新Componentを追加しない。
7. 既存Problemを検索・再利用してから新Problemを追加する。
8. 人間向けだけでなくAI検索性を考慮してMetadataを設計する。
9. Canonical Dataを二重管理しない。
10. AI向けIndexは可能ならCanonical Dataから生成する。
11. 外部コードを使用する場合はLicenseを確認する。
12. 外部教材・サービスのUIや問題文をそのままコピーしない。
13. PC・Tablet・Smartphone操作を考慮する。
14. Keyboard操作とAccessibilityを維持する。
15. ValidatorをAI生成DataとComponentの境界として扱う。
16. Lesson数を増やすこと自体を目的化しない。
17. AIが教材を生成しやすい構造を優先する。

---

# 39. 新Interactionを追加する条件

以下をすべて検討してから追加する。

```text
既存Problemを再利用できないか
        ↓
既存Interactionで新Problemを作れないか
        ↓
既存Interactionを汎用的に拡張できないか
        ↓
それでも学習目的を表現できない
        ↓
新Interactionを検討
```

新文法単元が出たことだけを理由として、新Componentを作らない。

---

# 40. 完成状態の定義

## 第1完成状態

```text
英文法学習に利用できる
約40種類のInteractionを一覧できる。
```

---

## 第2完成状態

```text
主要Interactionを
実際に操作できるDemoが存在する。
```

---

## 第3完成状態

```text
Reusable Componentsと
Problem Dataが分離され、
同じComponentを異なる教材で再利用できる。
```

---

## 第4完成状態

```text
複数Problemを組み合わせて
Lessonを構成できる。
```

---

## 第5完成状態

```text
AIがInteractionとProblemを
学習目的から検索できる。
```

---

## 最終完成状態

ユーザーが文法解説を提供すると、

AIが、

```text
Grammar Referenceを読む
        ↓
Learning Requirementsを抽出する
        ↓
AtlasからInteractionを検索する
        ↓
既存Problemを検索・再利用する
        ↓
不足Problemだけ生成する
        ↓
Validatorで確認する
        ↓
Lessonを構成する
        ↓
インタラクティブ教材を完成させる
```

ことができる。

最終的には、

```text
ユーザーが
「何を教えたいか」
を文法資料として渡す

        ＋

Atlasが
「どう学ばせるか」
を提供する

        ↓

AIが教材を設計・生成する
```

という教材制作環境を実現する。

---

# 41. 最終的なプロジェクトの価値

このプロジェクトの価値は、

```text
教材を1つ作ること
```

ではない。

また、

```text
Lessonを10個作ること
```

でもない。

本当に作りたいものは、

# 文法解説とInteractionを分離し、

# AIがそれらを組み合わせて教材を生成できる基盤

である。

つまり最終的には、

```text
Grammar Knowledge
        ×
Interaction Library
        ×
AI
        =
Interactive Grammar Material
```

という仕組みを成立させることを、このプロジェクトの最終ゴールとする。
