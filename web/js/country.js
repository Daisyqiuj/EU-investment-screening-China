import { loadCases, COUNTRY_NAMES } from './data.js';

async function init() {
  const params = new URLSearchParams(location.search);
  const code = params.get('c');
  if (!code) {
    window.location.href = 'map.html';
    return;
  }

  const data = await loadCases();
  const cases = data.cases.filter((c) => c.country === code);
  const name =
    COUNTRY_NAMES[code] ||
    cases[0]?.country_name ||
    code;

  document.title = `${name} — 投资审查案例`;
  document.getElementById('country-title').textContent = `${name}（${code}）涉华投资审查案例`;
  document.getElementById('breadcrumb-country').textContent = name;
  document.getElementById('last-updated').textContent =
    new Date(data.meta.last_updated).toLocaleString('zh-CN');

  const container = document.getElementById('cases-container');
  if (!cases.length) {
    container.innerHTML = `<p class="empty-state">暂无该国案例记录。<a href="map.html">返回地图</a></p>`;
    return;
  }

  container.innerHTML = cases.map((c) => renderFullCase(c)).join('');
}

function renderFullCase(c) {
  const timeline = (c.timeline || [])
    .map((t) => `<li><span class="date">${esc(t.date)}</span>${esc(t.event)}</li>`)
    .join('');
  const sources = (c.sources || [])
    .map((s) => `<li><a href="${escAttr(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`)
    .join('');

  return `
    <article class="case-card" id="${escAttr(c.id)}">
      <h3>${esc(c.target_company)}</h3>
      <div class="meta-row">
        <span>案例编号: ${esc(c.id)}</span>
        <span>投资者: ${esc(c.investor)}</span>
        <span>行业: ${esc(c.target_sector)}</span>
        <span>交易类型: ${esc(c.deal_type)}</span>
        <span>决定日期: ${esc(c.decision_date || '—')}</span>
        <span class="outcome outcome-${c.outcome}">${esc(c.outcome)}</span>
      </div>
      <p><strong>审查机制：</strong>${esc(c.mechanism)}</p>
      <p><strong>欧盟通报：</strong>${c.eu_notified ? '是' : '否'}</p>
      <p>${esc(c.summary_zh)}</p>
      <p style="color:var(--muted);font-size:0.85rem;margin-top:0.5rem">${esc(c.summary_en)}</p>
      <h4 style="margin-top:1rem;font-size:0.9rem;color:var(--accent2)">时间线</h4>
      <ul class="timeline">${timeline}</ul>
      <h4 style="margin-top:1rem;font-size:0.9rem;color:var(--accent2)">参考来源</h4>
      <ul style="list-style:disc;padding-left:1.25rem;font-size:0.85rem">${sources}</ul>
      <div style="margin-top:0.5rem">${(c.tags || []).map((t) => `<span class="badge" style="margin-right:0.35rem">${esc(t)}</span>`).join('')}</div>
    </article>`;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function escAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
}

init().catch(console.error);
