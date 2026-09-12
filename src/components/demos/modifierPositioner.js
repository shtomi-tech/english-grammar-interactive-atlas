import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import {
  buildModifierPlacementSentence,
  getPlacementRelation,
  getModifierPlacement,
} from '../../lib/grammar/modifier-placement.js';

export function mountModifierPositioner(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'modifier-positioner') {
    throw new TypeError('Modifier Positioner needs a modifier-positioner problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  let modifierSelected = false;
  let selectedPlacementId = null;
  let completed = false;

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage modifier-positioner-stage">
      <div class="modifier-positioner-goal">
        <span class="meta-label">Goal</span>
        <p>${escapeHtml(problem.goal.description)}</p>
      </div>
      <div class="modifier-positioner-controls">
        <section class="modifier-positioner-modifier" aria-labelledby="modifier-positioner-modifier-heading">
          <h4 id="modifier-positioner-modifier-heading">Modifier</h4>
          <button class="modifier-card" type="button" data-modifier aria-pressed="false">
            <span class="modifier-card-label">Move this phrase</span>
            <span class="modifier-card-text">${escapeHtml(problem.modifier.text)}</span>
          </button>
        </section>
        <section aria-labelledby="modifier-positioner-place-heading">
          <h4 id="modifier-positioner-place-heading">Place it</h4>
          <div class="modifier-positioner-slots" data-placement-slots role="group" aria-label="Placement options"></div>
        </section>
      </div>
      <div class="modifier-positioner-output" data-positioner-output aria-live="polite">
        <span class="output-label">Current sentence</span>
        <p class="modifier-positioner-sentence" data-positioner-sentence>—</p>
        <div class="modifier-positioner-detail" data-positioner-detail></div>
      </div>
      <div class="feedback" data-positioner-feedback role="status" aria-live="polite"></div>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-positioner-reset>Reset</button>
      </div>
      <p class="explanation" data-positioner-explanation>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const modifierButton = root.querySelector('[data-modifier]');
  const placementSlots = root.querySelector('[data-placement-slots]');
  const sentence = root.querySelector('[data-positioner-sentence]');
  const detail = root.querySelector('[data-positioner-detail]');
  const feedback = root.querySelector('[data-positioner-feedback]');
  const resetButton = root.querySelector('[data-positioner-reset]');

  function render(focusTarget = null) {
    modifierButton.setAttribute('aria-pressed', String(modifierSelected));
    modifierButton.querySelector('.modifier-card-label').textContent = modifierSelected ? 'Selected modifier' : 'Move this phrase';
    placementSlots.innerHTML = problem.placements
      .map((placement) => `
        <button class="modifier-positioner-slot" type="button" data-placement-id="${escapeHtml(placement.id)}" aria-pressed="${selectedPlacementId === placement.id}"${modifierSelected ? '' : ' disabled'}>
          ${escapeHtml(placement.label)}
        </button>`)
      .join('');

    const placement = getModifierPlacement(problem, selectedPlacementId);
    const relation = getPlacementRelation(problem, selectedPlacementId);
    const generatedSentence = buildModifierPlacementSentence(problem, selectedPlacementId);
    sentence.textContent = generatedSentence ?? '—';
    if (!placement || !relation) {
      detail.innerHTML = '<p>Modifierを選び、置く位置を選択してください。</p>';
      feedback.className = 'feedback';
      feedback.textContent = '';
    } else {
      const target = problem.chunks.find((chunk) => chunk.id === relation.targetId);
      detail.innerHTML = `
        <p><strong>Relation</strong><br>${escapeHtml(problem.modifier.text)} → ${escapeHtml(target?.text ?? relation.targetId)}</p>
        <p><strong>${escapeHtml(relation.label)}</strong><br>${escapeHtml(relation.explanation)}</p>
        <p><strong>Meaning</strong><br>${escapeHtml(placement.meaning)}</p>`;
      feedback.className = `feedback is-visible ${placement.grammatical ? placement.matchesGoal ? 'success' : 'neutral' : 'error'}`;
      feedback.textContent = placement.grammatical
        ? placement.matchesGoal
          ? 'Goal matched.'
          : 'The sentence is grammatical, but the modifier describes a different part of the sentence.'
        : 'This placement is not natural in this problem.';
    }

    if (focusTarget === 'modifier') modifierButton.focus();
    if (focusTarget === 'placement') {
      [...root.querySelectorAll('[data-placement-id]')]
        .find((button) => button.dataset.placementId === selectedPlacementId)
        ?.focus();
    }
    if (focusTarget === 'reset') resetButton.focus();
  }

  on(modifierButton, 'click', () => {
    modifierSelected = !modifierSelected;
    render('modifier');
  });

  on(placementSlots, 'click', (event) => {
    const placementButton = event.target.closest('[data-placement-id]');
    if (!placementButton || !modifierSelected) return;
    const placement = getModifierPlacement(problem, placementButton.dataset.placementId);
    if (!placement) return;
    selectedPlacementId = placement.id;
    render('placement');
    if (placement.grammatical && placement.matchesGoal && !completed) {
      completed = true;
      onComplete({
        correct: true,
        problemId: problem.id,
        placementId: placement.id,
        sentence: buildModifierPlacementSentence(problem, placement.id),
        relation: placement.relation,
      });
    }
  });

  on(resetButton, 'click', () => {
    modifierSelected = false;
    selectedPlacementId = null;
    completed = false;
    render('reset');
  });

  render();
  return cleanup;
}
