"use client";

import { cn } from "@/lib/utils";
import { STATUS_FILTERS, MODE_FILTERS } from "../_lib/constants";
import type { StatusFilter, ModeFilter } from "../_lib/types";

interface FilterChipsProps {
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  modeFilter: ModeFilter;
  setModeFilter: (value: ModeFilter) => void;
}

export function FilterChips({
  statusFilter,
  setStatusFilter,
  modeFilter,
  setModeFilter,
}: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 bg-white border border-[#e8eaed] rounded-[10px] px-3 py-2 mt-7 mb-7 flex-wrap">
      <span className="text-sm text-[#878c97] font-medium mr-1">
        Quick filters:
      </span>

      {STATUS_FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => setStatusFilter(f.key)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-all cursor-pointer",
            statusFilter === f.key
              ? "bg-[#eff4ff] border-blue-200/60 text-[#2563eb]"
              : "bg-[#fafafa] border-[#e8eaed] text-[#3d4047] hover:bg-[#eff4ff] hover:border-blue-200/60 hover:text-[#2563eb]",
          )}
        >
          {f.label}
        </button>
      ))}

      <div className="w-px h-5 bg-[#e8eaed] mx-1" />

      {MODE_FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => setModeFilter(modeFilter === f.key ? "all" : f.key)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-all cursor-pointer",
            modeFilter === f.key
              ? "bg-[#eff4ff] border-blue-200/60 text-[#2563eb]"
              : "bg-[#fafafa] border-[#e8eaed] text-[#3d4047] hover:bg-[#eff4ff] hover:border-blue-200/60 hover:text-[#2563eb]",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
