export function getScenarioStep(steps = [], stepReference) {
  if (!Array.isArray(steps)) return null;
  if (Number.isInteger(stepReference)) return steps[stepReference] ?? null;
  if (typeof stepReference !== 'string' || !stepReference) return null;
  return steps.find((step) => step?.id === stepReference) ?? null;
}

export function getScenarioChoice(step, choiceId) {
  if (!step || !Array.isArray(step.choices) || typeof choiceId !== 'string' || !choiceId) return null;
  return step.choices.find((choice) => choice?.id === choiceId) ?? null;
}

export function isAcceptedScenarioChoice(step, choiceId) {
  return Boolean(
    step &&
      typeof choiceId === 'string' &&
      Array.isArray(step.acceptedChoiceIds) &&
      step.acceptedChoiceIds.includes(choiceId),
  );
}

export function hasCompletedScenario(steps = [], completedStepIds = new Set()) {
  if (!Array.isArray(steps) || steps.length === 0) return false;
  const completed = completedStepIds instanceof Set ? completedStepIds : new Set(completedStepIds ?? []);
  return steps.every((step) => completed.has(step?.id));
}
