"""Jekyll 호환 마크다운으로 디스크에 저장 → GitHub Pages 가 자동 빌드."""
from __future__ import annotations

import datetime as dt
from pathlib import Path

from .generator import GeneratedPost


FRONTMATTER_TEMPLATE = """---
layout: post
title: {title!r}
date: {date}
description: {description!r}
keywords: [{keywords}]
author: {author}
---

"""


def _yaml_list(items: list[str]) -> str:
    return ", ".join(f'"{i}"' for i in items)


def save_post(
    post: GeneratedPost,
    body_markdown: str,
    posts_dir: Path,
    author: str,
    now: dt.datetime | None = None,
) -> Path:
    now = now or dt.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    filename = f"{date_str}-{post.slug}.md"
    out_path = posts_dir / filename
    front = FRONTMATTER_TEMPLATE.format(
        title=post.title,
        date=now.strftime("%Y-%m-%d %H:%M:%S +0900"),
        description=post.description,
        keywords=_yaml_list(post.keywords),
        author=author,
    )
    out_path.write_text(front + body_markdown + "\n", encoding="utf-8")
    return out_path
