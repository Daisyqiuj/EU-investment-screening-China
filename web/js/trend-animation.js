/**
 * 首页趋势演示 — 分幕解说 + 简易图表（数据来自 cases.json）
 */
import { loadCases } from './data.js';
import { loadReviewPointsCatalog, buildNoveltyIndex } from './review-points.js';

const SKIP_KEY = 'trend-hero-collapsed';

const COLORS = {
  bg: '#1A2634',
  panel: '#243447',
  accent: '#4FC3F7',
  accentDim: 'rgba(79, 195, 247, 0.35)',
  warn: '#FF7043',
  amber: '#FFB74D',
  ok: '#81C784',
  text: '#FFFFFF',
  muted: '#B0B8C1',
  border: 'rgba(79, 195, 247, 0.25)',
};

const COUNTRY_NAMES = {
  DE: '德国', IT: '意大利', GB: '英国', FR: '法国', NL: '荷兰',
  ES: '西班牙', SE: '瑞典', PL: '波兰', CZ: '捷克', RO: '罗马尼亚',
  LT: '立陶宛', AT: '奥地利', PT: '葡萄牙',
};

const OUTCOME_STYLE = {
  禁止: COLORS.warn,
  附条件批准: COLORS.amber,
  批准: COLORS.accent,
  政府干预: COLORS.warn,
  交易失败: COLORS.muted,
  审查中: COLORS.muted,
  限制参与: COLORS.warn,
};

/** 每幕：标题、要点、时长(ms)、绘制函数 */
const SCENES = [
  {
    title: '欧洲涉华投资审查趋势演示',
    bullets: [
      '中国企业赴欧洲投资（并购、绿地、参股等）',
      '东道国政府依据国家安全法规进行审查',
      '本库汇总<strong>公开可见</strong>的审查决定与政策动态',
    ],
    duration: 6500,
    draw: drawIntroFlow,
  },
  {
    title: '2019：欧盟建立通报机制',
    bullets: [
      'Regulation (EU) 2019/452 生效',
      '成员国须就涉欧安全的外资交易<strong>互相通报</strong>',
      '为后续各国执法趋严奠定协调基础',
    ],
    duration: 6500,
    draw: drawMechanismTimeline,
  },
  {
    title: '公开案例：近年明显增多',
    bullets: [
      '本库收录 <strong>{dealCases}</strong> 起具体审查决定（不含纯机制说明）',
      '<strong>2022</strong> 年为公开案例高峰（半导体、关键基础设施等）',
      '2023–2025 年持续有新案例与政策修订',
    ],
    duration: 9000,
    draw: drawYearBars,
  },
  {
    title: '哪些国家案例最多？',
    bullets: [
      '<strong>德国</strong>执法最为活跃，半导体等领域多起禁止/附条件',
      '意大利（黄金权力）、英国（NSIA）案例亦较多',
      '点击首页下方地图可逐国查看详情',
    ],
    duration: 7500,
    draw: drawCountryBars,
  },
  {
    title: '审查结果：并非一律禁止',
    bullets: [
      '禁止 {blocked} 起 · 附条件批准 {conditional} 起 · 批准 {approved} 起',
      '多数案件以<strong>附条件或协商</strong>方式放行',
      '下方表格可按「审查结果」筛选',
    ],
    duration: 8000,
    draw: drawOutcomes,
  },
  {
    title: '审查关注点不断扩展',
    bullets: [
      '除传统并购外，绿地投资、零售数据等进入视野',
      '本库「新增审查风险提醒」追踪<strong>首次出现</strong>的关注点',
      '{riskLine}',
    ],
    duration: 7500,
    draw: drawRiskTags,
  },
  {
    title: '如何使用本案例库？',
    bullets: [
      '全库 <strong>{totalEntries}</strong> 条 · 具体审查决定 <strong>{dealCases}</strong> 起',
      '欧盟机制 2024 年通报约 <strong>477</strong> 起（含未公开细节）',
      '向下滚动 → 图表、地图、表格均可交互探索',
    ],
    duration: 7000,
    draw: drawSummary,
  },
];

