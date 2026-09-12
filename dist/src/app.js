import {
  categoryOptions,
  getInteractionBySlug,
  interactions,
} from './data/interactions.js';
import {
  licenseStatusLabels,
  researchStatusLabels,
  reusePolicyLabels,
  sourceTypeLabels,
} from './data/interaction-schema.js';
import { getLessonBySlug, lessons } from './data/lessons.js';
import { getProblemById } from './data/problems/index.js';
import {
  getResearchReferencesByIds,
  researchLicenseStatusLabels,
  researchReusePolicyLabels,
  researchSourceTypeLabels,
  researchStatusLabels as externalResearchStatusLabels,
} from './data/research/index.js';
import { renderInteractionCard, renderEmptyState, renderDifficulty } from './components/atlas/interactionCard.js';
import { renderFilterBar } from './components/atlas/filterBar.js';
import { renderDemoPanel } from './components/demos/demoPanel.js';
import { demoRegistry, mountDemo } from './components/demos/registry.js';
import { filterInteractions, getAtlasStats, searchInteractions } from './lib/atlas.js';
import { escapeHtml } from './lib/dom.js';
import { registerAtlasWebMcp } from './webmcp.js';

const app = document.querySelector('#app');
const state = { query: '', category: 'all', reusability: 'all', demo: 'all' };

function getRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  const hashParts = hash.split('/');
  if (hashParts[0] === 'interactions' && hashParts[1]) {
    return { page: 'detail', slug: decodeURIComponent(hashParts.slice(1).join('/')) };
  }
  if (hashParts[0] === 'lessons' && hashParts[1]) {
    return { page: 'lesson', slug: decodeURIComponent(hashParts.slice(1).join('/')) };
  }
  return { page: 'atlas' };
}

function categoryLabel(category) {
  return categoryOptions.find((option) => option.id === category)?.label ?? category;
}

function metadataText(value, fallback = 'Not recorded') {
  return escapeHtml(typeof value === 'string' && value.trim() ? value : fallback);
}

