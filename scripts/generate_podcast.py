#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
根据 cases.json 生成约 800 字的周评播客脚本，并用 edge-tts 合成 MP3。
输出：data/podcast.json、web/audio/latest.mp3、web/audio/episode_YYYYMMDD.mp3
"""

from __future__ import annotations

import asyncio
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CASES_FILE = DATA_DIR / "cases.json"
PODCAST_JSON = DATA_DIR / "podcast.json"
AUDIO_DIR = ROOT / "web" / "audio"
TTS_VOICE = "zh-CN-XiaoxiaoNeural"
TARGET_CHARS = (780, 860)

COUNTRY_NAMES = {
    "AT": "奥地利", "BE": "比利时", "BG": "保加利亚", "HR": "克罗地亚",
    "CY": "塞浦路斯", "CZ": "捷克", "DE": "德国", "DK": "丹麦",
    "EE": "爱沙尼亚", "ES": "西班牙", "FI": "芬兰", "FR": "法国",
    "GR": "希腊", "HU": "匈牙利", "IE": "爱尔兰", "IT": "意大利",
    "LT": "立陶宛", "LU": "卢森堡", "LV": "拉脱维亚", "MT": "马耳他",
    "NL": "荷兰", "PL": "波兰", "PT": "葡萄牙", "RO": "罗马尼亚",
    "SE": "瑞典", "SI": "斯洛文尼亚", "SK": "斯洛伐克", "GB": "英国",
    "EU": "欧盟",
}

SKIP_DEAL = {"机制说明", "统计"}
SKIP_OUTCOME_CHART = {"机制运行", "无公开否决"}
HIGHLIGHT_OUTCOMES = {"禁止", "限制参与", "政府干预", "附条件批准", "交易失败", "审查中"}


def load_cases() -> dict:
    with open(CASES_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def concrete_cases(cases: list) -> list:
    return [
        c for c in cases
        if c.get("deal_type") not in SKIP_DEAL
        and c.get("outcome") not in SKIP_OUTCOME_CHART
    ]


def analyze(db: dict) -> dict:
    cases = db["cases"]
    concrete = concrete_cases(cases)
    outcomes = Counter(c["outcome"] for c in concrete)
    countries = Counter(c["country"] for c in concrete)
    sectors = Counter(c.get("target_sector", "其他") for c in concrete)

    years = []
    for c in concrete:
        d = c.get("decision_date") or ""
        m = re.match(r"(\d{4})", str(d))
        if m:
            years.append(int(m.group(1)))
    year_counts = Counter(years)

    highlights = []
    for c in concrete:
        if c.get("outcome") not in HIGHLIGHT_OUTCOMES:
            continue
        score = 0
        if c["outcome"] in ("禁止", "限制参与"):
            score += 3
        elif c["outcome"] in ("政府干预", "交易失败"):
            score += 2
        else:
            score += 1
        if "半导体" in c.get("target_sector", "") or "半导体" in c.get("summary_zh", ""):
            score += 1
        d = c.get("decision_date") or "0000"
        highlights.append((d, score, c))
    highlights.sort(key=lambda x: (x[0], x[1]), reverse=True)
    top_cases = [x[2] for x in highlights[:4]]

    fw = db.get("framework_updates") or []
    recent_fw = sorted(fw, key=lambda x: x.get("date", ""), reverse=True)[:2]

    eu_meta = db.get("meta", {}).get("eu27_coverage", {})
    ms_count = len(eu_meta.get("countries_with_entries") or [])

    return {
        "total": len(cases),
        "concrete_n": len(concrete),
        "outcomes": outcomes,
        "countries": countries,
        "sectors": sectors,
        "year_counts": year_counts,
        "highlights": top_cases,
        "recent_fw": recent_fw,
        "ms_count": ms_count,
        "last_updated": db.get("meta", {}).get("last_updated", ""),
    }


def outcome_phrase(stats: dict) -> str:
    oc = stats["outcomes"]
    banned = oc.get("禁止", 0) + oc.get("限制参与", 0)
    cond = oc.get("附条件批准", 0)
    approved = oc.get("批准", 0)
    other = sum(v for k, v in oc.items() if k not in ("禁止", "限制参与", "附条件批准", "批准"))
    parts = []
    if banned:
        parts.append(f"公开禁止或限制类决定约 {banned} 起")
    if cond:
        parts.append(f"附条件批准 {cond} 起")
    if approved:
        parts.append(f"无条件批准 {approved} 起")
    if other:
        parts.append(f"审查中、政府干预或交易失败等 {other} 起")
    return "；".join(parts) if parts else "各类结果分布较为分散"


def sector_phrase(stats: dict) -> str:
    top = stats["sectors"].most_common(3)
    if not top:
        return "半导体、关键基础设施与电信仍是执法关注重点"
    names = "、".join(f"{s}（{n}起）" for s, n in top)
    return f"行业分布上，{names} 案例相对集中"


def country_phrase(stats: dict) -> str:
    top = stats["countries"].most_common(5)
    if not top:
        return ""
    items = []
    for code, n in top:
        name = COUNTRY_NAMES.get(code, code)
        items.append(f"{name}{n}起")
    return "案例数量较多的司法管辖区包括：" + "、".join(items) + "。"


def highlight_phrase(case: dict, brief: bool = False) -> str:
    name = COUNTRY_NAMES.get(case["country"], case.get("country_name", case["country"]))
    outcome = case.get("outcome", "")
    sector = case.get("target_sector", "") or "涉华交易"
    year = (case.get("decision_date") or "")[:4]
    if brief:
        return f"{name}{year}年{sector}案（{outcome}）"
    target = re.sub(r"[（(].*$", "", case.get("target_company") or "")[:14]
    summary = (case.get("summary_zh") or "")[:40]
    return f"{name}{year}年{target}（{sector}，{outcome}）：{summary}"


def framework_phrase(fw: dict, brief: bool = False) -> str:
    title = fw.get("title") or fw.get("title_en") or ""
    date = fw.get("date", "")
    if brief:
        return f"{date}，{title[:32]}"
    summary = (fw.get("summary") or "")[:65]
    return f"{date}，{title}。{summary}"


def build_script(db: dict, stats: dict) -> str:
    now = datetime.now()
    week = now.isocalendar()[1]
    date_str = now.strftime("%Y年%m月%d日")
    meta_date = stats["last_updated"][:10] if stats["last_updated"] else now.strftime("%Y-%m-%d")

    intro = (
        f"欢迎收听「欧洲涉华投资审查周评」，本期为第{week}期，"
        f"播报日期{date_str}。本节目根据案例库每周一自动更新的公开资料整理，"
        f"数据截至{meta_date}，仅供研究参考，不构成法律意见。"
    )

    overview = (
        f"本期资料库共收录 {stats['total']} 条条目，"
        f"其中可比对的具体交易与审查决定 {stats['concrete_n']} 起，"
        f"覆盖欧盟及欧洲范围内 {stats['ms_count']} 个成员国或关联司法管辖区。"
        f"从结果类型看，{outcome_phrase(stats)}。"
        f"{sector_phrase(stats)}。"
    )

    trend = (
        "从近年趋势观察，欧洲涉华投资审查呈现「机制全覆盖、个案选择严」的特点："
        "多数成员国已建立或完善国家审查工具，公开否决多集中在半导体、国防供应链、"
        "关键基础设施与敏感数据领域；同时，绿地投资与新能源项目在一些国家仍获较快批准，"
        "形成「硬否决」与「条件管控」并存的执法光谱。"
    )
    yc = stats["year_counts"]
    if yc:
        recent_years = sorted(yc.keys(), reverse=True)[:3]
        yparts = [f"{y}年{yc[y]}起" for y in recent_years]
        trend += f" 按决定年份统计，最近可见记录为：" + "、".join(yparts) + "。"

    country_line = country_phrase(stats)

    closing = (
        "以上为本期周评。访问案例库网站可查看互动地图、各国执法风格分类与完整时间线。"
        "我们每周一上午九点随数据库同步更新，下期再见。"
    )

    lo, hi = TARGET_CHARS

    def highlights_block(brief: bool) -> str:
        hb = "本周点评重点案件："
        for i, c in enumerate(stats["highlights"][:3], 1):
            hb += f"第{i}，{highlight_phrase(c, brief=brief)}；"
        return hb

    def policy_block(brief: bool) -> str:
        if stats["recent_fw"]:
            fb = "政策层面，近期欧盟动态："
            for fw in stats["recent_fw"][:1 if brief else 2]:
                fb += framework_phrase(fw, brief=brief) + "。"
            if not brief:
                fb += "布鲁塞尔正推动筛查规则修订与成员国协调，涉华投资合规成本可能继续上升。"
            return fb
        return "政策层面，欧盟持续推进 FDI 筛查条例修订与年度报告发布，强调经济安全与机制对齐。"

    def assemble(brief: bool, with_countries: bool) -> str:
        parts = [intro, overview, trend]
        if with_countries:
            parts.append(country_line)
        parts.extend([highlights_block(brief), policy_block(brief), closing])
        return "".join(p for p in parts if p)

    script = assemble(brief=False, with_countries=True)
    if len(script) > hi:
        script = assemble(brief=True, with_countries=True)
    if len(script) > hi:
        script = assemble(brief=True, with_countries=False)
    if len(script) < lo:
        script += (
            "对投资者而言，建议在交易早期即进行国家安全审查预判，"
            "重点关注半导体、关键基础设施与敏感数据资产，"
            "并预留与成员国机关及欧盟合作机制沟通的时间窗口。"
        )
    if len(script) > hi:
        script = assemble(brief=True, with_countries=False)
        if len(script) > hi:
            script = intro + overview + highlights_block(True) + policy_block(True) + closing

    return script


def mp3_duration(path: Path) -> int | None:
    try:
        from mutagen.mp3 import MP3
        return int(MP3(path).info.length)
    except Exception:
        return None


async def synthesize_mp3(text: str, out_path: Path) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(text, TTS_VOICE)
    await communicate.save(str(out_path))


def generate_episode(db: dict | None = None) -> dict:
    if db is None:
        db = load_cases()
    stats = analyze(db)
    script = build_script(db, stats)

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d")
    episode_file = AUDIO_DIR / f"episode_{stamp}.mp3"
    latest_file = AUDIO_DIR / "latest.mp3"

    print(f"[podcast] 脚本字数: {len(script)}")
    print("[podcast] 正在合成语音 (edge-tts)…")
    asyncio.run(synthesize_mp3(script, episode_file))
    # 同步 latest 副本
    latest_file.write_bytes(episode_file.read_bytes())

    duration = mp3_duration(episode_file)
    if duration is None:
        duration = max(60, int(len(script) / 4.2))

    now_iso = datetime.now().astimezone().isoformat(timespec="seconds")
    episode = {
        "id": f"{datetime.now().strftime('%Y')}-W{datetime.now().isocalendar()[1]:02d}",
        "title": f"第{datetime.now().isocalendar()[1]}期 · 欧洲涉华投资审查周评",
        "published": datetime.now().strftime("%Y-%m-%d"),
        "generated_at": now_iso,
        "duration_sec": duration,
        "script": script,
        "char_count": len(script),
        "audio_url": f"audio/episode_{stamp}.mp3",
        "audio_latest": "audio/latest.mp3",
        "highlights": [
            {
                "country": c["country"],
                "country_name": c.get("country_name") or COUNTRY_NAMES.get(c["country"], c["country"]),
                "outcome": c.get("outcome"),
                "target": c.get("target_company"),
            }
            for c in stats["highlights"][:3]
        ],
    }

    manifest = {"latest": episode, "episodes": []}
    if PODCAST_JSON.exists():
        manifest = json.loads(PODCAST_JSON.read_text(encoding="utf-8"))
    eps = manifest.get("episodes") or []
    eps = [e for e in eps if e.get("id") != episode["id"]]
    eps.insert(0, episode)
    manifest["latest"] = episode
    manifest["episodes"] = eps[:12]
    save_json(PODCAST_JSON, manifest)

    print(f"[podcast] 已保存: {episode_file}")
    print(f"[podcast] 时长约 {duration} 秒")
    return {"status": "ok", "episode_id": episode["id"], "duration_sec": duration, "char_count": len(script)}


def main() -> int:
    try:
        result = generate_episode()
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
