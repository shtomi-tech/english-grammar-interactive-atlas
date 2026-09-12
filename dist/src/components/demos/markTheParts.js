import { markPartsProblem } from '../../data/demo-problems.js';
import { checkTokenSelection } from '../../lib/grammar/parts.js';
import { escapeHtml } from '../../lib/dom.js';

export function mountMarkTheParts(root) {
  let selectedIds = [];
  let checked = false;

  root.innerHTML = `
    <p class="instruction">${escapeHtml(markPartsProblem.prompt)}</p>
    <div class="demo-stage">
      <h4>Sentence</h4>
      <div class="parts-token-row" data-parts-tokens></div>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-parts-reset>Reset</button>
        <button class="button" type="button" data-parts-check>Check selection</button>
      </div>
      <div class="feedback" data-parts-feedback role="status" aria-live="polite"></div>
      <div class="structure-result" data-structure-result aria-live="polite">
        ${markPartsProblem.tokens
          .map(
            (token) => `
              <div class="structure-row">
                <span class="structure-role">${token.role}</span>
                <span class="structure-text">${escapeHtml(token.text)}</span>
              </div>`,
          )
          .join('')}
      </div>
    </div>`;

  const tokens = root.querySelector('[data-parts-tokens]');
  const feedback = root.querySelector('[data-parts-feedback]');
  const structure = root.querySelector('[data-structure-result]');

  function render() {
    tokens.innerHTML = markPartsProblem.tokens
      .map(
        (token) => `<button class="parts-token" type="button" data-token-id="${token.id}" aria-pressed="${selectedIds.includes(token.id)}">${escapeHtml(token.text)}</button>`,
      )
      .join('');
  }

  function clearResult() {
    checked = false;
    feedback.className = 'feedback';
    feedback.textContent = '';
    structure.classList.remove('is-visible');
  }

  tokens.addEventListener('click', (event) => {
    const button = event.target.closest('[data-token-id]');
    if (!button) return;
    const id = button.dataset.tokenId;
    selectedIds = selectedIds.includes(id)
      ? selectedIds.filter((tokenId) => tokenId !== id)
      : [...selectedIds, id];
    clearResult();
    render();
  });

  root.querySelector('[data-parts-reset]').addEventListener('click', () => {
    selectedIds = [];
    clearResult();
    render();
  });

  root.querySelector('[data-parts-check]').addEventListener('click', () => {
    checked = true;
    const correct = checkTokenSelection(selectedIds, markPartsProblem.answer);
    feedback.className = `feedback is-visible ${correct ? 'success' : 'error'}`;
    feedback.textContent = correct
      ? 'Correct — The boy が主語です。'
      : 'Not yet — 主語は「だれが・なにが」にあたる部分です。';
    structure.classList.toggle('is-visible', correct);
  });

  render();
}
