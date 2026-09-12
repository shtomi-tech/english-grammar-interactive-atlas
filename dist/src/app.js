import { categoryOptions, getInteractionBySlug, interactions } from './data/interactions.js';
import { renderInteractionCard, renderEmptyState, renderDifficulty } from './components/atlas/interactionCard.js';
import { renderFilterBar } from './components/atlas/filterBar.js';
import { renderDemoPanel } from './components/demos/demoPanel.js';
import { demoRegistry } from './components/demos/registry.js';
import { filterInteractions, getAtlasStats, searchInteractions } from './lib/atlas.js';
import { escapeHtml } from './lib/dom.js';
import { registerAtlasWebMcp } from './webmcp.js';

const app = document.querySelector('#app');
const state = { query: '', category: 'all' };

function getRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  const hashParts = hash.split('/');
  if (hashParts[0] === 'interactions' && hashParts[1]) {
    return { page: 'detail', slug: decodeURIComponent(hashParts.slice(1).join('/')) };
  }
  return { page: 'atlas' };
}

function categoryLabel(category) {
  return categoryOptions.find((option) => option.id === category)?.label ?? category;
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
      </div>
    </section>`;
}

function getVisibleInteractions() {
  return searchInteractions(filterInteractions(interactions, state.category), state.query);
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
      <div class="results-heading">
        <h2>Explore interactions</h2>
        <span class="results-count" data-results-count></span>
      </div>
      <section class="interaction-grid" data-results aria-live="polite"></section>
    </main>
    <footer class="site-footer"><div class="shell">Phase 1 · Research the interaction, then reuse the learning part.</div></footer>`;

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
  updateResults();
}

function renderDetail(entry) {
  document.title = `${entry.title} · Interactive Grammar Atlas`;
  const demoMountId = 'demo-mount';
  const hasDemo = Boolean(entry.demoType && demoRegistry[entry.demoType]);
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
              <div><dt>Source</dt><dd>${escapeHtml(entry.sourceName ?? 'Not recorded')}</dd></div>
              <div><dt>Repository</dt><dd>${entry.repositoryUrl ? `<a href="${escapeHtml(entry.repositoryUrl)}" rel="noreferrer">Open repository</a>` : 'Not recorded'}</dd></div>
              <div><dt>License</dt><dd>${escapeHtml(entry.license ?? 'Not recorded')}</dd></div>
              <div><dt>Reuse policy</dt><dd>${escapeHtml(entry.reusePolicy)}</dd></div>
              <div><dt>Notes</dt><dd>${escapeHtml(entry.notes ?? '—')}</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </main>
    <footer class="site-footer"><div class="shell">Interactive Grammar Atlas · one interaction, one reusable learning part.</div></footer>`;

  if (hasDemo) demoRegistry[entry.demoType](app.querySelector(`#${demoMountId}`));
}

function render() {
  const route = getRoute();
  const entry = route.page === 'detail' ? getInteractionBySlug(route.slug) : null;
  if (route.page === 'detail' && entry) {
    renderDetail(entry);
  } else {
    renderAtlas();
  }
}

window.addEventListener('hashchange', render);
registerAtlasWebMcp({ getRoute, showAtlasSearch });
render();
