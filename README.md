# PixelRoom — 100만 픽셀 디지털 전시장

1000×1000 캔버스에서 10×10 픽셀 블록을 사고팔며, 각 블록이 하나의 **전시 룸 / 광고 룸**이 되는 사이트.

> Million Dollar Homepage(2005, $1M)의 진화형 — 정적 이미지가 아니라 **클릭하면 룸이 열리는** 인터랙티브 캔버스.

## 한 줄 컨셉

```
캔버스 1000×1000 = 100만 픽셀 = 10,000개 블록 = 10,000개의 미니 전시장
```

## 빠른 시작

```bash
cd canvas
cp .env.example .env.local
npm install
npm run dev
```

→ http://localhost:3000

## 프로젝트 구조

```
canvas/                 # 메인 Next.js 앱 (Vercel 배포)
├── app/
│   ├── page.tsx        캔버스 메인 (드래그 선택 / 클릭 → 룸)
│   ├── buy/            구매 페이지 (티어·소개·결제)
│   ├── room/[id]/      개별 룸 페이지 (SEO·SNS 공유용)
│   └── api/
│       ├── blocks/     블록 목록·상세
│       ├── reserve/    가격 미리보기
│       ├── checkout/   Stripe Checkout 세션
│       └── webhook/    결제 완료 → DB 저장
├── components/
│   ├── Canvas.tsx      줌·팬·드래그 선택 캔버스
│   └── RoomModal.tsx   클릭 시 열리는 룸
├── lib/
│   ├── grid.ts         블록 좌표 ↔ 픽셀 좌표
│   ├── pricing.ts      티어·위치 프리미엄
│   ├── db.ts           Upstash Redis (+ in-memory fallback)
│   └── types.ts
└── README.md           상세 가이드
```

## 수익 모델

| 티어 | 가격/블록 | 무엇을 할 수 있는가 |
|---|---|---|
| Basic | ₩1,000 | 이미지 + 외부 링크 |
| Gallery | ₩10,000 | 이미지 5장 + 룸 소개 |
| Exhibition | ₩30,000 | 풀 룸 + 영상·임베드 |
| Premium | ₩100,000 | 커스텀 HTML 룸 |

**수익 천장 시나리오** (전 블록 판매 시):
- 전부 Basic: ₩1,000만
- 평균 Gallery: ₩1억
- 평균 Exhibition: ₩3억

## 다음 단계

1. **Vercel 배포** — `canvas/` 디렉토리를 import (무료)
2. **Stripe 테스트 모드** — 키 발급 후 환경변수 입력
3. **Upstash Redis** 무료 가입 → URL/TOKEN 환경변수 입력 (영구 저장)
4. **첫 데모 룸 5~10개 시드** — 친구·지인 무료 입주로 캔버스가 비어보이지 않게
5. **트래픽 유입** — X/스레드/커뮤니티에 캔버스 캡처 공유 → 입소문

자세한 운영 가이드는 `canvas/README.md` 참고.
