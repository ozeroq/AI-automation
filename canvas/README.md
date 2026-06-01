# PixelRoom — 100만 픽셀 디지털 전시장

1000×1000 캔버스에서 10×10 픽셀 블록을 사고팔며, 각 블록이 하나의 **전시 룸 / 광고 룸**이 되는 사이트.
Million Dollar Homepage 컨셉의 진화형 — 정적 이미지 광고가 아니라 **클릭하면 룸이 열리는** 인터랙티브 캔버스.

## 핵심 컨셉

- **캔버스**: 1000×1000 픽셀 (총 1,000,000 픽셀)
- **최소 블록**: 10×10 픽셀 (100픽셀 단위)
- **총 블록 수**: 10,000개
- **기본가**: ₩1,000 / 블록 (중앙 가까울수록 최대 +50%)

### 4가지 티어 (1회성 구매)

| 티어 | 가격/블록 | 룸 콘텐츠 |
|---|---|---|
| Basic | ₩1,000 | 이미지 + 외부 링크 |
| Gallery | ₩10,000 | 이미지 5장 + 소개글 |
| Exhibition | ₩30,000 | 360° 파노라마 룸 |
| Premium | ₩100,000 | 커스텀 HTML |

### Pro 구독 (월 ₩15,000)

블록을 한 번 산 뒤에도 룸을 계속 운영·확장하기 위한 멤버십.

- 룸 콘텐츠 무제한 수정 (제목·소개·파노라마 교체)
- 갤러리 이미지·영상 추가 업로드
- 커스텀 서브도메인 (yourname.pixelroom.xyz)
- 방문자 분석 (일별 클릭·체류)
- 캔버스 호버 시 Pro 배지 표시

구매 흐름:
1. `/pricing` 페이지에서 이메일 입력 → Stripe Checkout (subscription mode)
2. 결제 완료 → webhook이 Subscriber 레코드 저장
3. 동일 이메일로 구매한 블록들이 자동으로 Pro 표시
4. `/manage` 에서 본인 블록 조회 + Stripe Customer Portal 진입 (해지·결제수단 변경)

## 로컬 실행

```bash
cd canvas
cp .env.example .env.local
# (선택) STRIPE_SECRET_KEY 입력
npm install
npm run dev
```

http://localhost:3000

스토리지 키가 없으면 in-memory 모드로 동작 (재시작 시 데이터 초기화).

## 핵심 기술 스택

| 영역 | 라이브러리 | 역할 |
|---|---|---|
| 캔버스 줌·팬 | **OpenSeadragon 5** | 무한 줌 타일 피라미드 + 키네틱 패닝. 100×100 그리드를 HTML 오버레이로 그림 |
| 360° 룸 | **Pannellum 2.5** | 등각투영 파노라마 뷰어. CDN lazy-load |
| 포털 전환 | 자체 구현 | 블록 화면 좌표 → 풀스크린 450ms 트랜지션, Pannellum 마운트 |
| 결제 | Stripe Checkout (KRW) | 한국 원화 결제 |
| 영구 저장 | Upstash Redis | 무료 티어 10k req/일 |

## Vercel 배포 (무료)

1. https://vercel.com 가입
2. Import → 이 레포 → **Root Directory: `canvas`**
3. 환경 변수 추가 (최소):
   - `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`
   - 결제 활성화 시: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - 영구 저장: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - 이미지 업로드: `BLOB_READ_WRITE_TOKEN`
4. Deploy

## 인프라 (모두 무료 티어로 시작)

| 컴포넌트 | 서비스 | 무료 한도 |
|---|---|---|
| 호스팅 | Vercel Hobby | 100GB 대역폭/월 |
| DB | Upstash Redis | 10,000 req/일 |
| 이미지 | Vercel Blob | 1GB 저장 / 100GB 다운 |
| 결제 | Stripe | 거래당 2.9% + ₩30 |

## 동작 흐름

```
[방문자] → 캔버스 보기 → 블록 호버: 미리보기 → 블록 클릭: 룸 모달
              ↓
        빈 영역 드래그 → /buy?bx=...
              ↓
        티어·이미지·소개 입력 → /api/checkout (Stripe Checkout 세션 생성)
              ↓
        Stripe 결제 페이지 → 결제 완료
              ↓
        Stripe Webhook → /api/webhook → DB에 블록 저장
              ↓
        다음 방문 시 캔버스에 즉시 표시
```

## 다음 확장

- [ ] 이미지 업로드 (Vercel Blob 연동) — 현재는 URL 직접 입력
- [ ] 관리자 검수 패널 (pending → active)
- [ ] 룸 콘텐츠 편집 (구매 후 추가 미디어 업로드)
- [ ] Toss Payments (한국 결제)
- [ ] 블록 재판매 / NFT 발행 (선택)
- [ ] 인기 룸 랭킹 / 신규 룸 피드
