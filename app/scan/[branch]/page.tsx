import { notFound } from "next/navigation";
import { ScanPoster } from "@/components/qr/ScanPoster";
import { siteUrl } from "@/lib/cn";
import { isBranchSlug } from "@/lib/qr";
import { getBranchMenu } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const { branch } = await params;
  if (!isBranchSlug(branch)) notFound();
  const menu = await getBranchMenu(branch);
  if (!menu) notFound();
  return <ScanPoster branch={menu} url={`${siteUrl()}/view/${menu.slug}`} />;
}
