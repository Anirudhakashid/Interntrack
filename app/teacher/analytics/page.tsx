"use client";

import { useEffect } from "react";
import { useAnalyticsData } from "./_lib/use-analytics-data";
import { AnalyticsNavbar } from "./_components/analytics-navbar";
import { AnalyticsHeader } from "./_components/analytics-header";
import { FilterChips } from "./_components/filter-chips";
import { MetricCards } from "./_components/metric-cards";
import { DistributionCharts } from "./_components/distribution-charts";
import { TrendsCharts } from "./_components/trends-charts";
import { TopCompaniesTable } from "./_components/top-companies-table";
import { CrossAnalysisChart } from "./_components/cross-analysis-chart";
import { InsightsCharts } from "./_components/insights-charts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold tracking-[0.06em] uppercase text-[#2563eb] mb-3.5">
      <div className="w-[3px] h-[14px] bg-[#2563eb] rounded-sm" />
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const {
    filteredData,
    loading,
    error,
    selectedBranch,
    setSelectedBranch,
    statusFilter,
    setStatusFilter,
    modeFilter,
    setModeFilter,
    allBranches,
    paidPercent,
    generateCSV,
    handleLogout,
  } = useAnalyticsData();

  // Scroll-reveal observer
  useEffect(() => {
    if (loading) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111318] antialiased">
      <AnalyticsNavbar onExportCSV={generateCSV} onLogout={handleLogout} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-16">
        <div className="reveal">
          <AnalyticsHeader
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            allBranches={allBranches}
          />
        </div>

        <div className="reveal delay-1">
          <FilterChips
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            modeFilter={modeFilter}
            setModeFilter={setModeFilter}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {!loading && !error && filteredData && (
          <>
            {/* Key Metrics */}
            <section className="reveal delay-1">
              <SectionTitle>Key Metrics</SectionTitle>
              <MetricCards
                filteredData={filteredData}
                paidPercent={paidPercent}
              />
            </section>

            {/* Distribution */}
            <section className="reveal delay-2 mt-8">
              <SectionTitle>Distribution</SectionTitle>
              <DistributionCharts filteredData={filteredData} />
            </section>

            {/* Insights: Location, Domain, Attendance */}
            <section className="reveal delay-3 mt-8">
              <SectionTitle>Insights</SectionTitle>
              <InsightsCharts filteredData={filteredData} />
            </section>

            {/* Trends */}
            <section className="reveal mt-8">
              <SectionTitle>Trends</SectionTitle>
              <TrendsCharts filteredData={filteredData} />
            </section>

            {/* Top Companies */}
            <section className="reveal mt-8">
              <div className="flex items-center justify-between mb-3.5">
                <SectionTitle>Top Companies</SectionTitle>
                <span className="text-sm text-[#878c97]">
                  Ranked by number of placements
                </span>
              </div>
              <TopCompaniesTable
                topCompanies={filteredData.topCompanies}
                totalInternships={filteredData.totalInternships}
              />
            </section>

            {/* Cross Analysis */}
            {filteredData.branchCompanyChart.length > 0 && (
              <section className="reveal mt-8">
                <div className="flex items-center justify-between mb-3.5">
                  <SectionTitle>Cross Analysis</SectionTitle>
                  <span className="text-sm text-[#878c97]">
                    Branch-wise company placement breakdown
                  </span>
                </div>
                <CrossAnalysisChart
                  branchCompanyChart={filteredData.branchCompanyChart}
                />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
