export function filterInteractions(entries, category = 'all') {
  if (category === 'all') return entries;
  return entries.filter((entry) => entry.category === category);
}

export function searchInteractions(entries, query = '') {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return entries;

  return entries.filter((entry) => {
    const searchableText = [entry.title, entry.description, ...entry.targetGrammar]
      .join(' ')
      .toLocaleLowerCase();
    return searchableText.includes(normalizedQuery);
  });
}
