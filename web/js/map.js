import {
  loadCases,
  countByCountry,
  COUNTRY_NAMES,
  buildEnforcementStyleMap,
  getStyleColors,
  ENFORCEMENT_STYLES,
} from './data.js';
import { showCountryIdiomBanner, hideCountryIdiomBanner } from './country-idioms.js';
import {
  loadReviewPointsCatalog,
  buildNoveltyIndex,
  getNoveltyForCase,
  renderNovelAlertBox,
} from './review-points.js';

const GEOJSON_URL = 'data/europe.geojson';
const EUROPE_BOUNDS = [[33, -25], [72, 45]];

const SELECTED_STYLE = {
  fillColor: '#4FC3F7',
  color: '#29B6F6',
  weight: 2.5,
  opacity: 1,
  fillOpacity: 0.95,
};

let map;
let geoLayer;
let selectedIso = null;
let casesData = null;
let styleByCountry = {};
let noveltyIndex = null;
const layerByIso = new Map();

function styleFeature(iso) {
  if (selectedIso === iso) return { ...SELECTED_STYLE };
  const styleId = styleByCountry[iso] || 'default';
  return getStyleColors(styleId);
}

function styleLabel(iso) {
  const id = styleByCountry[iso] || 'default';
  return ENFORCEMENT_STYLES[id]?.label || '暂无分类';
}

function bindLayer(feature, layer, counts) {
  const iso = feature.properties.iso_a2;
  layerByIso.set(iso, layer);

  const nameZh = feature.properties.name_zh || COUNTRY_NAMES[iso] || feature.properties.name;
  const n = counts[iso] || 0;
  const style = styleLabel(iso);
  const tip = `${nameZh}\n${style}${n ? ` · ${n} 个案例` : ''}`;

  layer.bindTooltip(tip, { sticky: true, direction: 'auto', className: 'map-tooltip' });

  layer.on({
    mouseover: (e) => {
      if (selectedIso !== iso) {
        const base = styleFeature(iso);
        e.target.setStyle({
          ...base,
          weight: (base.weight || 1.5) + 0.5,
          fillOpacity: Math.min(0.98, (base.fillOpacity || 0.8) + 0.12),
        });
        e.target.bringToFront();
      }
    },
    mouseout: (e) => {
      e.target.setStyle(selectedIso === iso ? SELECTED_STYLE : styleFeature(iso));
    },
    click: () => selectCountry(iso, casesData),
  });
}

function highlightSelected(iso) {
  layerByIso.forEach((layer, code) => {
    if (code === iso) {
      layer.setStyle(SELECTED_STYLE);
      layer.bringToFront();
    } else {
      layer.setStyle(styleFeature(code));
    }
  });
}

function renderStyleBadge(code) {
  const id = styleByCountry[code] || 'default';
  const meta = ENFORCEMENT_STYLES[id];
  return `<span class="map-style-badge style-${id}" title="${escapeAttr(meta.desc)}">${escapeHtml(meta.label)}</span>`;
}

