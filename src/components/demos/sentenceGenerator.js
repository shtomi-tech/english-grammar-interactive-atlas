import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import { generateSentence } from '../../lib/grammar/generateSentence.js';
import {
  findMatchingTargetState,
  hasCompleteGenerationState,
} from '../../lib/grammar/generation-goal.js';

const controlLabels = {
  subject: 'Subject',
  tense: 'Tense',
  negative: 'Polarity',
};

function valueKey(value) {
  return `${typeof value}:${String(value)}`;
}

function safeId(value) {
  return String(value).replace(/[^a-z0-9_-]/gi, '-');
}

export function mountSentenceGenerator(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'sentence-generator') {
    throw new TypeError('Sentence Generator needs a sentence-generator problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const state = {};
  let generatedSentence = '';
  let feedbackText = '';
  let feedbackKind = '';
  let completionNotified = false;
  const problemKey = safeId(problem.id);
  const controls = Object.entries(problem.controls);
  const controlNames = controls.map(([name]) => name);

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage sentence-generator-stage">
      <section class="generator-goal" aria-labelledby="generator-goal-heading">
        <p class="generator-kicker">Goal</p>
        <h4 id="generator-goal-heading">${escapeHtml(problem.goal.title)}</h4>
        <p>${escapeHtml(problem.goal.description)}</p>
      </section>
      <div class="generator-controls" data-generator-controls>
        ${controls
          .map(
            ([name, values]) => `
              <fieldset class="control-group">
                <legend>${escapeHtml(controlLabels[name] ?? name)}</legend>
                <div class="control-options">
                  ${values
                    .map((option, index) => {
                      const inputId = `generator-${problemKey}-${safeId(name)}-${index}`;
                      return `<div class="control-option"><input id="${inputId}" type="radio" name="generator-${problemKey}-${safeId(name)}" value="${escapeHtml(String(option.value))}" data-generator-control="${escapeHtml(name)}"><label for="${inputId}">${escapeHtml(option.label)}</label></div>`;
                    })
                    .join('')}
                </div>
              </fieldset>`,
          )
          .join('')}
      </div>
      <div class="demo-actions">
        <button class="button" type="button" data-generator-generate disabled>Generate</button>
        <button class="button secondary" type="button" data-generator-reset>Reset</button>
      </div>
      <div class="generator-output" aria-live="polite">
        <span class="output-label">Generated sentence</span>
        <span class="generator-sentence" data-generator-sentence>—</span>
        <div class="grammar-recipe" data-generator-recipe></div>
      </div>
      <div class="feedback" data-generator-feedback role="status" aria-live="polite"></div>
      <p class="generator-explanation" data-generator-explanation hidden>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const generateButton = root.querySelector('[data-generator-generate]');
  const resetButton = root.querySelector('[data-generator-reset]');
  const sentence = root.querySelector('[data-generator-sentence]');
  const recipe = root.querySelector('[data-generator-recipe]');
  const feedback = root.querySelector('[data-generator-feedback]');
  const explanation = root.querySelector('[data-generator-explanation]');

  function getOptionLabel(name, value) {
    return problem.controls[name]?.find((option) => valueKey(option.value) === valueKey(value))?.label ?? String(value);
  }

  function restoreFocus(focusTarget) {
    if (!focusTarget) return;
    if (focusTarget.type === 'control') {
      [...root.querySelectorAll('[data-generator-control]')]
        .find((input) => input.dataset.generatorControl === focusTarget.name && input.value === String(focusTarget.value))
        ?.focus();
    }
    if (focusTarget.type === 'generate') generateButton.focus();
    if (focusTarget.type === 'reset') resetButton.focus();
  }

  function render(focusTarget = null) {
    const completeState = hasCompleteGenerationState(state, problem.controls);
    controls.forEach(([name]) => {
      root.querySelectorAll(`[data-generator-control="${name}"]`).forEach((input) => {
        input.checked = Object.prototype.hasOwnProperty.call(state, name) && input.value === String(state[name]);
      });
    });
    generateButton.disabled = !completeState;
    sentence.textContent = generatedSentence || '—';
    recipe.innerHTML = generatedSentence
      ? controlNames
          .map((name) => `<span class="recipe-chip">${escapeHtml(controlLabels[name] ?? name)}: ${escapeHtml(getOptionLabel(name, state[name]))}</span>`)
          .join('')
      : '';
    feedback.className = feedbackText ? `feedback is-visible ${feedbackKind}` : 'feedback';
    feedback.textContent = feedbackText;
    const goalMatched = Boolean(generatedSentence) && findMatchingTargetState(state, problem.targetStates, controlNames) >= 0;
    explanation.hidden = !goalMatched;
    restoreFocus(focusTarget);
  }

  function handleControlChange(input) {
    const name = input.dataset.generatorControl;
    const option = problem.controls[name]?.find((candidate) => String(candidate.value) === input.value);
    if (!option) return;
    state[name] = option.value;
    generatedSentence = '';
    feedbackText = '';
    feedbackKind = '';
    render({ type: 'control', name, value: option.value });
  }

  function generate() {
    if (!hasCompleteGenerationState(state, problem.controls)) return;
    generatedSentence = generateSentence(state, problem.sentenceModel);
    const matchedTargetIndex = findMatchingTargetState(state, problem.targetStates, controlNames);
    if (matchedTargetIndex >= 0) {
      feedbackKind = 'success';
      feedbackText = 'Goal matched.';
      render({ type: 'generate' });
      if (!completionNotified) {
        completionNotified = true;
        onComplete({
          correct: true,
          problemId: problem.id,
          state: { ...state },
          sentence: generatedSentence,
          matchedTargetIndex,
        });
      }
      return;
    }
    feedbackKind = 'neutral';
    feedbackText = 'The sentence is grammatical, but it does not match the goal yet.';
    render({ type: 'generate' });
  }

  function reset() {
    controlNames.forEach((name) => delete state[name]);
    generatedSentence = '';
    feedbackText = '';
    feedbackKind = '';
    completionNotified = false;
    render({ type: 'reset' });
  }

  on(root, 'change', (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.dataset.generatorControl) handleControlChange(input);
  });
  on(generateButton, 'click', generate);
  on(resetButton, 'click', reset);

  render();
  return cleanup;
}
