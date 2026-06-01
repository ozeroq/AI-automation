# Vercel 배포 가이드 (5분 소요)

## 1. Vercel 가입 + GitHub 연결 (1분)

1. https://vercel.com/signup → **Continue with GitHub** (계정 ohyk5604 사용)
2. 권한 요청 페이지에서 `ozeroq/ai-automation` 레포에 액세스 허용

## 2. 프로젝트 Import (2분)

1. https://vercel.com/new → `ai-automation` 레포 옆 **Import**
2. **Configure Project** 화면에서:
   - **Project Name**: `pixelroom` (또는 원하는 이름 → 도메인이 됨)
   - **Framework Preset**: `Next.js` (자동 감지)
   - **Root Directory**: 우측 **Edit** 클릭 → **`canvas`** 입력 ⚠️ 중요
   - **Build / Output Settings**: 기본값 유지
3. **Environment Variables** 섹션은 일단 **비워두고** 다음 단계로
4. **Deploy** 클릭

→ 약 2분 후 `https://pixelroom-xxx.vercel.app` 형태 URL 생성

## 3. 환경 변수 추가 (2분)

배포 완료 후 Project → **Settings → Environment Variables**.
**최소 동작**(구경만)을 위해 비워둬도 OK. 결제·인증 활성화하려면 아래 단계.

### A. 결제 활성화 (Stripe)

1. https://dashboard.stripe.com/register → 가입 (한국 가능, 테스트 모드부터)
2. **Test mode** 좌상단 토글 켠 채로:
   - **Developers → API keys** 에서 `Secret key` 복사
   - Vercel 에 `STRIPE_SECRET_KEY = sk_test_...` 추가
   - **Publishable key** 도 복사 → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...`
3. **Developers → Webhooks → Add endpoint**:
   - Endpoint URL: `https://your-domain.vercel.app/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - **Reveal signing secret** → `STRIPE_WEBHOOK_SECRET = whsec_...`

### B. 영구 저장소 (Upstash Redis)

1. https://upstash.com → GitHub 로그인 → **Create Database** (Global, 무료 티어)
2. 만든 DB 의 **REST API** 탭에서:
   - `UPSTASH_REDIS_REST_URL` 복사
   - `UPSTASH_REDIS_REST_TOKEN` 복사
3. 둘 다 Vercel 환경변수에 추가

### C. 인증 (Auth + Email)

```
AUTH_SECRET = <openssl rand -base64 48 결과>
```

이메일 발송은 선택. 미설정 시 dev 모드에서만 동작 (운영은 사용자가 매직 링크를 받지 못함). 활성화하려면:

1. https://resend.com → GitHub 로그인 → **API Keys → Create**
2. 환경변수:
   ```
   RESEND_API_KEY = re_...
   RESEND_FROM = PixelRoom <onboarding@resend.dev>   # 도메인 검증 전엔 이거 사용
   ```

### D. 기타

```
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME = PixelRoom
```

## 4. 재배포

환경 변수 추가 후 **Deployments → ··· → Redeploy** 1회. 약 2분.

## 5. 동작 확인 체크리스트

배포된 URL 접속 후:

- [ ] 메인 페이지 캔버스 로드 (OpenSeadragon, 줌·팬 작동)
- [ ] 데모 블록(45,45) 클릭 → 박스가 풀스크린으로 확장 + 360° 파노라마 마운트
- [ ] 빈 영역 드래그 → 분홍 선택 박스 + `/buy` 이동
- [ ] `/buy` 결제 폼 정상 (Stripe 키 입력했다면 실제 Checkout 페이지로 이동)
- [ ] `/pricing` 페이지 4티어 + Pro 카드 표시
- [ ] `/manage` 로그인 카드 표시 → 이메일 입력 → (Resend 설정 시) 메일 도착, 미설정 시 응답에 debug_link
- [ ] `/auth/verify` 링크 클릭 → 쿠키 발급 → `/manage` 대시보드

## 6. 실제 결제 테스트 (Stripe Test mode)

Stripe 테스트 카드: `4242 4242 4242 4242`, 만료 미래 아무 날짜, CVC 아무 3자리, 우편번호 아무 5자리.

블록 구매 → Stripe Checkout → 결제 완료 → `/auth/checkout-success` 가 자동 로그인 → `/manage?purchase=success` 로 이동.

## 7. 커스텀 도메인 (선택)

Project → Settings → **Domains** → Add Domain. Vercel 의 무료 `*.vercel.app` 도 충분히 좋음.

## 8. 다음에 손 댈 것

- [ ] 이미지 업로드(현재 URL 직접 입력) → Vercel Blob 통합
- [ ] 갤러리 미디어 5장+ 업로드 (Pro 약속 충족)
- [ ] 관리자 검수 패널 (신고·NSFW 제거)
- [ ] Toss Payments (한국 카드 결제 마찰 ↓)
- [ ] 시드 룸 5-10개 추가 (캔버스 살아있어 보이게)
