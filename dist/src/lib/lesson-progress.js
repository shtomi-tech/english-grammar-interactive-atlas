function getStepIds(lesson) {
  return new Set((lesson?.steps ?? []).map((step) => step?.id).filter((id) => typeof id === 'string' && id.length > 0));
}

export function markLessonStepComplete(completedStepIds, stepId) {
  const next = new Set(completedStepIds ?? []);
  next.add(stepId);
  return next;
}

export function isLessonStepComplete(completedStepIds, stepId) {
  return Boolean(stepId) && Boolean(completedStepIds?.has(stepId));
}

export function getLessonProgress(lesson, completedStepIds) {
  const stepIds = getStepIds(lesson);
  const completedCount = [...stepIds].filter((stepId) => completedStepIds?.has(stepId)).length;
  const totalCount = stepIds.size;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  return {
    completedCount,
    totalCount,
    percentage,
    allComplete: totalCount > 0 && completedCount === totalCount,
  };
}
