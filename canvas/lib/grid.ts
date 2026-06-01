// 캔버스 1000×1000 픽셀. 최소 블록 = 10×10 픽셀.
// → 블록 좌표계는 0..99 × 0..99 (100×100 = 10,000 블록)
export const CANVAS_PX = 1000;
export const BLOCK_PX = 10;
export const GRID_SIZE = CANVAS_PX / BLOCK_PX; // 100

export type BlockCoord = { bx: number; by: number };
export type BlockArea = { bx: number; by: number; bw: number; bh: number };

export function pixelToBlock(x: number, y: number): BlockCoord {
  return { bx: Math.floor(x / BLOCK_PX), by: Math.floor(y / BLOCK_PX) };
}

export function blockToPixel(bx: number, by: number) {
  return { x: bx * BLOCK_PX, y: by * BLOCK_PX };
}

export function snapToGrid(x: number, y: number) {
  return {
    x: Math.max(0, Math.min(CANVAS_PX, Math.round(x / BLOCK_PX) * BLOCK_PX)),
    y: Math.max(0, Math.min(CANVAS_PX, Math.round(y / BLOCK_PX) * BLOCK_PX)),
  };
}

export function rectFromDrag(
  start: { x: number; y: number },
  end: { x: number; y: number },
): BlockArea {
  const s = {
    x: Math.floor(Math.min(start.x, end.x) / BLOCK_PX),
    y: Math.floor(Math.min(start.y, end.y) / BLOCK_PX),
  };
  const e = {
    x: Math.ceil(Math.max(start.x, end.x) / BLOCK_PX),
    y: Math.ceil(Math.max(start.y, end.y) / BLOCK_PX),
  };
  return {
    bx: s.x,
    by: s.y,
    bw: Math.max(1, e.x - s.x),
    bh: Math.max(1, e.y - s.y),
  };
}

export function areaBlocks(a: BlockArea): number {
  return a.bw * a.bh;
}

export function areasOverlap(a: BlockArea, b: BlockArea): boolean {
  return (
    a.bx < b.bx + b.bw &&
    a.bx + a.bw > b.bx &&
    a.by < b.by + b.bh &&
    a.by + a.bh > b.by
  );
}

export function clampArea(a: BlockArea): BlockArea {
  const bx = Math.max(0, Math.min(GRID_SIZE - 1, a.bx));
  const by = Math.max(0, Math.min(GRID_SIZE - 1, a.by));
  const bw = Math.max(1, Math.min(GRID_SIZE - bx, a.bw));
  const bh = Math.max(1, Math.min(GRID_SIZE - by, a.bh));
  return { bx, by, bw, bh };
}
