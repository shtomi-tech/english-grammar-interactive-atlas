export function checkWordOrder(selectedIds, answerIds) {
  return selectedIds.length === answerIds.length && selectedIds.every((id, index) => id === answerIds[index]);
}

function shuffleOnce(ids, random) {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const value = Number(random());
    const normalized = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999999999) : 0;
    const swapIndex = Math.floor(normalized * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function sameOrder(left, right) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function shuffleWordIds(wordIds, answerIds = [], random = Math.random) {
  const source = [...wordIds];
  if (source.length < 2) return source;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const shuffled = shuffleOnce(source, random);
    if (!sameOrder(shuffled, answerIds)) return shuffled;
  }

  for (let offset = 1; offset < source.length; offset += 1) {
    const rotated = source.slice(offset).concat(source.slice(0, offset));
    if (!sameOrder(rotated, answerIds)) return rotated;
  }

  return source;
}
