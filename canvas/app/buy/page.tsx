import BuyClient from "./BuyClient";

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const bx = parseInt(sp.bx ?? "0", 10);
  const by = parseInt(sp.by ?? "0", 10);
  const bw = parseInt(sp.bw ?? "1", 10);
  const bh = parseInt(sp.bh ?? "1", 10);
  return <BuyClient area={{ bx, by, bw, bh }} />;
}
