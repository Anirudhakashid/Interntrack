"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip, ChartLegend } from "./chart-tooltip";
import { BRANCH_COLORS, PALETTE } from "../_lib/constants";

interface CrossAnalysisChartProps {
  branchCompanyChart: Array<Record<string, string | number>>;
}

export function CrossAnalysisChart({
  branchCompanyChart,
}: CrossAnalysisChartProps) {
  const branches = useMemo(() => {
    const branchSet = new Set<string>();
    branchCompanyChart.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "company") branchSet.add(key);
      });
    });
    return Array.from(branchSet);
  }, [branchCompanyChart]);

  return (
    <div className="bg-white border border-[#e8eaed] rounded-[14px] p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-base font-semibold text-[#111318] tracking-[-0.01em]">
            Branch-wise Company Distribution
          </div>
          <div className="text-sm text-[#878c97] mt-0.5">
            Which companies hired from which branches
          </div>
        </div>
        <ChartLegend
          items={branches.map((b, i) => ({
            label: b,
            color: BRANCH_COLORS[b] || PALETTE[i % PALETTE.length],
          }))}
          type="sq"
        />
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={branchCompanyChart}>
            <XAxis
              dataKey="company"
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
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            {branches.map((branch, i) => (
              <Bar
                key={branch}
                dataKey={branch}
                fill={BRANCH_COLORS[branch] || PALETTE[i % PALETTE.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
