"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartTooltip,
  PieTooltip,
  ChartLegend,
  NoChartData,
} from "./chart-tooltip";
import { PALETTE, BRANCH_COLORS } from "../_lib/constants";
import type { FilteredData } from "../_lib/types";

interface InsightsChartsProps {
  filteredData: FilteredData;
}

export function InsightsCharts({ filteredData }: InsightsChartsProps) {
  const locationDonutData = useMemo(() => {
    const top5 = filteredData.locationDistribution.slice(0, 5);
    const othersCount = filteredData.locationDistribution
      .slice(5)
      .reduce((sum, l) => sum + l.count, 0);
    const result = top5.map((l) => ({ name: l.location, value: l.count }));
    if (othersCount > 0) result.push({ name: "Others", value: othersCount });
    return result;
  }, [filteredData.locationDistribution]);

  const domainBarData = useMemo(() => {
    return filteredData.domainDistribution.slice(0, 8);
  }, [filteredData.domainDistribution]);

  const domainChartHeight = Math.max(domainBarData.length * 36, 180);
  const domainAxisWidth = useMemo(() => {
    const longestDomain = domainBarData.reduce(
      (max, item) => Math.max(max, item.domain.length),
      0,
    );

    return Math.min(Math.max(longestDomain * 7, 110), 180);
  }, [domainBarData]);

  const locationColors = [
    "#2563eb",
    "#16a34a",
    "#d97706",
    "#7c3aed",
    "#0891b2",
    "#e5e7eb",
  ];

  const hasLocationData = locationDonutData.length > 0;
  const hasDomainData = domainBarData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Company Location Donut */}
      <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-1">
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Company Locations
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            Geographic distribution of internships
          </div>
        </div>
        {hasLocationData ? (
          <>
            <div className="h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    dataKey="value"
                    stroke="none"
                  >
                    {locationDonutData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={locationColors[i % locationColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend
              items={locationDonutData.map((l, i) => ({
                label: `${l.name} (${l.value})`,
                color: locationColors[i % locationColors.length],
              }))}
            />
          </>
        ) : (
          <NoChartData message="No location data available for the current filters" />
        )}
      </div>

      {/* Domain Bar Chart */}
      <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-1">
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Internship Domains
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            Field / domain distribution
          </div>
        </div>
        {hasDomainData ? (
          <div className="mt-4" style={{ height: domainChartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={domainBarData}
                layout="vertical"
                margin={{ top: 8, right: 12, bottom: 8, left: 8 }}
                barCategoryGap="18%"
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 13 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="domain"
                  tick={{ fontSize: 13 }}
                  tickLine={false}
                  axisLine={false}
                  width={domainAxisWidth}
                  interval={0}
                  tickFormatter={(v: string) =>
                    v.length > 22 ? v.substring(0, 22) + "..." : v
                  }
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {domainBarData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <NoChartData message="No domain data available for the current filters" />
        )}
      </div>

      {/* Attendance by Branch */}
      <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-1">
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Attendance by Branch
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            Verification rate per department
          </div>
        </div>
        {filteredData.attendanceByBranch.length > 0 ? (
          <div className="mt-4 space-y-3">
            {filteredData.attendanceByBranch.map((item) => (
              <div key={item.branch}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#3d4047] truncate max-w-[120px]">
                    {item.branch}
                  </span>
                  <span className="text-sm font-semibold text-[#111318]">
                    {item.rate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#e8eaed] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.rate}%`,
                      backgroundColor: BRANCH_COLORS[item.branch] || "#2563eb",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-xs text-[#878c97]">
                    {item.verified}/{item.total} verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoChartData message="No attendance data available for the current filters" />
        )}
      </div>
    </div>
  );
}
