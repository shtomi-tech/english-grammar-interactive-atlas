import { escapeHtml } from '../../lib/dom.js';

const categoryLabels = {
  build: 'Build',
  move: 'Move',
  select: 'Select',
  classify: 'Classify',
  transform: 'Transform',
  visualize: 'Visualize',
  generate: 'Generate',
  compare: 'Compare',
  correct: 'Correct',
  simulate: 'Simulate',
};

export function renderDifficulty(level) {
  const stars = '★'.repeat(level) + '☆'.repeat(5 - level);
  return `<span class="difficulty" aria-label="実装難易度 ${level} / 5">${stars}</span>`;
}

export function renderInteractionCard(entry) {
  const demoLabel = entry.demoType ? 'Demo available' : 'Demo planned';
  const grammarTags = entry.targetGrammar
    .map((grammar) => `<span class="grammar-tag">${escapeHtml(grammar)}</span>`)
    .join('');

  return `
    <article class="interaction-card">
      <div class="card-top">
        <span class="entry-id">${escapeHtml(entry.id)}</span>
        <span class="demo-pill ${entry.demoType ? '' : 'planned'}">${demoLabel}</span>
      </div>
      <div class="card-heading">
        <h2>${escapeHtml(entry.title)}</h2>
        <span class="category-pill">${categoryLabels[entry.category]}</span>
      </div>
      <p class="card-description">${escapeHtml(entry.description)}</p>
      <div>
        <p class="card-label">Target grammar</p>
        <div class="grammar-tags">${grammarTags}</div>
      </div>
      <div class="card-meta-row">
        <div>
          <span class="meta-label">Implementation</span>
          ${renderDifficulty(entry.implementationDifficulty)}
        </div>
        <div>
          <span class="meta-label">Reusability</span>
          <span class="rank-badge"><strong>${entry.reusability}</strong></span>
        </div>
      </div>
      <div class="card-footer">
        <span class="meta-label">${entry.demoType ? 'Try the interaction' : 'Catalog entry'}</span>
        <a class="button" href="#interactions/${encodeURIComponent(entry.slug)}">Open detail</a>
      </div>
    </article>`;
}

export function renderEmptyState() {
  return `
    <div class="empty-state">
      <h3>No interactions found</h3>
      <p>検索語またはカテゴリを変えて、もう一度試してください。</p>
    </div>`;
}
