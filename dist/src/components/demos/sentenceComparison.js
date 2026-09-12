import { escapeHtml } from '../../lib/dom.js';
import { prepareMountRoot } from '../../lib/lifecycle.js';
import {
  getChunkIdsForDifference,
  getDifferenceByChunkId,
  hasExploredAllDifferences,
} from '../../lib/grammar/sentence-comparison.js';

export function mountSentenceComparison(root, problem, options = {}) {
  const { on, cleanup } = prepareMountRoot(root);
  if (!problem || problem.type !== 'sentence-comparison') {
    throw new TypeError('Sentence Comparison needs a sentence-comparison problem');
  }
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const exploredDifferenceIds = new Set();
  let selectedDifferenceId = null;
  let selectedChunkId = null;
  let completed = false;

  root.innerHTML = `
    <p class="instruction">${escapeHtml(problem.prompt)}</p>
    <div class="demo-stage sentence-comparison-stage">
      <div class="comparison-grid" data-comparison-sentences></div>
      <div class="comparison-selection" data-comparison-selection role="status" aria-live="polite">違いのある語句を選択すると、意味の対応が表示されます。</div>
      <p class="comparison-progress" data-comparison-progress aria-live="polite"></p>
      <div class="demo-actions">
        <button class="button secondary" type="button" data-comparison-reset>Reset</button>
      </div>
      <p class="explanation" data-comparison-explanation>${escapeHtml(problem.explanation)}</p>
    </div>`;

  const sentenceArea = root.querySelector('[data-comparison-sentences]');
  const selection = root.querySelector('[data-comparison-selection]');
  const progress = root.querySelector('[data-comparison-progress]');
  const resetButton = root.querySelector('[data-comparison-reset]');

  function restoreFocus(focusTarget) {
    if (!focusTarget) return;
    if (focusTarget.type === 'chunk') {
      [...root.querySelectorAll('[data-comparison-chunk-id]')]
        .find(
          (button) =>
            button.dataset.comparisonChunkId === focusTarget.chunkId &&
            button.dataset.comparisonSentenceId === focusTarget.sentenceId,
        )
        ?.focus();
    }
    if (focusTarget.type === 'reset') resetButton.focus();
  }

  function render(focusTarget = null) {
    sentenceArea.innerHTML = problem.sentences
      .map((sentence, index) => {
        const sentenceLabel = `Sentence ${String.fromCharCode(65 + index)}`;
        return `
          <section class="comparison-sentence-card" data-comparison-sentence-id="${escapeHtml(sentence.id)}" aria-label="${escapeHtml(sentenceLabel)}">
            <h4>${escapeHtml(sentenceLabel)}</h4>
            <p class="comparison-sentence-text">${escapeHtml(sentence.text)}</p>
            <div class="comparison-chunk-row" role="group" aria-label="${escapeHtml(`${sentenceLabel} chunks`)}">
              ${sentence.chunks
                .map((chunk) => {
                  const difference = getDifferenceByChunkId(problem.differences, chunk.id);
                  const related = selectedDifferenceId === difference?.id && getChunkIdsForDifference(problem.differences, difference.id).includes(chunk.id);
                  const selected = selectedChunkId === chunk.id;
                  const stateLabel = selected ? 'Selected' : related ? 'Compared' : difference ? 'Difference' : 'Shared';
                  return `
                    <button class="comparison-chunk${related ? ' is-related' : ''}${selected ? ' is-selected' : ''}" type="button" data-comparison-sentence-id="${escapeHtml(sentence.id)}" data-comparison-chunk-id="${escapeHtml(chunk.id)}" aria-pressed="${Boolean(related)}">
                      <span class="comparison-chunk-text">${escapeHtml(chunk.text)}</span>
                      <span class="comparison-chunk-state">${stateLabel}</span>
                    </button>`;
                })
                .join('')}
            </div>
          </section>`;
      })
      .join('');

    if (!selectedDifferenceId) {
      const selectedChunk = problem.sentences
        .flatMap((sentence) => sentence.chunks)
        .find((chunk) => chunk.id === selectedChunkId);
      selection.textContent = selectedChunk
        ? `${selectedChunk.text} は両方の文に共通しています。違いのある語句を選択してください。`
        : '違いのある語句を選択すると、意味の対応が表示されます。';
    } else {
      const difference = problem.differences.find((entry) => entry.id === selectedDifferenceId);
      selection.textContent = `Difference: ${difference.label}。Meaning A: ${difference.meaningLeft} Meaning B: ${difference.meaningRight} Why it matters: ${difference.explanation}`;
    }
    progress.textContent = completed
      ? 'You explored all sentence differences.'
      : `${exploredDifferenceIds.size} / ${problem.differences.length} differences explored.`;
    restoreFocus(focusTarget);
  }

  function selectChunk(sentenceId, chunkId) {
    const sentence = problem.sentences.find((entry) => entry.id === sentenceId);
    const chunk = sentence?.chunks.find((entry) => entry.id === chunkId);
    if (!chunk) return;
    const difference = getDifferenceByChunkId(problem.differences, chunk.id);
    selectedChunkId = chunk.id;
    selectedDifferenceId = difference?.id ?? null;
    if (difference) exploredDifferenceIds.add(difference.id);
    render({ type: 'chunk', sentenceId, chunkId });
    if (!completed && hasExploredAllDifferences(problem.differences, exploredDifferenceIds)) {
      completed = true;
      onComplete({
        correct: true,
        problemId: problem.id,
        exploredDifferenceIds: [...exploredDifferenceIds],
      });
      progress.textContent = 'You explored all sentence differences.';
    }
  }

  on(root, 'click', (event) => {
    const chunkButton = event.target.closest('[data-comparison-chunk-id]');
    if (chunkButton) {
      selectChunk(chunkButton.dataset.comparisonSentenceId, chunkButton.dataset.comparisonChunkId);
    }
  });

  on(resetButton, 'click', () => {
    selectedDifferenceId = null;
    selectedChunkId = null;
    exploredDifferenceIds.clear();
    completed = false;
    render({ type: 'reset' });
  });

  render();
  return cleanup;
}
