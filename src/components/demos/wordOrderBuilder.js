import { wordOrderProblem } from '../../data/demo-problems.js';
import { checkWordOrder } from '../../lib/grammar/word-order.js';
import { escapeHtml } from '../../lib/dom.js';

export function mountWordOrderBuilder(root) {
  const wordById = new Map(wordOrderProblem.words.map((word) => [word.id, word]));
  let bankIds = [...wordOrderProblem.initialOrder];
  let answerIds = [];

  root.innerHTML = `
    <p class="instruction">${escapeHtml(wordOrderProblem.prompt)}</p>
    <div class="demo-stage">
      <h4>Answer area</h4>
      <div class="answer-area is-empty" data-answer-area aria-live="polite"></div>
      <h4>Word cards</h4>
      <div class="token-bank" data-word-bank></div>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-reset>Reset</button>
        <button class="button" type="button" data-check>Check answer</button>
      </div>
      <div class="feedback" data-feedback role="status" aria-live="polite"></div>
      <p class="explanation" data-explanation hidden>${escapeHtml(wordOrderProblem.explanation)}</p>
    </div>`;

  const answerArea = root.querySelector('[data-answer-area]');
  const wordBank = root.querySelector('[data-word-bank]');
  const feedback = root.querySelector('[data-feedback]');
  const explanation = root.querySelector('[data-explanation]');

  function render() {
    answerArea.classList.toggle('is-empty', answerIds.length === 0);
    answerArea.innerHTML = answerIds
      .map((id) => `<button class="word-token" type="button" data-answer-id="${id}" aria-label="${escapeHtml(wordById.get(id).text)}を回答欄から戻す">${escapeHtml(wordById.get(id).text)}</button>`)
      .join('');
    wordBank.innerHTML = bankIds
      .map((id) => `<button class="word-token" type="button" data-word-id="${id}">${escapeHtml(wordById.get(id).text)}</button>`)
      .join('');
  }

  function clearFeedback() {
    feedback.className = 'feedback';
    feedback.textContent = '';
    explanation.hidden = true;
  }

  wordBank.addEventListener('click', (event) => {
    const button = event.target.closest('[data-word-id]');
    if (!button) return;
    const id = button.dataset.wordId;
    bankIds = bankIds.filter((wordId) => wordId !== id);
    answerIds = [...answerIds, id];
    clearFeedback();
    render();
  });

  answerArea.addEventListener('click', (event) => {
    const button = event.target.closest('[data-answer-id]');
    if (!button) return;
    const id = button.dataset.answerId;
    answerIds = answerIds.filter((wordId) => wordId !== id);
    bankIds = [...bankIds, id];
    clearFeedback();
    render();
  });

  root.querySelector('[data-reset]').addEventListener('click', () => {
    bankIds = [...wordOrderProblem.initialOrder];
    answerIds = [];
    clearFeedback();
    render();
  });

  root.querySelector('[data-check]').addEventListener('click', () => {
    const correct = checkWordOrder(answerIds, wordOrderProblem.answer);
    feedback.className = `feedback is-visible ${correct ? 'success' : 'error'}`;
    feedback.textContent = correct
      ? 'Correct — 文の骨格を正しく組み立てられました。'
      : 'Not yet — 主語から始めて、もう一度並びを確認してみましょう。';
    explanation.hidden = !correct;
  });

  render();
}
