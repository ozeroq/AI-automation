---
layout: post
title: "AI 자동 블로그 — 파이프라인 테스트"
date: 2026-05-31 12:00:00 +0900
description: "Jekyll → GitHub Pages 자동 빌드 파이프라인이 정상 작동하는지 확인하는 테스트 글입니다."
keywords: ["AI 자동화", "블로그 자동 발행", "GitHub Pages"]
author: 익명
---

이 글은 **자동 발행 파이프라인이 정상 작동하는지** 확인하기 위해 수동으로 푸시된 테스트 글입니다.

## 무엇이 자동인가

매일 새벽 KST 3시에 GitHub Actions cron 이 실행되면:

1. 한국 트렌딩 키워드 1~3개 자동 선정
2. Claude API 가 SEO 최적화 한국어 글을 생성
3. 쿠팡파트너스 어필리에이트 검색 링크 자동 삽입
4. Jekyll 이 마크다운 → HTML 변환
5. GitHub Pages 가 정적 사이트로 발행

## 다음 단계

이 글이 보이면 인프라가 정상이라는 뜻입니다. 이후 Actions → "Content Bot — Daily Auto Publish" → Run workflow 를 한 번 실행하면 실제 AI 생성 글이 추가됩니다.