function metadataLink(url, label) {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return 'Not recorded';
  return `<a href="${escapeHtml(url)}" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function metadataLabel(value, labels, fallback = 'Not recorded') {
  return escapeHtml(labels[value] ?? value ?? fallback);
}

function renderResearchList(items) {
  return `<ul class="research-points">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderResearchSection(entry) {
  const references = getResearchReferencesByIds(entry.researchRefs);
  const referenceMarkup = references.length
    ? `<div class="research-grid">${references.map((reference) => `
        <article class="research-card">
          <div class="research-card-top">
            <div>
              <p class="card-label">${escapeHtml(reference.id)}</p>
              <h3>${escapeHtml(reference.name)}</h3>
            </div>
            <span class="status-pill">${metadataLabel(reference.researchStatus, externalResearchStatusLabels)}</span>
          </div>
          <dl class="research-list">
            <div><dt>Source type</dt><dd>${metadataLabel(reference.sourceType, researchSourceTypeLabels)}</dd></div>
            <div><dt>Observed patterns</dt><dd>${renderResearchList(reference.observedPatterns)}</dd></div>
            <div><dt>Atlas implication</dt><dd>${renderResearchList(reference.atlasImplications)}</dd></div>
            <div><dt>Learning value</dt><dd>${escapeHtml(reference.learningValue)}</dd></div>
            <div><dt>License</dt><dd>${reference.licenseStatus === 'not-applicable' ? 'Not applicable' : metadataText(reference.license)} · ${metadataLabel(reference.licenseStatus, researchLicenseStatusLabels)}</dd></div>
            <div><dt>Reuse policy</dt><dd>${metadataLabel(reference.reusePolicy, researchReusePolicyLabels)}</dd></div>
            <div><dt>Links</dt><dd>${metadataLink(reference.sourceUrl, 'Open source')}${reference.repositoryUrl ? ` · ${metadataLink(reference.repositoryUrl, 'Open repository')}` : ''}</dd></div>
            <div><dt>Reuse notes</dt><dd>${escapeHtml(reference.reuseNotes)}</dd></div>
          </dl>
        </article>`).join('')}</div>`
    : '<p class="research-empty">No external research recorded yet.</p>';

  return `
    <section class="detail-section research-section" id="research">
      <div class="research-heading">
        <div>
          <p class="section-kicker">Evidence trail</p>
          <h2>Research references</h2>
        </div>
        <span class="research-count">${references.length} ${references.length === 1 ? 'reference' : 'references'}</span>
      </div>
      ${referenceMarkup}
    </section>`;
}

function renderHeader() {
  const stats = getAtlasStats(interactions, demoRegistry);
  return `
    <header class="site-header">
      <div class="shell">
        <div class="topbar">
          <a class="brand" href="#" aria-label="Interactive Grammar Atlas home">
            <span class="brand-mark">A</span>
            <span>Grammar Atlas<small>field notes / 01</small></span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#catalog">Catalog</a>
            ${lessons.map((lesson) => `<a href="#lessons/${escapeHtml(lesson.slug)}">${escapeHtml(lesson.label)}</a>`).join('')}
            <a href="#about">How it works</a>
          </nav>
        </div>
        <p class="header-kicker">Interactive Grammar Atlas</p>
        <h1>英文法を、<span>触って理解する。</span></h1>
        <p class="header-description">文法のインタラクションを、学習者が触るもの・変わるもの・気づくことから記録する図鑑。</p>
        <div class="stats" aria-label="Catalog summary">
          <div class="stat"><strong>${stats.catalogEntries}</strong><span>catalog entries</span></div>
          <div class="stat"><strong>${stats.interactionFamilies}</strong><span>interaction families</span></div>
          <div class="stat"><strong>${stats.workingDemos}</strong><span>working demos</span></div>
        </div>
      </div>
    </header>`;
}

function renderToolbar() {
  return `
    <section class="toolbar" aria-label="Interaction catalog filters">
      <div>
        <label class="toolbar-label" for="interaction-search">Search the atlas</label>
        <div class="search-box">
          <input id="interaction-search" type="search" value="${escapeHtml(state.query)}" placeholder="title, description, grammar" autocomplete="off" />
        </div>
      </div>
      <div>
        <span class="toolbar-label">Category</span>
        <div class="filter-list" role="group" aria-label="Filter by category">
          ${renderFilterBar(categoryOptions, state.category)}
        </div>
        <div class="toolbar-options">
          <label class="select-filter" for="reusability-filter">
            <span>Reusability</span>
            <select id="reusability-filter" aria-label="Filter by reusability">
              <option value="all"${state.reusability === 'all' ? ' selected' : ''}>All ranks</option>
              <option value="S"${state.reusability === 'S' ? ' selected' : ''}>S — highest reuse</option>
              <option value="A"${state.reusability === 'A' ? ' selected' : ''}>A — strong reuse</option>
              <option value="B"${state.reusability === 'B' ? ' selected' : ''}>B — limited reuse</option>
            </select>
          </label>
          <label class="select-filter" for="demo-filter">
            <span>Demo</span>
            <select id="demo-filter" aria-label="Filter by demo status">
              <option value="all"${state.demo === 'all' ? ' selected' : ''}>All demos</option>
              <option value="available"${state.demo === 'available' ? ' selected' : ''}>Available now</option>
              <option value="planned"${state.demo === 'planned' ? ' selected' : ''}>Planned</option>
            </select>
          </label>
        </div>
        <div class="toolbar-actions">
          <button class="button secondary" type="button" id="reset-filters">Reset filters</button>
        </div>
      </div>
    </section>`;
}

function renderLessonIndex() {
  return `
    <section class="lesson-index" id="lessons" aria-labelledby="lesson-index-heading">
      <div class="lesson-index-copy">
        <p class="section-kicker">Guided lessons</p>
        <h2 id="lesson-index-heading">図鑑の操作を、学習の流れへ。</h2>
        <p>LessonはRegistryのProblem IDから構成され、同じComponentを別の文脈で再利用します。</p>
      </div>
      <div class="lesson-index-list">
        ${lessons
          .map(
            (lesson) => `
              <a class="lesson-index-card" href="#lessons/${escapeHtml(lesson.slug)}">
                <span class="step-label">${escapeHtml(lesson.label)}</span>
                <strong>${escapeHtml(lesson.title)}</strong>
                <span>${escapeHtml(lesson.learningGoal)}</span>
              </a>`,
          )
          .join('')}
      </div>
    </section>`;
}

function getVisibleInteractions() {
  return searchInteractions(
    filterInteractions(interactions, state.category, {
      reusability: state.reusability,
      demo: state.demo,
    }),
    state.query,
  );
}

function updateResults() {
  const visible = getVisibleInteractions();
  const results = app.querySelector('[data-results]');
  const count = app.querySelector('[data-results-count]');
  if (!results || !count) return;
  count.textContent = `${visible.length} ${visible.length === 1 ? 'entry' : 'entries'}`;
  results.innerHTML = visible.length ? visible.map(renderInteractionCard).join('') : renderEmptyState();
}

function showAtlasSearch(query) {
  state.query = query;
  if (getRoute().page !== 'atlas') {
    renderAtlas();
  } else {
    const searchInput = app.querySelector('#interaction-search');
    if (searchInput) searchInput.value = query;
    updateResults();
  }
  return getVisibleInteractions();
}

function renderAtlas() {
  document.title = 'Interactive Grammar Atlas';
  app.innerHTML = `
    ${renderHeader()}
    <main class="catalog-section shell" id="catalog">
      ${renderToolbar()}
      ${renderLessonIndex()}
      <div class="results-heading">
        <h2>Explore interactions</h2>
        <span class="results-count" data-results-count></span>
      </div>
      <section class="interaction-grid" data-results aria-live="polite"></section>
    </main>
    <footer class="site-footer"><div class="shell">Phase 3B · Research the interaction, then reuse the learning part.</div></footer>`;

  app.querySelector('#interaction-search').addEventListener('input', (event) => {
    state.query = event.target.value;
    updateResults();
  });
  app.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderAtlas();
      app.querySelector(`[data-category="${state.category}"]`)?.focus();
    });
  });
  app.querySelector('#reusability-filter').addEventListener('change', (event) => {
    state.reusability = event.target.value;
    updateResults();
  });
  app.querySelector('#demo-filter').addEventListener('change', (event) => {
    state.demo = event.target.value;
    updateResults();
  });
  app.querySelector('#reset-filters').addEventListener('click', () => {
    state.query = '';
    state.category = 'all';
    state.reusability = 'all';
    state.demo = 'all';
    renderAtlas();
    app.querySelector('#reset-filters')?.focus();
  });
  updateResults();
}

