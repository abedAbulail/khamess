import { VisitorsChart } from "@/components/admin/VisitorsChart";
import type { VisitRecord } from "@/lib/types";

export function VisitorsPanel({ visits }: { visits: VisitRecord[] }) {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold">الزوار</h1>
      <VisitorsChart visits={visits} />
      <div className="admin-card mt-6 overflow-x-auto">
        {visits.length === 0 ? (
          <p className="p-8 text-center text-[var(--admin-muted)]">ما في زيارات بعد.</p>
        ) : (
          <table className="w-full min-w-[640px] text-right text-[13px]">
            <thead className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الوقت</th>
                <th className="px-4 py-3 font-medium">الفرع</th>
                <th className="px-4 py-3 font-medium">الصفحة</th>
                <th className="px-4 py-3 font-medium">المصدر</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3">
                    {new Intl.DateTimeFormat("ar-PS", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(visit.createdAt))}
                  </td>
                  <td className="px-4 py-3">{visit.branchId ?? "—"}</td>
                  <td className="px-4 py-3">{visit.page}</td>
                  <td className="px-4 py-3">{visit.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