const LOOP_MS = SCENES.reduce((s, sc) => s + sc.duration, 0);

let canvas, ctx, wrap, heroEl, progressEl;
let titleEl, bulletsEl, sceneNumEl, sceneTotalEl, dotsEl;
let animData = null;
let startTs = 0;
let paused = false;
let rafId = 0;

function parseYear(d) {
  const y = (d || '').slice(0, 4);
  return y && y.length === 4 ? parseInt(y, 10) : null;
}

function isDealCase(c) {
  if (c.country === 'EU') return false;
  if (c.deal_type === '机制说明' || c.deal_type === '统计') return false;
  if (c.outcome === '机制运行' || c.outcome === '无公开否决') return false;
  return true;
}

function easeOut(t) {
  return 1 - (1 - t) ** 3;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function fillBullets(text) {
  const d = animData;
  return text
    .replace(/\{dealCases\}/g, String(d.dealCases))
    .replace(/\{totalEntries\}/g, String(d.totalEntries))
    .replace(/\{blocked\}/g, String(d.outcomes['禁止'] || 0))
    .replace(/\{conditional\}/g, String(d.outcomes['附条件批准'] || 0))
    .replace(/\{approved\}/g, String(d.outcomes['批准'] || 0))
    .replace(/\{riskLine\}/g, d.riskLine);
}

async function buildAnimData(data) {
  const allCases = data.cases;
  const deals = allCases.filter(isDealCase);
  const byYear = {};
  const byCountry = {};
  const outcomes = {};

  for (const c of deals) {
    const y = parseYear(c.decision_date);
    if (y) byYear[y] = (byYear[y] || 0) + 1;
    byCountry[c.country] = (byCountry[c.country] || 0) + 1;
    outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1;
  }

  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  const minY = years.length ? years[0] : 2019;
  const maxY = years.length ? years[years.length - 1] : 2025;

  const topCountries = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({
      code,
      name: COUNTRY_NAMES[code] || code,
      count,
    }));

  const highlights = deals
    .filter((c) => ['禁止', '附条件批准'].includes(c.outcome))
    .sort((a, b) => (b.decision_date || '').localeCompare(a.decision_date || ''))
    .slice(0, 3)
    .map((c) => ({
      year: parseYear(c.decision_date),
      country: c.country_name || COUNTRY_NAMES[c.country] || c.country,
      target: c.target_company || c.target_sector || '投资交易',
      outcome: c.outcome,
    }));

  let riskTags = [];
  try {
    const catalog = await loadReviewPointsCatalog();
    const { timeline } = buildNoveltyIndex(allCases, catalog);
    riskTags = timeline.slice(0, 4).map(({ case: c, novel }) => ({
      year: parseYear(c.decision_date) || 2024,
      label: novel[0]?.label || '新风险维度',
    }));
  } catch {
    riskTags = [
      { year: 2023, label: '绿地投资' },
      { year: 2024, label: '零售与消费者数据' },
      { year: 2024, label: '电池与关键原材料' },
    ];
  }

  const riskLine = riskTags.length
    ? `例如：${riskTags.slice(0, 2).map((t) => t.label).join('、')}`
    : '专页持续更新首次出现的审查维度';

  return {
    totalEntries: allCases.length,
    dealCases: deals.length,
    byYear,
    minY,
    maxY,
    topCountries,
    outcomes,
    highlights,
    riskTags,
    riskLine,
  };
}

function sceneAt(elapsed) {
  let acc = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const dur = SCENES[i].duration;
    if (elapsed < acc + dur) {
      return { index: i, scene: SCENES[i], localT: (elapsed - acc) / dur };
    }
    acc += dur;
  }
  return { index: 0, scene: SCENES[0], localT: 0 };
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

function drawArrow(c, x1, y1, x2, y2, alpha) {
  c.strokeStyle = `rgba(79, 195, 247, ${alpha})`;
  c.fillStyle = `rgba(79, 195, 247, ${alpha})`;
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  c.beginPath();
  c.moveTo(x2, y2);
  c.lineTo(x2 - 10 * Math.cos(ang - 0.4), y2 - 10 * Math.sin(ang - 0.4));
  c.lineTo(x2 - 10 * Math.cos(ang + 0.4), y2 - 10 * Math.sin(ang + 0.4));
  c.closePath();
  c.fill();
}

