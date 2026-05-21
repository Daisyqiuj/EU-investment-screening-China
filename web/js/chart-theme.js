/** 治愈系 Chart.js 主题 v2 */
export const CHART_THEME = {
  text: '#333333',
  muted: '#5C6B66',
  grid: 'rgba(142, 210, 186, 0.55)',
  palette: ['#8ED2BA', '#FF8C94', '#B5E8D4', '#FFB8BE', '#6BB89E', '#E3F2F1', '#F0C987', '#C5B8E8'],
  mint: '#8ED2BA',
  mintDark: '#5FAF92',
  coral: '#FF8C94',
  coralDark: '#E06B74',
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
