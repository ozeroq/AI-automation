"""한국 트렌딩 키워드 수집.

pytrends 가 한국 일일 트렌드를 제공하지 않을 때를 대비해
폴백 키워드 풀을 둔다. 0원 운영 원칙.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import random
from pathlib import Path
from typing import Iterable

import requests

FALLBACK_TOPICS: tuple[str, ...] = (
    "재택근무 부업 추천",
    "초보 주식 투자 입문",
    "AI 활용 생산성 도구",
    "쿠팡 가성비 가전 추천",
    "퇴근 후 1시간 자기계발",
    "맞벌이 부부 절세 전략",
    "노트북 구매 가이드",
    "에어프라이어 요리 레시피",
    "1인 가구 자취 필수템",
    "건강검진 결과 해석",
    "겨울철 전기세 절약법",
    "사회초년생 적금 비교",
    "직장인 영어 회화 공부법",
    "주말 당일치기 국내 여행",
    "홈트레이닝 다이어트 루틴",
)


def google_trends_kr(limit: int = 5) -> list[str]:
    """공개 RSS 기반 한국 일일 트렌드. pytrends 의존 줄이고 안정성 ↑."""
    url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR"
    try:
        r = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code != 200:
            return []
        text = r.text
        titles: list[str] = []
        # 의존성 줄이기 위해 lxml 대신 단순 파싱
        for chunk in text.split("<item>")[1:]:
            start = chunk.find("<title>")
            end = chunk.find("</title>", start)
            if start == -1 or end == -1:
                continue
            raw = chunk[start + len("<title>") : end]
            raw = raw.replace("<![CDATA[", "").replace("]]>", "").strip()
            if raw:
                titles.append(raw)
            if len(titles) >= limit:
                break
        return titles
    except requests.RequestException:
        return []


def _hash_seed(when: dt.date) -> int:
    h = hashlib.sha256(when.isoformat().encode()).digest()
    return int.from_bytes(h[:4], "big")


def pick_topics(state_file: Path, n: int = 1) -> list[str]:
    """오늘의 주제 N개를 결정적으로 고른다. 중복 회피."""
    today = dt.date.today()
    pool: list[str] = google_trends_kr(limit=10) or []
    pool.extend(FALLBACK_TOPICS)

    used: set[str] = set()
    if state_file.exists():
        try:
            used = set(json.loads(state_file.read_text(encoding="utf-8")).get("used", []))
        except json.JSONDecodeError:
            used = set()

    rng = random.Random(_hash_seed(today))
    rng.shuffle(pool)
    picked: list[str] = []
    for topic in pool:
        if topic in used:
            continue
        picked.append(topic)
        if len(picked) >= n:
            break

    state_file.parent.mkdir(parents=True, exist_ok=True)
    used.update(picked)
    state_file.write_text(
        json.dumps({"used": sorted(used)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return picked
