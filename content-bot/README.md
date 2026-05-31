# Content Bot

Claude API 로 매일 새벽 한국어 SEO 블로그 글을 자동 생성하고
쿠팡파트너스 어필리에이트 링크를 삽입해 GitHub Pages 에 발행하는 봇.

## 로컬 테스트

```bash
cd content-bot
pip install -r requirements.txt
# 루트의 .env 에 ANTHROPIC_API_KEY 설정 후
python -m src.main --dry-run -n 1
```

## 자동 발행 설정

1. **GitHub Secrets 추가** (Settings → Secrets and variables → Actions)
   - `ANTHROPIC_API_KEY`
   - `COUPANG_PARTNERS_ID` (쿠팡파트너스 가입 후 발급)
2. **GitHub Pages 활성화**: Settings → Pages → Source: "GitHub Actions"
3. **수동 첫 실행**: Actions 탭 → "Content Bot — Daily Auto Publish" → Run workflow
4. 이후 매일 KST 새벽 3시 자동 발행

## 트래픽 끌어오는 법 (필수)

봇이 글을 써도 검색 노출엔 시간이 걸립니다. 초반에는:
- Google Search Console 등록 → sitemap 제출
- 네이버 서치어드바이저 등록
- 제목·메타를 검색 의도 맞게 조정 (생성 후 수동 수정 OK)
- 첫 30개 글 누적될 때까지는 손 봐주는 게 효과적

## 아키텍처

```
trends.py  → 오늘의 주제 선정 (Google Trends KR + 폴백 풀)
   ↓
generator.py → Claude 로 JSON 스키마 글 생성
   ↓
affiliate.py → 쿠팡 검색 링크 + 법적 고지문 삽입
   ↓
publisher.py → Jekyll 호환 마크다운 저장
   ↓
GitHub Actions → 자동 커밋·푸시 → Pages 빌드
```
