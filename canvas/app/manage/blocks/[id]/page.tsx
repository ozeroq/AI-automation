import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { getBlock } from "@/lib/db";
import { getSubscriber, isProActive } from "@/lib/subscriptions";
import EditClient from "./EditClient";

export const dynamic = "force-dynamic";

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const email = await getSessionEmail();
  if (!email) redirect(`/manage?auth=required`);

  const block = await getBlock(id);
  if (!block) notFound();

  if (
    !block.owner_email ||
    block.owner_email.toLowerCase() !== email.toLowerCase()
  ) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto">
        <Link href="/manage" className="text-sm opacity-70 hover:underline">
          ← 내 룸 목록
        </Link>
        <h1 className="text-xl font-bold mt-4">접근 권한 없음</h1>
        <p className="mt-2 text-sm opacity-70">
          이 블록의 소유자만 편집할 수 있습니다.
        </p>
      </main>
    );
  }

  const sub = await getSubscriber(email);
  return <EditClient block={block} isPro={isProActive(sub)} />;
}