function selectCountry(code, data) {
  selectedIso = code;
  highlightSelected(code);
  if (map && layerByIso.has(code)) {
    map.fitBounds(layerByIso.get(code).getBounds(), { padding: [40, 40], maxZoom: 6 });
  }

  const cases = data.cases.filter((c) => c.country === code);
  const panel = document.getElementById('country-panel');
  const layer = layerByIso.get(code);
  const geoName = layer?.feature?.properties;
  const displayName =
    (code === 'EU' ? '欧盟' : null) ||
    geoName?.name_zh ||
    COUNTRY_NAMES[code] ||
    data.cases.find((c) => c.country === code)?.country_name ||
    geoName?.name_en ||
    code;

  showCountryIdiomBanner(code, displayName);

  const styleMeta = ENFORCEMENT_STYLES[styleByCountry[code] || 'default'];

  if (!cases.length) {
    panel.innerHTML = `
      <div class="card">
        <h2>${escapeHtml(displayName)}（${code}） ${renderStyleBadge(code)}</h2>
        <p class="empty-state">当前资料库中暂无该国的公开涉华投资审查案例。<br>
        <a href="index.html">返回主页</a> 查看全部案例，或等待每周自动更新。</p>
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div class="card">
      <h2>${escapeHtml(displayName)} — ${cases.length} 个案例 ${renderStyleBadge(code)}</h2>
      <p style="font-size:0.85rem;color:var(--muted);margin-bottom:0.75rem">${escapeHtml(styleMeta.desc)}</p>
      <p style="margin-bottom:1rem"><a class="btn-map" href="country.html?c=${code}" style="padding:0.5rem 1rem;font-size:0.9rem">查看完整国家页面 ↗</a></p>
      ${cases.map(renderCaseCard).join('')}
    </div>`;
}

function renderCaseCard(c) {
  const novel = noveltyIndex ? getNoveltyForCase(c.id, noveltyIndex) : [];
  const timeline = (c.timeline || [])
    .map((t) => `<li><span class="date">${escapeHtml(t.date)}</span>${escapeHtml(t.event)}</li>`)
    .join('');
  const sources = (c.sources || [])
    .map((s) => `<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a>`)
    .join(' · ');

  return `
    <div class="case-card">
      ${renderNovelAlertBox(novel, c.target_company)}
      <h3>${escapeHtml(c.target_company)}</h3>
      <div class="meta-row">
        <span>投资者: ${escapeHtml(c.investor)}</span>
        <span>行业: ${escapeHtml(c.target_sector)}</span>
        <span>决定: ${escapeHtml(c.decision_date || '—')}</span>
        <span class="outcome outcome-${c.outcome}">${escapeHtml(c.outcome)}</span>
      </div>
      <p>${escapeHtml(c.summary_zh)}</p>
      <ul class="timeline">${timeline}</ul>
      <p style="margin-top:0.5rem;font-size:0.8rem">${sources}</p>
    </div>`;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
}

function resetAllStyles() {
  geoLayer.eachLayer((layer) => {
    const iso = layer.feature.properties.iso_a2;
    layer.setStyle(styleFeature(iso));
  });
}

async function initMap(counts) {
  map = L.map('leaflet-map', {
    zoomControl: true,
    minZoom: 3,
    maxZoom: 10,
    maxBounds: [[25, -35], [78, 55]],
    maxBoundsViscosity: 0.85,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a> | 边界 &copy; Natural Earth',
    subdomains: 'abcd',
    maxZoom: 12,
  }).addTo(map);

  map.fitBounds(EUROPE_BOUNDS);

  const geo = await fetch(GEOJSON_URL);
  if (!geo.ok) throw new Error(`无法加载 GeoJSON: ${geo.status}`);
  const geojson = await geo.json();

  geoLayer = L.geoJSON(geojson, {
    style: (feature) => {
      const iso = feature.properties.iso_a2;
      return styleFeature(iso);
    },
    onEachFeature: (feature, layer) => bindLayer(feature, layer, counts),
  }).addTo(map);

  // 确保初始样式写入（避免部分环境下 style 回调未着色）
  geoLayer.eachLayer((layer) => {
    const iso = layer.feature?.properties?.iso_a2;
    if (iso) layer.setStyle(styleFeature(iso));
  });

  document.getElementById('btn-reset-view').addEventListener('click', () => {
    selectedIso = null;
    resetAllStyles();
    hideCountryIdiomBanner();
    map.fitBounds(EUROPE_BOUNDS);
    document.getElementById('country-panel').innerHTML =
      '<div class="card empty-state">请在上方地图中选择一个国家，或点击「欧盟合作机制案例」</div>';
  });

  document.getElementById('btn-eu-cases').addEventListener('click', () => {
    selectedIso = 'EU';
    resetAllStyles();
    selectCountry('EU', casesData);
    map.fitBounds(EUROPE_BOUNDS);
  });
}

async function init() {
  casesData = await loadCases();
  styleByCountry = buildEnforcementStyleMap(casesData);
  const catalog = await loadReviewPointsCatalog();
  noveltyIndex = buildNoveltyIndex(casesData.cases, catalog).index;
  const counts = countByCountry(casesData);
  document.getElementById('last-updated').textContent =
    new Date(casesData.meta.last_updated).toLocaleString('zh-CN');

  await initMap(counts);

  const params = new URLSearchParams(location.search);
  const pre = params.get('c');
  if (pre) selectCountry(pre, casesData);
}

init().catch((e) => {
  console.error(e);
  document.getElementById('country-panel').innerHTML =
    `<div class="card empty-state">地图加载失败: ${escapeHtml(e.message)}</div>`;
});
