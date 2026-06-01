import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlock } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const block = await getBlock(id);
  if (!block?.room) return { title: "Room not found" };
  return {
    title: `${block.room.title} — by ${block.room.owner_name}`,
    description: block.room.description.slice(0, 160),
    openGraph: {
      title: block.room.title,
      description: block.room.description.slice(0, 160),
      images: block.thumbnail_url ? [block.thumbnail_url] : undefined,
    },
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const block = await getBlock(id);
  if (!block) notFound();

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← 캔버스로
      </Link>

      {block.room ? (
        <article className="mt-4">
          <h1 className="text-3xl font-bold">{block.room.title}</h1>
          <p className="text-sm opacity-70 mt-1">by {block.room.owner_name}</p>
          <p className="mt-6 leading-relaxed whitespace-pre-wrap">
            {block.room.description}
          </p>

          {block.room.media.length > 0 && (
            <div className="mt-8 grid gap-4">
              {block.room.media.map((m, i) =>
                m.kind === "image" ? (
                  <figure key={i}>
                    <img src={m.url} alt={m.caption ?? ""} className="w-full rounded-xl" />
                    {m.caption && (
                      <figcaption className="text-xs opacity-70 mt-1">{m.caption}</figcaption>
                    )}
                  </figure>
                ) : m.kind === "video" ? (
                  <video key={i} src={m.url} controls className="w-full rounded-xl" />
                ) : (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden"
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
              className="inline-block mt-8 px-5 py-3 rounded-lg bg-pink-500 hover:bg-pink-400"
            >
              방문하기 →
            </a>
          )}
        </article>
      ) : (
        <div className="mt-4">
          <p>이 블록은 외부 사이트로 직접 연결됩니다.</p>
          {block.external_url && (
            <a
              href={block.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-5 py-3 rounded-lg bg-pink-500 hover:bg-pink-400"
            >
              {new URL(block.external_url).hostname} 으로 이동 →
            </a>
          )}
        </div>
      )}
    </main>
  );
}
