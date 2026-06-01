"use client";

import { useEffect, useState } from "react";
import Panorama360 from "./Panorama360";

export type ScreenRect = { x: number; y: number; w: number; h: number };

type Props = {
  rect: ScreenRect;
  panoramaUrl: string;
  thumbnailUrl?: string;
  title?: string;
  ownerName?: string;
  description?: string;
  onClose: () => void;
};

const ENTER_MS = 450;
const EXIT_MS = 350;

export default function PortalTransition({
  rect,
  panoramaUrl,
  thumbnailUrl,
  title,
  ownerName,
  description,
  onClose,
}: Props) {
  // 'enter' = 시작 rect 박스 상태 (썸네일만 보임)
  // 'open'  = 풀스크린 (Pannellum 마운트)
  // 'exit'  = 닫히는 중 (rect 박스로 축소)
  const [phase, setPhase] = useState<"enter" | "open" | "exit">("enter");
  const [mounted360, setMounted360] = useState(false);

  useEffect(() => {
    // ESC 닫기
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 다음 프레임에 'open' 으로 전환 → CSS transition 발동
    const id = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    // 확장 애니메이션 끝난 후에 Pannellum 마운트 (transition 끊김 방지)
    const t = setTimeout(() => setMounted360(true), ENTER_MS);
    return () => clearTimeout(t);
  }, [phase]);

  function handleClose() {
    setMounted360(false);
    setPhase("exit");
    setTimeout(onClose, EXIT_MS);
  }

  const boxStyle: React.CSSProperties =
    phase === "open"
      ? {
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          transition: `all ${ENTER_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }
      : {
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          transition:
            phase === "exit"
              ? `all ${EXIT_MS}ms cubic-bezier(0.55, 0, 0.68, 0.45)`
              : "none",
        };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/0"
      style={{
        backgroundColor:
          phase === "open" ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0)",
        transition: `background-color ${ENTER_MS}ms ease`,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="fixed overflow-hidden rounded-lg shadow-2xl"
        style={{
          ...boxStyle,
          borderRadius: phase === "open" ? 0 : 4,
        }}
      >
        {/* 썸네일 (확장 중에 보이는 placeholder) */}
        {thumbnailUrl && !mounted360 && (
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: phase === "open" ? 0.4 : 1,
              transition: `opacity ${ENTER_MS}ms ease`,
            }}
          />
        )}

        {/* Pannellum 360° 뷰어 */}
        {mounted360 && phase === "open" && (
          <div className="absolute inset-0">
            <Panorama360 url={panoramaUrl} title={title} />
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {phase === "open" && !mounted360 && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
            룸으로 이동 중...
          </div>
        )}
      </div>

      {/* 상단 정보 + 닫기 (open 일 때만) */}
      {phase === "open" && (
        <>
          <div className="fixed top-4 left-4 z-10 max-w-md p-3 rounded-lg bg-black/60 backdrop-blur-sm text-white animate-fadein">
            {title && <div className="font-semibold">{title}</div>}
            {ownerName && (
              <div className="text-xs opacity-70 mt-0.5">by {ownerName}</div>
            )}
            {description && (
              <div className="text-xs opacity-90 mt-2 line-clamp-3">
                {description}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white text-xl backdrop-blur-sm"
            aria-label="닫기"
          >
            ✕
          </button>
        </>
      )}

      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadein {
          animation: fadein ${ENTER_MS}ms ease forwards;
          animation-delay: ${ENTER_MS - 150}ms;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
