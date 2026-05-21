const PODCAST_URL = '../data/podcast.json';

export async function initPodcast() {
  const section = document.getElementById('podcast-section');
  if (!section) return;

  const wrap = document.getElementById('podcast-player-wrap');
  const empty = document.getElementById('podcast-empty');

  try {
    const res = await fetch(PODCAST_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const ep = data.latest;
    if (!ep?.audio_latest && !ep?.audio_url) throw new Error('无播客数据');

    const audioUrl = ep.audio_latest || ep.audio_url;
    const audio = document.getElementById('podcast-audio');
    audio.src = audioUrl;

    document.getElementById('podcast-title').textContent = ep.title || '欧洲涉华投资审查周评';
    document.getElementById('podcast-date').textContent = ep.published || '—';
    const mins = ep.duration_sec ? (ep.duration_sec / 60).toFixed(1) : '—';
    document.getElementById('podcast-duration').textContent = mins;

    const scriptEl = document.getElementById('podcast-script');
    if (scriptEl && ep.script) {
      scriptEl.textContent = ep.script;
    }

    const hl = document.getElementById('podcast-highlights');
    if (hl && ep.highlights?.length) {
      hl.innerHTML = ep.highlights
        .map(
          (h) =>
            `<li><strong>${escapeHtml(h.country_name)}</strong> · ${escapeHtml(h.target || '')} · <span class="outcome">${escapeHtml(h.outcome || '')}</span></li>`
        )
        .join('');
    } else if (hl) {
      hl.innerHTML = '';
    }

    const badge = document.getElementById('podcast-badge');
    if (badge && ep.generated_at) {
      badge.textContent = `更新于 ${new Date(ep.generated_at).toLocaleString('zh-CN')}`;
    }

    wrap.classList.remove('hidden');
    empty.classList.add('hidden');
  } catch (e) {
    console.warn('Podcast load:', e);
    wrap?.classList.add('hidden');
    empty?.classList.remove('hidden');
  }
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
