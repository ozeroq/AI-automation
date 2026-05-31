# AI Automation — 듀얼 트랙 수익 자동화

**현실 체크**: 이건 "버튼 누르면 돈 나오는" 시스템이 아닙니다. 콘텐츠 발행/SaaS 운영의 **반복 작업을 0으로** 만들어, 본인은 마케팅·최적화·신규 아이템 발굴에만 집중할 수 있게 해주는 인프라입니다. 보통 1~3개월 누적되어야 첫 수익이 발생합니다.

## 2개의 수익 트랙

### 1. Content Bot (`/content-bot`)
- **무엇**: Claude API로 매일 한국어 SEO 블로그 글을 자동 생성 → GitHub Pages로 자동 발행 → 쿠팡파트너스 링크 자동 삽입
- **수익원**: 쿠팡파트너스 어필리에이트 수수료, 추후 Google AdSense
- **비용**: 0원 (GitHub Actions cron + GitHub Pages 호스팅 무료)
- **운영**: 한 번 세팅 후 매일 새벽 자동 발행

### 2. AI SaaS (`/saas`)
- **무엇**: Next.js 기반 한국어 AI 도구 (자기소개서 첨삭, 이메일 작성, 회의록 요약 등)
- **수익원**: 무료 체험 → 월 구독 (Toss Payments / Stripe)
- **비용**: 0원 (Vercel 무료 티어 + Claude API는 사용량 기반)
- **운영**: 신규 도구 추가 / SEO·SNS로 트래픽 유입

## 빠른 시작

```bash
# 1. 환경 변수 세팅
cp .env.example .env
# .env에 ANTHROPIC_API_KEY, COUPANG_PARTNERS_ID 등 입력

# 2. 콘텐츠 봇 로컬 테스트
cd content-bot
pip install -r requirements.txt
python -m src.main --dry-run

# 3. SaaS 로컬 실행
cd saas
npm install
npm run dev
```

## 배포 (모두 무료 티어)

| 컴포넌트 | 호스팅 | 자동화 |
|---|---|---|
| 블로그 | GitHub Pages | GitHub Actions cron (매일 새벽 3시 KST) |
| SaaS | Vercel | git push 시 자동 배포 |
| DB (선택) | Supabase 무료 / Vercel KV | — |

## 환경 변수

`.env.example` 참고. 최소 필요:
- `ANTHROPIC_API_KEY` — Claude API
- `COUPANG_PARTNERS_ID` — 쿠팡파트너스 가입 후 발급 (무료)
- `GITHUB_TOKEN` — GitHub Actions에서 자동 주입 (수동 설정 불필요)

## 다음 단계 체크리스트

- [ ] `.env` 작성 (API 키 입력)
- [ ] 쿠팡파트너스 가입 → ID 발급 → `.env`에 입력
- [ ] GitHub Repo의 Settings → Secrets에 `ANTHROPIC_API_KEY` 추가
- [ ] GitHub Pages 활성화 (Settings → Pages → branch: `gh-pages`)
- [ ] 첫 발행 테스트: `gh workflow run content-cron.yml`
- [ ] Vercel 가입 후 `saas/` 디렉토리 import → 자동 배포
- [ ] 도메인 연결 (선택, `.dev`는 연 $12)
