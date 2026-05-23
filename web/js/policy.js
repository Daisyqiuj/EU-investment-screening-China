import { loadCases } from './data.js';
import { CHART_THEME, chartOptions } from './chart-theme.js';

const SECTOR_KEYWORDS = [
  ['半导体', '半导体'],
  ['基础设施', '基础设施|港口|电网|铁路|核电|交通'],
  ['电信/5G', '电信|5G'],
  ['医疗', '医疗'],
  ['机器人', '机器人'],
  ['电池', '电池'],
  ['其他', '.*'],
];

function classifySector(c) {
  const t = `${c.target_sector} ${c.summary_zh}`;
  for (const [label, pat] of SECTOR_KEYWORDS) {
    if (label === '其他') continue;
    if (new RegExp(pat).test(t)) return label;
  }
  return '其他';
}

function aggregateFromCases(cases) {
  const eu = cases.filter((c) => c.country !== 'EU' && c.region === 'EU');
  const concrete = eu.filter((c) => c.deal_type !== '机制说明' && c.deal_type !== '统计');
  const sectors = {};
  const outcomes = {};
  const styles = { 硬否决型: 0, 条件管控型: 0, 吸引投资型: 0, 其他: 0 };
  const hard = new Set(['DE', 'IT', 'CZ', 'SE']);
  const cond = new Set(['DE', 'IT', 'NL']);
  const open = new Set(['HU']);

  for (const c of concrete) {
    const s = classifySector(c);
    sectors[s] = (sectors[s] || 0) + 1;
    if (!['无公开否决', '机制运行'].includes(c.outcome)) {
      outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1;
    }
    if (hard.has(c.country) && (c.outcome === '禁止' || c.outcome === '限制参与')) styles['硬否决型']++;
    else if (cond.has(c.country) && c.outcome === '附条件批准') styles['条件管控型']++;
    else if (open.has(c.country)) styles['吸引投资型']++;
    else styles['其他']++;
  }

  return {
    total: eu.length,
    concrete: concrete.length,
    countries: new Set(eu.map((c) => c.country)).size,
    sectors,
    outcomes,
    styles,
  };
}

function initKpis(stats) {
  document.getElementById('kpi-cases').textContent = stats.concrete;
  document.getElementById('kpi-countries').textContent = stats.countries;
}

function initCharts(stats) {
  const pal = CHART_THEME.palette;

  new Chart(document.getElementById('chart-policy-sector'), {
    type: 'bar',
    data: {
      labels: Object.keys(stats.sectors),
      datasets: [{
        label: '案例数',
        data: Object.values(stats.sectors),
        backgroundColor: pal,
        borderRadius: 8,
      }],
    },
    options: {
      ...chartOptions('涉华审查案例 — 行业分布'),
      indexAxis: 'y',
      scales: {
        x: { ticks: { color: CHART_THEME.muted }, grid: { color: CHART_THEME.grid } },
        y: { ticks: { color: CHART_THEME.muted }, grid: { display: false } },
      },
    },
  });

  new Chart(document.getElementById('chart-policy-outcome'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(stats.outcomes),
      datasets: [{ data: Object.values(stats.outcomes), backgroundColor: pal }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '审查结果结构', color: CHART_THEME.text },
        legend: { position: 'right', labels: { color: CHART_THEME.muted, boxWidth: 12 } },
      },
    },
  });

  new Chart(document.getElementById('chart-fdi-stats'), {
    type: 'bar',
    data: {
      labels: ['两周内结案', '需深入评估', '引发成员国质询', '委员会出具意见'],
      datasets: [{
        label: '占比 %（2024）',
        data: [92, 8, 10, 2],
        backgroundColor: [CHART_THEME.accent, CHART_THEME.warn, CHART_THEME.accentDark, '#81B4D9'],
        borderRadius: 8,
      }],
    },
    options: {
      ...chartOptions('欧盟合作机制处理结构（2024）'),
      scales: {
        y: { max: 100, ticks: { color: CHART_THEME.muted, callback: (v) => v + '%' }, grid: { color: CHART_THEME.grid } },
        x: { ticks: { color: CHART_THEME.muted, font: { size: 10 } }, grid: { display: false } },
      },
    },
  });
}

function initTabs() {
  const tabs = document.querySelectorAll('.policy-tab');
  const panels = document.querySelectorAll('.policy-tab-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => p.classList.toggle('active', p.id === `panel-${id}`));
    });
  });
}

function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });
}

function initTimeline() {
  const items = document.querySelectorAll('.viz-timeline-item');
  const detail = document.getElementById('timeline-detail');
  const defaults = items[0];

  function show(item) {
    items.forEach((el) => el.classList.toggle('active', el === item));
    if (detail && item) {
      detail.innerHTML = `
        <span class="trend-year">${item.dataset.year}</span>
        <h4>${item.dataset.title}</h4>
        <p>${item.dataset.body}</p>
      `;
    }
  }

  items.forEach((item) => {
    item.addEventListener('click', () => show(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        show(item);
      }
    });
  });
  if (defaults) show(defaults);
}

function initFlowSteps() {
  document.querySelectorAll('.flow-step').forEach((step, i, all) => {
    step.addEventListener('mouseenter', () => {
      all.forEach((s, j) => s.classList.toggle('highlight', j <= i));
    });
    step.addEventListener('mouseleave', () => all.forEach((s) => s.classList.remove('highlight')));
  });
}

function initTocSpy() {
  const links = document.querySelectorAll('.policy-toc-pill');
  const sections = [...links].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        }
      });
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}

function initCompareToggle() {
  const btn = document.getElementById('compare-toggle');
  const wrap = document.getElementById('legal-compare');
  if (!btn || !wrap) return;
  btn.addEventListener('click', () => {
    wrap.classList.toggle('show-revised');
    btn.textContent = wrap.classList.contains('show-revised')
      ? '← 查看 2019 现行条例'
      : '查看 2025 修订要点 →';
  });
}

async function init() {
  const data = await loadCases();
  const stats = aggregateFromCases(data.cases);
  initKpis(stats);
  initCharts(stats);

  const el = document.getElementById('policy-updated');
  if (el && data.meta?.last_updated) {
    el.textContent = new Date(data.meta.last_updated).toLocaleDateString('zh-CN');
  }
}

initTabs();
initAccordions();
initTimeline();
initFlowSteps();
initTocSpy();
initCompareToggle();
init().catch(console.error);
