function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function validateLessons(lessons, { problemRegistry = {}, problemTypes = new Set() } = {}) {
  const errors = [];
  if (!Array.isArray(lessons)) return { valid: false, errors: ['Lessons must be an array'] };

  const ids = new Set();
  const slugs = new Set();
  lessons.forEach((lesson, index) => {
    const label = `Lesson[${index}]`;
    if (!isRecord(lesson) || !hasText(lesson.id) || !hasText(lesson.slug) || !hasText(lesson.title)) {
      errors.push(`${label} needs id, slug, and title`);
      return;
    }
    if (ids.has(lesson.id)) errors.push(`${label}.id is duplicated: ${lesson.id}`);
    ids.add(lesson.id);
    if (slugs.has(lesson.slug)) errors.push(`${label}.slug is duplicated: ${lesson.slug}`);
    slugs.add(lesson.slug);
    if (!hasText(lesson.description) || !hasText(lesson.learningGoal)) {
      errors.push(`${label} needs description and learningGoal`);
    }
    if (!Array.isArray(lesson.steps) || lesson.steps.length === 0) {
      errors.push(`${label}.steps must contain at least one step`);
      return;
    }
    lesson.steps.forEach((step, stepIndex) => {
      const stepLabel = `${label}.steps[${stepIndex}]`;
      if (!isRecord(step) || !hasText(step.interactionType) || !hasText(step.problemId)) {
        errors.push(`${stepLabel} needs interactionType and problemId`);
        return;
      }
      if (problemTypes.size > 0 && !problemTypes.has(step.interactionType)) {
        errors.push(`${stepLabel}.interactionType is not registered: ${step.interactionType}`);
      }
      const problem = problemRegistry[step.problemId];
      if (!problem) errors.push(`${stepLabel}.problemId is unknown: ${step.problemId}`);
      else if (problem.type !== step.interactionType) {
        errors.push(`${stepLabel} type mismatch: ${step.interactionType} vs ${problem.type}`);
      }
      if (!hasText(step.title) || !hasText(step.instruction)) errors.push(`${stepLabel} needs title and instruction`);
    });
  });

  return { valid: errors.length === 0, errors };
}