function drawBox(c, x, y, w, h, label, sub, alpha, accent) {
  c.globalAlpha = alpha;
  c.fillStyle = COLORS.panel;
  c.strokeStyle = accent ? COLORS.accent : COLORS.border;
  c.lineWidth = accent ? 2 : 1;
  roundRect(c, x, y, w, h, 10);
  c.fill();
  c.stroke();
  c.fillStyle = COLORS.text;
  c.font = 'bold 15px "PingFang SC", "Segoe UI", sans-serif';
  c.textAlign = 'center';
  c.fillText(label, x + w / 2, y + h / 2 - (sub ? 6 : 0));
  if (sub) {
    c.fillStyle = COLORS.muted;
    c.font = '11px "PingFang SC", sans-serif';
    c.fillText(sub, x + w / 2, y + h / 2 + 14);
  }
  c.globalAlpha = 1;
}

/** 第1幕：三步骤流程图 */
function drawIntroFlow(c, w, h, t) {
  const p1 = easeOut(Math.min(1, t / 0.28));
  const p2 = easeOut(Math.min(1, Math.max(0, (t - 0.22) / 0.28)));
  const p3 = easeOut(Math.min(1, Math.max(0, (t - 0.44) / 0.28)));

  c.fillStyle = COLORS.muted;
  c.font = '12px "PingFang SC", sans-serif';
  c.textAlign = 'center';
  c.fillText('一条投资交易的大致路径', w / 2, h * 0.12);

  const bw = Math.min(130, w * 0.22);
  const bh = 56;
  const gap = (w - bw * 3) / 4;
  const y = h * 0.42;

  drawBox(c, gap, y, bw, bh, '中国企业', '赴欧投资', p1, false);
  if (p1 > 0.5) drawArrow(c, gap + bw + 4, y + bh / 2, gap * 2 + bw - 4, y + bh / 2, p1);

  drawBox(c, gap * 2 + bw, y, bw, bh, '欧洲标的', '并购 / 绿地 / 参股', p2, false);
  if (p2 > 0.5) drawArrow(c, gap * 2 + bw * 2 + 4, y + bh / 2, gap * 3 + bw * 2 - 4, y + bh / 2, p2);

  drawBox(c, gap * 3 + bw * 2, y, bw, bh, '国家安全审查', '批准 / 附条件 / 禁止', p3, true);

  if (t > 0.72) {
    const fa = easeOut((t - 0.72) / 0.28);
    c.globalAlpha = fa;
    c.fillStyle = 'rgba(79, 195, 247, 0.12)';
    c.strokeStyle = COLORS.accent;
    c.lineWidth = 1;
    roundRect(c, w * 0.08, h * 0.68, w * 0.84, 44, 8);
    c.fill();
    c.stroke();
    c.fillStyle = COLORS.text;
    c.font = '13px "PingFang SC", sans-serif';
    c.fillText('本库 = 把这些「公开可见的审查决定」整理成表格、图表与地图', w / 2, h * 0.68 + 27);
    c.globalAlpha = 1;
  }
}

