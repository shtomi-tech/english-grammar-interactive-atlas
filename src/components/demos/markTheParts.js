import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import { checkTokenSelection } from '../../lib/grammar/parts.js';

export function mountMarkTheParts(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'mark-parts') throw new TypeError('Mark the Parts needs a mark-parts problem');
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  let selectedIds = [];

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage">
      <h4>Sentence</h4>
      <div class="parts-token-row" data-parts-tokens></div>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-parts-reset>Reset</button>
        <button class="button" type="button" data-parts-check>Check selection</button>
      </div>
      <div class="feedback" data-parts-feedback role="status" aria-live="polite"></div>
      <div class="structure-result" data-structure-result aria-live="polite">
        ${problem.tokens
          .map(
            (token) => `
              <div class="structure-row">
                <span class="structure-role">${escapeHtml(token.role)}</span>
                <span class="structure-text">${escapeHtml(token.text)}</span>
              </div>`,
          )
          .join('')}
      </div>
      <p class="explanation" data-parts-explanation hidden>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const tokens = root.querySelector('[data-parts-tokens]');
  const feedback = root.querySelector('[data-parts-feedback]');
  const structure = root.querySelector('[data-structure-result]');
  const explanation = root.querySelector('[data-parts-explanation]');
  const resetButton = root.querySelector('[data-parts-reset]');
  const checkButton = root.querySelector('[data-parts-check]');

  function render() {
    tokens.innerHTML = problem.tokens
      .map(
        (token) => `<button class="parts-token" type="button" data-token-id="${escapeHtml(token.id)}" aria-pressed="${selectedIds.includes(token.id)}">${escapeHtml(token.text)}</button>`,
      )
      .join('');
  }

  function clearResult() {
    feedback.className = 'feedback';
    feedback.textContent = '';
    structure.classList.remove('is-visible');
    explanation.hidden = true;
  }

  function check() {
    const correct = checkTokenSelection(selectedIds, problem.answer);
    feedback.className = `feedback is-visible ${correct ? 'success' : 'error'}`;
    feedback.textContent = correct
      ? `Correct — ${problem.targetRole} を見つけられました。`
      : `Not yet — ${problem.targetRole} にあたるまとまりをもう一度考えてみましょう。`;
    structure.classList.toggle('is-visible', correct);
    explanation.hidden = !correct;
    onComplete({ correct, problemId: problem.id, selectedIds: [...selectedIds] });
  }

  on(tokens, 'click', (event) => {
    const button = event.target.closest('[data-token-id]');
    if (!button) return;
    const id = button.dataset.tokenId;
    selectedIds = selectedIds.includes(id)
      ? selectedIds.filter((tokenId) => tokenId !== id)
      : [...selectedIds, id];
    clearResult();
    render();
  });

  on(resetButton, 'click', () => {
    selectedIds = [];
    clearResult();
    render();
  });
  on(checkButton, 'click', check);

  render();
  return cleanup;
}
