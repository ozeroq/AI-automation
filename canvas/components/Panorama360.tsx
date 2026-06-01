"use client";

import { useEffect, useRef, useState } from "react";

const PANNELLUM_VERSION = "2.5.6";
const PANNELLUM_CSS = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build/pannellum.css`;
const PANNELLUM_JS = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build/pannellum.js`;

declare global {
  interface Window {
    pannellum?: {
      viewer: (
        id: string | HTMLElement,
        config: Record<string, unknown>,
      ) => { destroy: () => void };
    };
  }
}

let loadPromise: Promise<void> | null = null;

function loadPannellum(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.pannellum) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${PANNELLUM_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = PANNELLUM_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PANNELLUM_JS}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("pannellum load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = PANNELLUM_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("pannellum load failed"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export default function Panorama360({
  url,
  title,
  autoLoad = true,
}: {
  url: string;
  title?: string;
  autoLoad?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ destroy: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPannellum()
      .then(() => {
        if (cancelled || !containerRef.current || !window.pannellum) return;
        try {
          viewerRef.current = window.pannellum.viewer(containerRef.current, {
            type: "equirectangular",
            panorama: url,
            autoLoad,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
            title,
            compass: false,
            hfov: 100,
          });
        } catch (e) {
          setError(e instanceof Error ? e.message : "viewer init failed");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      try {
        viewerRef.current?.destroy();
      } catch {}
      viewerRef.current = null;
    };
  }, [url, title, autoLoad]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-red-300 p-4 text-center">
        파노라마 로딩 실패: {error}
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
