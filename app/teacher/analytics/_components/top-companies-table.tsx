"use client";

interface TopCompaniesTableProps {
  topCompanies: Array<{ company: string; count: number }>;
  totalInternships: number;
}

export function TopCompaniesTable({
  topCompanies,
  totalInternships,
}: TopCompaniesTableProps) {
  const maxCount = topCompanies.length > 0 ? topCompanies[0].count : 1;

  return (
    <div className="bg-white border border-[#e8eaed] rounded-[14px] overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[32px_1fr_80px_100px] items-center gap-3 px-5 py-2.5 text-xs font-semibold text-[#878c97] tracking-[0.06em] uppercase bg-[#fafafa] border-b border-[#e8eaed]">
        <div>#</div>
        <div>Company</div>
        <div className="text-right">Students</div>
        <div>Share</div>
      </div>

      {/* Data rows */}
      {topCompanies.map((item, i) => {
        const sharePercent =
          totalInternships > 0 ? Math.round((item.count / maxCount) * 100) : 0;

        return (
          <div
            key={item.company}
            className="grid grid-cols-[32px_1fr_80px_100px] items-center gap-3 px-5 py-3 border-b border-[#e8eaed] last:border-b-0 text-sm transition-colors hover:bg-[#fafafa]"
          >
            <div
              className={`text-sm font-bold ${
                i < 3 ? "text-[#2563eb]" : "text-[#b8bcc6]"
              }`}
            >
              {i + 1}
            </div>
            <div>
              <div className="font-semibold text-[#111318]">{item.company}</div>
            </div>
            <div className="text-right font-semibold text-[#3d4047]">
              {item.count}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-[5px] bg-[#e8eaed] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2563eb]"
                  style={{ width: `${sharePercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#878c97] w-5 text-right flex-shrink-0">
                {item.count}
              </span>
            </div>
          </div>
        );
      })}

      {topCompanies.length === 0 && (
        <div className="text-center py-8 text-[#878c97] text-sm">
          No company data available
        </div>
      )}
    </div>
  );
}
