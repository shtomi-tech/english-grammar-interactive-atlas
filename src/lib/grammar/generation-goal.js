function valueKey(value) {
  return `${typeof value}:${String(value)}`;
}

function controlNamesFrom(source) {
  if (Array.isArray(source)) return source;
  if (source !== null && typeof source === 'object') return Object.keys(source);
  return [];
}

export function hasCompleteGenerationState(state = {}, controls = {}) {
  if (state === null || typeof state !== 'object' || Array.isArray(state)) return false;
  const controlNames = controlNamesFrom(controls);
  return controlNames.length > 0 && controlNames.every((name) => Object.prototype.hasOwnProperty.call(state, name));
}

export function matchesGenerationTarget(state = {}, targetState = {}, controlNames = Object.keys(targetState ?? {})) {
  if (state === null || typeof state !== 'object' || Array.isArray(state)) return false;
  if (targetState === null || typeof targetState !== 'object' || Array.isArray(targetState)) return false;
  const names = controlNamesFrom(controlNames);
  if (names.length === 0 || Object.keys(state).length !== names.length) return false;
  return names.every(
    (name) =>
      Object.prototype.hasOwnProperty.call(state, name) &&
      Object.prototype.hasOwnProperty.call(targetState, name) &&
      valueKey(state[name]) === valueKey(targetState[name]),
  );
}

export function findMatchingTargetState(state = {}, targetStates = [], controlNames) {
  if (!Array.isArray(targetStates)) return -1;
  const names = controlNamesFrom(controlNames ?? targetStates[0] ?? {});
  return targetStates.findIndex((targetState) => matchesGenerationTarget(state, targetState, names));
}
