function getPlacement(problem, placementId) {
  if (!Array.isArray(problem?.placements)) return null;
  return problem.placements.find((placement) => placement?.id === placementId) ?? null;
}

function getChunkText(chunk, placement) {
  return placement?.chunkTextOverrides?.[chunk.id] ?? chunk.text;
}

export function getModifierPlacement(problem, placementId) {
  return getPlacement(problem, placementId);
}

export function buildModifierPlacementSentence(problem, placementId) {
  const placement = getPlacement(problem, placementId);
  if (!placement || !Array.isArray(problem?.chunks) || !problem.modifier) return null;
  if (!Number.isInteger(placement.position) || placement.position < 0 || placement.position > problem.chunks.length) return null;

  const chunks = problem.chunks.map((chunk) => getChunkText(chunk, placement));
  const modifierText = placement.modifierText ?? problem.modifier.text;
  if (typeof modifierText !== 'string' || !modifierText.trim()) return null;
  chunks.splice(placement.position, 0, modifierText);
  return `${chunks.join(' ')}${problem.punctuation ?? ''}`;
}

export function isGoalMatchingPlacement(problem, placementId) {
  return Boolean(getPlacement(problem, placementId)?.matchesGoal);
}

export function getPlacementRelation(problem, placementId) {
  return getPlacement(problem, placementId)?.relation ?? null;
}
