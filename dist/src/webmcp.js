export function registerAtlasWebMcp({ getRoute, showAtlasSearch }) {
  const context = typeof document === 'undefined' ? undefined : document.modelContext;
  if (!context?.registerTool) return false;

  const lifecycle = new AbortController();

  try {
    void Promise.resolve(
      context.registerTool(
        {
          name: 'search_grammar_atlas',
          title: 'Search the grammar atlas',
          description: 'Search the visible Interactive Grammar Atlas by title, description, or target grammar and update the results shown to the learner.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', maxLength: 120 },
            },
            required: ['query'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (!input || typeof input !== 'object' || typeof input.query !== 'string') {
              throw new TypeError('query must be a string');
            }
            if (input.query.length > 120) {
              throw new RangeError('query must be 120 characters or fewer');
            }
            if (getRoute().page !== 'atlas') window.location.hash = '';
            const results = showAtlasSearch(input.query);
            return {
              query: input.query,
              count: results.length,
              titles: results.map((entry) => entry.title),
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
  } catch {
    return false;
  }

  return true;
}
