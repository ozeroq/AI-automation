import { notFound } from "next/navigation";
import Link from "next/link";
import { TOOLS, type ToolSlug } from "@/lib/prompts";
import ToolClient from "./ToolClient";

export function generateStaticParams() {
  return (Object.keys(TOOLS) as ToolSlug[]).map((slug) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(slug in TOOLS)) notFound();
  const tool = TOOLS[slug as ToolSlug];
  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← 도구 목록
      </Link>
      <h1 className="text-2xl font-bold mt-4">{tool.label}</h1>
      <p className="text-sm opacity-70 mt-1">하루 3회 무료 · 이메일·가입 불필요</p>
      <ToolClient slug={slug as ToolSlug} fields={tool.fields} />
    </main>
  );
}
