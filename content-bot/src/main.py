"""콘텐츠 봇 오케스트레이터.

흐름: 트렌딩 토픽 선정 → Claude 생성 → 어필리에이트 링크 삽입 → 파일 저장.
GitHub Actions cron 이 매일 실행 → Jekyll 이 GitHub Pages 로 빌드.
"""
from __future__ import annotations

import argparse
import sys

from .affiliate import inject_into_markdown
from .config import Config
from .generator import generate_post
from .publisher import save_post
from .trends import pick_topics


def run(dry_run: bool = False, n: int = 1) -> int:
    cfg = Config.load()
    topics = pick_topics(cfg.state_file, n=n)
    if not topics:
        print("[fatal] 선정된 주제 없음. 종료.", file=sys.stderr)
        return 1

    saved = 0
    failures: list[str] = []
    for topic in topics:
        print(f"[info] 주제: {topic}")
        try:
            post = generate_post(cfg.anthropic_api_key, cfg.anthropic_model, topic)
        except Exception as exc:  # noqa: BLE001
            msg = f"{type(exc).__name__}: {exc}"
            print(f"[error] 생성 실패: {msg}", file=sys.stderr)
            failures.append(f"{topic} → {msg}")
            continue

        body = inject_into_markdown(
            post.markdown, post.product_keywords, cfg.coupang_partners_id
        )

        if dry_run:
            print("=== DRY RUN ===")
            print(f"title: {post.title}")
            print(f"slug:  {post.slug}")
            print(f"desc:  {post.description}")
            print(f"keywords: {post.keywords}")
            print("--- body preview (300자) ---")
            print(body[:300])
            saved += 1
            continue

        out = save_post(post, body, cfg.posts_dir, cfg.blog_author)
        print(f"[ok] 저장: {out.relative_to(cfg.posts_dir.parents[2])}")
        saved += 1

    if saved == 0:
        print(
            f"[fatal] {len(topics)}개 주제 모두 생성 실패. "
            f"실패 내역:\n  - " + "\n  - ".join(failures),
            file=sys.stderr,
        )
        return 2
    if failures:
        print(f"[warn] 일부 실패 ({len(failures)}개)", file=sys.stderr)
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description="AI 콘텐츠 봇")
    p.add_argument("--dry-run", action="store_true", help="파일 저장 없이 미리보기")
    p.add_argument("-n", type=int, default=1, help="이번 실행에 생성할 글 수")
    args = p.parse_args()
    return run(dry_run=args.dry_run, n=args.n)


if __name__ == "__main__":
    raise SystemExit(main())
