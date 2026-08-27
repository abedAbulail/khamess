import { notFound } from "next/navigation";
import { ItemDetail } from "@/components/menu/ItemDetail";
import { isBranchSlug } from "@/lib/qr";
import { getMenuItem } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OrderItemPage({
  params,
}: {
  params: Promise<{ branch: string; slug: string }>;
}) {
  const { branch, slug } = await params;
  if (!isBranchSlug(branch)) notFound();
  const found = await getMenuItem(branch, slug, "outside");
  if (!found) notFound();
  return (
    <ItemDetail
      branch={found.branch}
      category={found.category}
      item={found.item}
      mode="order"
    />
  );
}
