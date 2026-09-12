import { escapeHtml } from '../../lib/dom.js';

export function renderFilterBar(categoryOptions, selectedCategory) {
  return categoryOptions
    .map(
      (category) => `
        <button
          class="filter-button"
          type="button"
          data-category="${category.id}"
          aria-pressed="${category.id === selectedCategory}"
        >${escapeHtml(category.label)}</button>`,
    )
    .join('');
}
