import { getSessionEmail } from "@/lib/auth";
import { listBlocksByEmail } from "@/lib/db";
import { getSubscriber, isProActive } from "@/lib/subscriptions";
import LoginCard from "./LoginCard";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const email = await getSessionEmail();

  if (!email) {
    return <LoginCard authStatus={sp.auth} prefillEmail={sp.email} />;
  }

  const [sub, blocks] = await Promise.all([
    getSubscriber(email),
    listBlocksByEmail(email),
  ]);

  return (
    <Dashboard
      email={email}
      isPro={isProActive(sub)}
      subscription={
        sub
          ? {
              status: sub.status,
              current_period_end: sub.current_period_end,
            }
          : null
      }
      blocks={blocks.map((b) => ({
        id: b.id,
        bx: b.bx,
        by: b.by,
        bw: b.bw,
        bh: b.bh,
        tier: b.tier,
        title: b.room?.title,
        has_panorama: !!b.panorama_url,
      }))}
      flashSubscribed={sp.subscribed === "1"}
      flashPurchased={sp.purchase === "success"}
    />
  );
}