function renderDetail(entry) {
  document.title = `${entry.title} · Interactive Grammar Atlas`;
  const demoMountId = 'demo-mount';
  const hasDemo = Boolean(entry.demoType && typeof demoRegistry[entry.demoType]?.mount === 'function');
  const demoMarkup = hasDemo
    ? renderDemoPanel(entry, demoMountId)
    : `<div class="planned-demo"><h3>Demo planned</h3><p>この項目は図鑑に登録済みです。学習効果と再利用性を検討しながら、次のDemo候補として実装します。</p></div>`;

  app.innerHTML = `
    <main class="detail-page shell">
      <div class="detail-topline">
        <a class="back-link" href="#">← Back to catalog</a>
        <span class="entry-id">${escapeHtml(entry.id)}</span>
      </div>
      <header class="detail-header">
        <p class="header-kicker">${categoryLabel(entry.category)} · ${entry.demoType ? 'Demo ready' : 'Catalog entry'}</p>
        <h1>${escapeHtml(entry.title)}</h1>
        <p>${escapeHtml(entry.description)}</p>
        <div class="detail-meta">
          <div class="detail-meta-item"><span class="meta-label">Implementation</span>${renderDifficulty(entry.implementationDifficulty)}</div>
          <div class="detail-meta-item"><span class="meta-label">Reusability</span><strong>${entry.reusability} rank</strong></div>
          <div class="detail-meta-item"><span class="meta-label">Action</span><strong>${escapeHtml(entry.userAction)}</strong></div>
        </div>
      </header>

      <section class="detail-section" id="about">
        <p class="section-kicker">The learning loop</p>
        <h2>操作から、気づきへ。</h2>
        <div class="learning-sequence">
          <div class="sequence-step"><span class="step-label">01 · Touch</span><strong>${escapeHtml(entry.touchTarget)}</strong><p>${escapeHtml(entry.userAction)}</p></div>
          <div class="sequence-step"><span class="step-label">02 · Change</span><strong>${escapeHtml(entry.changingElement)}</strong><p>操作の結果を目で追う</p></div>
          <div class="sequence-step"><span class="step-label">03 · Notice</span><strong>${escapeHtml(entry.insight)}</strong><p>文法規則との関係に気づく</p></div>
        </div>
      </section>

      <section class="detail-section">
        <p class="section-kicker">Try it</p>
        <h2>Interactive Demo</h2>
        ${demoMarkup}
      </section>

      <section class="detail-section">
        <div class="detail-grid">
          <div class="info-card">
            <h3>Learning brief</h3>
            <dl class="info-list">
              <div><dt>Learning goal</dt><dd>${escapeHtml(entry.learningGoal)}</dd></div>
              <div><dt>Target grammar</dt><dd>${entry.targetGrammar.map(escapeHtml).join(' / ')}</dd></div>
              <div><dt>Interaction type</dt><dd>${entry.interactionType.map(escapeHtml).join(' / ')}</dd></div>
              <div><dt>Feedback</dt><dd>${entry.feedbackType.map(escapeHtml).join(' / ')}</dd></div>
            </dl>
          </div>
          <div class="info-card">
            <h3>Reference notes</h3>
            <dl class="info-list">
              <div><dt>Source type</dt><dd>${metadataLabel(entry.sourceType, sourceTypeLabels)}</dd></div>
              <div><dt>Research status</dt><dd>${metadataLabel(entry.researchStatus, researchStatusLabels)}</dd></div>
              <div><dt>Source</dt><dd>${metadataText(entry.sourceName)}${entry.sourceUrl ? ` · ${metadataLink(entry.sourceUrl, 'Open source')}` : ''}</dd></div>
              <div><dt>Repository</dt><dd>${metadataLink(entry.repositoryUrl, 'Open repository')}</dd></div>
              <div><dt>License</dt><dd>${entry.licenseStatus === 'not-applicable' ? 'Not applicable' : metadataText(entry.license)}</dd></div>
              <div><dt>License status</dt><dd>${metadataLabel(entry.licenseStatus, licenseStatusLabels)}</dd></div>
              <div><dt>Reuse policy</dt><dd>${metadataLabel(entry.reusePolicy, reusePolicyLabels)}</dd></div>
              <div><dt>Notes</dt><dd>${metadataText(entry.notes, 'Not recorded')}</dd></div>
            </dl>
          </div>
        </div>
      </section>
      ${renderResearchSection(entry)}
    </main>
    <footer class="site-footer"><div class="shell">Interactive Grammar Atlas · one interaction, one reusable learning part.</div></footer>`;

  if (hasDemo) mountDemo(entry.demoType, app.querySelector(`#${demoMountId}`));
}

