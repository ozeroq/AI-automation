import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 도구 모음 — 자기소개서·이메일·요약 자동 생성",
  description:
    "Claude AI 로 자기소개서·비즈니스 이메일·회의록 요약을 30초 안에. 무료로 시작.",
  openGraph: {
    title: "AI 도구 모음",
    description: "30초 만에 자기소개서·이메일·요약을 AI 가 작성합니다.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
