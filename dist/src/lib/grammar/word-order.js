export function normalizeAcceptedAnswers(acceptedAnswers = []) {
  if (!Array.isArray(acceptedAnswers) || acceptedAnswers.length === 0) return [];
  return Array.isArray(acceptedAnswers[0]) ? acceptedAnswers : [acceptedAnswers];
}

export function checkWordOrder(selectedIds, acceptedAnswers) {
  if (!Array.isArray(selectedIds)) return false;
  return normalizeAcceptedAnswers(acceptedAnswers).some((answerIds) => (
    Array.isArray(answerIds)
      && selectedIds.length === answerIds.length
      && selectedIds.every((id, index) => id === answerIds[index])
  ));
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

export function shuffleWordIds(wordIds, acceptedAnswers = [], random = Math.random) {
  const source = [...wordIds];
  if (source.length < 2) return source;
  const answers = normalizeAcceptedAnswers(acceptedAnswers);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const shuffled = shuffleOnce(source, random);
    if (!answers.some((answer) => sameOrder(shuffled, answer))) return shuffled;
  }

  for (let offset = 1; offset < source.length; offset += 1) {
    const rotated = source.slice(offset).concat(source.slice(0, offset));
    if (!answers.some((answer) => sameOrder(rotated, answer))) return rotated;
  }

  return source;
}
