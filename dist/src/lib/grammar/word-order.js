export function checkWordOrder(selectedIds, answerIds) {
  return selectedIds.length === answerIds.length && selectedIds.every((id, index) => id === answerIds[index]);
}
