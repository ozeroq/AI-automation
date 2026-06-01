"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CANVAS_PX, BLOCK_PX, GRID_SIZE, rectFromDrag, type BlockArea } from "@/lib/grid";
import type { BlockSummary } from "@/lib/types";

type Props = {
  blocks: BlockSummary[];
  onSelectArea: (a: BlockArea) => void;
  onClickBlock: (b: BlockSummary) => void;
};

export default function Canvas({ blocks, onSelectArea, onClickBlock }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<
    | { mode: "select"; startCanvas: { x: number; y: number }; endCanvas: { x: number; y: number } }
    | { mode: "pan"; lastClient: { x: number; y: number } }
    | null
  >(null);
  const [hover, setHover] = useState<BlockSummary | null>(null);

  const occupancy = useMemo(() => {
    const map = new Map<number, BlockSummary>();
    for (const b of blocks) {
      for (let dy = 0; dy < b.bh; dy++) {
        for (let dx = 0; dx < b.bw; dx++) {
          map.set((b.by + dy) * GRID_SIZE + (b.bx + dx), b);
        }
      }
    }
    return map;
  }, [blocks]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    cvs.width = CANVAS_PX;
    cvs.height = CANVAS_PX;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

    for (const b of blocks) {
      const x = b.bx * BLOCK_PX;
      const y = b.by * BLOCK_PX;
      const w = b.bw * BLOCK_PX;
      const h = b.bh * BLOCK_PX;
      const hue = (b.bx * 7 + b.by * 13) % 360;
      ctx.fillStyle = `hsl(${hue} 70% 45%)`;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }

    if (drag?.mode === "select") {
      const a = rectFromDrag(drag.startCanvas, drag.endCanvas);
      ctx.strokeStyle = "#ff3b81";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(a.bx * BLOCK_PX, a.by * BLOCK_PX, a.bw * BLOCK_PX, a.bh * BLOCK_PX);
      ctx.setLineDash([]);
    }
  }, [blocks, drag]);

  function clientToCanvas(clientX: number, clientY: number) {
    const wrap = wrapRef.current!;
    const rect = wrap.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  }

  function handleMouseDown(e: React.MouseEvent) {
    const isPan = e.button === 1 || e.shiftKey;
    if (isPan) {
      setDrag({ mode: "pan", lastClient: { x: e.clientX, y: e.clientY } });
      return;
    }
    const p = clientToCanvas(e.clientX, e.clientY);
    setDrag({ mode: "select", startCanvas: p, endCanvas: p });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (drag?.mode === "pan") {
      setPan((prev) => ({
        x: prev.x + (e.clientX - drag.lastClient.x),
        y: prev.y + (e.clientY - drag.lastClient.y),
      }));
      setDrag({ mode: "pan", lastClient: { x: e.clientX, y: e.clientY } });
      return;
    }
    const p = clientToCanvas(e.clientX, e.clientY);
    if (drag?.mode === "select") {
      setDrag({ ...drag, endCanvas: p });
      return;
    }
    const bx = Math.floor(p.x / BLOCK_PX);
    const by = Math.floor(p.y / BLOCK_PX);
    const hit = occupancy.get(by * GRID_SIZE + bx) ?? null;
    if (hit?.id !== hover?.id) setHover(hit);
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (drag?.mode === "select") {
      const dx = Math.abs(drag.endCanvas.x - drag.startCanvas.x);
      const dy = Math.abs(drag.endCanvas.y - drag.startCanvas.y);
      const moved = dx > 4 || dy > 4;
      if (moved) {
        const area = rectFromDrag(drag.startCanvas, drag.endCanvas);
        onSelectArea(area);
      } else {
        // 단순 클릭: 해당 좌표의 블록 있으면 룸 열기, 없으면 1블록 선택
        const p = clientToCanvas(e.clientX, e.clientY);
        const bx = Math.floor(p.x / BLOCK_PX);
        const by = Math.floor(p.y / BLOCK_PX);
        const hit = occupancy.get(by * GRID_SIZE + bx);
        if (hit) onClickBlock(hit);
        else onSelectArea({ bx, by, bw: 1, bh: 1 });
      }
    }
    setDrag(null);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setZoom((z) => Math.max(0.2, Math.min(4, z * factor)));
  }

  return (
    <div className="relative w-full h-[80vh] overflow-hidden rounded-xl border border-zinc-800">
      <div className="absolute top-3 left-3 z-10 flex gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700">
          줌 {Math.round(zoom * 100)}%
        </span>
        <span className="px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700">
          드래그: 영역 선택 · Shift+드래그: 화면 이동 · 휠: 줌
        </span>
      </div>

      <div
        ref={wrapRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setDrag(null);
          setHover(null);
        }}
        onWheel={handleWheel}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <canvas ref={canvasRef} className="canvas-wrap block" />
        </div>
      </div>

      {hover && (
        <div className="absolute bottom-3 right-3 z-10 max-w-xs p-3 rounded-lg bg-zinc-900/95 border border-zinc-700 text-sm shadow-xl">
          <div className="font-semibold">{hover.owner_name ?? "익명"}</div>
          <div className="text-xs opacity-70 mt-1">
            ({hover.bx},{hover.by}) · {hover.bw}×{hover.bh} 블록
          </div>
          {hover.has_room && (
            <div className="text-xs mt-1 text-pink-400">클릭하면 룸이 열립니다 →</div>
          )}
        </div>
      )}
    </div>
  );
}