/** 第2幕：2019 机制时间轴 */
function drawMechanismTimeline(c, w, h, t) {
  const lineY = h * 0.48;
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  const prog = easeOut(Math.min(1, t / 0.55));

  c.strokeStyle = COLORS.border;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x0, lineY);
  c.lineTo(x0 + (x1 - x0) * prog, lineY);
  c.stroke();

  const milestones = [
    { year: 2017, label: '各国\n国内立法', x: 0.22 },
    { year: 2019, label: '欧盟\n通报机制', x: 0.42, highlight: true },
    { year: 2022, label: '执法\n高峰', x: 0.62 },
    { year: 2025, label: '机制\n修订提案', x: 0.82 },
  ];

  milestones.forEach((m, i) => {
    const reveal = easeOut(Math.min(1, Math.max(0, (t - 0.12 - i * 0.1) / 0.25)));
    if (reveal <= 0) return;
    const mx = x0 + (x1 - x0) * m.x * Math.min(1, prog / 0.85);
    const r = m.highlight ? 16 : 10;

    c.globalAlpha = reveal;
    c.beginPath();
    c.arc(mx, lineY, r, 0, Math.PI * 2);
    c.fillStyle = m.highlight ? COLORS.accent : COLORS.panel;
    c.fill();
    c.strokeStyle = m.highlight ? COLORS.accent : COLORS.border;
    c.lineWidth = m.highlight ? 3 : 1;
    c.stroke();

    c.fillStyle = m.highlight ? '#1A2634' : COLORS.text;
    c.font = `bold ${m.highlight ? 12 : 10}px sans-serif`;
    c.textAlign = 'center';
    c.fillText(String(m.year), mx, lineY + 4);

    c.fillStyle = COLORS.text;
    c.font = '11px "PingFang SC", sans-serif';
    m.label.split('\n').forEach((line, li) => {
      c.fillText(line, mx, lineY + 32 + li * 14);
    });
    c.globalAlpha = 1;
  });

  if (t > 0.65) {
    const fa = easeOut((t - 0.65) / 0.3);
    c.globalAlpha = fa;
    c.fillStyle = 'rgba(255, 112, 67, 0.15)';
    c.strokeStyle = COLORS.warn;
    roundRect(c, w * 0.12, h * 0.72, w * 0.76, 50, 8);
    c.fill();
    c.stroke();
    c.fillStyle = COLORS.text;
    c.font = '12px "PingFang SC", sans-serif';
    c.textAlign = 'center';
    c.fillText('2019/452：成员国须通报可能影响欧盟安全的外资交易，并在欧盟层面协调', w / 2, h * 0.72 + 20);
    c.fillStyle = COLORS.muted;
    c.font = '11px "PingFang SC", sans-serif';
    c.fillText('（个案细节通常不向公众披露，本库收录的是各国公开决定）', w / 2, h * 0.72 + 38);
    c.globalAlpha = 1;
  }
}

/** 第3幕：年度柱状图 */
function drawYearBars(c, w, h, t, data) {
  const years = [];
  for (let y = data.minY; y <= data.maxY; y++) years.push(y);
  const maxCount = Math.max(1, ...years.map((y) => data.byYear[y] || 0));

  const padL = w * 0.12;
  const padR = w * 0.08;
  const padB = h * 0.22;
  const padT = h * 0.14;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const barW = chartW / years.length * 0.55;
  const gap = chartW / years.length;

  c.fillStyle = COLORS.muted;
  c.font = '12px "PingFang SC", sans-serif';
  c.textAlign = 'center';
  c.fillText('各年公开审查决定数量（本库）', w / 2, padT * 0.55);

  years.forEach((year, i) => {
    const count = data.byYear[year] || 0;
    const barReveal = easeOut(Math.min(1, Math.max(0, (t - i * 0.07) / 0.35)));
    if (barReveal <= 0) return;

    const bh = (count / maxCount) * chartH * barReveal;
    const x = padL + i * gap + (gap - barW) / 2;
    const y = padT + chartH - bh;
    const isPeak = year === 2022 && count === maxCount;

    c.fillStyle = isPeak ? COLORS.warn : COLORS.accent;
    roundRect(c, x, y, barW, bh, 4);
    c.fill();

    c.fillStyle = COLORS.muted;
    c.font = '10px sans-serif';
    c.textAlign = 'center';
    c.fillText(String(year), x + barW / 2, padT + chartH + 16);

    if (count > 0 && barReveal > 0.85) {
      c.fillStyle = isPeak ? COLORS.warn : COLORS.text;
      c.font = `bold ${isPeak ? 13 : 11}px sans-serif`;
      c.fillText(String(count), x + barW / 2, y - 6);
    }
  });

  if (t > 0.75) {
    const fa = easeOut((t - 0.75) / 0.25);
    c.globalAlpha = fa;
    c.fillStyle = COLORS.warn;
    c.font = 'bold 12px "PingFang SC", sans-serif';
    c.textAlign = 'right';
    c.fillText('↑ 2022 执法高峰（半导体等）', w - padR, padT - 4);
    c.globalAlpha = 1;
  }
}

