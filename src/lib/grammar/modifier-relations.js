export function getRelationsForChunk(relations = [], chunkId) {
  if (!Array.isArray(relations) || !chunkId) return [];
  return relations.filter((relation) => relation?.modifierId === chunkId || relation?.targetId === chunkId);
}

export function getRelatedChunkIds(relations = [], chunkId) {
  return [
    ...new Set(
      getRelationsForChunk(relations, chunkId).flatMap((relation) =>
        [relation.modifierId, relation.targetId].filter((id) => id !== chunkId),
      ),
    ),
  ];
}

export function hasExploredAllRelations(relations = [], exploredRelationIds = new Set()) {
  if (!Array.isArray(relations) || relations.length === 0) return false;
  const explored = exploredRelationIds instanceof Set ? exploredRelationIds : new Set(exploredRelationIds);
  return relations.every((relation) => explored.has(relation?.id));
}
