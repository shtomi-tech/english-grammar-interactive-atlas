import { escapeHtml } from '../../lib/dom.js';

export function renderDemoPanel(entry, contentId) {
  return `
    <section class="demo-panel" aria-labelledby="demo-heading">
      <header class="demo-header">
        <div>
          <p class="section-kicker">Interactive Demo</p>
          <h3 id="demo-heading">${escapeHtml(entry.title)}</h3>
          <p>操作すると、英文のどこが変わったかを確認できます。</p>
        </div>
        <span class="demo-pill">${escapeHtml(entry.reusability)} rank</span>
      </header>
      <div class="demo-body" id="${contentId}"></div>
      <footer class="demo-footer">
        <span><strong>Touch</strong> ${escapeHtml(entry.touchTarget)}</span>
        <span><strong>Change</strong> ${escapeHtml(entry.changingElement)}</span>
      </footer>
    </section>`;
}
