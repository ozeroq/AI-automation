"use client";

import { useEffect, useRef, useState } from "react";
import OpenSeadragon from "openseadragon";
import {
  CANVAS_PX,
  BLOCK_PX,
  GRID_SIZE,
  type BlockArea,
} from "@/lib/grid";
import type { BlockSummary } from "@/lib/types";
import type { ScreenRect } from "./PortalTransition";

type Props = {
  blocks: BlockSummary[];
  onSelectArea: (a: BlockArea) => void;
  onClickBlock: (b: BlockSummary, rect: ScreenRect) => void;
};

type Mode = "select" | "pan";

// 그리드 라인이 그려진 256×256 배경 타일 (어두운 색 + 100px 간격 보조선)
const TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#0c0c0c"/>
  ${Array.from({ length: 27 })
    .map(
      (_, i) =>
        `<line x1="${i * 10}" y1="0" x2="${i * 10}" y2="256" stroke="#171717" stroke-width="0.5"/>`,
    )
    .join("")}
  ${Array.from({ length: 27 })
    .map(
      (_, i) =>
        `<line x1="0" y1="${i * 10}" x2="256" y2="${i * 10}" stroke="#171717" stroke-width="0.5"/>`,
    )
    .join("")}
</svg>`;

function makeTileUrl(): string {
  if (typeof window === "undefined") return "";
  return `data:image/svg+xml;base64,${btoa(TILE_SVG)}`;
}

function rectFromImagePoints(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): BlockArea {
  const sx = Math.max(0, Math.floor(Math.min(ax, bx) / BLOCK_PX));
  const sy = Math.max(0, Math.floor(Math.min(ay, by) / BLOCK_PX));
  const ex = Math.min(GRID_SIZE, Math.ceil(Math.max(ax, bx) / BLOCK_PX));
  const ey = Math.min(GRID_SIZE, Math.ceil(Math.max(ay, by) / BLOCK_PX));
  return {
    bx: sx,
    by: sy,
    bw: Math.max(1, ex - sx),
    bh: Math.max(1, ey - sy),
  };
}

export default function Canvas({ blocks, onSelectArea, onClickBlock }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const overlayMapRef = useRef(new Map<string, HTMLElement>());
  const selectionDivRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; curX: number; curY: number } | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const [mode, setMode] = useState<Mode>("select");
  const modeRef = useRef<Mode>(mode);
  modeRef.current = mode;

  const [zoomPct, setZoomPct] = useState(60);
  const [hover, setHover] = useState<BlockSummary | null>(null);

  // OpenSeadragon 뷰어 초기화 (단 1회)
  useEffect(() => {
    if (!containerRef.current) return;

    const tileUrl = makeTileUrl();

    const viewer = OpenSeadragon({
      element: containerRef.current,
      prefixUrl:
        "https://cdn.jsdelivr.net/npm/openseadragon@5.0.1/build/openseadragon/images/",
      showNavigationControl: false,
      showNavigator: false,
      visibilityRatio: 0.6,
      constrainDuringPan: true,
      defaultZoomLevel: 0.6,
      minZoomImageRatio: 0.4,
      maxZoomPixelRatio: 25,
      animationTime: 0.4,
      springStiffness: 7,
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: false,
        dblClickToZoom: false,
        dragToPan: false,
        flickEnabled: false,
        pinchToZoom: true,
      },
      gestureSettingsTouch: {
        scrollToZoom: false,
        clickToZoom: false,
        dblClickToZoom: false,
        dragToPan: true,
        flickEnabled: true,
        pinchToZoom: true,
      },
      tileSources: {
        width: CANVAS_PX,
        height: CANVAS_PX,
        tileSize: 256,
        tileOverlap: 0,
        maxLevel: 8,
        getTileUrl: () => tileUrl,
      },
    });
    viewerRef.current = viewer;

    // 선택 박스 DOM (드래그 중 표시되는 분홍색 사각형)
    const selDiv = document.createElement("div");
    selDiv.style.cssText =
      "position:absolute; pointer-events:none; border:2px dashed #ff3b81; background:rgba(255,59,129,0.15); display:none; box-sizing:border-box;";
    selectionDivRef.current = selDiv;
    containerRef.current.appendChild(selDiv);

    function imgPointFromEvent(position: OpenSeadragon.Point) {
      const vp = viewer.viewport.pointFromPixel(position);
      const img = viewer.viewport.viewportToImageCoordinates(vp);
      return { x: img.x, y: img.y };
    }

    function updateSelectionDiv() {
      const d = dragRef.current;
      const container = containerRef.current;
      if (!d || !container) {
        selDiv.style.display = "none";
        return;
      }
      const x0 = Math.floor(Math.min(d.startX, d.curX) / BLOCK_PX) * BLOCK_PX;
      const y0 = Math.floor(Math.min(d.startY, d.curY) / BLOCK_PX) * BLOCK_PX;
      const x1 = Math.ceil(Math.max(d.startX, d.curX) / BLOCK_PX) * BLOCK_PX;
      const y1 = Math.ceil(Math.max(d.startY, d.curY) / BLOCK_PX) * BLOCK_PX;
      const tl = viewer.viewport.imageToViewerElementCoordinates(
        new OpenSeadragon.Point(x0, y0),
      );
      const br = viewer.viewport.imageToViewerElementCoordinates(
        new OpenSeadragon.Point(x1, y1),
      );
      selDiv.style.display = "block";
      selDiv.style.left = `${tl.x}px`;
      selDiv.style.top = `${tl.y}px`;
      selDiv.style.width = `${Math.max(0, br.x - tl.x)}px`;
      selDiv.style.height = `${Math.max(0, br.y - tl.y)}px`;
    }

    viewer.addHandler("canvas-press", (event) => {
      if (modeRef.current !== "select") return;
      const p = imgPointFromEvent(event.position);
      dragRef.current = { startX: p.x, startY: p.y, curX: p.x, curY: p.y };
    });

    viewer.addHandler("canvas-drag", (event) => {
      if (modeRef.current === "pan") {
        const delta = viewer.viewport.deltaPointsFromPixels(event.delta.negate());
        viewer.viewport.panBy(delta);
        return;
      }
      if (!dragRef.current) return;
      const p = imgPointFromEvent(event.position);
      dragRef.current.curX = p.x;
      dragRef.current.curY = p.y;
      updateSelectionDiv();
    });

    viewer.addHandler("canvas-release", () => {
      if (modeRef.current !== "select" || !dragRef.current) return;
      const { startX, startY, curX, curY } = dragRef.current;
      const dx = Math.abs(curX - startX);
      const dy = Math.abs(curY - startY);
      dragRef.current = null;
      selDiv.style.display = "none";
      if (dx < BLOCK_PX / 2 && dy < BLOCK_PX / 2) return; // 클릭은 canvas-click 에서
      const area = rectFromImagePoints(startX, startY, curX, curY);
      onSelectArea(area);
    });

    viewer.addHandler("canvas-click", (event) => {
      if (!event.quick) return;
      const p = imgPointFromEvent(event.position);
      const bxi = Math.floor(p.x / BLOCK_PX);
      const byi = Math.floor(p.y / BLOCK_PX);
      const hit = blocksRef.current.find(
        (b) =>
          bxi >= b.bx && bxi < b.bx + b.bw && byi >= b.by && byi < b.by + b.bh,
      );
      if (hit) {
        const tlImg = new OpenSeadragon.Point(hit.bx * BLOCK_PX, hit.by * BLOCK_PX);
        const brImg = new OpenSeadragon.Point(
          (hit.bx + hit.bw) * BLOCK_PX,
          (hit.by + hit.bh) * BLOCK_PX,
        );
        const tlWin = viewer.viewport.imageToWindowCoordinates(tlImg);
        const brWin = viewer.viewport.imageToWindowCoordinates(brImg);
        onClickBlock(hit, {
          x: tlWin.x,
          y: tlWin.y,
          w: brWin.x - tlWin.x,
          h: brWin.y - tlWin.y,
        });
        return;
      }
      if (modeRef.current === "select") {
        onSelectArea({ bx: bxi, by: byi, bw: 1, bh: 1 });
      }
    });

    viewer.addHandler("animation", updateSelectionDiv);
    viewer.addHandler("update-viewport", updateSelectionDiv);
    viewer.addHandler("zoom", () => {
      setZoomPct(Math.round(viewer.viewport.getZoom(true) * 100));
    });
    viewer.addHandler("open", () => {
      setZoomPct(Math.round(viewer.viewport.getZoom(true) * 100));
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
      overlayMapRef.current.clear();
    };
  }, [onClickBlock, onSelectArea]);

  // 블록 변경 시 오버레이 재구성
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const sync = (v: OpenSeadragon.Viewer) => {
      const map = overlayMapRef.current;
      for (const el of map.values()) {
        try {
          v.removeOverlay(el);
        } catch {}
      }
      map.clear();
      for (const b of blocks) {
        const div = document.createElement("div");
        div.style.cssText = `
          background: #1a1a1a center/cover no-repeat;
          ${b.thumbnail_url ? `background-image: url(${JSON.stringify(b.thumbnail_url)});` : ""}
          cursor: pointer;
          border-radius: 1px;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.4) inset;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        `;
        div.title = b.owner_name ?? "";
        div.addEventListener("mouseenter", () => {
          setHover(b);
          div.style.boxShadow = "0 0 0 2px #ff3b81, 0 0 16px rgba(255,59,129,0.4)";
        });
        div.addEventListener("mouseleave", () => {
          setHover((cur) => (cur?.id === b.id ? null : cur));
          div.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.4) inset";
        });
        v.addOverlay({
          element: div,
          location: new OpenSeadragon.Rect(
            (b.bx * BLOCK_PX) / CANVAS_PX,
            (b.by * BLOCK_PX) / CANVAS_PX,
            (b.bw * BLOCK_PX) / CANVAS_PX,
            (b.bh * BLOCK_PX) / CANVAS_PX,
          ),
        });
        map.set(b.id, div);
      }
    };

    if (viewer.world.getItemCount() === 0) {
      const v = viewer;
      const onOpen = () => {
        v.removeHandler("open", onOpen);
        sync(v);
      };
      v.addHandler("open", onOpen);
      return () => v.removeHandler("open", onOpen);
    }
    sync(viewer);
  }, [blocks]);

  return (
    <div className="relative w-full h-[80vh] overflow-hidden rounded-xl border border-zinc-800">
      <div className="absolute top-3 left-3 z-10 flex gap-2 text-xs">
        <button
          onClick={() => setMode("select")}
          className={`px-3 py-1.5 rounded font-medium ${
            mode === "select"
              ? "bg-pink-500 text-white"
              : "bg-zinc-900/90 border border-zinc-700 hover:bg-zinc-800"
          }`}
        >
          영역 선택
        </button>
        <button
          onClick={() => setMode("pan")}
          className={`px-3 py-1.5 rounded font-medium ${
            mode === "pan"
              ? "bg-pink-500 text-white"
              : "bg-zinc-900/90 border border-zinc-700 hover:bg-zinc-800"
          }`}
        >
          캔버스 이동
        </button>
        <span className="px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700 self-center">
          줌 {zoomPct}%
        </span>
        <span className="px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700 self-center hidden sm:inline">
          휠: 줌 · 모바일: 핀치
        </span>
      </div>

      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ cursor: mode === "pan" ? "grab" : "crosshair" }}
      />

      {hover && (
        <div className="absolute bottom-3 right-3 z-10 max-w-xs p-3 rounded-lg bg-zinc-900/95 border border-zinc-700 text-sm shadow-xl pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{hover.owner_name ?? "익명"}</span>
            {hover.is_pro && (
              <span className="px-1.5 py-0.5 rounded bg-pink-500 text-[10px] font-semibold">
                Pro
              </span>
            )}
          </div>
          <div className="text-xs opacity-70 mt-1">
            ({hover.bx},{hover.by}) · {hover.bw}×{hover.bh} 블록
          </div>
          {hover.has_panorama && (
            <div className="text-xs mt-1 text-pink-400">
              클릭 → 360° 룸 포털 →
            </div>
          )}
          {!hover.has_panorama && hover.has_room && (
            <div className="text-xs mt-1 text-pink-400">클릭 → 룸 열기 →</div>
          )}
        </div>
      )}
    </div>
  );
}
