export const grammarReferenceFormats = Object.freeze(['text', 'markdown']);
export const grammarReferenceTopLevelFields = Object.freeze([
  'id',
  'sourceId',
  'title',
  'format',
  'content',
]);
export const grammarReferenceLimits = Object.freeze({ maxCharacters: 50_000 });

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeGrammarReference(grammarReference) {
  if (!isObject(grammarReference)) throw new TypeError('Grammar Reference must be an object');
  return {
    ...structuredClone(grammarReference),
    content: typeof grammarReference.content === 'string'
      ? grammarReference.content.replace(/\r\n?/g, '\n').trim()
      : grammarReference.content,
  };
}

export function extractMarkdownSections(content) {
  if (typeof content !== 'string') return [];
  return content.split('\n').flatMap((line, index) => {
    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line.trim());
    if (!match) return [];
    return [{ heading: match[2].trim(), level: match[1].length, line: index + 1 }];
  });
}
