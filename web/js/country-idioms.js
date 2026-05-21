/** 欧洲各国幽默俚语（点击地图时展示） */
export const COUNTRY_IDIOMS = {
  AT: {
    original: '„Schwimmen lernen heißt, die Angst vor dem Wasser zu verlieren.“',
    zh: '学会游泳，就是要克服对水的恐惧。',
  },
  BE: {
    original: '„Meten is weten.“',
    zh: '测量就是知道（调侃人们爱量化）。',
  },
  BG: {
    original: '„Който копае гроб другиму, сам пада в него.“',
    zh: '谁给别人挖坑，自己先掉进去。',
  },
  HR: {
    original: '„Tko rano rani, dvije sreće grabi.“',
    zh: '早起的人抓两份幸运（鼓励早起也带点幽默）。',
  },
  CY: {
    original: '„Όποιος βιάζεται σκοντάφτει.“',
    zh: '欲速则不达。',
  },
  CZ: {
    original: '„Bez práce nejsou koláče.“',
    zh: '没有劳动就没有蛋糕。',
  },
  DK: {
    original: '„Hvo intet vover, intet vinder.“',
    zh: '不敢冒险的人，什么都得不到。',
  },
  EE: {
    original: '„Parem hilja kui mitte kunagi.“',
    zh: '迟到总比永远不来好。',
  },
  FI: {
    original: '„Ei savua ilman tulta.“',
    zh: '无风不起浪。',
  },
  FR: {
    original: '„Il ne faut pas vendre la peau de l’ours avant de l’avoir tué.“',
    zh: '别在没打死熊之前就卖熊皮（别高兴得太早）。',
  },
  DE: {
    original: '„Ich verstehe nur Bahnhof.“',
    zh: '我只听懂火车站（完全不明白）。',
  },
  GR: {
    original: '„Τα φιλιά είναι για τους τολμηρούς.“',
    zh: '亲吻是勇敢者的事。',
  },
  HU: {
    original: '„Kutyából nem lesz szalonna.“',
    zh: '狗永远变不成培根（本性难移）。',
  },
  IE: {
    original: '„May the road rise to meet you.“',
    zh: '愿路高高迎你（幽默祝福语，口语风趣）。',
  },
  IT: {
    original: '„Chi dorme non piglia pesci.“',
    zh: '睡觉的人抓不到鱼（劝人勤快）。',
  },
  LV: {
    original: '„Kas neriskē, tas neuzvar.“',
    zh: '不冒险的人不会赢。',
  },
  LT: {
    original: '„Geriau vėliau negu niekada.“',
    zh: '迟到总比永不做好。',
  },
  LU: {
    original: '„Aller guten Dinge sind drei.“',
    zh: '好事成三（三次才成好事）。',
  },
  MT: {
    original: '„Għal qalbi, ħa nibqa’ kalm.“',
    zh: '为了心情，我保持冷静（调侃耐心）。',
  },
  NL: {
    original: '„Wie niet waagt, wie niet wint.“',
    zh: '不入虎穴，焉得虎子。',
  },
  PL: {
    original: '„Co kraj, to obyczaj.“',
    zh: '每个国家有每个国家的习惯。',
  },
  PT: {
    original: '„Quem não arrisca, não petisca.“',
    zh: '不冒险就得不到点心。',
  },
  RO: {
    original: '„Cine se scoală de dimineaţă, departe ajunge.“',
    zh: '早起的人走得远（幽默劝早起）。',
  },
  SK: {
    original: '„Lepšie neskoro ako nikdy.“',
    zh: '迟到总比永不做好。',
  },
  SI: {
    original: '„Kdor ne poskusi, ne ve.“',
    zh: '不试试，你永远不知道。',
  },
  ES: {
    original: '„Más vale tarde que nunca.“',
    zh: '迟做总比不做好。',
  },
  SE: {
    original: '„Borta bra men hemma bäst.“',
    zh: '外面再好，也不如家好。',
  },
  GB: {
    original: '„It’s not my cup of tea.“',
    zh: '这不是我的菜（不喜欢）。',
  },
  IS: {
    original: '„Það er ekki allt gull sem glóir.“',
    zh: '发光的东西未必都是金子（事物不全看表面）。',
  },
  NO: {
    original: '„Bedre føre var enn etter snar.“',
    zh: '小心驶得万年船（小心总比事后补救好）。',
  },
};

const EU_BANNER = {
  original: '„Unity in diversity.“',
  zh: '多元一体——欧盟合作机制下的投资审查，个案在布鲁塞尔协调、各国门前落地。',
};

export function flagUrl(iso) {
  if (iso === 'EU') return 'https://flagcdn.com/w160/eu.png';
  const code = String(iso || '').toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return null;
  return `https://flagcdn.com/w160/${code}.png`;
}

export function showCountryIdiomBanner(iso, countryNameZh) {
  const banner = document.getElementById('country-idiom-banner');
  if (!banner) return;

  const flagImg = document.getElementById('idiom-flag');
  const nameEl = document.getElementById('idiom-country-name');
  const origEl = document.getElementById('idiom-original');
  const zhEl = document.getElementById('idiom-zh');

  const idiom = iso === 'EU' ? EU_BANNER : COUNTRY_IDIOMS[iso];
  const url = flagUrl(iso);

  nameEl.textContent = countryNameZh || iso;
  if (url && flagImg) {
    flagImg.src = url;
    flagImg.alt = `${countryNameZh || iso} 国旗`;
    flagImg.hidden = false;
  } else if (flagImg) {
    flagImg.hidden = true;
  }

  if (idiom) {
    origEl.textContent = idiom.original;
    zhEl.textContent = idiom.zh;
    origEl.hidden = false;
    zhEl.hidden = false;
  } else {
    origEl.textContent = '';
    zhEl.textContent = '该国幽默俚语尚未收录，欢迎后续补充。';
    origEl.hidden = true;
    zhEl.hidden = false;
  }

  banner.classList.remove('hidden');
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function hideCountryIdiomBanner() {
  const banner = document.getElementById('country-idiom-banner');
  if (banner) banner.classList.add('hidden');
}
