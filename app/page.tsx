import { listBranches } from "@/lib/queries";
import { BranchPicker } from "@/components/branch/BranchPicker";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const branches = await listBranches();
  const nablus = branches.find((branch) => branch.slug === "nablus");
  const jenin = branches.find((branch) => branch.slug === "jenin");
  if (!nablus || !jenin) {
    return (
      <main className="grid min-h-svh place-items-center p-8 text-center">
        <p>ما لقيناش الفروع. شغّل db:seed.</p>
      </main>
    );
  }
  return <BranchPicker nablus={nablus} jenin={jenin} />;
}
