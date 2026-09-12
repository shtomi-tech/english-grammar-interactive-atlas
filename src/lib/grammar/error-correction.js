export function getCorrectionByTokenId(corrections = [], tokenId) {
  if (!Array.isArray(corrections) || !tokenId) return null;
  return corrections.find((correction) => correction?.tokenId === tokenId) ?? null;
}

export function isAcceptedCorrection(correction, optionId) {
  return Boolean(
    correction &&
    optionId &&
    Array.isArray(correction.acceptedOptionIds) &&
    correction.acceptedOptionIds.includes(optionId),
  );
}

export function hasCompletedAllCorrections(corrections = [], answers = new Map()) {
  if (!Array.isArray(corrections) || corrections.length === 0) return false;
  const answerMap = answers instanceof Map ? answers : new Map(Object.entries(answers ?? {}));
  return corrections.every((correction) => isAcceptedCorrection(correction, answerMap.get(correction?.id)));
}
