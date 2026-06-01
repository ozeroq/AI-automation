"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Block } from "@/lib/types";

type Msg = { type: "ok" | "err"; text: string; needsPro?: boolean };

export default function EditClient({
  block,
  isPro,
}: {
  block: Block;
  isPro: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(block.room?.title ?? "");
  const [description, setDescription] = useState(block.room?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(block.thumbnail_url);
  const [panoramaUrl, setPanoramaUrl] = useState(block.panorama_url ?? "");
  const [externalUrl, setExternalUrl] = useState(block.external_url ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);

  const isBasic = block.tier === "basic";
  const supportsPanorama =
    block.tier === "exhibition" || block.tier === "premium";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const patch: Record<string, string> = {};
    if (title !== (block.room?.title ?? "")) patch.room_title = title;
    if (description !== (block.room?.description ?? ""))
      patch.room_description = description;
    if (thumbnailUrl !== block.thumbnail_url)
      patch.thumbnail_url = thumbnailUrl;
    if (panoramaUrl !== (block.panorama_url ?? ""))
      patch.panorama_url = panoramaUrl;
    if (externalUrl !== (block.external_url ?? ""))
      patch.external_url = externalUrl;

    if (Object.keys(patch).length === 0) {
      setMsg({ type: "ok", text: "변경된 내용이 없습니다" });
      setSaving(false);
      return;
    }

    try {
      const r = await fetch(`/api/blocks/${block.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await r.json();
      if (!r.ok) {
        setMsg({
          type: "err",
          text: data.error ?? "저장 실패",
          needsPro: data.needs_pro,
        });
      } else {
        setMsg({ type: "ok", text: "저장되었습니다" });
        router.refresh();
      }
    } catch {
      setMsg({ type: "err", text: "네트워크 오류" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link href="/manage" className="text-sm opacity-70 hover:underline">
        ← 내 룸 목록
      </Link>
      <h1 className="text-2xl font-bold mt-3">룸 편집</h1>
      <p className="text-sm opacity-70 mt-1">
        ({block.bx},{block.by}) · {block.bw}×{block.bh} · {block.tier}
      </p>

      {!isPro && (
        <div className="mt-4 p-3 rounded-lg bg-pink-500/10 border border-pink-500/40 text-sm">
          💡 텍스트 수정은 무료. 썸네일·파노라마 교체는{" "}
          <Link href="/pricing" className="underline">
            Pro 구독
          </Link>{" "}
          전용.
        </div>
      )}

      <form onSubmit={save} className="mt-6 space-y-4">
        <Field label="룸 제목">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
            placeholder="예) 2026 회화 전시"
          />
        </Field>

        <Field label="룸 소개글">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
          />
        </Field>

        <Field label="썸네일 이미지 URL" proGated={!isPro}>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            disabled={!isPro}
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent disabled:opacity-50"
            placeholder="https://..."
          />
        </Field>

        {supportsPanorama && (
          <Field label="360° 파노라마 URL" proGated={!isPro}>
            <input
              value={panoramaUrl}
              onChange={(e) => setPanoramaUrl(e.target.value)}
              disabled={!isPro}
              className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent disabled:opacity-50"
              placeholder="등각투영 .jpg URL (4K 권장)"
            />
          </Field>
        )}

        {isBasic && (
          <Field label="외부 링크 URL">
            <input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
              placeholder="https://your-site.com"
            />
          </Field>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-50 font-medium"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <Link
            href={`/room/${block.id}`}
            target="_blank"
            className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm self-center"
          >
            미리보기 →
          </Link>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-lg text-sm ${
              msg.type === "ok"
                ? "bg-emerald-900/40 text-emerald-200"
                : "bg-red-900/40 text-red-200"
            }`}
          >
            {msg.text}
            {msg.needsPro && (
              <>
                {" · "}
                <Link href="/pricing" className="underline">
                  Pro 시작하기 →
                </Link>
              </>
            )}
          </div>
        )}
      </form>
    </main>
  );
}

function Field({
  label,
  proGated,
  children,
}: {
  label: string;
  proGated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium flex items-center gap-2">
        {label}
        {proGated && (
          <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] font-semibold">
            Pro 전용
          </span>
        )}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
