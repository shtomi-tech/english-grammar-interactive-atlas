import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import { checkWordOrder, shuffleWordIds } from '../../lib/grammar/word-order.js';

export function mountWordOrderBuilder(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'word-order') throw new TypeError('Word Order Builder needs a word-order problem');
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const wordById = new Map(problem.words.map((word) => [word.id, word]));
  const initialBankIds = shuffleWordIds(
    problem.words.map((word) => word.id),
    problem.acceptedAnswers,
  );
  let bankIds = [...initialBankIds];
  let answerIds = [];
  let hintIndex = 0;
  const hints = Array.isArray(problem.hints) ? problem.hints : [];

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage">
      <h4>Answer area</h4>
      <div class="answer-area is-empty" data-answer-area aria-live="polite"></div>
      <h4>Word cards</h4>
      <div class="token-bank" data-word-bank></div>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-reset>Reset</button>
        ${hints.length ? '<button class="button secondary" type="button" data-hint>Hint</button>' : ''}
        <button class="button" type="button" data-check>Check answer</button>
      </div>
      ${hints.length ? '<div class="hint" data-hint-output role="status" aria-live="polite"></div>' : ''}
      <div class="feedback" data-feedback role="status" aria-live="polite"></div>
      <p class="explanation" data-explanation hidden>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const answerArea = root.querySelector('[data-answer-area]');
  const wordBank = root.querySelector('[data-word-bank]');
  const feedback = root.querySelector('[data-feedback]');
  const explanation = root.querySelector('[data-explanation]');
  const resetButton = root.querySelector('[data-reset]');
  const hintButton = root.querySelector('[data-hint]');
  const hintOutput = root.querySelector('[data-hint-output]');
  const checkButton = root.querySelector('[data-check]');

  function restoreFocus(id) {
    if (!id) return;
    [...root.querySelectorAll('.word-token')].find((button) => button.dataset.wordId === id)?.focus();
  }

  function render(focusId = null) {
    answerArea.classList.toggle('is-empty', answerIds.length === 0);
    answerArea.innerHTML = answerIds
      .map((id) => {
        const word = wordById.get(id);
        return `<button class="word-token" type="button" data-answer-id="${escapeHtml(id)}" aria-label="${escapeHtml(word.text)}を回答欄から戻す">${escapeHtml(word.text)}</button>`;
      })
      .join('');
    wordBank.innerHTML = bankIds
      .map((id) => `<button class="word-token" type="button" data-word-id="${escapeHtml(id)}">${escapeHtml(wordById.get(id).text)}</button>`)
      .join('');
    restoreFocus(focusId);
  }

  function clearFeedback() {
    feedback.className = 'feedback';
    feedback.textContent = '';
    explanation.hidden = true;
  }

  function check() {
    const correct = checkWordOrder(answerIds, problem.acceptedAnswers);
    feedback.className = `feedback is-visible ${correct ? 'success' : 'error'}`;
    feedback.textContent = correct
      ? 'Correct — 文の骨格を正しく組み立てられました。'
      : 'Not yet — 主語から始めて、もう一度並びを確認してみましょう。';
    explanation.hidden = !correct;
    onComplete({ correct, problemId: problem.id, answerIds: [...answerIds] });
  }

  on(wordBank, 'click', (event) => {
    const button = event.target.closest('[data-word-id]');
    if (!button) return;
    const id = button.dataset.wordId;
    bankIds = bankIds.filter((wordId) => wordId !== id);
    answerIds = [...answerIds, id];
    clearFeedback();
    render(id);
  });

  on(answerArea, 'click', (event) => {
    const button = event.target.closest('[data-answer-id]');
    if (!button) return;
    const id = button.dataset.answerId;
    answerIds = answerIds.filter((wordId) => wordId !== id);
    bankIds = [...bankIds, id];
    clearFeedback();
    render(id);
  });

  on(resetButton, 'click', () => {
    bankIds = [...initialBankIds];
    answerIds = [];
    hintIndex = 0;
    clearFeedback();
    if (hintOutput) hintOutput.textContent = '';
    if (hintButton) hintButton.disabled = false;
    render();
  });
  if (hintButton) {
    on(hintButton, 'click', () => {
      if (!hintOutput || hintIndex >= hints.length) return;
      hintOutput.textContent = `Hint ${hintIndex + 1}: ${hints[hintIndex]}`;
      hintIndex += 1;
      if (hintIndex >= hints.length) hintButton.disabled = true;
    });
  }
  on(checkButton, 'click', check);

  render();
  return cleanup;
}
