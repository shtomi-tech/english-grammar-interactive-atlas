import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import {
  getCorrectionByTokenId,
  hasCompletedAllCorrections,
  isAcceptedCorrection,
} from '../../lib/grammar/error-correction.js';

export function mountErrorCorrector(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'error-corrector') {
    throw new TypeError('Error Corrector needs an error-corrector problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const correctionById = new Map(problem.corrections.map((correction) => [correction.id, correction]));
  const optionById = new Map(
    problem.corrections.flatMap((correction) => correction.options.map((option) => [option.id, option])),
  );
  const answers = new Map();
  let selectedCorrectionId = null;
  let selectedOptionId = null;
  let feedbackText = '';
  let feedbackKind = '';
  let completed = false;

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage error-corrector-stage">
      <h4>Sentence</h4>
      <div class="error-token-row" data-error-tokens role="group" aria-label="Sentence tokens"></div>
      <div class="error-selection" data-error-selection role="status" aria-live="polite">語句を選択すると、修正候補が表示されます。</div>
      <div class="error-options" data-error-options></div>
      <div class="feedback" data-error-feedback role="status" aria-live="polite"></div>
      <p class="error-progress" data-error-progress aria-live="polite"></p>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-error-reset>Reset</button>
      </div>
      <p class="explanation" data-error-explanation>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const tokenArea = root.querySelector('[data-error-tokens]');
  const selection = root.querySelector('[data-error-selection]');
  const optionArea = root.querySelector('[data-error-options]');
  const feedback = root.querySelector('[data-error-feedback]');
  const progress = root.querySelector('[data-error-progress]');
  const resetButton = root.querySelector('[data-error-reset]');

  function getCompletedCorrectionIds() {
    return problem.corrections
      .filter((correction) => isAcceptedCorrection(correction, answers.get(correction.id)))
      .map((correction) => correction.id);
  }

  function restoreFocus(focusTarget) {
    if (!focusTarget) return;
    if (focusTarget.type === 'token') {
      [...root.querySelectorAll('[data-error-correction-id]')]
        .find((button) => button.dataset.errorCorrectionId === focusTarget.correctionId)
        ?.focus();
    }
    if (focusTarget.type === 'option') {
      [...root.querySelectorAll('[data-error-option-id]')]
        .find((button) => button.dataset.errorOptionId === focusTarget.optionId)
        ?.focus();
    }
    if (focusTarget.type === 'reset') resetButton.focus();
  }

  function render(focusTarget = null) {
    tokenArea.innerHTML = problem.tokens
      .map((token) => {
        const correction = getCorrectionByTokenId(problem.corrections, token.id);
        if (!correction) return `<span class="error-plain-token">${escapeHtml(token.text)}</span>`;
        const selected = selectedCorrectionId === correction.id;
        const answerOption = optionById.get(answers.get(correction.id));
        const displayText = answerOption?.text ?? token.text;
        const isCorrect = isAcceptedCorrection(correction, answers.get(correction.id));
        const stateLabel = selected ? 'Selected' : isCorrect ? 'Correct' : 'Choose to inspect';
        return `
          <button class="error-token${selected ? ' is-selected' : ''}" type="button" data-error-correction-id="${escapeHtml(correction.id)}" aria-pressed="${selected}">
            <span class="error-token-text">${escapeHtml(displayText)}</span>
            <span class="error-token-state">${stateLabel}</span>
          </button>`;
      })
      .join('');

    const selectedCorrection = selectedCorrectionId ? correctionById.get(selectedCorrectionId) : null;
    const selectedToken = selectedCorrection
      ? problem.tokens.find((token) => token.id === selectedCorrection.tokenId)
      : null;
    selection.textContent = selectedCorrection
      ? `${selectedToken?.text ?? 'Selected token'} を選択中。修正候補を選んでください。`
      : '語句を選択すると、修正候補が表示されます。';

    optionArea.innerHTML = selectedCorrection
      ? `<h4>Choose a correction</h4><div class="error-option-row">${selectedCorrection.options
          .map((option) => {
            const selected = selectedOptionId === option.id;
            const correct = selected && isAcceptedCorrection(selectedCorrection, option.id);
            const stateLabel = selected ? (correct ? 'Correct' : 'Selected') : 'Option';
            return `
              <button class="error-option${selected ? ' is-selected' : ''}" type="button" data-error-option-id="${escapeHtml(option.id)}" aria-pressed="${selected}">
                <span>${escapeHtml(option.text)}</span>
                <span class="error-option-state">${stateLabel}</span>
              </button>`;
          })
          .join('')}</div>`
      : '';

    feedback.className = feedbackText ? `feedback is-visible ${feedbackKind}` : 'feedback';
    feedback.textContent = feedbackText;
    progress.textContent = completed
      ? 'You corrected all errors.'
      : `${getCompletedCorrectionIds().length} / ${problem.corrections.length} corrections completed.`;
    restoreFocus(focusTarget);
  }

  function selectCorrection(correctionId) {
    const correction = correctionById.get(correctionId);
    if (!correction) return;
    selectedCorrectionId = correction.id;
    selectedOptionId = answers.get(correction.id) ?? null;
    feedbackText = '';
    feedbackKind = '';
    render({ type: 'token', correctionId: correction.id });
  }

  function selectOption(optionId) {
    const option = optionById.get(optionId);
    const correction = selectedCorrectionId ? correctionById.get(selectedCorrectionId) : null;
    if (!option || !correction || !correction.options.some((entry) => entry.id === optionId)) return;
    answers.set(correction.id, option.id);
    selectedOptionId = option.id;
    const originalToken = problem.tokens.find((token) => token.id === correction.tokenId);
    const correct = isAcceptedCorrection(correction, option.id);
    feedbackKind = correct ? 'success' : 'error';
    feedbackText = correct
      ? `Correct. ${originalToken.text} → ${option.text}。${correction.ruleLabel}: ${correction.explanation}`
      : `Not yet. ${correction.ruleLabel}。${correction.explanation}`;
    render({ type: 'option', optionId: option.id });
    if (!completed && hasCompletedAllCorrections(problem.corrections, answers)) {
      completed = true;
      onComplete({
        correct: true,
        problemId: problem.id,
        completedCorrectionIds: getCompletedCorrectionIds(),
      });
      progress.textContent = 'You corrected all errors.';
    }
  }

  on(root, 'click', (event) => {
    const tokenButton = event.target.closest('[data-error-correction-id]');
    if (tokenButton) {
      selectCorrection(tokenButton.dataset.errorCorrectionId);
      return;
    }
    const optionButton = event.target.closest('[data-error-option-id]');
    if (optionButton) selectOption(optionButton.dataset.errorOptionId);
  });

  on(resetButton, 'click', () => {
    answers.clear();
    selectedCorrectionId = null;
    selectedOptionId = null;
    feedbackText = '';
    feedbackKind = '';
    completed = false;
    render({ type: 'reset' });
  });

  render();
  return cleanup;
}
