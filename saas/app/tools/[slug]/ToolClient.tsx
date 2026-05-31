"use client";

import { useState } from "react";
import type { ToolSlug } from "@/lib/prompts";

type Field = { name: string; label: string; placeholder: string; multiline?: boolean };

export default function ToolClient({
  slug,
  fields,
}: {
  slug: ToolSlug;
  fields: Field[];
}) {
  const [input, setInput] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool: slug, input }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "오류");
      } else {
        setOutput(data.output);
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {fields.map((f) => (
        <label key={f.name} className="block">
          <span className="text-sm font-medium">{f.label}</span>
          {f.multiline ? (
            <textarea
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent min-h-24"
              placeholder={f.placeholder}
              value={input[f.name] ?? ""}
              onChange={(e) =>
                setInput((v) => ({ ...v, [f.name]: e.target.value }))
              }
            />
          ) : (
            <input
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-transparent"
              placeholder={f.placeholder}
              value={input[f.name] ?? ""}
              onChange={(e) =>
                setInput((v) => ({ ...v, [f.name]: e.target.value }))
              }
            />
          )}
        </label>
      ))}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full px-4 py-3 rounded-lg bg-black text-white disabled:opacity-50"
      >
        {loading ? "생성 중..." : "생성하기"}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      {output && (
        <article className="p-4 rounded-lg border whitespace-pre-wrap text-sm leading-relaxed">
          {output}
        </article>
      )}
    </div>
  );
}
