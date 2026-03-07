"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsHeaderProps {
  selectedBranch: string;
  setSelectedBranch: (value: string) => void;
  allBranches: string[];
}

export function AnalyticsHeader({
  selectedBranch,
  setSelectedBranch,
  allBranches,
}: AnalyticsHeaderProps) {
  return (
    <div className="pt-8 pb-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-[#878c97] mb-1.5">
        <a
          href="/teacher/dashboard"
          className="text-[#878c97] no-underline hover:text-[#111318] transition-colors"
        >
          Dashboard
        </a>
        <span className="text-[#b8bcc6]">/</span>
        <span className="text-[#3d4047]">Internship Analytics</span>
      </div>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#111318] leading-tight">
            Internship Analytics
          </h1>
          <p className="text-base text-[#878c97] mt-1">
            Overview of all student internship placements, attendance, and
            company data
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-44 h-9 rounded-lg border-[#d1d5dc] text-sm bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {allBranches.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
