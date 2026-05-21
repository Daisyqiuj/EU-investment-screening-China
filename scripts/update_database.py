#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
欧盟涉华 FDI 投资审查案例库 — 每周自动更新脚本
搜索欧盟委员会贸易与经济安全政策新闻及投资审查专题页面，
将新政策动态写入 framework_updates，并记录更新日志。
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CASES_FILE = DATA_DIR / "cases.json"
LOG_FILE = DATA_DIR / "update_log.json"

EC_NEWS_URL = "https://policy.trade.ec.europa.eu/news"
EC_SCREENING_URL = (
    "https://policy.trade.ec.europa.eu/enforcement-and-protection/investment-screening_en"
)
KEYWORDS = re.compile(
    r"fdi|foreign\s+direct\s+investment|investment\s+screening|screening\s+of\s+foreign|"
    r"chinese|china|third.countr",
    re.I,
)
HEADERS = {
    "User-Agent": "EU-China-FDI-Database-Updater/1.0 (research; +local)",
    "Accept-Language": "en,zh;q=0.8",
}
TIMEOUT = 30


def load_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_log() -> list:
    if LOG_FILE.exists():
        return load_json(LOG_FILE)
    return []


def append_log(entry: dict) -> None:
    log = load_log()
    log.append(entry)
    if len(log) > 200:
        log = log[-200:]
    save_json(LOG_FILE, log)


def fetch_html(url: str) -> str | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        return r.text
    except requests.RequestException as e:
        print(f"[WARN] Failed to fetch {url}: {e}", file=sys.stderr)
        return None


def parse_ec_news_list(html: str, base_url: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    items: list[dict] = []
    seen: set[str] = set()

    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        if not text or len(text) < 20:
            continue
        full = urljoin(base_url, href)
        if "policy.trade.ec.europa.eu" not in urlparse(full).netloc:
            continue
        if "/news/" not in full and "investment-screening" not in full:
            continue
        if not KEYWORDS.search(text) and not KEYWORDS.search(full):
            continue
        if full in seen:
            continue
        seen.add(full)
        items.append({"title": text[:300], "url": full})

    return items[:40]


def parse_news_article(html: str, url: str) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")
    title_el = soup.find("h1") or soup.find("title")
    title = title_el.get_text(strip=True) if title_el else url

    date = None
    for sel in ["time", ".date", ".publication-date"]:
        el = soup.select_one(sel)
        if el:
            date = el.get("datetime") or el.get_text(strip=True)
            break
    if not date:
        m = re.search(r"(\d{1,2}\s+\w+\s+\d{4})", soup.get_text())
        if m:
            date = m.group(1)

    paras = []
    for p in soup.find_all("p"):
        t = p.get_text(strip=True)
        if len(t) > 40:
            paras.append(t)
    summary = " ".join(paras[:3])[:600] if paras else title

    return {
        "id": f"EU-AUTO-{hash(url) % 10**8:08d}",
        "date": normalize_date(date),
        "title": title[:200],
        "title_en": title[:200],
        "summary": summary,
        "source_url": url,
        "source_type": "ec_news_auto",
    }


def normalize_date(raw: str | None) -> str:
    if not raw:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for fmt in ("%Y-%m-%d", "%d %B %Y", "%d %b %Y"):
        try:
            return datetime.strptime(raw[:30].strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def merge_framework_updates(db: dict, new_items: list[dict]) -> int:
    existing_urls = {u.get("source_url") for u in db.get("framework_updates", [])}
    added = 0
    for item in new_items:
        if item["source_url"] in existing_urls:
            continue
        db.setdefault("framework_updates", []).insert(0, item)
        existing_urls.add(item["source_url"])
        added += 1
    return added


def scan_cases_for_keywords(db: dict, articles: list[dict]) -> list[str]:
    """Match news titles to existing cases by country/company keywords (heuristic)."""
    hints = []
    case_keywords: list[tuple[str, list[str]]] = []
    for c in db.get("cases", []):
        kws = [
            c.get("target_company", ""),
            c.get("investor", ""),
            c.get("country_name_en", ""),
            c.get("country_name", ""),
        ]
        case_keywords.append((c["id"], [k.lower() for k in kws if k and k != "N/A"]))

    for art in articles:
        title_low = art["title"].lower()
        for cid, kws in case_keywords:
            if any(k and k in title_low for k in kws if len(k) > 4):
                hints.append(f"Possible update for {cid}: {art['url']}")
    return hints


def update_existing_case_progress(db: dict, hints: list[str]) -> int:
    """Append review hints to case timeline when news may relate."""
    updated = 0
    for hint in hints:
        m = re.search(r"for (\S+):", hint)
        if not m:
            continue
        cid = m.group(1)
        url = hint.split(": ", 1)[-1]
        for case in db.get("cases", []):
            if case["id"] != cid:
                continue
            timeline = case.setdefault("timeline", [])
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            note = f"EC/政策新闻可能相关进展（自动标记）: {url}"
            if any(note in t.get("event", "") for t in timeline):
                break
            timeline.append({"date": today, "event": note})
            case["status"] = case.get("status", "closed")
            updated += 1
            break
    return updated


def run_update() -> dict:
    db = load_json(CASES_FILE)
    articles_meta: list[dict] = []

    list_html = fetch_html(EC_NEWS_URL)
    if list_html:
        articles_meta.extend(parse_ec_news_list(list_html, EC_NEWS_URL))

    screening_html = fetch_html(EC_SCREENING_URL)
    if screening_html:
        articles_meta.extend(parse_ec_news_list(screening_html, EC_SCREENING_URL))

    detailed: list[dict] = []
    for meta in articles_meta[:15]:
        page = fetch_html(meta["url"])
        if page:
            parsed = parse_news_article(page, meta["url"])
            if parsed:
                detailed.append(parsed)

    if not detailed:
        for meta in articles_meta:
            detailed.append(
                {
                    "id": f"EU-AUTO-{hash(meta['url']) % 10**8:08d}",
                    "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "title": meta["title"],
                    "title_en": meta["title"],
                    "summary": meta["title"],
                    "source_url": meta["url"],
                    "source_type": "ec_news_auto",
                }
            )

    framework_added = merge_framework_updates(db, detailed)
    hints = scan_cases_for_keywords(db, articles_meta)
    cases_updated = update_existing_case_progress(db, hints)

    now = datetime.now().astimezone().isoformat(timespec="seconds")
    db["meta"]["last_updated"] = now

    save_json(CASES_FILE, db)

    result = {
        "timestamp": now,
        "framework_updates_added": framework_added,
        "cases_timeline_updated": cases_updated,
        "articles_scanned": len(articles_meta),
        "hints": hints[:10],
        "status": "ok",
    }
    append_log(result)

    try:
        scripts_dir = Path(__file__).resolve().parent
        if str(scripts_dir) not in sys.path:
            sys.path.insert(0, str(scripts_dir))
        from generate_podcast import generate_episode

        pod = generate_episode(db)
        result["podcast"] = pod
        print(f"[OK] Podcast generated: {pod.get('episode_id')}")
    except Exception as e:
        result["podcast"] = {"status": "error", "error": str(e)}
        print(f"[WARN] Podcast generation skipped: {e}", file=sys.stderr)

    return result


def main() -> int:
    print("Starting EU-China FDI database update...")
    try:
        result = run_update()
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except Exception as e:
        err = {"timestamp": datetime.now().isoformat(), "status": "error", "error": str(e)}
        append_log(err)
        print(f"ERROR: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
