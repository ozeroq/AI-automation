"""쿠팡파트너스 링크 생성 / 삽입.

법적 고지: 쿠팡파트너스 활동은 본문에 '쿠팡파트너스 활동의 일환으로
일정액의 수수료를 제공받을 수 있습니다.' 고지를 반드시 포함해야 한다.
"""
from __future__ import annotations

import urllib.parse

DISCLOSURE = (
    "\n\n> **쿠팡파트너스 안내**: 이 포스팅은 쿠팡파트너스 활동의 일환으로, "
    "이에 따른 일정액의 수수료를 제공받습니다. (구매자에게 추가 부담 없음)\n"
)


def search_link(keyword: str, partner_id: str) -> str:
    """파트너 ID 가 비면 일반 검색 링크 반환."""
    q = urllib.parse.quote(keyword)
    base = f"https://www.coupang.com/np/search?q={q}"
    if not partner_id:
        return base
    return f"{base}&lptag={partner_id}"


def inject_into_markdown(markdown: str, keywords: list[str], partner_id: str) -> str:
    if not keywords:
        return markdown + DISCLOSURE
    block_lines = ["", "### 관련 추천 상품", ""]
    for kw in keywords[:5]:
        url = search_link(kw, partner_id)
        block_lines.append(f"- [{kw} 쿠팡에서 보기]({url})")
    return markdown + "\n".join(block_lines) + DISCLOSURE