/** 第4幕：国家横向柱 */
function drawCountryBars(c, w, h, t, data) {
  const items = data.topCountries;
  const maxCount = Math.max(1, ...items.map((i) => i.count));
  const padL = w * 0.28;
  const padR = w * 0.1;
  const rowH = Math.min(36, (h * 0.55) / items.length);
  const startY = h * 0.22;

  c.fillStyle = COLORS.muted;
  c.font = '12px "PingFang SC", sans-serif';
  c.textAlign = 'center';
  c.fillText('公开案例数量 Top 5（本库）', w / 2, h * 0.1);

  items.forEach((item, i) => {
    const reveal = easeOut(Math.min(1, Math.max(0, (t - i * 0.12) / 0.4)));
    if (reveal <= 0) return;
    const y = startY + i * (rowH + 12);
    const barMaxW = w - padL - padR;
    const barW = barMaxW * (item.count / maxCount) * reveal;

    c.fillStyle = COLORS.text;
    c.font = '13px "PingFang SC", sans-serif';
    c.textAlign = 'right';
    c.fillText(`${item.name}`, padL - 10, y + rowH * 0.65);

    c.fillStyle = item.code === 'DE' ? COLORS.warn : COLORS.accent;
    roundRect(c, padL, y, barW, rowH, 6);
    c.fill();

    c.fillStyle = COLORS.text;
    c.font = 'bold 12px sans-serif';
    c.textAlign = 'left';
    c.fillText(`${item.count} 起`, padL + barW + 8, y + rowH * 0.65);
  });
}

/** 第5幕：结果分布 + 典型案例 */
function drawOutcomes(c, w, h, t, data) {
  const groups = [
    { key: '禁止', label: '禁止', color: COLORS.warn },
    { key: '附条件批准', label: '附条件', color: COLORS.amber },
    { key: '批准', label: '批准', color: COLORS.accent },
  ];
  const total = groups.reduce((s, g) => s + (data.outcomes[g.key] || 0), 0) || 1;

  const cardW = Math.min(110, (w - 80) / 3);
  const startX = (w - cardW * 3 - 40) / 2;
  const cardY = h * 0.18;
  const cardH = 90;

  groups.forEach((g, i) => {
    const reveal = easeOut(Math.min(1, Math.max(0, (t - i * 0.15) / 0.35)));
    if (reveal <= 0) return;
    const x = startX + i * (cardW + 20);
    const count = data.outcomes[g.key] || 0;
    const pct = Math.round((count / total) * 100);

    c.globalAlpha = reveal;
    c.fillStyle = 'rgba(34, 50, 68, 0.95)';
    c.strokeStyle = g.color;
    c.lineWidth = 2;
    roundRect(c, x, cardY, cardW, cardH, 10);
    c.fill();
    c.stroke();

    c.fillStyle = g.color;
    c.font = 'bold 28px sans-serif';
    c.textAlign = 'center';
    c.fillText(String(count), x + cardW / 2, cardY + 42);

    c.fillStyle = COLORS.text;
    c.font = '13px "PingFang SC", sans-serif';
    c.fillText(g.label, x + cardW / 2, cardY + 62);

    c.fillStyle = COLORS.muted;
    c.font = '11px sans-serif';
    c.fillText(`${pct}%`, x + cardW / 2, cardY + 78);
    c.globalAlpha = 1;
  });

  data.highlights.forEach((hc, i) => {
    const reveal = easeOut(Math.min(1, Math.max(0, (t - 0.45 - i * 0.12) / 0.3)));
    if (reveal <= 0) return;
    const y = h * 0.52 + i * 34;
    const color = OUTCOME_STYLE[hc.outcome] || COLORS.muted;

    c.globalAlpha = reveal;
    c.fillStyle = 'rgba(34, 50, 68, 0.9)';
    c.strokeStyle = color;
    c.lineWidth = 1;
    roundRect(c, w * 0.06, y, w * 0.88, 28, 6);
    c.fill();
    c.stroke();

    c.fillStyle = color;
    c.font = 'bold 10px sans-serif';
    c.textAlign = 'left';
    c.fillText(hc.outcome, w * 0.06 + 10, y + 18);

    c.fillStyle = COLORS.text;
    c.font = '11px "PingFang SC", sans-serif';
    const shortTarget = hc.target.length > 28 ? `${hc.target.slice(0, 26)}…` : hc.target;
    c.fillText(`${hc.year || '—'} · ${hc.country} · ${shortTarget}`, w * 0.06 + 52, y + 18);
    c.globalAlpha = 1;
  });
}

