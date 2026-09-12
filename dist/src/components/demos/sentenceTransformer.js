import { transformerDefaults } from '../../data/demo-problems.js';
import { generateSentence } from '../../lib/grammar/generateSentence.js';

export function mountSentenceTransformer(root) {
  const state = { ...transformerDefaults };

  root.innerHTML = `
    <p class="instruction">条件を変えると、英文の形がどう変わるか観察してください。</p>
    <div class="demo-stage">
      <div class="transformer-grid">
        <fieldset class="control-group">
          <legend>Subject</legend>
          <div class="control-options">
            <div class="control-option"><input id="subject-he" type="radio" name="subject" value="he" checked><label for="subject-he">He</label></div>
            <div class="control-option"><input id="subject-they" type="radio" name="subject" value="they"><label for="subject-they">They</label></div>
          </div>
        </fieldset>
        <fieldset class="control-group">
          <legend>Tense</legend>
          <div class="control-options">
            <div class="control-option"><input id="tense-present" type="radio" name="tense" value="present" checked><label for="tense-present">Present</label></div>
            <div class="control-option"><input id="tense-past" type="radio" name="tense" value="past"><label for="tense-past">Past</label></div>
          </div>
        </fieldset>
        <fieldset class="control-group">
          <legend>Negative</legend>
          <div class="control-options">
            <div class="control-option"><input id="negative-off" type="radio" name="negative" value="false" checked><label for="negative-off">OFF</label></div>
            <div class="control-option"><input id="negative-on" type="radio" name="negative" value="true"><label for="negative-on">ON</label></div>
          </div>
        </fieldset>
      </div>
      <div class="transformer-output" aria-live="polite">
        <span class="output-label">Generated sentence</span>
        <span class="transformer-sentence" data-sentence></span>
        <div class="grammar-recipe" data-recipe></div>
      </div>
    </div>`;

  const sentence = root.querySelector('[data-sentence]');
  const recipe = root.querySelector('[data-recipe]');

  function render() {
    sentence.textContent = generateSentence(state);
    recipe.innerHTML = [
      `subject: ${state.subject}`,
      'verb: play',
      `tense: ${state.tense}`,
      `polarity: ${state.negative ? 'negative' : 'affirmative'}`,
    ]
      .map((item) => `<span class="recipe-chip">${item}</span>`)
      .join('');
  }

  root.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.name === 'subject') state.subject = input.value;
    if (input.name === 'tense') state.tense = input.value;
    if (input.name === 'negative') state.negative = input.value === 'true';
    render();
  });

  render();
}
