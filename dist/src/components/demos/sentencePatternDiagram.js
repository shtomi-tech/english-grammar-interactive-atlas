import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import { buildPatternSlots, getExploredRoles, hasExploredAllChunks } from '../../lib/grammar/sentence-pattern.js';

export function mountSentencePatternDiagram(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'sentence-pattern-diagram') {
    throw new TypeError('Sentence Pattern Diagram needs a sentence-pattern-diagram problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const slots = buildPatternSlots(problem.chunks, problem.pattern);
  const chunkById = new Map(problem.chunks.map((chunk) => [chunk.id, chunk]));
  const exploredChunkIds = new Set();
  let selectedChunkId = null;
  let completed = false;

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage sentence-pattern-stage">
      <h4>Sentence</h4>
      <div class="sentence-chunk-row" data-sentence-chunks role="group" aria-label="Sentence elements"></div>
      <h4>Pattern diagram</h4>
      <div class="pattern-diagram" data-pattern-diagram role="list" aria-label="Sentence pattern"></div>
      <div class="pattern-selection" data-pattern-selection role="status" aria-live="polite">要素を選択すると、英文と文型図の対応が表示されます。</div>
      <p class="pattern-progress" data-pattern-progress aria-live="polite"></p>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-pattern-reset>Clear selection</button>
      </div>
      <p class="explanation" data-pattern-explanation>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const sentenceChunks = root.querySelector('[data-sentence-chunks]');
  const diagram = root.querySelector('[data-pattern-diagram]');
  const selection = root.querySelector('[data-pattern-selection]');
  const progress = root.querySelector('[data-pattern-progress]');
  const resetButton = root.querySelector('[data-pattern-reset]');

  function restoreFocus(focusTarget) {
    if (!focusTarget) return;
    if (focusTarget.type === 'sentence') {
      [...root.querySelectorAll('[data-sentence-chunk-id]')]
        .find((button) => button.dataset.sentenceChunkId === focusTarget.id)
        ?.focus();
    }
    if (focusTarget.type === 'diagram') {
      [...root.querySelectorAll('[data-diagram-chunk-id]')]
        .find((button) => button.dataset.diagramChunkId === focusTarget.id)
        ?.focus();
    }
    if (focusTarget.type === 'reset') resetButton.focus();
  }

  function render(focusTarget = null) {
    sentenceChunks.innerHTML = problem.chunks
      .map(
        (chunk) => `
          <button class="sentence-chunk" type="button" data-sentence-chunk-id="${escapeHtml(chunk.id)}" aria-pressed="${selectedChunkId === chunk.id}">
            <span class="sentence-chunk-text">${escapeHtml(chunk.text)}</span>
            <span class="sentence-chunk-role">${escapeHtml(chunk.role)}</span>
          </button>`,
      )
      .join('');

    diagram.innerHTML = slots
      .map((slot) => {
        const chunk = chunkById.get(slot.chunkId);
        return `
          <div class="pattern-slot" role="listitem">
            <button class="pattern-node" type="button" data-diagram-chunk-id="${escapeHtml(chunk.id)}" aria-pressed="${selectedChunkId === chunk.id}">
              <span class="pattern-role">${escapeHtml(slot.role)}</span>
              <span class="pattern-label">${escapeHtml(chunk.label)}</span>
              <span class="pattern-text">${escapeHtml(chunk.text)}</span>
            </button>
          </div>`;
      })
      .join('');

    const selectedChunk = selectedChunkId ? chunkById.get(selectedChunkId) : null;
    selection.textContent = selectedChunk
      ? `${selectedChunk.role} — ${selectedChunk.label}。${selectedChunk.explanation}`
      : '要素を選択すると、英文と文型図の対応が表示されます。';
    progress.textContent = completed
      ? 'You explored the whole pattern.'
      : `${exploredChunkIds.size} / ${problem.chunks.length} elements explored.`;
    restoreFocus(focusTarget);
  }

  function selectChunk(id, focusType) {
    const chunk = chunkById.get(id);
    if (!chunk) return;
    selectedChunkId = selectedChunkId === id ? null : id;
    exploredChunkIds.add(id);
    render({ type: focusType, id });
    if (!completed && hasExploredAllChunks(problem.chunks, exploredChunkIds)) {
      completed = true;
      onComplete({
        correct: true,
        problemId: problem.id,
        exploredRoles: getExploredRoles(problem.chunks, exploredChunkIds),
      });
      progress.textContent = 'You explored the whole pattern.';
    }
  }

  on(root, 'click', (event) => {
    const sentenceButton = event.target.closest('[data-sentence-chunk-id]');
    if (sentenceButton) {
      selectChunk(sentenceButton.dataset.sentenceChunkId, 'sentence');
      return;
    }
    const diagramButton = event.target.closest('[data-diagram-chunk-id]');
    if (diagramButton) selectChunk(diagramButton.dataset.diagramChunkId, 'diagram');
  });

  on(resetButton, 'click', () => {
    selectedChunkId = null;
    exploredChunkIds.clear();
    completed = false;
    render({ type: 'reset' });
  });

  render();
  return cleanup;
}