/** 第6幕：新风险标签 */
function drawRiskTags(c, w, h, t, data) {
  c.fillStyle = COLORS.muted;
  c.font = '12px "PingFang SC", sans-serif';
  c.textAlign = 'center';
  c.fillText('本库首次记录的审查关注点（节选）', w / 2, h * 0.1);

  const tags = data.riskTags.slice(0, 4);
  const startY = h * 0.24;

  tags.forEach((tag, i) => {
    const reveal = easeOut(Math.min(1, Math.max(0, (t - i * 0.14) / 0.35)));
    if (reveal <= 0) return;
    const y = startY + i * 52;

    c.globalAlpha = reveal;
    c.fillStyle = 'rgba(255, 112, 67, 0.12)';
    c.strokeStyle = COLORS.warn;
    c.lineWidth = 1.5;
    roundRect(c, w * 0.1, y, w * 0.8, 42, 10);
    c.fill();
    c.stroke();

    c.fillStyle = COLORS.warn;
    c.font = 'bold 11px sans-serif';
    c.textAlign = 'left';
    c.fillText(`🆕 ${tag.year}`, w * 0.1 + 14, y + 18);

    c.fillStyle = COLORS.text;
    c.font = '14px "PingFang SC", sans-serif';
    c.fillText(tag.label, w * 0.1 + 14, y + 34);
    c.globalAlpha = 1;
  });

  if (t > 0.7) {
    const fa = easeOut((t - 0.7) / 0.3);
    c.globalAlpha = fa;
    c.fillStyle = COLORS.accent;
    c.font = '12px "PingFang SC", sans-serif';
    c.textAlign = 'center';
    c.fillText('→ 导航栏「新增审查风险提醒」查看完整时间线', w / 2, h * 0.88);
    c.globalAlpha = 1;
  }
}

/** 第7幕：总结 */
function drawSummary(c, w, h, t, data) {
  const items = [
    { num: String(data.totalEntries), label: '案例库总条目', sub: '含机制说明与统计', color: COLORS.accent },
    { num: String(data.dealCases), label: '具体审查决定', sub: '并购 / 绿地等交易', color: COLORS.amber },
    { num: '477', label: '2024 欧盟通报', sub: '含未公开细节', color: COLORS.warn },
  ];

  const cardW = Math.min(120, (w - 60) / 3);
  const startX = (w - cardW * 3 - 30) / 2;
  const cardY = h * 0.22;

  items.forEach((item, i) => {
    const reveal = easeOut(Math.min(1, Math.max(0, (t - i * 0.12) / 0.35)));
    if (reveal <= 0) return;
    const x = startX + i * (cardW + 15);

    c.globalAlpha = reveal;
    c.fillStyle = 'rgba(34, 50, 68, 0.95)';
    c.strokeStyle = item.color;
    c.lineWidth = 2;
    roundRect(c, x, cardY, cardW, 100, 10);
    c.fill();
    c.stroke();

    c.fillStyle = item.color;
    c.font = 'bold 32px sans-serif';
    c.textAlign = 'center';
    c.fillText(item.num, x + cardW / 2, cardY + 42);

    c.fillStyle = COLORS.text;
    c.font = '12px "PingFang SC", sans-serif';
    c.fillText(item.label, x + cardW / 2, cardY + 62);

    c.fillStyle = COLORS.muted;
    c.font = '10px "PingFang SC", sans-serif';
    c.fillText(item.sub, x + cardW / 2, cardY + 78);
    c.globalAlpha = 1;
  });

  if (t > 0.55) {
    const bounce = easeInOut((t - 0.55) / 0.45);
    const fa = Math.min(1, bounce * 1.5);
    c.globalAlpha = fa;
    c.fillStyle = COLORS.accent;
    c.font = 'bold 14px "PingFang SC", sans-serif';
    c.textAlign = 'center';
    c.fillText('↓ 向下滚动探索图表、地图与完整表格', w / 2, h * 0.72 + bounce * 8);
    c.globalAlpha = 1;
  }
}

