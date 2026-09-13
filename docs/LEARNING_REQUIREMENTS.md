# Learning Requirements v1

Learning Requirementsは、英文法教材を生成・再利用する前に「何を学ぶか」と「その根拠は何か」を記録する入力契約です。既存のInteraction、Problem、LessonのIDやUI部品を直接含めず、教材要件とAtlas検索条件を分離します。

## 必須構造

```js
{
  version: '1',
  id: 'LR-001',
  topic: 'infinitives',
  sourceReferences: [
    { id: 'SOURCE-001', type: 'user-provided', title: '不定詞 解説資料' }
  ],
  audience: { stage: 'high-school' },
  constraints: { durationMinutes: 15 },
  learningPoints: [
    {
      id: 'LP-001',
      concept: 'to + base verb',
      summary: '不定詞はtoの後ろに動詞原形を置く。',
      importance: 'core',
      desiredOutcomes: ['recognize-form', 'produce-form'],
      sourceEvidence: [
        {
          sourceId: 'SOURCE-001',
          locator: { section: '不定詞の基本形' },
          summary: 'toの後ろには動詞原形を置くと説明されている。'
        }
      ]
    }
  ]
}
```

`version`、`id`、`topic`、`sourceReferences`、`learningPoints`は必須です。`audience` と `constraints` は情報がある場合だけ追加し、値を推測して補いません。

## controlled vocabulary

- source type: `user-provided`
- audience stage: `middle-school`、`high-school`、`adult`
- importance: `core`、`supporting`、`extension`
- desired outcome: `recognize-form`、`produce-form`、`identify-role`、`classify-function`、`understand-meaning`、`compare-meaning`、`understand-rule`、`apply-rule`、`diagnose-error`、`correct-error`、`choose-in-context`、`explain-choice`

`desiredOutcomes` はLearning Requirementsの学習成果であり、Retrieval Indexの `learningIntents` とは別物です。Phase 8Aでは両者を自動変換しません。

## Source EvidenceとLocator

各Learning Pointには少なくとも一つの `sourceEvidence` が必要です。`sourceId` は同じオブジェクト内の `sourceReferences.id` を参照し、`summary` は空にできません。

Locatorで使えるキーは `page`、`section`、`paragraph`、`line`、`heading`、`offset` です。`page`、`paragraph`、`line`、`offset` は1以上の整数、`section` と `heading` は空でない文字列にします。Locator自体は空のオブジェクトにできません。

## 境界

Learning Requirementsには `interactionId`、`interactionIds`、`problemId`、`problemIds`、`lessonId`、`lessonIds`、`demoType` を含めません。これらは教材要件ではなく、後段の検索・再利用・計画で扱う情報です。Phase 8AではLLM呼び出し、OCR、PDF/Word parser、外部DB、外部Backendも追加しません。

## 検証と生成物

validatorは `src/lib/validateLearningRequirements.js` の `validateLearningRequirements()` です。合成fixtureは `src/data/ai/learning-requirements-fixtures.js` に2件あり、`npm run check` で検証されます。

`npm run build` はスキーマ定数から `dist/ai/contracts/learning-requirements.json` を生成します。手動でJSONを編集せず、スキーマとvalidatorを正本にします。
