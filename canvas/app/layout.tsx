import type { Metadata } from "next";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_NAME ?? "PixelRoom";

export const metadata: Metadata = {
  title: `${SITE} — 100만 픽셀 디지털 전시장`,
  description:
    "1000×1000 캔버스의 픽셀을 사서 본인만의 광고·갤러리·전시 룸을 여는 곳. " +
    "한 번 구매하면 영구 소유. 클릭하면 그 사람의 룸이 열립니다.",
  openGraph: {
    title: `${SITE}`,
    description: "100만 픽셀, 10,000개의 전시 룸",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
