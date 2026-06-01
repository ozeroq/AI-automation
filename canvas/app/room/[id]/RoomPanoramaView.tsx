"use client";

import Link from "next/link";
import Panorama360 from "@/components/Panorama360";

export default function RoomPanoramaView({
  panoramaUrl,
  title,
  ownerName,
  description,
}: {
  panoramaUrl: string;
  title: string;
  ownerName: string;
  description: string;
}) {
  return (
    <main className="fixed inset-0 bg-black">
      <div className="absolute inset-0">
        <Panorama360 url={panoramaUrl} title={title} />
      </div>

      <div className="absolute top-4 left-4 z-10 max-w-md p-3 rounded-lg bg-black/60 backdrop-blur-sm text-white">
        {title && <div className="font-semibold">{title}</div>}
        {ownerName && (
          <div className="text-xs opacity-70 mt-0.5">by {ownerName}</div>
        )}
        {description && (
          <div className="text-xs opacity-90 mt-2 line-clamp-3">{description}</div>
        )}
      </div>

      <Link
        href="/"
        className="absolute top-4 right-4 z-10 px-3 py-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-sm"
      >
        ← 캔버스로
      </Link>
    </main>
  );
}
