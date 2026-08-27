import { notFound } from "next/navigation";
import { CartView } from "@/components/cart/CartView";
import { isBranchSlug } from "@/lib/qr";
import { getBranchMenu } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CartPage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const { branch } = await params;
  if (!isBranchSlug(branch)) notFound();
  const menu = await getBranchMenu(branch, "outside");
  if (!menu) notFound();
  return <CartView branch={menu} />;
}