function resizeCanvas() {
  if (!canvas || !wrap) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = wrap.getBoundingClientRect();
  const w = Math.max(rect.width, 280);
  const h = Math.max(rect.height, 200);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function renderDots(activeIndex) {
  if (!dotsEl) return;
  dotsEl.innerHTML = SCENES.map((_, i) =>
    `<span class="trend-dot${i === activeIndex ? ' active' : ''}"></span>`
  ).join('');
}

function updateNarrative(index, scene) {
  if (titleEl) titleEl.textContent = scene.title;
  if (sceneNumEl) sceneNumEl.textContent = String(index + 1);
  if (sceneTotalEl) sceneTotalEl.textContent = String(SCENES.length);
  if (bulletsEl) {
    bulletsEl.innerHTML = scene.bullets
      .map((b) => `<li>${fillBullets(b)}</li>`)
      .join('');
  }
  renderDots(index);
}

function frame(ts) {
  if (!startTs) startTs = ts;
  if (paused) {
    rafId = requestAnimationFrame(frame);
    return;
  }

  const elapsed = (ts - startTs) % LOOP_MS;
  const progress = elapsed / LOOP_MS;
  const { index, scene, localT } = sceneAt(elapsed);
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  scene.draw(ctx, w, h, localT, animData);

  updateNarrative(index, scene);

  if (progressEl) {
    progressEl.style.width = `${progress * 100}%`;
  }

  rafId = requestAnimationFrame(frame);
}

function replay() {
  startTs = 0;
}

function bindControls() {
  document.getElementById('trend-replay')?.addEventListener('click', replay);
  document.getElementById('trend-skip')?.addEventListener('click', () => {
    heroEl?.classList.add('collapsed');
    document.getElementById('trend-collapsed-bar')?.classList.remove('hidden');
    localStorage.setItem(SKIP_KEY, '1');
    cancelAnimationFrame(rafId);
  });
  document.getElementById('trend-expand')?.addEventListener('click', () => {
    heroEl?.classList.remove('collapsed');
    document.getElementById('trend-collapsed-bar')?.classList.add('hidden');
    localStorage.removeItem(SKIP_KEY);
    startTs = 0;
    rafId = requestAnimationFrame(frame);
  });
  wrap?.addEventListener('mouseenter', () => { paused = true; });
  wrap?.addEventListener('mouseleave', () => { paused = false; });
  document.getElementById('trend-stage')?.addEventListener('mouseenter', () => { paused = true; });
  document.getElementById('trend-stage')?.addEventListener('mouseleave', () => { paused = false; });
}

export async function initTrendAnimation() {
  heroEl = document.getElementById('trend-hero');
  canvas = document.getElementById('trend-canvas');
  wrap = document.getElementById('trend-canvas-wrap');
  progressEl = document.getElementById('trend-progress-fill');
  titleEl = document.getElementById('trend-scene-title');
  bulletsEl = document.getElementById('trend-scene-bullets');
  sceneNumEl = document.getElementById('trend-scene-num');
  sceneTotalEl = document.getElementById('trend-scene-total');
  dotsEl = document.getElementById('trend-scene-dots');

  if (!heroEl || !canvas) return;

  if (localStorage.getItem(SKIP_KEY) === '1') {
    heroEl.classList.add('collapsed');
    document.getElementById('trend-collapsed-bar')?.classList.remove('hidden');
  }

  ctx = canvas.getContext('2d');
  const data = await loadCases();
  animData = await buildAnimData(data);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  bindControls();
  rafId = requestAnimationFrame(frame);
}
