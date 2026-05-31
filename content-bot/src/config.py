import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@dataclass(frozen=True)
class Config:
    anthropic_api_key: str
    anthropic_model: str
    coupang_partners_id: str
    blog_base_url: str
    blog_author: str
    posts_dir: Path
    state_file: Path

    @classmethod
    def load(cls) -> "Config":
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY 가 .env 또는 환경 변수에 없습니다. "
                ".env.example 을 참고해 .env 를 만들어 주세요."
            )
        root = Path(__file__).resolve().parents[2]
        posts_dir = root / "content-bot" / "blog" / "posts"
        posts_dir.mkdir(parents=True, exist_ok=True)
        return cls(
            anthropic_api_key=api_key,
            anthropic_model=os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-7"),
            coupang_partners_id=os.environ.get("COUPANG_PARTNERS_ID", ""),
            blog_base_url=os.environ.get("BLOG_BASE_URL", "https://example.github.io"),
            blog_author=os.environ.get("BLOG_AUTHOR", "익명"),
            posts_dir=posts_dir,
            state_file=root / "content-bot" / ".cache" / "state.json",
        )
