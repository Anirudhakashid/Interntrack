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
import { ChartTooltip, PieTooltip, ChartLegend } from "./chart-tooltip";
import {
  BRANCH_COLORS,
  COLORS,
  STIPEND_COLORS,
  MODE_COLORS,
  PALETTE,
} from "../_lib/constants";
import type { FilteredData } from "../_lib/types";

interface DistributionChartsProps {
  filteredData: FilteredData;
}

export function DistributionCharts({ filteredData }: DistributionChartsProps) {
  const companyDonutData = useMemo(() => {
    const top5 = filteredData.companyDistribution.slice(0, 5);
    const othersCount = filteredData.companyDistribution
      .slice(5)
      .reduce((sum, c) => sum + c.count, 0);
    const result = top5.map((c) => ({ name: c.company, value: c.count }));
    if (othersCount > 0) result.push({ name: "Others", value: othersCount });
    return result;
  }, [filteredData.companyDistribution]);

  const companyDonutColors = [
    COLORS.blue,
    COLORS.green,
    COLORS.violet,
    COLORS.amber,
    COLORS.cyan,
    "#e5e7eb",
  ];

  const stipendChartData = useMemo(() => {
    return [
      { name: "Paid", value: filteredData.stipendAnalytics.paid },
      { name: "Unpaid", value: filteredData.stipendAnalytics.unpaid },
      { name: "Unknown", value: filteredData.stipendAnalytics.unknown },
    ].filter((d) => d.value > 0);
  }, [filteredData.stipendAnalytics]);

  const modeChartData = useMemo(() => {
    return [
      { mode: "Online", count: filteredData.modeAnalytics.online },
      { mode: "Offline", count: filteredData.modeAnalytics.offline },
      { mode: "Hybrid", count: filteredData.modeAnalytics.hybrid },
      { mode: "Unknown", count: filteredData.modeAnalytics.unknown },
    ].filter((d) => d.count > 0);
  }, [filteredData.modeAnalytics]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Branch Distribution Bar Chart */}
      <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-1">
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Student Distribution by Branch
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            How internships are spread across departments
          </div>
        </div>
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData.branchDistribution}>
              <XAxis
                dataKey="branch"
                tick={{ fontSize: 13 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                tickFormatter={(v: string) =>
                  v.length > 8 ? v.substring(0, 8) + "..." : v
                }
              />
              <YAxis
                tick={{ fontSize: 13 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {filteredData.branchDistribution.map((entry, i) => (
                  <Cell
                    key={entry.branch}
                    fill={
                      BRANCH_COLORS[entry.branch] || PALETTE[i % PALETTE.length]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          items={filteredData.branchDistribution.map((b, i) => ({
            label: b.branch,
            color: BRANCH_COLORS[b.branch] || PALETTE[i % PALETTE.length],
          }))}
          type="sq"
        />
      </div>

      {/* Company Distribution Donut */}
      <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-1">
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Company Distribution
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            Top hiring companies this cycle
          </div>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={companyDonutData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                dataKey="value"
                stroke="none"
              >
                {companyDonutData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={companyDonutColors[i % companyDonutColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          items={companyDonutData.map((c, i) => ({
            label: `${c.name} (${c.value})`,
            color: companyDonutColors[i % companyDonutColors.length],
          }))}
        />
      </div>

      {/* Stipend Distribution Donut */}
      <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-1">
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Stipend Distribution
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            Paid vs unpaid vs unknown internships
          </div>
        </div>
        <div className="h-[180px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stipendChartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                dataKey="value"
                stroke="none"
              >
                {stipendChartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STIPEND_COLORS[entry.name] || "#9ca3af"}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          items={stipendChartData.map((d) => ({
            label: `${d.name} (${d.value})`,
            color: STIPEND_COLORS[d.name] || "#9ca3af",
          }))}
        />
      </div>

      {/* Mode Distribution Bar Chart */}
      <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-1">
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Internship Mode
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            On-site, remote, and hybrid breakdown
          </div>
        </div>
        <div className="h-[180px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modeChartData}>
              <XAxis
                dataKey="mode"
                tick={{ fontSize: 13 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 13 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {modeChartData.map((entry) => (
                  <Cell
                    key={entry.mode}
                    fill={MODE_COLORS[entry.mode] || "#9ca3af"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          items={modeChartData.map((d) => ({
            label: `${d.mode} (${d.count})`,
            color: MODE_COLORS[d.mode] || "#9ca3af",
          }))}
          type="sq"
        />
      </div>
    </div>
  );
}
