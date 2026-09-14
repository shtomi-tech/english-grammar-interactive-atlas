import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import { evaluateExamChoice } from '../../lib/grammar/exam-multiple-choice.js';

export function mountExamMultipleChoice(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'exam-multiple-choice') {
    throw new TypeError('Exam Multiple Choice needs an exam-multiple-choice problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  let selectedChoiceId = null;
  let submitted = false;

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage exam-mc-stage">
      <h4>Question</h4>
      <p class="exam-mc-stem">${escapeHtml(problem.stem)}</p>
      <div class="exam-mc-choices" data-exam-choices role="group" aria-label="Answer choices"></div>
      <div class="demo-actions">
        <button class="button" type="button" data-exam-submit disabled>解答する</button>
      </div>
      <div class="exam-mc-result" data-exam-result role="status" aria-live="polite" tabindex="-1" hidden></div>
      <section class="exam-mc-overall" data-exam-overall hidden>
        <h4>Grammar explanation</h4>
        <p data-exam-overall-text></p>
      </section>
      <section class="exam-mc-review" data-exam-review hidden>
        <h4>Choice explanations</h4>
        <ol class="exam-mc-review-list" data-exam-review-list></ol>
      </section>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-exam-reset hidden>もう一度解く</button>
      </div>
    </div>`;

  const choices = root.querySelector('[data-exam-choices]');
  const submitButton = root.querySelector('[data-exam-submit]');
  const result = root.querySelector('[data-exam-result]');
  const overall = root.querySelector('[data-exam-overall]');
  const overallText = root.querySelector('[data-exam-overall-text]');
  const review = root.querySelector('[data-exam-review]');
  const reviewList = root.querySelector('[data-exam-review-list]');
  const resetButton = root.querySelector('[data-exam-reset]');

  function focusChoice(choiceId) {
    [...choices.querySelectorAll('[data-exam-choice-id]')]
      .find((button) => button.dataset.examChoiceId === choiceId)
      ?.focus();
  }

  function renderChoices(focusTarget = null) {
    choices.innerHTML = problem.choices
      .map((choice, index) => {
        const selected = selectedChoiceId === choice.id;
        let stateLabel = '';
        if (submitted) {
          stateLabel = choice.id === problem.answerChoiceId
            ? 'Correct answer'
            : choice.id === selectedChoiceId
              ? 'Your answer'
              : 'Not selected';
        } else if (selected) {
          stateLabel = 'Selected';
        }
        return `
          <button class="exam-mc-choice${selected ? ' is-selected' : ''}" type="button" data-exam-choice-id="${escapeHtml(choice.id)}" aria-pressed="${selected}"${submitted ? ' disabled' : ''}>
            <span class="exam-mc-choice-number" aria-hidden="true">${index + 1}.</span>
            <span class="exam-mc-choice-text">${escapeHtml(choice.text)}</span>
            <span class="exam-mc-choice-state">${escapeHtml(stateLabel)}</span>
          </button>`;
      })
      .join('');
    if (focusTarget) focusChoice(focusTarget);
  }

  function renderReview(evaluation) {
    const answerIndex = problem.choices.findIndex((choice) => choice.id === evaluation.answerChoiceId);
    const answerChoice = problem.choices[answerIndex];
    result.className = `exam-mc-result is-visible ${evaluation.correct ? 'success' : 'error'}`;
    result.textContent = evaluation.correct
      ? '○ 正解です'
      : `× 不正解です。正解：${answerIndex + 1}. ${answerChoice.text}`;
    result.hidden = false;

    overallText.textContent = problem.explanation;
    overall.hidden = false;
    reviewList.innerHTML = problem.choices
      .map((choice, index) => {
        const isAnswer = choice.id === evaluation.answerChoiceId;
        const isSelectedWrong = choice.id === evaluation.selectedChoiceId && !evaluation.correct;
        const labels = [
          isAnswer ? '正解' : '',
          isSelectedWrong ? 'あなたの選択' : '',
        ].filter(Boolean).join(' · ');
        return `
          <li class="exam-mc-option-review${isAnswer ? ' is-answer' : ''}${isSelectedWrong ? ' is-selected-wrong' : ''}">
            <div class="exam-mc-option-heading">
              <strong>${index + 1}. ${escapeHtml(choice.text)}</strong>
              <span>${escapeHtml(labels)}</span>
            </div>
            <p>${escapeHtml(choice.explanation)}</p>
          </li>`;
      })
      .join('');
    review.hidden = false;
  }

  function submit() {
    if (submitted || !selectedChoiceId) return;
    const evaluation = evaluateExamChoice(problem, selectedChoiceId);
    submitted = true;
    submitButton.disabled = true;
    resetButton.hidden = false;
    renderChoices();
    renderReview(evaluation);
    onComplete({ ...evaluation, problemId: problem.id });
    result.focus({ preventScroll: true });
  }

  function reset() {
    selectedChoiceId = null;
    submitted = false;
    submitButton.disabled = true;
    result.hidden = true;
    result.textContent = '';
    overall.hidden = true;
    overallText.textContent = '';
    review.hidden = true;
    reviewList.innerHTML = '';
    resetButton.hidden = true;
    renderChoices(problem.choices[0]?.id);
  }

  on(choices, 'click', (event) => {
    const choiceButton = event.target.closest('[data-exam-choice-id]');
    if (!choiceButton || submitted) return;
    selectedChoiceId = choiceButton.dataset.examChoiceId;
    submitButton.disabled = false;
    renderChoices(selectedChoiceId);
  });
  on(submitButton, 'click', submit);
  on(resetButton, 'click', reset);

  renderChoices();
  return cleanup;
}
