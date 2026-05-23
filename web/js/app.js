import { loadCases, countByCountry, countByOutcome } from './data.js';
import { CHART_THEME, chartOptions } from './chart-theme.js';
import { initPodcast } from './podcast.js';
import { initTrendAnimation } from './trend-animation.js';

const OUTCOME_COLORS = {
  '禁止': '#FF7043',
  '附条件批准': '#FFB74D',
  '批准': '#4FC3F7',
  '机制运行': '#81B4D9',
  '政府干预': '#FF8A65',
  '交易失败': '#FFB74D',
  '审查中': '#29B6F6',
  '无公开否决': '#5A6A7C',
  '限制参与': '#FF7043',
};

async function init() {
  const data = await loadCases();
  document.getElementById('last-updated').textContent =
    new Date(data.meta.last_updated).toLocaleString('zh-CN');
  document.getElementById('case-count').textContent = data.cases.length;
  const note = data.meta.completeness_note ? ` ${data.meta.completeness_note}` : '';
  document.getElementById('disclaimer-text').textContent = data.meta.disclaimer + note;

  renderFrameworkUpdates(data);
  renderTable(data.cases);
  setupFilters(data.cases);
  renderCharts(data);
  initPodcast();
  initTrendAnimation().catch((e) => console.warn('趋势动画:', e));
}

function renderFrameworkUpdates(data) {
  const ul = document.getElementById('framework-updates');
  ul.innerHTML = '';
  const items = data.framework_updates.slice(0, 8);
  if (!items.length) {
    ul.innerHTML = '<li class="empty-state">暂无政策动态</li>';
    return;
  }
  for (const u of items) {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${u.date}</strong> — ${escapeHtml(u.title)}
      <p style="margin-top:0.35rem;color:var(--muted);font-size:0.85rem">${escapeHtml(u.summary)}</p>
      <a href="${escapeAttr(u.source_url)}" target="_blank" rel="noopener">来源 ↗</a>
    `;
    ul.appendChild(li);
  }
}

function renderTable(cases) {
  const tbody = document.getElementById('cases-tbody');
  tbody.innerHTML = '';
  for (const c of cases) {
    const tr = document.createElement('tr');
    tr.dataset.country = c.country;
    tr.dataset.outcome = c.outcome;
    tr.dataset.sector = c.target_sector;
    tr.innerHTML = `
      <td><a href="country.html?c=${c.country}">${escapeHtml(c.country_name)}</a></td>
      <td>${escapeHtml(c.target_company)}</td>
      <td>${escapeHtml(c.investor)}</td>
      <td>${escapeHtml(c.target_sector)}</td>
      <td>${escapeHtml(c.decision_date || '—')}</td>
      <td><span class="outcome outcome-${c.outcome}">${escapeHtml(c.outcome)}</span></td>
      <td title="${escapeAttr(c.summary_zh)}">${escapeHtml(c.summary_zh.slice(0, 60))}…</td>
    `;
    tbody.appendChild(tr);
  }
}

function setupFilters(cases) {
  const countrySel = document.getElementById('filter-country');
  const sectorSel = document.getElementById('filter-sector');
  const countries = [...new Set(cases.map((c) => c.country))].sort();
  const sectors = [...new Set(cases.map((c) => c.target_sector))].sort();

  for (const code of countries) {
    const c = cases.find((x) => x.country === code);
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = c?.country_name || code;
    countrySel.appendChild(opt);
  }
  for (const s of sectors) {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    sectorSel.appendChild(opt);
  }

  const apply = () => {
    const country = countrySel.value;
    const outcome = document.getElementById('filter-outcome').value;
    const sector = sectorSel.value;
    const q = document.getElementById('filter-search').value.toLowerCase();
    document.querySelectorAll('#cases-tbody tr').forEach((tr) => {
      const text = tr.textContent.toLowerCase();
      const show =
        (!country || tr.dataset.country === country) &&
        (!outcome || tr.dataset.outcome === outcome) &&
        (!sector || tr.dataset.sector === sector) &&
        (!q || text.includes(q));
      tr.style.display = show ? '' : 'none';
    });
  };

  [countrySel, document.getElementById('filter-outcome'), sectorSel, document.getElementById('filter-search')]
    .forEach((el) => el.addEventListener('input', apply));
  apply();
}

function renderCharts(data) {
  const byCountry = countByCountry(data);
  const byOutcome = countByOutcome(data);

  new Chart(document.getElementById('chart-country'), {
    type: 'bar',
    data: {
      labels: Object.keys(byCountry).map((k) => {
        const c = data.cases.find((x) => x.country === k);
        return c?.country_name || k;
      }),
      datasets: [{
        label: '案例数',
        data: Object.values(byCountry),
        backgroundColor: CHART_THEME.accent,
      }],
    },
    options: chartOptions('各国/地区案例数量'),
  });

  new Chart(document.getElementById('chart-outcome'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(byOutcome),
      datasets: [{
        data: Object.values(byOutcome),
        backgroundColor: Object.keys(byOutcome).map((k) => OUTCOME_COLORS[k] || '#4FC3F7'),
      }],
    },
    options: { ...chartOptions('审查结果分布'), plugins: { legend: { position: 'right' } } },
  });

  new Chart(document.getElementById('chart-timeline'), {
    type: 'line',
    data: buildTimelineData(data.cases),
    options: chartOptions('案例决定年份趋势'),
  });
}

function buildTimelineData(cases) {
  const years = {};
  for (const c of cases) {
    const y = (c.decision_date || '').slice(0, 4);
    if (y && y.length === 4) years[y] = (years[y] || 0) + 1;
  }
  const sorted = Object.keys(years).sort();
  return {
    labels: sorted,
    datasets: [{
      label: '案例数',
      data: sorted.map((y) => years[y]),
      borderColor: CHART_THEME.accent,
      backgroundColor: 'rgba(79, 195, 247, 0.25)',
      fill: true,
      tension: 0.3,
    }],
  };
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
}

init().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<p class="empty-state">加载失败: ${e.message}</p>`);
});
