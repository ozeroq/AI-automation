# AI SaaS — 한국어 AI 도구 모음

Next.js 15 + Claude API 로 만든 마이크로 SaaS.
무료 3회/일 → ₩9,900/월 Pro 전환 모델.

## 로컬 실행

```bash
cp .env.example .env.local
# ANTHROPIC_API_KEY 입력
npm install
npm run dev
```

http://localhost:3000

## Vercel 배포 (무료)

1. https://vercel.com 가입 (GitHub 로 로그인)
2. "Add New" → "Project" → 이 레포 import
3. **Root Directory**: `saas`
4. Environment Variables 에 `ANTHROPIC_API_KEY` 추가
5. Deploy

이후 main 브랜치 푸시 시 자동 재배포.

## 도구 추가하기

`lib/prompts.ts` 의 `TOOLS` 객체에 새 슬러그 + 시스템 프롬프트 + 필드 추가 → 끝.
페이지/API/UI 자동 적용.

## 결제 (Pro 활성화)

1. https://stripe.com 가입 → 한국 사업자 등록 또는 테스트 모드 시작
2. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` 설정
3. Vercel 환경변수 추가 → 자동 재배포

한국 결제만 원하면 `app/api/checkout/route.ts` 를 Toss Payments SDK 로 교체.
