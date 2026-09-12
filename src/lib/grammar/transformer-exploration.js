function valueKey(value) {
  return `${typeof value}:${String(value)}`;
}

function getCompletion(problem) {
  return problem?.type === 'sentence-transformer' && problem.completion?.type === 'explore-control'
    ? problem.completion
    : null;
}

export function createInitialExploration(problem) {
  const exploration = new Map();
  const completion = getCompletion(problem);
  if (!completion) return exploration;

  const defaultValue = problem.defaults?.[completion.control];
  if (defaultValue !== undefined) {
    exploration.set(completion.control, new Set([valueKey(defaultValue)]));
  }
  return exploration;
}

export function recordExploredValue(exploredValues, control, value) {
  const next = new Map(exploredValues ?? []);
  const values = new Set(next.get(control) ?? []);
  values.add(valueKey(value));
  next.set(control, values);
  return next;
}

export function getTransformerExplorationProgress(problem, exploredValues) {
  const completion = getCompletion(problem);
  if (!completion) return null;

  const explored = exploredValues?.get(completion.control) ?? new Set();
  const exploredCount = completion.requiredValues.filter((value) => explored.has(valueKey(value))).length;
  return { exploredCount, requiredCount: completion.requiredValues.length };
}

export function hasCompletedTransformerExploration(problem, exploredValues) {
  const completion = getCompletion(problem);
  if (!completion) return false;

  const explored = exploredValues?.get(completion.control) ?? new Set();
  return completion.requiredValues.every((value) => explored.has(valueKey(value)));
}
