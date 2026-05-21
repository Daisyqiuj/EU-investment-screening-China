/** Shared data loader */
const DATA_URL = '../data/cases.json';

let cachedData = null;

export async function loadCases() {
  if (cachedData) return cachedData;
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`无法加载资料库: ${res.status}`);
  cachedData = await res.json();
  return cachedData;
}

export function getCountryCases(data, countryCode) {
  return data.cases.filter(
    (c) => c.country === countryCode || (countryCode === 'EU' && c.region === 'EU' && c.country === 'EU')
  );
}

export function countByCountry(data) {
  const counts = {};
  for (const c of data.cases) {
    if (c.country === 'EU') continue;
    counts[c.country] = (counts[c.country] || 0) + 1;
  }
  return counts;
}

const SKIP_CHART_OUTCOMES = new Set(['机制运行', '无公开否决']);

export function countByOutcome(data) {
  const counts = {};
  for (const c of data.cases) {
    if (SKIP_CHART_OUTCOMES.has(c.outcome)) continue;
    if (c.deal_type === '机制说明') continue;
    counts[c.outcome] = (counts[c.outcome] || 0) + 1;
  }
  return counts;
}

/** 执法风格：与 policy.html 矩阵一致，可结合案例自动推断 */
export const ENFORCEMENT_STYLES = {
  hard: {
    id: 'hard',
    label: '硬否决型',
    desc: '公开禁止或否决技术转让，政治信号强',
    fill: '#FFB8BE',
    stroke: '#E06B74',
  },
  conditional: {
    id: 'conditional',
    label: '条件管控型',
    desc: '股权上限、治理限制、事后干预等',
    fill: '#F5E6C8',
    stroke: '#C9A227',
  },
  open: {
    id: 'open',
    label: '吸引投资型',
    desc: '积极吸纳中资绿地，审查禁止率低',
    fill: '#B5E8D4',
    stroke: '#5FAF92',
  },
  quiet: {
    id: 'quiet',
    label: '机制完善·个案少',
    desc: '法律工具齐全，公开涉华否决较少',
    fill: '#EEF7F6',
    stroke: '#9BB5AC',
  },
  default: {
    id: 'default',
    label: '暂无分类',
    desc: '尚无案例或执法风格未纳入本库',
    fill: '#E3F2F1',
    stroke: '#B5D9D0',
  },
};

const HARD_OUTCOMES = new Set(['禁止', '限制参与']);
const COND_OUTCOMES = new Set(['附条件批准', '政府干预', '审查中', '交易失败']);

/** 人工校正的优先风格（覆盖自动推断） */
const STYLE_OVERRIDE = {
  HU: 'open',
  FR: 'quiet',
  BE: 'quiet',
  IE: 'quiet',
  DK: 'quiet',
  FI: 'quiet',
  GR: 'quiet',
  LU: 'quiet',
  LV: 'quiet',
  MT: 'quiet',
  SK: 'quiet',
  SI: 'quiet',
  BG: 'quiet',
  HR: 'quiet',
  CY: 'quiet',
  EE: 'quiet',
  PL: 'quiet',
};

function scoreCases(cases) {
  let hard = 0;
  let cond = 0;
  for (const c of cases) {
    if (c.deal_type === '机制说明' || c.deal_type === '统计') continue;
    if (HARD_OUTCOMES.has(c.outcome)) hard += 2;
    else if (c.outcome === '政府干预') hard += 1.5;
    else if (COND_OUTCOMES.has(c.outcome)) cond += 1;
    else if (c.outcome === '批准') cond += 0.3;
  }
  return { hard, cond };
}

/**
 * 为每个国家生成执法风格（ISO2 -> style id）
 */
export function buildEnforcementStyleMap(data) {
  const byCountry = {};
  const grouped = {};

  for (const c of data.cases) {
    if (c.country === 'EU') continue;
    (grouped[c.country] ||= []).push(c);
  }

  for (const [code, list] of Object.entries(grouped)) {
    if (STYLE_OVERRIDE[code]) {
      byCountry[code] = STYLE_OVERRIDE[code];
      continue;
    }
    const concrete = list.filter((x) => x.deal_type !== '机制说明' && x.deal_type !== '统计');
    if (!concrete.length) {
      const onlyMech = list.some((x) => x.deal_type === '机制说明' || x.outcome === '无公开否决');
      byCountry[code] = onlyMech ? 'quiet' : 'default';
      continue;
    }
    const { hard, cond } = scoreCases(concrete);
    if (hard > cond && hard >= 1) byCountry[code] = 'hard';
    else if (cond >= hard && cond > 0) byCountry[code] = 'conditional';
    else if (hard > 0) byCountry[code] = 'hard';
    else byCountry[code] = 'quiet';
  }

  for (const code of Object.keys(STYLE_OVERRIDE)) {
    if (!byCountry[code]) byCountry[code] = STYLE_OVERRIDE[code];
  }

  return byCountry;
}

/** Leaflet Path 样式：须用 fillColor / color，不能用 fill / stroke */
export function getStyleColors(styleId) {
  const s = ENFORCEMENT_STYLES[styleId] || ENFORCEMENT_STYLES.default;
  return {
    fillColor: s.fill,
    color: s.stroke,
    weight: styleId === 'default' ? 1 : 1.5,
    opacity: 1,
    fillOpacity: styleId === 'default' ? 0.55 : 0.82,
  };
}

export const COUNTRY_NAMES = {
  AT: '奥地利', BE: '比利时', BG: '保加利亚', HR: '克罗地亚',
  CY: '塞浦路斯', CZ: '捷克', DE: '德国', DK: '丹麦',
  EE: '爱沙尼亚', ES: '西班牙', FI: '芬兰', FR: '法国',
  GR: '希腊', HU: '匈牙利', IE: '爱尔兰', IT: '意大利',
  LT: '立陶宛', LU: '卢森堡', LV: '拉脱维亚', MT: '马耳他',
  NL: '荷兰', PL: '波兰', PT: '葡萄牙', RO: '罗马尼亚',
  SE: '瑞典', SI: '斯洛文尼亚', SK: '斯洛伐克',
  GB: '英国', IS: '冰岛', NO: '挪威', EU: '欧盟',
};
