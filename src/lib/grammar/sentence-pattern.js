export function buildPatternSlots(chunks = [], pattern = []) {
  if (!Array.isArray(chunks) || !Array.isArray(pattern)) return [];
  return chunks.map((chunk, index) => ({
    chunkId: chunk?.id,
    role: pattern[index] ?? chunk?.role,
  }));
}

export function hasExploredAllChunks(chunks = [], exploredChunkIds = new Set()) {
  if (!Array.isArray(chunks) || chunks.length === 0) return false;
  const explored = exploredChunkIds instanceof Set ? exploredChunkIds : new Set(exploredChunkIds);
  return chunks.every((chunk) => explored.has(chunk?.id));
}

export function getExploredRoles(chunks = [], exploredChunkIds = new Set()) {
  const explored = exploredChunkIds instanceof Set ? exploredChunkIds : new Set(exploredChunkIds);
  return [...new Set(chunks.filter((chunk) => explored.has(chunk?.id)).map((chunk) => chunk?.role).filter(Boolean))];
}
