/**
 * 首页纯 Canvas 趋势演示动画 — 数据来自 cases.json
 */
import { loadCases } from './data.js';
import { loadReviewPointsCatalog, buildNoveltyIndex } from './review-points.js';

const LOOP_MS = 52000;
const SKIP_KEY = 'trend-hero-collapsed';

const COLORS = {
  bg: '#1A2634',
  grid: 'rgba(79, 195, 247, 0.06)',
  accent: '#4FC3F7',
  accentDim: 'rgba(79, 195, 247, 0.35)',
  warn: '#FF7043',
  warnDim: 'rgba(255, 112, 67, 0.4)',
  text: '#FFFFFF',
  muted: '#B0B8C1',
  node: '#243447',
};

/** 画布上的相对坐标 (0–1)，大致对应欧洲地图 */
const NODES = {
  EU: { x: 0.48, y: 0.38, label: '欧盟合作机制' },
  DE: { x: 0.52, y: 0.42, label: '德国' },
  IT: { x: 0.56, y: 0.58, label: '意大利' },
  GB: { x: 0.38, y: 0.36, label: '英国' },
  FR: { x: 0.42, y: 0.48, label: '法国' },
  NL: { x: 0.49, y: 0.39, label: '荷兰' },
  ES: { x: 0.34, y: 0.62, label: '西班牙' },
  SE: { x: 0.58, y: 0.22, label: '瑞典' },
  PL: { x: 0.62, y: 0.40, label: '波兰' },
  CZ: { x: 0.58, y: 0.44, label: '捷克' },
  RO: { x: 0.64, y: 0.52, label: '罗马尼亚' },
  LT: { x: 0.62, y: 0.32, label: '立陶宛' },
  AT: { x: 0.55, y: 0.48, label: '奥地利' },
  PT: { x: 0.28, y: 0.62, label: '葡萄牙' },
};

const PHASES = [
  { until: 0.15, title: '2019 · 欧盟 FDI 筛查合作机制生效', sub: 'Regulation (EU) 2019/452 — 成员国通报与协调' },
  { until: 0.38, title: '2020–2022 · 审查执法趋严', sub: '半导体、关键基础设施案例进入公众视野' },
  { until: 0.65, title: '2023–2024 · 风险维度扩展', sub: '绿地投资、零售数据、电池材料等新关注点' },
  { until: 0.88, title: '2025 · 机制修订与案例积累', sub: '27 国强制审查 · 本库持续追踪公开案例' },
  { until: 1.0, title: '趋势概览', sub: '下方图表与地图可交互探索完整资料库' },
];

let canvas, ctx, wrap, captionEl, yearEl, progressEl, heroEl;
let animData = null;
let startTs = 0;
let paused = false;
let rafId = 0;
let particles = [];

function parseYear(d) {
  const y = (d || '').slice(0, 4);
  return y && y.length === 4 ? parseInt(y, 10) : null;
}

function isAnimCase(c) {
  if (c.country === 'EU') return false;
  if (c.deal_type === '机制说明' || c.deal_type === '统计') return false;
  if (c.outcome === '机制运行' || c.outcome === '无公开否决') return false;
  return true;
}

function outcomeRgba(outcome, alpha) {
  if (['禁止', '限制参与', '政府干预'].includes(outcome)) return `rgba(255, 112, 67, ${alpha})`;
  if (outcome === '附条件批准') return `rgba(255, 183, 77, ${alpha})`;
  return `rgba(79, 195, 247, ${alpha})`;
}

async function buildAnimData(data) {
  const cases = data.cases.filter(isAnimCase);
  const byYear = {};
  const byCountry = {};
  const events = [];

  for (const c of cases) {
    const y = parseYear(c.decision_date);
    if (y) {
      byYear[y] = (byYear[y] || 0) + 1;
      events.push({ year: y, country: c.country, outcome: c.outcome, t: 0 });
    }
    byCountry[c.country] = (byCountry[c.country] || 0) + 1;
  }

  events.sort((a, b) => a.year - b.year || a.country.localeCompare(b.country));
  const minY = Math.min(2019, ...events.map((e) => e.year));
  const maxY = Math.max(2025, ...events.map((e) => e.year));

  let catalog = {};
  let riskTags = [];
  try {
    catalog = await loadReviewPointsCatalog();
    const { timeline } = buildNoveltyIndex(data.cases, catalog);
    riskTags = timeline.slice(0, 6).map(({ case: c, novel }) => ({
      year: parseYear(c.decision_date) || 2024,
      label: novel[0]?.label || '新风险维度',
    }));
  } catch {
  }

  return {
    total: cases.length,
    byYear,
    byCountry,
    events,
    minY,
    maxY,
    riskTags,
    metaUpdated: data.meta.last_updated,
  };
}

