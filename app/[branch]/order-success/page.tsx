import { notFound } from "next/navigation";
import { OrderSuccess } from "@/components/cart/OrderSuccess";
import { isBranchSlug } from "@/lib/qr";
import { getBranchMenu } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const { branch } = await params;
  if (!isBranchSlug(branch)) notFound();
  const menu = await getBranchMenu(branch, "outside");
  if (!menu) notFound();
  return <OrderSuccess branchSlug={menu.slug} branchName={menu.nameAr} />;
}
