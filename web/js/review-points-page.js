import { loadCases } from './data.js';
import {
  loadReviewPointsCatalog,
  buildNoveltyIndex,
  buildFirstAppearance,
  getNoveltyForCase,
  renderNovelBadges,
  renderAllReviewPoints,
  isReviewableCase,
  parseDecisionSortKey,
} from './review-points.js';

async function init() {
  const data = await loadCases();
  const catalog = await loadReviewPointsCatalog();
  const { index, timeline, seenCount } = buildNoveltyIndex(data.cases, catalog);

  document.getElementById('last-updated').textContent =
    new Date(data.meta.last_updated).toLocaleString('zh-CN');
  document.getElementById('novel-case-count').textContent = String(timeline.length);
  document.getElementById('novel-point-types').textContent = String(seenCount);
  document.getElementById('disclaimer-text').textContent = data.meta.disclaimer || '';

  renderNoveltyFeedFull(timeline);
  renderCatalog(buildFirstAppearance(data.cases, catalog));
  renderTable(data.cases, catalog, index);
  setupFilters();
}

function renderNoveltyFeedFull(timeline) {
  const el = document.getElementById('novel-review-feed');
  if (!el) return;
  const items = [...timeline].reverse();
  if (!items.length) {
    el.innerHTML = '<p class="empty-state">暂无带审查点标注的案例。</p>';
    return;
  }
  el.innerHTML = items
    .map(({ case: c, novel }) => {
      const novelHtml = novel
        .map((p) => `<span class="review-point-badge review-point-new">${esc(p.label)}</span>`)
        .join(' ');
      return `
        <article class="novel-feed-item">
          <header>
            <time>${esc(c.decision_date || '—')}</time>
            <strong>${esc(c.country_name || c.country)} · ${esc(c.target_company)}</strong>
            <span class="outcome outcome-${escAttr(c.outcome)}">${esc(c.outcome)}</span>
          </header>
          <p class="novel-feed-label">首次出现审查点：</p>
          <div class="novel-feed-badges">${novelHtml}</div>
          <a href="country.html?c=${escAttr(c.country)}#${escAttr(c.id)}">查看案例 ↗</a>
        </article>`;
    })
    .join('');
}

function renderCatalog(firstAppearance) {
  const el = document.getElementById('review-point-catalog');
  if (!el) return;
  const entries = [...firstAppearance.entries()].sort((a, b) =>
    parseDecisionSortKey(a[1].case.decision_date) - parseDecisionSortKey(b[1].case.decision_date)
  );
  el.innerHTML = entries
    .map(([, { point, case: c }]) => `
      <article class="catalog-item">
        <h3 class="catalog-item-title"><span class="review-point-badge review-point-new">🆕 ${esc(point.label)}</span></h3>
        <p class="catalog-item-desc">${esc(point.desc || '')}</p>
        <p class="catalog-item-case">
          首次出现：<time>${esc(c.decision_date || '—')}</time>
          · <a href="country.html?c=${escAttr(c.country)}#${escAttr(c.id)}">${esc(c.country_name)} · ${esc(c.target_company)}</a>
          · <span class="outcome outcome-${escAttr(c.outcome)}">${esc(c.outcome)}</span>
        </p>
      </article>`)
    .join('');
}

function renderTable(cases, catalog, index) {
  const tbody = document.getElementById('review-points-tbody');
  if (!tbody) return;
  const reviewable = cases.filter(isReviewableCase);
  const sorted = [...reviewable].sort(
    (a, b) => parseDecisionSortKey(b.decision_date) - parseDecisionSortKey(a.decision_date)
  );
  tbody.innerHTML = sorted
    .map((c) => {
      const novel = getNoveltyForCase(c.id, index);
      const novelIds = novel.map((p) => p.id);
      return `
        <tr data-has-novel="${novel.length ? '1' : '0'}">
          <td>${esc(c.decision_date || '—')}</td>
          <td><a href="country.html?c=${escAttr(c.country)}">${esc(c.country_name)}</a></td>
          <td><a href="country.html?c=${escAttr(c.country)}#${escAttr(c.id)}">${esc(c.target_company)}</a></td>
          <td><span class="outcome outcome-${escAttr(c.outcome)}">${esc(c.outcome)}</span></td>
          <td class="novel-cell">${novel.length ? renderNovelBadges(novel) : '—'}</td>
          <td>${renderAllReviewPoints(c.review_points, catalog, novelIds)}</td>
        </tr>`;
    })
    .join('');
}

function setupFilters() {
  const novelOnly = document.getElementById('filter-novel-only');
  const search = document.getElementById('filter-search');
  const apply = () => {
    const q = (search?.value || '').toLowerCase();
    const only = novelOnly?.checked;
    document.querySelectorAll('#review-points-tbody tr').forEach((tr) => {
      const show =
        (!only || tr.dataset.hasNovel === '1') &&
        (!q || tr.textContent.toLowerCase().includes(q));
      tr.style.display = show ? '' : 'none';
    });
  };
  novelOnly?.addEventListener('change', apply);
  search?.addEventListener('input', apply);
  apply();
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function escAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
}

init().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<p class="empty-state">加载失败: ${esc(e.message)}</p>`);
});
