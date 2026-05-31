"""Claude 로 SEO 한국어 블로그 글 생성."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass

import anthropic

SYSTEM_PROMPT = """너는 한국어 SEO 블로그 작가다. 다음 규칙을 반드시 지킨다.

1. 출력은 **순수 JSON** 한 개. 추가 설명 금지.
2. 스키마:
   {
     "title": "60자 이내 후킹 제목",
     "slug": "url-safe-english-or-romanized-korean",
     "description": "150자 이내 메타 디스크립션",
     "keywords": ["SEO 키워드 5~8개"],
     "product_keywords": ["쿠팡에서 찾아볼만한 상품 키워드 3~5개"],
     "markdown": "1500~2500자 한국어 본문 (마크다운, ## 소제목 3개 이상, 표·목록 활용)"
   }
3. 본문은 정보성 + 후기형 + 비교형 중 하나의 톤으로 일관되게.
4. 본문 마지막에 '추천 정리' 섹션을 둔다.
5. 과장/허위 광고성 표현 금지. 가격·스펙은 '구매 시점 확인 권장' 으로 표기.
6. 외부 링크는 본문에 직접 박지 않는다 (어필리에이트 블록은 후처리에서 추가됨).
"""

USER_TEMPLATE = """주제: {topic}

위 주제로 한국 독자 대상 SEO 블로그 글을 작성해줘.
독자는 검색으로 유입된 일반인이다. 실용적이고 구체적인 정보 위주로.
"""


@dataclass
class GeneratedPost:
    title: str
    slug: str
    description: str
    keywords: list[str]
    product_keywords: list[str]
    markdown: str


def _coerce_slug(raw: str, fallback: str) -> str:
    s = raw.strip().lower()
    s = re.sub(r"[^a-z0-9\-]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or fallback


def generate_post(api_key: str, model: str, topic: str) -> GeneratedPost:
    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model=model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": USER_TEMPLATE.format(topic=topic)}],
    )
    text = "".join(
        block.text for block in msg.content if getattr(block, "type", None) == "text"
    ).strip()

    # 모델이 코드펜스로 감싸는 경우 제거
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    data = json.loads(text)
    fallback_slug = re.sub(r"\s+", "-", topic)[:40]
    return GeneratedPost(
        title=str(data["title"]).strip(),
        slug=_coerce_slug(str(data.get("slug", "")), fallback_slug),
        description=str(data["description"]).strip(),
        keywords=[str(k).strip() for k in data.get("keywords", [])],
        product_keywords=[str(k).strip() for k in data.get("product_keywords", [])],
        markdown=str(data["markdown"]).strip(),
    )
