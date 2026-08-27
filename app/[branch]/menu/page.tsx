import { notFound } from "next/navigation";
import { MenuPage } from "@/components/menu/MenuPage";
import { isBranchSlug } from "@/lib/qr";
import { getBranchMenu } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OrderMenuPage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const { branch } = await params;
  if (!isBranchSlug(branch)) notFound();
  const menu = await getBranchMenu(branch, "outside");
  if (!menu) notFound();
  return <MenuPage menu={menu} mode="order" />;
}
