/** 大屏深色主题 Chart.js 配色 */
export const CHART_THEME = {
  text: '#FFFFFF',
  muted: '#B0B8C1',
  grid: 'rgba(79, 195, 247, 0.12)',
  palette: ['#4FC3F7', '#FF7043', '#29B6F6', '#FF8A65', '#81D4FA', '#3A4A5C', '#FFB74D', '#81B4D9'],
  accent: '#4FC3F7',
  accentDark: '#29B6F6',
  warn: '#FF7043',
  warnDark: '#F4511E',
  // 兼容旧引用
  mint: '#4FC3F7',
  mintDark: '#29B6F6',
  coral: '#FF7043',
  coralDark: '#F4511E',
};

export function chartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: title, color: CHART_THEME.text, font: { size: 14, weight: '600' } },
      legend: { labels: { color: CHART_THEME.muted, boxWidth: 12 } },
    },
    scales: {
      x: { ticks: { color: CHART_THEME.muted }, grid: { color: CHART_THEME.grid } },
      y: { ticks: { color: CHART_THEME.muted }, grid: { color: CHART_THEME.grid }, beginAtZero: true },
    },
  };
}