function renderLesson(lesson) {
  document.title = `${lesson.label}: ${lesson.title} · Interactive Grammar Atlas`;
  let stepIndex = 0;
  let cleanup = null;

  app.innerHTML = `
    <main class="lesson-page shell">
      <div class="detail-topline">
        <a class="back-link" href="#">← Back to catalog</a>
        <span class="entry-id">${escapeHtml(lesson.id)}</span>
      </div>
      <header class="lesson-header">
        <p class="header-kicker">${escapeHtml(lesson.label)}</p>
        <h1>${escapeHtml(lesson.title)}</h1>
        <p>${escapeHtml(lesson.description)}</p>
        <div class="lesson-goal">
          <span class="meta-label">Learning goal</span>
          <p>${escapeHtml(lesson.learningGoal)}</p>
        </div>
      </header>
      <section class="lesson-player" aria-labelledby="lesson-step-heading">
        <div class="lesson-progress">
          <strong data-step-label></strong>
          <span class="progress-text" data-progress-text></span>
          <span class="progress-dots" data-progress-dots aria-hidden="true"></span>
        </div>
        <div class="lesson-step-copy">
          <p class="section-kicker">Current step</p>
          <h2 id="lesson-step-heading" tabindex="-1" data-step-title></h2>
          <p data-step-instruction></p>
        </div>
        <div class="lesson-component" data-lesson-component></div>
        <div class="lesson-completion" data-lesson-completion role="status" aria-live="polite"></div>
        <nav class="lesson-navigation" aria-label="Lesson navigation">
          <button class="button secondary" type="button" data-lesson-previous>← Previous</button>
          <button class="button" type="button" data-lesson-next>Next →</button>
        </nav>
      </section>
    </main>
    <footer class="site-footer"><div class="shell">Lesson prototype · one component, many questions.</div></footer>`;

  const stepLabel = app.querySelector('[data-step-label]');
  const progressText = app.querySelector('[data-progress-text]');
  const progressDots = app.querySelector('[data-progress-dots]');
  const stepTitle = app.querySelector('[data-step-title]');
  const stepInstruction = app.querySelector('[data-step-instruction]');
  const componentRoot = app.querySelector('[data-lesson-component]');
  const completion = app.querySelector('[data-lesson-completion]');
  const previousButton = app.querySelector('[data-lesson-previous]');
  const nextButton = app.querySelector('[data-lesson-next]');

  function renderStep(shouldFocus = true) {
    const step = lesson.steps[stepIndex];
    const requiresCompletion = Boolean(getProblemById(step.problemId)?.completion);
    let stepComplete = !requiresCompletion;
    cleanup?.();
    cleanup = null;
    stepLabel.textContent = `Step ${stepIndex + 1} / ${lesson.steps.length}`;
    progressText.textContent = `${Math.round(((stepIndex + 1) / lesson.steps.length) * 100)}% complete`;
    progressDots.innerHTML = lesson.steps
      .map((_, index) => `<span class="progress-dot${index <= stepIndex ? ' is-complete' : ''}" aria-hidden="true"></span>`)
      .join('');
    stepTitle.textContent = step.title;
    stepInstruction.textContent = step.instruction;
    completion.textContent = '';
    previousButton.disabled = stepIndex === 0;
    nextButton.disabled = stepIndex === lesson.steps.length - 1 || !stepComplete;
    cleanup = mountDemo(step.interactionType, componentRoot, {
      problemId: step.problemId,
      onComplete(result) {
        if (result.correct) {
          completion.textContent = 'Step complete — 次の気づきへ進めます。';
          stepComplete = true;
          nextButton.disabled = stepIndex === lesson.steps.length - 1;
        }
      },
    });
    if (shouldFocus) stepTitle.focus({ preventScroll: true });
  }

  previousButton.addEventListener('click', () => {
    if (stepIndex === 0) return;
    stepIndex -= 1;
    renderStep();
  });
  nextButton.addEventListener('click', () => {
    if (stepIndex >= lesson.steps.length - 1) return;
    stepIndex += 1;
    renderStep();
  });

  renderStep(false);
}

function render() {
  const route = getRoute();
  const entry = route.page === 'detail' ? getInteractionBySlug(route.slug) : null;
  const lesson = route.page === 'lesson' ? getLessonBySlug(route.slug) : null;
  if (route.page === 'detail' && entry) {
    renderDetail(entry);
  } else if (route.page === 'lesson' && lesson) {
    renderLesson(lesson);
  } else {
    renderAtlas();
  }
}

window.addEventListener('hashchange', render);
registerAtlasWebMcp({ getRoute, showAtlasSearch });
render();
