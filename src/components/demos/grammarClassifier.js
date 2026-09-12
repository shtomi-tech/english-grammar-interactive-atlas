import { grammarClassifierProblem } from '../../data/demo-problems.js';
import { escapeHtml } from '../../lib/dom.js';
import { checkClassification } from '../../lib/grammar/classification.js';

export function mountGrammarClassifier(root) {
  let selectedItemId = null;
  let assignments = {};

  root.innerHTML = `
    <p class="instruction">${escapeHtml(grammarClassifierProblem.prompt)}</p>
    <div class="demo-stage classifier-stage">
      <h4>Original sentence</h4>
      <p class="classifier-sentence" aria-label="Original sentence">${escapeHtml(grammarClassifierProblem.sentence)}</p>
      <h4>Unclassified phrase cards</h4>
      <div class="classifier-card-list" data-classifier-cards aria-live="polite"></div>
      <h4>Classification areas</h4>
      <div class="classifier-category-grid" data-classifier-categories></div>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-classifier-reset>Reset</button>
        <button class="button" type="button" data-classifier-check>Check answer</button>
      </div>
      <div class="feedback" data-classifier-feedback role="status" aria-live="polite"></div>
      <div class="classifier-result" data-classifier-result hidden></div>
      <p class="explanation" data-classifier-explanation hidden>${escapeHtml(grammarClassifierProblem.explanation)}</p>
    </div>`;

  const cards = root.querySelector('[data-classifier-cards]');
  const categories = root.querySelector('[data-classifier-categories]');
  const feedback = root.querySelector('[data-classifier-feedback]');
  const result = root.querySelector('[data-classifier-result]');
  const explanation = root.querySelector('[data-classifier-explanation]');

  function restoreFocus(focusTarget) {
    if (!focusTarget) return;
    let target = null;
    if (focusTarget.type === 'category') {
      target = [...root.querySelectorAll('[data-classifier-category-id]')].find(
        (button) => button.dataset.classifierCategoryId === focusTarget.id,
      );
    } else if (focusTarget.type === 'item') {
      target = [...root.querySelectorAll('[data-classifier-item-id]')].find(
        (button) => button.dataset.classifierItemId === focusTarget.id,
      );
    } else if (focusTarget.type === 'check') {
      target = root.querySelector('[data-classifier-check]');
    }
    target?.focus();
  }

  function render(focusTarget = null) {
    const unclassifiedItems = grammarClassifierProblem.items.filter((item) => !assignments[item.id]);
    cards.innerHTML = unclassifiedItems.length
      ? unclassifiedItems
          .map(
            (item) => `
              <button class="classifier-card" type="button" data-classifier-item-id="${escapeHtml(item.id)}" aria-pressed="${selectedItemId === item.id}">
                ${escapeHtml(item.text)}
              </button>`,
          )
          .join('')
      : '<p class="classifier-empty">すべての語句を分類しました。</p>';

    categories.innerHTML = grammarClassifierProblem.categories
      .map((category) => {
        const categoryItems = grammarClassifierProblem.items.filter((item) => assignments[item.id] === category.id);
        return `
          <section class="classifier-category" aria-labelledby="classifier-category-${escapeHtml(category.id)}">
            <button class="classifier-category-target" type="button" data-classifier-category-id="${escapeHtml(category.id)}" aria-label="${escapeHtml(category.label)}へ分類">
              <span id="classifier-category-${escapeHtml(category.id)}">${escapeHtml(category.label)}</span>
              <span class="classifier-count">${categoryItems.length}</span>
            </button>
            <div class="classifier-category-items" data-classifier-category-items="${escapeHtml(category.id)}">
              ${categoryItems
                .map(
                  (item) => `
                    <button class="classifier-card" type="button" data-classifier-item-id="${escapeHtml(item.id)}" aria-pressed="${selectedItemId === item.id}">
                      ${escapeHtml(item.text)}
                    </button>`,
                )
                .join('')}
            </div>
          </section>`;
      })
      .join('');
    restoreFocus(focusTarget);
  }

  function clearFeedback() {
    feedback.className = 'feedback';
    feedback.textContent = '';
    result.hidden = true;
    result.innerHTML = '';
    explanation.hidden = true;
  }

  function showSelectionHint() {
    feedback.className = 'feedback is-visible';
    feedback.textContent = 'まず語句カードを選択してください。';
  }

  cards.addEventListener('click', (event) => {
    const button = event.target.closest('[data-classifier-item-id]');
    if (!button) return;
    selectedItemId = button.dataset.classifierItemId;
    clearFeedback();
    render({ type: 'category', id: grammarClassifierProblem.categories[0].id });
  });

  categories.addEventListener('click', (event) => {
    const itemButton = event.target.closest('[data-classifier-item-id]');
    if (itemButton) {
      selectedItemId = itemButton.dataset.classifierItemId;
      clearFeedback();
      render({
        type: 'category',
        id: itemButton.closest('[data-classifier-category-items]')?.dataset.classifierCategoryItems,
      });
      return;
    }
    const button = event.target.closest('[data-classifier-category-id]');
    if (!button) return;
    if (!selectedItemId) {
      showSelectionHint();
      return;
    }
    const assignedIndex = grammarClassifierProblem.items.findIndex((item) => item.id === selectedItemId);
    assignments = { ...assignments, [selectedItemId]: button.dataset.classifierCategoryId };
    selectedItemId = null;
    clearFeedback();
    const nextItem =
      grammarClassifierProblem.items.find((item, index) => index > assignedIndex && !assignments[item.id]) ??
      grammarClassifierProblem.items.find((item) => !assignments[item.id]);
    render(nextItem ? { type: 'item', id: nextItem.id } : { type: 'check' });
  });

  root.querySelector('[data-classifier-reset]').addEventListener('click', () => {
    selectedItemId = null;
    assignments = {};
    clearFeedback();
    render({ type: 'item', id: grammarClassifierProblem.items[0].id });
  });

  root.querySelector('[data-classifier-check]').addEventListener('click', () => {
    const correct = checkClassification(assignments, grammarClassifierProblem.items);
    feedback.className = `feedback is-visible ${correct ? 'success' : 'error'}`;
    feedback.textContent = correct
      ? 'Correct — 語句のまとまりを文中の役割ごとに分類できました。'
      : 'Not yet — 語句が文の中で何をしているかを考えてみましょう。';
    if (!correct) return;

    result.innerHTML = grammarClassifierProblem.categories
      .map((category) => {
        const categoryItems = grammarClassifierProblem.items.filter((item) => item.answer === category.id);
        return `
          <div class="classifier-result-row">
            <span class="structure-role">${escapeHtml(category.label)}</span>
            <div>
              ${categoryItems
                .map(
                  (item) => `
                    <strong class="structure-text">${escapeHtml(item.text)}</strong>
                    <p>${escapeHtml(category.explanation)} ${escapeHtml(item.explanation)}</p>`,
                )
                .join('')}
            </div>
          </div>`;
      })
      .join('');
    result.hidden = false;
    explanation.hidden = false;
  });

  render();
}
