"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RoomModal from "@/components/RoomModal";
import PortalTransition, { type ScreenRect } from "@/components/PortalTransition";

// OpenSeadragon이 모듈 로드 시 document에 접근하므로 SSR 비활성화
const Canvas = dynamic(() => import("@/components/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[80vh] rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center text-sm opacity-60">
      캔버스 로딩 중...
    </div>
  ),
});
import type { BlockArea } from "@/lib/grid";
import type { Block, BlockSummary } from "@/lib/types";
import { TIER_PRICES_KRW, formatKrw } from "@/lib/pricing";

type ActivePortal = {
  rect: ScreenRect;
  block: Block;
};

export default function Home() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [portal, setPortal] = useState<ActivePortal | null>(null);
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
        <div className="flex gap-2 text-sm items-center">
          <Link
            href="/pricing"
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
          >
            가격
          </Link>
          <Link
            href="/manage"
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
          >
            내 룸
          </Link>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="opacity-60 text-xs">남은 블록</div>
            <div className="font-mono text-lg">{remaining.toLocaleString()}</div>
          </div>
        </div>
      </header>

      <Canvas
        blocks={blocks}
        onSelectArea={(a) => setPendingArea(a)}
        onClickBlock={async (b, rect) => {
          if (b.has_panorama) {
            // 풀 블록 정보를 받아와서 포털 전환
            const res = await fetch(`/api/blocks/${b.id}`);
            const data = (await res.json()) as { block: Block | null };
            if (data.block?.panorama_url) {
              setPortal({ rect, block: data.block });
              return;
            }
          }
          setOpenBlockId(b.id);
        }}
      />

      <RoomModal blockId={openBlockId} onClose={() => setOpenBlockId(null)} />

      {portal && portal.block.panorama_url && (
        <PortalTransition
          rect={portal.rect}
          panoramaUrl={portal.block.panorama_url}
          thumbnailUrl={portal.block.thumbnail_url}
          title={portal.block.room?.title}
          ownerName={portal.block.room?.owner_name}
          description={portal.block.room?.description}
          onClose={() => setPortal(null)}
        />
      )}

      {pendingArea && (
        <PurchaseSheet area={pendingArea} onClose={() => setPendingArea(null)} />
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-3 text-sm">
        <Info title="① 무한 줌 캔버스 탐색">
          마우스 휠로 줌인·줌아웃. "캔버스 이동" 모드에서 드래그해 다른 영역으로
          이동. 블록 위에 마우스를 올리면 소유자 정보가 나타납니다.
        </Info>
        <Info title="② 영역 선택 → 결제">
          "영역 선택" 모드에서 빈 곳을 드래그하면 10×10 블록 단위로 자동 스냅됩니다.
          한 번 구매하면 그 자리는 영구 본인 소유.
        </Info>
        <Info title="③ 360° 룸 포털">
          Exhibition 티어 이상은 등각투영 파노라마 1장으로 가상 룸을 엽니다. 클릭하면
          블록이 풀스크린으로 확장되며 Pannellum 뷰어가 마운트.
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
