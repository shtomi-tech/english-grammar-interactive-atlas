export function filterInteractions(entries, category = 'all', { reusability = 'all', demo = 'all' } = {}) {
  return entries.filter((entry) => {
    const matchesCategory = category === 'all' || entry.category === category;
    const matchesReusability = reusability === 'all' || entry.reusability === reusability;
    const hasDemo = Boolean(entry.demoType);
    const matchesDemo = demo === 'all' || (demo === 'available' && hasDemo) || (demo === 'planned' && !hasDemo);
    return matchesCategory && matchesReusability && matchesDemo;
  });
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

export function getAtlasStats(entries, demoRegistry = {}) {
  const categories = new Set(entries.map((entry) => entry.category));
  const workingDemos = entries.filter(
    (entry) => {
      const registryEntry = entry.demoType ? demoRegistry[entry.demoType] : null;
      return typeof registryEntry === 'function' || typeof registryEntry?.mount === 'function';
    },
  ).length;

  return {
    catalogEntries: entries.length,
    interactionFamilies: categories.size,
    workingDemos,
  };
}
