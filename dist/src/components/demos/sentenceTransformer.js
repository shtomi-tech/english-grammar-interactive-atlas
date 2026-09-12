import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import { generateSentence } from '../../lib/grammar/generateSentence.js';
import { getControlLabel } from '../../lib/grammar/grammar-controls.js';

function valueKey(value) {
  return `${typeof value}:${String(value)}`;
}

function safeId(value) {
  return String(value).replace(/[^a-z0-9_-]/gi, '-');
}

export function mountSentenceTransformer(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'sentence-transformer') {
    throw new TypeError('Sentence Transformer needs a sentence-transformer problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const state = { ...problem.defaults };
  const problemKey = safeId(problem.id);
  const controls = Object.entries(problem.controls);

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage">
      <div class="transformer-grid">
        ${controls
          .map(
            ([name, values]) => `
              <fieldset class="control-group">
                <legend>${escapeHtml(getControlLabel(name))}</legend>
                <div class="control-options">
                  ${values
                    .map((option, index) => {
                      const inputId = `transformer-${problemKey}-${safeId(name)}-${index}`;
                      const checked = valueKey(option.value) === valueKey(state[name]);
                      return `<div class="control-option"><input id="${inputId}" type="radio" name="transformer-${problemKey}-${safeId(name)}" value="${escapeHtml(String(option.value))}" data-control-name="${escapeHtml(name)}" ${checked ? 'checked' : ''}><label for="${inputId}">${escapeHtml(option.label)}</label></div>`;
                    })
                    .join('')}
                </div>
              </fieldset>`,
          )
          .join('')}
      </div>
      <div class="transformer-output" aria-live="polite">
        <span class="output-label">Generated sentence</span>
        <span class="transformer-sentence" data-sentence></span>
        <div class="grammar-recipe" data-recipe></div>
      </div>
    </div>`;

  const sentence = root.querySelector('[data-sentence]');
  const recipe = root.querySelector('[data-recipe]');

  function getOptionLabel(name, value) {
    return problem.controls[name]?.find((option) => valueKey(option.value) === valueKey(value))?.label ?? String(value);
  }

  function render() {
    const generatedSentence = generateSentence(state, problem.sentenceModel);
    sentence.textContent = generatedSentence;
    recipe.innerHTML = controls
      .map(([name]) => `<span class="recipe-chip">${escapeHtml(getControlLabel(name))}: ${escapeHtml(getOptionLabel(name, state[name]))}</span>`)
      .join('');
    return generatedSentence;
  }

  on(root, 'change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.controlName) return;
    const name = input.dataset.controlName;
    const option = problem.controls[name]?.find((candidate) => String(candidate.value) === input.value);
    if (!option) return;
    state[name] = option.value;
    const generatedSentence = render();
    onComplete({ correct: true, problemId: problem.id, state: { ...state }, sentence: generatedSentence });
  });

  render();
  return cleanup;
}
