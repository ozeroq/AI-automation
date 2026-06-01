"use client";

import { useEffect, useState } from "react";
import type { Block } from "@/lib/types";

export default function RoomModal({
  blockId,
  onClose,
}: {
  blockId: string | null;
  onClose: () => void;
}) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!blockId) {
      setBlock(null);
      return;
    }
    setLoading(true);
    fetch(`/api/blocks/${blockId}`)
      .then((r) => r.json())
      .then((d) => setBlock(d.block ?? null))
      .finally(() => setLoading(false));
  }, [blockId]);

  if (!blockId) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl bg-zinc-900 border border-zinc-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
          aria-label="닫기"
        >
          ✕
        </button>

        {loading && <p className="text-sm opacity-70">로딩 중...</p>}

        {block?.room && (
          <article>
            <h2 className="text-2xl font-bold">{block.room.title}</h2>
            <p className="text-sm opacity-70 mt-1">by {block.room.owner_name}</p>
            <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
              {block.room.description}
            </p>

            {block.room.media.length > 0 && (
              <div className="mt-6 grid gap-3">
                {block.room.media.map((m, i) =>
                  m.kind === "image" ? (
                    <figure key={i}>
                      <img src={m.url} alt={m.caption ?? ""} className="w-full rounded-lg" />
                      {m.caption && (
                        <figcaption className="text-xs opacity-70 mt-1">{m.caption}</figcaption>
                      )}
                    </figure>
                  ) : m.kind === "video" ? (
                    <video key={i} src={m.url} controls className="w-full rounded-lg" />
                  ) : (
                    <div
                      key={i}
                      className="rounded-lg overflow-hidden bg-black"
                      // 임베드는 운영자 검수 후에만 허용되므로 제한적 신뢰
                      dangerouslySetInnerHTML={{ __html: m.html }}
                    />
                  ),
                )}
              </div>
            )}

            {block.room.contact_url && (
              <a
                href={block.room.contact_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-400 text-sm"
              >
                방문하기 →
              </a>
            )}
          </article>
        )}

        {block && !block.room && block.external_url && (
          <div>
            <p className="text-sm">이 블록은 외부 사이트로 연결됩니다.</p>
            <a
              href={block.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-400 text-sm"
            >
              {new URL(block.external_url).hostname} 으로 이동 →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
