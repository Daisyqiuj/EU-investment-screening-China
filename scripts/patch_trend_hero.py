# -*- coding: utf-8 -*-
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / "web" / "index.html"

OLD = (
    '          <h2>欧盟涉华投资审查 · 趋势演示</h2>\n'
    '          <p class="trend-hero-desc">纯数据驱动动画 · 约 50 秒循环 · 悬停暂停</p>\n'
    '        </div>\n'
    '        <div class="trend-hero-controls">\n'
    '          <span class="trend-year-badge">年份 <strong id="trend-year">2019</strong></span>\n'
    '          <button type="button" class="trend-btn" id="trend-replay" title="重新播放">↻ 重播</button>\n'
    '          <button type="button" class="trend-btn trend-btn-ghost" id="trend-skip" title="收起演示">跳过</button>\n'
    '        </div>\n'
    '      </div>\n'
    '      <motion class="trend-canvas-wrap" id="trend-canvas-wrap">\n'
    '        <canvas id="trend-canvas" aria-label="欧盟涉华 FDI 审查趋势动画"></canvas>\n'
    '        <div class="trend-caption" id="trend-caption"></div>\n'
    '      </div>'
)
OLD = OLD.replace('<motion class="trend-canvas-wrap"', '<div class="trend-canvas-wrap"')

NEW = (
    '          <h2>欧盟涉华投资审查 · 分幕解说</h2>\n'
    '          <p class="trend-hero-desc">7 幕故事线 · 约 45 秒 · 左侧读文字、右侧看图表 · 悬停暂停</p>\n'
    '        </div>\n'
    '        <div class="trend-hero-controls">\n'
    '          <button type="button" class="trend-btn" id="trend-replay" title="重新播放">↻ 重播</button>\n'
    '          <button type="button" class="trend-btn trend-btn-ghost" id="trend-skip" title="收起演示">跳过</button>\n'
    '        </div>\n'
    '      </div>\n'
    '      <div class="trend-stage" id="trend-stage">\n'
    '        <div class="trend-narrative" id="trend-narrative">\n'
    '          <div class="trend-scene-meta">\n'
    '            <span class="trend-scene-step">第 <strong id="trend-scene-num">1</strong> / <span id="trend-scene-total">7</span> 幕</span>\n'
    '            <div class="trend-scene-dots" id="trend-scene-dots"></div>\n'
    '          </div>\n'
    '          <h3 class="trend-scene-title" id="trend-scene-title">加载中…</h3>\n'
    '          <ul class="trend-scene-bullets" id="trend-scene-bullets"></ul>\n'
    '        </div>\n'
    '        <div class="trend-chart-area" id="trend-canvas-wrap">\n'
    '          <canvas id="trend-canvas" aria-label="欧盟涉华 FDI 审查趋势动画"></canvas>\n'
    '        </div>\n'
    '      </div>'
)


def main():
    text = INDEX.read_text(encoding="utf-8")
    if OLD not in text:
        raise SystemExit("OLD block not found in index.html")
    INDEX.write_text(text.replace(OLD, NEW), encoding="utf-8")
    print("Patched", INDEX)


if __name__ == "__main__":
    main()
