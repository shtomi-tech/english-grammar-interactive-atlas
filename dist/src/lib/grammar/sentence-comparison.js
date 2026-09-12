export function getDifferenceByChunkId(differences = [], chunkId) {
  if (!Array.isArray(differences) || !chunkId) return null;
  return differences.find(
    (difference) => difference?.leftChunkId === chunkId || difference?.rightChunkId === chunkId,
  ) ?? null;
}

export function getChunkIdsForDifference(differences = [], differenceId) {
  if (!Array.isArray(differences) || !differenceId) return [];
  const difference = differences.find((entry) => entry?.id === differenceId);
  return difference ? [difference.leftChunkId, difference.rightChunkId] : [];
}

export function hasExploredAllDifferences(differences = [], exploredDifferenceIds = new Set()) {
  if (!Array.isArray(differences) || differences.length === 0) return false;
  const explored = exploredDifferenceIds instanceof Set
    ? exploredDifferenceIds
    : new Set(exploredDifferenceIds);
  return differences.every((difference) => explored.has(difference?.id));
}
