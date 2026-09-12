import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import {
  getRelatedChunkIds,
  getRelationsForChunk,
  hasExploredAllRelations,
} from '../../lib/grammar/modifier-relations.js';

export function mountModifierConnectionViewer(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'modifier-connection-viewer') {
    throw new TypeError('Modifier Connection Viewer needs a modifier-connection-viewer problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const chunkById = new Map(problem.chunks.map((chunk) => [chunk.id, chunk]));
  const exploredRelationIds = new Set();
  let selectedChunkId = null;
  let completed = false;

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage modifier-connection-stage">
      <h4>Sentence</h4>
      <div class="modifier-chunk-row" data-modifier-chunks role="group" aria-label="Sentence chunks"></div>
      <h4>Modifier connections</h4>
      <div class="modifier-relation-list" data-modifier-relations role="list" aria-label="Modifier relations"></div>
      <div class="modifier-selection" data-modifier-selection role="status" aria-live="polite">語句を選択すると、修飾関係が表示されます。</div>
      <p class="modifier-progress" data-modifier-progress aria-live="polite"></p>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-modifier-reset>Reset</button>
      </div>
      <p class="explanation" data-modifier-explanation>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const chunks = root.querySelector('[data-modifier-chunks]');
  const relations = root.querySelector('[data-modifier-relations]');
  const selection = root.querySelector('[data-modifier-selection]');
  const progress = root.querySelector('[data-modifier-progress]');
  const resetButton = root.querySelector('[data-modifier-reset]');

  function restoreFocus(focusTarget) {
    if (!focusTarget) return;
    if (focusTarget.type === 'sentence') {
      [...root.querySelectorAll('[data-sentence-chunk-id]')]
        .find((button) => button.dataset.sentenceChunkId === focusTarget.id)
        ?.focus();
    }
    if (focusTarget.type === 'relation') {
      [...root.querySelectorAll('[data-relation-node-id]')]
        .find(
          (button) =>
            button.dataset.relationNodeId === focusTarget.id &&
            button.dataset.relationId === focusTarget.relationId &&
            button.dataset.relationNodeKind === focusTarget.kind,
        )
        ?.focus();
    }
    if (focusTarget.type === 'reset') resetButton.focus();
  }

  function render(focusTarget = null) {
    const relatedChunkIds = new Set(getRelatedChunkIds(problem.relations, selectedChunkId));
    const selectedRelations = getRelationsForChunk(problem.relations, selectedChunkId);

    chunks.innerHTML = problem.chunks
      .map((chunk) => {
        const selected = selectedChunkId === chunk.id;
        const related = relatedChunkIds.has(chunk.id);
        const stateLabel = selected ? 'Selected' : related ? 'Related' : chunk.kind === 'modifier' ? 'Modifier' : 'Core';
        return `
          <button class="modifier-chunk${related ? ' is-related' : ''}" type="button" data-sentence-chunk-id="${escapeHtml(chunk.id)}" aria-pressed="${selected}">
            <span class="modifier-chunk-text">${escapeHtml(chunk.text)}</span>
            <span class="modifier-chunk-kind">${escapeHtml(chunk.kind)} · ${stateLabel}</span>
          </button>`;
      })
      .join('');

    relations.innerHTML = problem.relations
      .map((relation) => {
        const modifier = chunkById.get(relation.modifierId);
        const target = chunkById.get(relation.targetId);
        const active = selectedChunkId === relation.modifierId || selectedChunkId === relation.targetId;
        return `
          <article class="modifier-relation${active ? ' is-active' : ''}" role="listitem">
            <button class="relation-node relation-modifier" type="button" data-relation-node-id="${escapeHtml(modifier.id)}" data-relation-id="${escapeHtml(relation.id)}" data-relation-node-kind="modifier" aria-pressed="${selectedChunkId === modifier.id}">
              <span class="relation-node-kind">Modifier</span>
              <span class="relation-node-text">${escapeHtml(modifier.text)}</span>
            </button>
            <span class="relation-arrow" aria-hidden="true">→</span>
            <button class="relation-node relation-target" type="button" data-relation-node-id="${escapeHtml(target.id)}" data-relation-id="${escapeHtml(relation.id)}" data-relation-node-kind="target" aria-pressed="${selectedChunkId === target.id}">
              <span class="relation-node-kind">Target</span>
              <span class="relation-node-text">${escapeHtml(target.text)}</span>
            </button>
            <p class="relation-label">${escapeHtml(relation.label)}</p>
          </article>`;
      })
      .join('');

    if (!selectedChunkId) {
      selection.textContent = '語句を選択すると、修飾関係が表示されます。';
    } else if (!selectedRelations.length) {
      selection.textContent = `${chunkById.get(selectedChunkId)?.text ?? '選択した語句'} に対応する修飾関係はありません。`;
    } else {
      const relatedText = selectedRelations
        .map((relation) => chunkById.get(relation.modifierId === selectedChunkId ? relation.targetId : relation.modifierId)?.text)
        .filter(Boolean)
        .join(' / ');
      const explanations = selectedRelations.map((relation) => relation.explanation).join(' ');
      selection.textContent = `${chunkById.get(selectedChunkId).text} を選択。関連する語句: ${relatedText}。${explanations}`;
    }
    progress.textContent = completed
      ? 'You explored all modifier connections.'
      : `${exploredRelationIds.size} / ${problem.relations.length} relations explored.`;
    restoreFocus(focusTarget);
  }

  function selectChunk(id, focusTarget) {
    if (!chunkById.has(id)) return;
    selectedChunkId = selectedChunkId === id ? null : id;
    getRelationsForChunk(problem.relations, id).forEach((relation) => exploredRelationIds.add(relation.id));
    render(focusTarget);
    if (!completed && hasExploredAllRelations(problem.relations, exploredRelationIds)) {
      completed = true;
      onComplete({ correct: true, problemId: problem.id, exploredRelationIds: [...exploredRelationIds] });
      progress.textContent = 'You explored all modifier connections.';
    }
  }

  on(root, 'click', (event) => {
    const sentenceButton = event.target.closest('[data-sentence-chunk-id]');
    if (sentenceButton) {
      selectChunk(sentenceButton.dataset.sentenceChunkId, {
        type: 'sentence',
        id: sentenceButton.dataset.sentenceChunkId,
      });
      return;
    }
    const relationButton = event.target.closest('[data-relation-node-id]');
    if (relationButton) {
      selectChunk(relationButton.dataset.relationNodeId, {
        type: 'relation',
        id: relationButton.dataset.relationNodeId,
        relationId: relationButton.dataset.relationId,
        kind: relationButton.dataset.relationNodeKind,
      });
    }
  });

  on(resetButton, 'click', () => {
    selectedChunkId = null;
    exploredRelationIds.clear();
    completed = false;
    render({ type: 'reset' });
  });

  render();
  return cleanup;
}
