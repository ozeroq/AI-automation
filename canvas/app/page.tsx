"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Canvas from "@/components/Canvas";
import RoomModal from "@/components/RoomModal";
import type { BlockArea } from "@/lib/grid";
import type { BlockSummary } from "@/lib/types";
import { TIER_PRICES_KRW, formatKrw } from "@/lib/pricing";

export default function Home() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [pendingArea, setPendingArea] = useState<BlockArea | null>(null);

  useEffect(() => {
    fetch("/api/blocks")
      .then((r) => r.json())
      .then((d) => setBlocks(d.blocks ?? []));
  }, []);

  const sold = blocks.reduce((s, b) => s + b.bw * b.bh, 0);
  const remaining = 10000 - sold;

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            PixelRoom
          </h1>
          <p className="text-sm opacity-70 mt-1">
            1000×1000 캔버스 · 100만 픽셀 · 10,000개의 전시 룸
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="opacity-60 text-xs">남은 블록</div>
            <div className="font-mono text-lg">{remaining.toLocaleString()}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="opacity-60 text-xs">최저가 / 블록</div>
            <div className="font-mono text-lg">{formatKrw(TIER_PRICES_KRW.basic)}</div>
          </div>
        </div>
      </header>

      <Canvas
        blocks={blocks}
        onSelectArea={(a) => setPendingArea(a)}
        onClickBlock={(b) => setOpenBlockId(b.id)}
      />

      <RoomModal blockId={openBlockId} onClose={() => setOpenBlockId(null)} />

      {pendingArea && (
        <PurchaseSheet area={pendingArea} onClose={() => setPendingArea(null)} />
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-3 text-sm">
        <Info title="① 빈 영역 드래그">
          캔버스에서 사고 싶은 영역을 마우스로 드래그. 10×10 블록 단위로 자동 스냅.
        </Info>
        <Info title="② 룸 콘텐츠 업로드">
          썸네일 이미지 + (선택) 갤러리 사진·영상·소개글. 외부 링크만 걸어도 OK.
        </Info>
        <Info title="③ 결제하면 영구 소유">
          기본 ₩1,000/블록부터. 한 번 구매하면 본인 룸은 영원히 그 자리에 남습니다.
        </Info>
      </section>
    </main>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="font-semibold">{title}</div>
      <p className="opacity-80 mt-1">{children}</p>
    </div>
  );
}

function PurchaseSheet({ area, onClose }: { area: BlockArea; onClose: () => void }) {
  const blocks = area.bw * area.bh;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">선택한 영역</h2>
        <p className="text-sm opacity-70 mt-1">
          ({area.bx}, {area.by}) · {area.bw} × {area.bh} 블록 ·{" "}
          <span className="font-mono">{blocks} 블록</span>
        </p>
        <div className="mt-5 grid gap-2">
          <Link
            href={`/buy?bx=${area.bx}&by=${area.by}&bw=${area.bw}&bh=${area.bh}`}
            className="block w-full text-center px-4 py-3 rounded-lg bg-pink-500 hover:bg-pink-400 font-medium"
          >
            구매하기 — 가격 확인 →
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-center px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
