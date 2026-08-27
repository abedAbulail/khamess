import { notFound } from "next/navigation";
import { LinktreePage } from "@/components/links/LinktreePage";
import { siteUrl } from "@/lib/cn";
import { isBranchSlug } from "@/lib/qr";
import { getBranchMenu } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function BranchLinksPage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const { branch } = await params;
  if (!isBranchSlug(branch)) notFound();
  const menu = await getBranchMenu(branch);
  if (!menu) notFound();
  return <LinktreePage branch={menu} pageUrl={`${siteUrl()}/${menu.slug}`} />;
}
