const CATALOG_URL = '../data/review_points.json';

let catalogCache = null;

export async function loadReviewPointsCatalog() {
  if (catalogCache) return catalogCache;
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error(`无法加载审查点分类: ${res.status}`);
  const data = await res.json();
  catalogCache = data.points || {};
  return catalogCache;
}

export function parseDecisionSortKey(dateStr) {
  if (!dateStr) return 99999999;
  const s = String(dateStr).trim();
  const m = s.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!m) return 99999999;
  const y = parseInt(m[1], 10);
  const mo = m[2] ? parseInt(m[2], 10) : 0;
  const d = m[3] ? parseInt(m[3], 10) : 0;
  return y * 10000 + mo * 100 + d;
}

export function isReviewableCase(c) {
  if (!c?.review_points?.length) return false;
  const skip = new Set(['机制说明', '统计', '机制统计']);
  if (skip.has(c.deal_type)) return false;
  const skipOut = new Set(['机制运行', '无公开否决']);
  if (skipOut.has(c.outcome)) return false;
  return true;
}

/** 按决定日期排序，检测每个案例中首次出现的审查点 */
export function buildNoveltyIndex(cases, catalog) {
  const reviewable = cases.filter(isReviewableCase);
  const sorted = [...reviewable].sort(
    (a, b) => parseDecisionSortKey(a.decision_date) - parseDecisionSortKey(b.decision_date)
  );

  const seen = new Set();
  const index = new Map();
  const timeline = [];

  for (const c of sorted) {
    const novel = [];
    for (const rpId of c.review_points) {
      if (!seen.has(rpId)) {
        const meta = catalog[rpId] || { label: rpId, desc: '' };
        novel.push({ id: rpId, label: meta.label, desc: meta.desc });
      }
    }
    index.set(c.id, { case: c, novel });
    if (novel.length) timeline.push({ case: c, novel });
    for (const rpId of c.review_points) seen.add(rpId);
  }

  return { index, timeline, seenCount: seen.size };
}

/** 每种审查点首次出现的案例 */
export function buildFirstAppearance(cases, catalog) {
  const { index, timeline } = buildNoveltyIndex(cases, catalog);
  const first = new Map();
  for (const { case: c, novel } of timeline) {
    for (const p of novel) {
      if (!first.has(p.id)) first.set(p.id, { point: p, case: c });
    }
  }
  return first;
}

export function renderNovelBadges(novelPoints) {
  if (!novelPoints?.length) return '';
  return novelPoints
    .map(
      (p) =>
        `<span class="review-point-badge review-point-new" title="${escapeAttr(p.desc || p.label)}">🆕 ${escapeHtml(p.label)}</span>`
    )
    .join(' ');
}

export function renderAllReviewPoints(pointIds, catalog, novelIds) {
  if (!pointIds?.length) return '';
  const novelSet = new Set(novelIds || []);
  return pointIds
    .map((id) => {
      const meta = catalog[id] || { label: id };
      const cls = novelSet.has(id) ? 'review-point-new' : 'review-point-known';
      const prefix = novelSet.has(id) ? '🆕 ' : '';
      return `<span class="review-point-badge ${cls}" title="${escapeAttr(meta.desc || '')}">${prefix}${escapeHtml(meta.label)}</span>`;
    })
    .join(' ');
}

export function renderNovelAlertBox(novelPoints, caseLabel) {
  if (!novelPoints?.length) return '';
  const items = novelPoints
    .map((p) => `<li><strong>${escapeHtml(p.label)}</strong>${p.desc ? ` — ${escapeHtml(p.desc)}` : ''}</li>`)
    .join('');
  return `
    <div class="novel-review-alert" role="status">
      <p class="novel-review-alert-title">🆕 本案例首次出现以下审查关注点${caseLabel ? `（${escapeHtml(caseLabel)}）` : ''}</p>
      <ul class="novel-review-alert-list">${items}</ul>
      <p class="novel-review-alert-note">无论最终批准与否，只要该审查维度在公开案例中首次被关注，即向读者提醒。</p>
    </div>`;
}

export function renderNoveltyFeed(timeline, limit = 15) {
  const section = document.getElementById('novel-review-feed');
  if (!section) return;

  const items = [...timeline].reverse().slice(0, limit);
  if (!items.length) {
    section.innerHTML = '<p class="empty-state">暂无带审查点标注的案例。</p>';
    return;
  }

  section.innerHTML = items
    .map(({ case: c, novel }) => {
      const novelHtml = novel
        .map((p) => `<span class="review-point-badge review-point-new">${escapeHtml(p.label)}</span>`)
        .join(' ');
      return `
        <article class="novel-feed-item">
          <header>
            <time>${escapeHtml(c.decision_date || '—')}</time>
            <strong>${escapeHtml(c.country_name || c.country)} · ${escapeHtml(c.target_company)}</strong>
            <span class="outcome outcome-${escapeAttr(c.outcome)}">${escapeHtml(c.outcome)}</span>
          </header>
          <p class="novel-feed-label">首次出现审查点：</p>
          <div class="novel-feed-badges">${novelHtml}</div>
          <a href="country.html?c=${escapeAttr(c.country)}#${escapeAttr(c.id)}">查看案例 ↗</a>
        </article>`;
    })
    .join('');
}

export async function initNoveltyAlerts(cases) {
  const catalog = await loadReviewPointsCatalog();
  const { index, timeline, seenCount } = buildNoveltyIndex(cases, catalog);
  renderNoveltyFeed(timeline);

  const caseCountEl = document.getElementById('novel-case-count');
  const typesEl = document.getElementById('novel-point-types');
  if (caseCountEl) caseCountEl.textContent = String(timeline.length);
  if (typesEl) typesEl.textContent = String(seenCount);

  return { catalog, index, timeline, seenCount };
}

export function getNoveltyForCase(caseId, index) {
  return index.get(caseId)?.novel || [];
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
}
