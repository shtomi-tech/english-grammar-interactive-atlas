const cleanupKey = Symbol('interactionCleanup');

export function prepareMountRoot(root) {
  if (!root || typeof root.addEventListener !== 'function') {
    throw new TypeError('A DOM element is required as the component root');
  }

  root[cleanupKey]?.();
  root.innerHTML = '';
  const listeners = [];

  function on(target, eventName, handler) {
    target.addEventListener(eventName, handler);
    listeners.push(() => target.removeEventListener(eventName, handler));
  }

  function cleanup() {
    listeners.splice(0).forEach((remove) => remove());
    if (root[cleanupKey] === cleanup) delete root[cleanupKey];
  }

  root[cleanupKey] = cleanup;
  return { on, cleanup };
}
