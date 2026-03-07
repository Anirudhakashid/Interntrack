"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Download, Search } from "lucide-react";

interface AnalyticsNavbarProps {
  onExportCSV: () => void;
  onLogout: () => void;
}

export function AnalyticsNavbar({
  onExportCSV,
  onLogout,
}: AnalyticsNavbarProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-[#fafafa]/[0.92] backdrop-blur-[12px] border-b border-[#e8eaed] px-4 sm:px-8 h-16 flex items-center justify-between">
      {/* Left: Logo */}
      <a href="#" className="flex items-center gap-2.5 no-underline">
        <div className="w-8 h-8 rounded-lg bg-[#111318] grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
            <rect
              x="9"
              y="2"
              width="5"
              height="5"
              rx="1.5"
              fill="white"
              opacity=".5"
            />
            <rect
              x="2"
              y="9"
              width="5"
              height="5"
              rx="1.5"
              fill="white"
              opacity=".5"
            />
            <rect
              x="9"
              y="9"
              width="5"
              height="5"
              rx="1.5"
              fill="white"
              opacity=".8"
            />
          </svg>
        </div>
        <div>
          <div className="text-base font-semibold text-[#111318] leading-tight tracking-[-0.01em]">
            Interntrack
          </div>
          <div className="text-xs text-[#878c97] leading-none">
            Attendance &amp; Internship SaaS
          </div>
        </div>
      </a>

      {/* Right: Buttons */}
      <div className="flex items-center gap-2">
        <button className="hidden sm:inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium text-[#3d4047] bg-transparent border border-[#d1d5dc] hover:bg-white transition-all cursor-pointer">
          <Search className="w-4 h-4" />
          Search
        </button>
        <button
          onClick={() => router.back()}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium text-[#3d4047] bg-transparent border border-[#d1d5dc] hover:bg-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <button
          onClick={onExportCSV}
          className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium text-white bg-[#16a34a] hover:bg-[#15803d] transition-all cursor-pointer border-none"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium text-white bg-[#111318] hover:bg-[#1d2028] transition-all cursor-pointer border-none"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
