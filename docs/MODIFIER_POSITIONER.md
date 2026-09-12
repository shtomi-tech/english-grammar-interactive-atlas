# Modifier Positioner

Modifier Positionerは、完成に近い英文の中で一つのmodifierの位置を選び、かかり先・意味・自然さの違いを観察するDemoです。英文全体を組み立てるWord Order Builderや、既存のrelationを確認するModifier Connection Viewerとは責務を分けます。

Problem Dataは `chunks`、`modifier`、`placements` を持ちます。`placement.position` はchunk境界のindexで、`0` は文頭、`chunks.length` は文末です。配置の表面形が位置で変わる場合は、placementの `modifierText` または `chunkTextOverrides` に持たせます。Component側で大文字化やcomma ruleを一般化しません。

`grammatical` と `matchesGoal` は別の値です。文法的だがmodifierのかかり先が課題の焦点と異なる配置は、別の関係・意味として表示します。`grammatical: true` かつ `matchesGoal: true` の配置を選ぶと、同一mount runで一度だけ完了callbackを呼びます。Reset後は再び完了できます。

Phase 6Dでは、MPO-001〜003をGRAM-INT-014に接続します。MPO-003は文頭・文末の両方をgoal-matchingとして扱い、複数の許容配置をProblem Dataで表します。主要操作はtap/clickで、drag-and-dropや外部コードの導入は行いません。
