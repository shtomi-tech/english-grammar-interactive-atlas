export function checkTokenSelection(selectedIds, answerIds) {
  if (selectedIds.length !== answerIds.length) return false;
  const selected = new Set(selectedIds);
  return answerIds.every((id) => selected.has(id));
}
