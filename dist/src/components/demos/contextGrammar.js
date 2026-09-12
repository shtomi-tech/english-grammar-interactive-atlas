import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import {
  getScenarioChoice,
  getScenarioStep,
  hasCompletedScenario,
  isAcceptedScenarioChoice,
} from '../../lib/grammar/context-grammar.js';

export function mountContextGrammar(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'context-grammar') {
    throw new TypeError('Context Grammar needs a context-grammar problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const state = {
    currentStepIndex: 0,
    selectedChoiceId: null,
    selectedChoices: new Map(),
    completedStepIds: new Set(),
    conversationHistory: [],
    feedbackText: '',
    feedbackKind: '',
    completed: false,
    completionNotified: false,
  };

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage context-grammar-stage">
      <section class="context-scenario" aria-labelledby="context-scenario-heading">
        <p class="context-kicker">Scenario goal</p>
        <h4 id="context-scenario-heading">${escapeHtml(problem.scenario.title)}</h4>
        <p class="context-setting">${escapeHtml(problem.scenario.setting)}</p>
        <dl class="context-goal-list">
          <div><dt>Your role</dt><dd>${escapeHtml(problem.scenario.learnerRole)}</dd></div>
          <div><dt>Goal</dt><dd>${escapeHtml(problem.scenario.goal)}</dd></div>
        </dl>
      </section>
      <section class="context-history" data-context-history aria-live="polite" aria-label="Conversation history"></section>
      <section class="context-current" aria-labelledby="context-step-heading">
        <p class="context-kicker">Current line</p>
        <h4 id="context-step-heading" data-context-step-heading tabindex="-1"></h4>
        <p class="context-speaker" data-context-speaker></p>
        <p class="context-line" data-context-line></p>
        <p class="context-instruction" data-context-instruction></p>
        <h4>Choose your response</h4>
        <div class="context-choice-row" data-context-choices role="group" aria-label="Response choices"></div>
      </section>
      <div class="feedback" data-context-feedback role="status" aria-live="polite"></div>
      <p class="context-progress" data-context-progress aria-live="polite"></p>
      <div class="demo-actions">
        <button class="button" type="button" data-context-continue hidden>Continue</button>
        <button class="button secondary" type="button" data-context-reset>Reset</button>
      </div>
      <p class="explanation" data-context-explanation>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const history = root.querySelector('[data-context-history]');
  const stepHeading = root.querySelector('[data-context-step-heading]');
  const speaker = root.querySelector('[data-context-speaker]');
  const line = root.querySelector('[data-context-line]');
  const instruction = root.querySelector('[data-context-instruction]');
  const choices = root.querySelector('[data-context-choices]');
  const feedback = root.querySelector('[data-context-feedback]');
  const progress = root.querySelector('[data-context-progress]');
  const continueButton = root.querySelector('[data-context-continue]');
  const resetButton = root.querySelector('[data-context-reset]');

  function restoreFocus(focusTarget) {
    if (!focusTarget) return;
    if (focusTarget.type === 'choice') {
      [...root.querySelectorAll('[data-context-choice-id]')]
        .find((button) => button.dataset.contextChoiceId === focusTarget.choiceId)
        ?.focus();
    }
    if (focusTarget.type === 'continue') continueButton.focus();
    if (focusTarget.type === 'heading') stepHeading.focus();
    if (focusTarget.type === 'reset') resetButton.focus();
  }

  function renderHistory() {
    history.innerHTML = state.conversationHistory.length
      ? `<p class="context-kicker">Conversation history</p><ol class="context-history-list">${state.conversationHistory
          .map(
            (entry) => `
              <li class="context-history-item">
                <p><strong>${escapeHtml(entry.speaker)}</strong> ${escapeHtml(entry.line)}</p>
                <p><strong>${escapeHtml(problem.scenario.learnerRole)}</strong> ${escapeHtml(entry.choice)}</p>
                <p class="context-reply"><strong>${escapeHtml(entry.replySpeaker)}</strong> ${escapeHtml(entry.reply)}</p>
              </li>`,
          )
          .join('')}</ol>`
      : '<p class="context-empty">No responses yet.</p>';
  }

  function render(focusTarget = null) {
    const currentStep = getScenarioStep(problem.steps, state.currentStepIndex);
    renderHistory();

    if (currentStep) {
      stepHeading.textContent = state.completed ? 'Scenario complete' : `Step ${state.currentStepIndex + 1}`;
      speaker.textContent = currentStep.speaker;
      line.textContent = currentStep.line;
      instruction.textContent = currentStep.instruction;
      choices.innerHTML = currentStep.choices
        .map((choice) => {
          const selected = state.selectedChoiceId === choice.id;
          const accepted = isAcceptedScenarioChoice(currentStep, choice.id);
          const stateLabel = selected ? (accepted ? 'Selected · accepted' : 'Selected') : 'Choose';
          return `
            <button class="context-choice${selected ? ' is-selected' : ''}" type="button" data-context-choice-id="${escapeHtml(choice.id)}" aria-pressed="${selected}"${state.completed ? ' disabled' : ''}>
              <span class="context-choice-text">${escapeHtml(choice.text)}</span>
              <span class="context-choice-state">${stateLabel}</span>
            </button>`;
        })
        .join('');
    } else {
      stepHeading.textContent = 'Scenario complete';
      speaker.textContent = '';
      line.textContent = '';
      instruction.textContent = '';
      choices.innerHTML = '';
    }

    feedback.className = state.feedbackText ? `feedback is-visible ${state.feedbackKind}` : 'feedback';
    feedback.textContent = state.feedbackText;
    const selectedStep = currentStep ? isAcceptedScenarioChoice(currentStep, state.selectedChoiceId) : false;
    continueButton.hidden = state.completed || !selectedStep;
    continueButton.disabled = state.completed || !selectedStep;
    progress.textContent = state.completed
      ? 'You completed the scenario.'
      : `${state.completedStepIds.size} / ${problem.steps.length} steps completed.`;
    restoreFocus(focusTarget);
  }

  function selectChoice(choiceId) {
    if (state.completed) return;
    const currentStep = getScenarioStep(problem.steps, state.currentStepIndex);
    const choice = getScenarioChoice(currentStep, choiceId);
    if (!choice) return;
    state.selectedChoiceId = choice.id;
    const accepted = isAcceptedScenarioChoice(currentStep, choice.id);
    state.feedbackKind = accepted ? 'success' : 'error';
    state.feedbackText = accepted
      ? `Correct. Good choice. ${choice.text} Grammar: ${choice.grammarLabel}. Why it works: ${choice.explanation} Response: ${choice.reply}`
      : `Not yet. ${choice.grammarLabel}: ${choice.explanation}`;
    render({ type: 'choice', choiceId: choice.id });
  }

  function continueScenario() {
    const currentStep = getScenarioStep(problem.steps, state.currentStepIndex);
    const choice = getScenarioChoice(currentStep, state.selectedChoiceId);
    if (!currentStep || !choice || !isAcceptedScenarioChoice(currentStep, choice.id)) return;

    state.selectedChoices.set(currentStep.id, choice.id);
    state.completedStepIds.add(currentStep.id);
    state.conversationHistory.push({
      speaker: currentStep.speaker,
      line: currentStep.line,
      choice: choice.text,
      replySpeaker: currentStep.speaker,
      reply: choice.reply,
    });

    if (hasCompletedScenario(problem.steps, state.completedStepIds)) {
      state.completed = true;
      render();
      if (!state.completionNotified) {
        state.completionNotified = true;
        onComplete({
          correct: true,
          problemId: problem.id,
          completedStepIds: [...state.completedStepIds],
          selectedChoiceIds: problem.steps.map((step) => state.selectedChoices.get(step.id)),
        });
      }
      return;
    }

    state.currentStepIndex += 1;
    state.selectedChoiceId = null;
    state.feedbackText = '';
    state.feedbackKind = '';
    render({ type: 'heading' });
  }

  function reset() {
    state.currentStepIndex = 0;
    state.selectedChoiceId = null;
    state.selectedChoices.clear();
    state.completedStepIds.clear();
    state.conversationHistory = [];
    state.feedbackText = '';
    state.feedbackKind = '';
    state.completed = false;
    state.completionNotified = false;
    render({ type: 'reset' });
  }

  on(choices, 'click', (event) => {
    const choiceButton = event.target.closest('[data-context-choice-id]');
    if (choiceButton) selectChoice(choiceButton.dataset.contextChoiceId);
  });
  on(continueButton, 'click', continueScenario);
  on(resetButton, 'click', reset);

  render();
  return cleanup;
}