function initParticles(w, h) {
  particles = Array.from({ length: 48 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: 1 + Math.random() * 1.5,
  }));
}

function resizeCanvas() {
  if (!canvas || !wrap) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = wrap.getBoundingClientRect();
  const w = Math.max(rect.width, 320);
  const h = Math.max(rect.height, 180);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!particles.length) initParticles(w, h);
}

function yearFromProgress(p, data) {
  const span = data.maxY - data.minY || 1;
  return Math.round(data.minY + p * span);
}

function phaseAt(p) {
  for (const ph of PHASES) {
    if (p <= ph.until) return ph;
  }
  return PHASES[PHASES.length - 1];
}

function drawGrid(w, h, pulse) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(79, 195, 247, ${0.03 + pulse * 0.04})`;
  ctx.fillRect(0, 0, w, h);
}

function drawParticles(w, h) {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.accentDim;
    ctx.fill();
  }
}

function drawLinks(w, h, progress, data) {
  const hub = NODES.EU;
  const hx = hub.x * w;
  const hy = hub.y * h;
  const activeCountries = Object.keys(data.byCountry).filter((c) => NODES[c]);

  for (const code of activeCountries) {
    const node = NODES[code];
    const nx = node.x * w;
    const ny = node.y * h;
    const countryProgress = Math.min(1, Math.max(0, (progress - 0.08) * 1.4));
    if (countryProgress <= 0) continue;

    const count = data.byCountry[code] || 0;
    const alpha = Math.min(0.65, 0.15 + count * 0.05) * countryProgress;

    ctx.strokeStyle = code === 'DE' || code === 'IT' ? `rgba(255, 112, 67, ${alpha})` : `rgba(79, 195, 247, ${alpha})`;
    ctx.lineWidth = 1 + count * 0.15;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(nx, ny);
    ctx.stroke();
  }
}

function drawNodes(w, h, progress, data, time) {
  const hub = NODES.EU;
  const hubPulse = 0.5 + 0.5 * Math.sin(time * 0.003);

  for (const [code, node] of Object.entries(NODES)) {
    const x = node.x * w;
    const y = node.y * h;
    const count = data.byCountry[code] || 0;
    const isHub = code === 'EU';
    const reveal = isHub ? Math.min(1, progress / 0.1) : Math.min(1, Math.max(0, (progress - 0.12) * 1.2));

    if (reveal <= 0) continue;

    const baseR = isHub ? 14 : 6 + Math.min(count * 1.2, 10);
    const pulseR = baseR + (isHub ? hubPulse * 4 : Math.sin(time * 0.004 + x) * 2);

    ctx.beginPath();
    ctx.arc(x, y, pulseR * reveal, 0, Math.PI * 2);
    ctx.fillStyle = isHub ? `rgba(79, 195, 247, ${0.25 * reveal})` : COLORS.node;
    ctx.fill();

    ctx.strokeStyle = isHub ? COLORS.accent : count > 3 ? COLORS.warn : COLORS.accentDim;
    ctx.lineWidth = isHub ? 2 : 1.5;
    ctx.stroke();

    if (reveal > 0.5 && (isHub || count > 0)) {
      ctx.fillStyle = COLORS.text;
      ctx.font = `${isHub ? 11 : 10}px "Segoe UI", "PingFang SC", sans-serif`;
      ctx.textAlign = 'center';
      const label = isHub ? node.label : `${node.label}${count ? ` · ${count}` : ''}`;
      ctx.fillText(label, x, y + pulseR + 14);
    }
  }
}

function drawEvents(w, h, progress, data, time) {
  const visibleCount = Math.floor(data.events.length * Math.min(1, Math.max(0, (progress - 0.15) / 0.7)));
  for (let i = 0; i < visibleCount; i++) {
    const ev = data.events[i];
    const node = NODES[ev.country];
    if (!node) continue;
    const x = node.x * w;
    const y = node.y * h;
    const age = (time * 0.001 + i * 0.3) % 3;
    const alpha = age < 2.5 ? 1 - age / 2.5 : 0;
    if (alpha <= 0) continue;

    ctx.beginPath();
    ctx.arc(x, y, 18 + age * 6, 0, Math.PI * 2);
    ctx.strokeStyle = outcomeRgba(ev.outcome, alpha * 0.55);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawRiskTags(w, h, progress, data) {
  if (progress < 0.42) return;
  const tagProgress = (progress - 0.42) / 0.35;
  data.riskTags.forEach((tag, i) => {
    const t = Math.min(1, Math.max(0, tagProgress * data.riskTags.length - i));
    if (t <= 0) return;
    const x = w * (0.12 + (i % 3) * 0.28);
    const y = h * (0.12 + Math.floor(i / 3) * 0.12);
    const alpha = t;

    ctx.fillStyle = `rgba(255, 112, 67, ${0.15 * alpha})`;
    ctx.strokeStyle = `rgba(255, 112, 67, ${0.7 * alpha})`;
    const text = `🆕 ${tag.label}`;
    ctx.font = '11px "Segoe UI", "PingFang SC", sans-serif';
    const tw = ctx.measureText(text).width + 16;
    roundRect(ctx, x, y, tw, 22, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.textAlign = 'left';
    ctx.fillText(text, x + 8, y + 15);
  });
}

function drawSummary(w, h, progress, data) {
  if (progress < 0.78) return;
  const t = Math.min(1, (progress - 0.78) / 0.15);
  const cx = w * 0.72;
  const cy = h * 0.55;

  ctx.globalAlpha = t;
  ctx.fillStyle = 'rgba(34, 50, 68, 0.92)';
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 1;
  roundRect(ctx, cx - 100, cy - 55, 200, 110, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.accent;
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(data.total), cx, cy - 18);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '11px "PingFang SC", sans-serif';
  ctx.fillText('本库公开案例', cx, cy);

  ctx.fillStyle = COLORS.warn;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('477', cx, cy + 22);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '10px "PingFang SC", sans-serif';
  ctx.fillText('2024 欧盟机制通报', cx, cy + 38);
  ctx.globalAlpha = 1;
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

function drawYearBar(w, h, progress, data) {
  const barY = h - 28;
  const barX = w * 0.08;
  const barW = w * 0.84;
  ctx.fillStyle = 'rgba(58, 74, 92, 0.8)';
  roundRect(ctx, barX, barY, barW, 6, 3);
  ctx.fill();
  ctx.fillStyle = COLORS.accent;
  roundRect(ctx, barX, barY, barW * progress, 6, 3);
  ctx.fill();

  const yMin = data.minY;
  const yMax = data.maxY;
  for (let y = yMin; y <= yMax; y++) {
    const p = (y - yMin) / (yMax - yMin || 1);
    const x = barX + barW * p;
    ctx.fillStyle = COLORS.muted;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(y), x, barY - 6);
    const cnt = data.byYear[y];
    if (cnt && progress > 0.15) {
      ctx.fillStyle = COLORS.accent;
      ctx.fillText(String(cnt), x, barY + 18);
    }
  }
}

function frame(ts) {
  if (!startTs) startTs = ts;
  if (paused) {
    rafId = requestAnimationFrame(frame);
    return;
  }

  const elapsed = (ts - startTs) % LOOP_MS;
  const progress = elapsed / LOOP_MS;
  const phase = phaseAt(progress);
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  const pulse = 0.5 + 0.5 * Math.sin(ts * 0.002);
  drawGrid(w, h, pulse);
  drawParticles(w, h);
  drawLinks(w, h, progress, animData);
  drawNodes(w, h, progress, animData, ts);
  drawEvents(w, h, progress, animData, ts);
  drawRiskTags(w, h, progress, animData);
  drawSummary(w, h, progress, animData);
  drawYearBar(w, h, progress, animData);

  if (captionEl) {
    captionEl.innerHTML = `<strong>${phase.title}</strong><span>${phase.sub}</span>`;
  }
  if (yearEl) {
    yearEl.textContent = String(yearFromProgress(progress, animData));
  }
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
}

export async function initTrendAnimation() {
  heroEl = document.getElementById('trend-hero');
  canvas = document.getElementById('trend-canvas');
  wrap = document.getElementById('trend-canvas-wrap');
  captionEl = document.getElementById('trend-caption');
  yearEl = document.getElementById('trend-year');
  progressEl = document.getElementById('trend-progress-fill');

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
