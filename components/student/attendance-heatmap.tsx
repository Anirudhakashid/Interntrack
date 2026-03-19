"use client";

import { cn } from "@/lib/utils";

export type AttendanceHeatmapStatus = "present" | "absent" | "pending" | "none";

export type AttendanceHeatmapRecord = {
  date: string;
  status: AttendanceHeatmapStatus;
};

type AttendanceHeatmapProps = {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  records: AttendanceHeatmapRecord[];
  variant?: "dashboard" | "detail";
  emptyMessage?: string;
  className?: string;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_MS = 1000 * 60 * 60 * 24;

function atStartOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function toDate(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : atStartOfDay(date);
}

function toLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AttendanceHeatmap({
  startDate,
  endDate,
  records,
  variant = "detail",
  emptyMessage = "No start date available",
  className,
}: AttendanceHeatmapProps) {
  const normalizedStart = toDate(startDate);
  const normalizedEnd = toDate(endDate);

  if (!normalizedStart) {
    return (
      <div
        className={cn("text-center py-6 px-5 text-sm text-gray-500", className)}
      >
        {emptyMessage}
      </div>
    );
  }

  const today = atStartOfDay(new Date());
  const todayKey = toLocalDateKey(today);
  const gridStart = new Date(normalizedStart);
  const startDow = (normalizedStart.getDay() + 6) % 7;
  gridStart.setDate(gridStart.getDate() - startDow);

  const renderEnd =
    variant === "dashboard"
      ? normalizedStart > today
        ? normalizedStart
        : today
      : normalizedEnd && normalizedEnd > normalizedStart
        ? normalizedEnd
        : normalizedStart;

  const diffDays = Math.floor(
    (renderEnd.getTime() - gridStart.getTime()) / DAY_MS,
  );
  const numWeeks = Math.max(1, Math.ceil((diffDays + 1) / 7));

  const lookup = new Map<string, AttendanceHeatmapStatus>();
  for (const record of records) {
    lookup.set(record.date.slice(0, 10), record.status);
  }

  const cellSize = variant === "dashboard" ? 16 : 12;
  const cellGap = variant === "dashboard" ? 5 : 3;
  const offsetX = variant === "dashboard" ? 34 : 0;
  const offsetY = variant === "dashboard" ? 22 : 0;
  const showAxes = variant === "dashboard";
  const monthLabelMap: Record<number, string> = {};
  let previousMonth = -1;

  const weeks: Array<
    Array<{
      date: Date;
      key: string;
      inRange: boolean;
      beforeStart: boolean;
      isFuture: boolean;
      isToday: boolean;
      status: AttendanceHeatmapStatus;
    }>
  > = [];

  for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
    const week: Array<{
      date: Date;
      key: string;
      inRange: boolean;
      beforeStart: boolean;
      isFuture: boolean;
      isToday: boolean;
      status: AttendanceHeatmapStatus;
    }> = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);
      const key = toLocalDateKey(date);
      const beforeStart = date < normalizedStart;
      const inRange =
        variant === "dashboard"
          ? date >= normalizedStart && date <= today
          : !!normalizedEnd && date >= normalizedStart && date <= normalizedEnd;
      const isFuture =
        variant === "dashboard"
          ? date > today
          : !!normalizedEnd && date > normalizedEnd;
      const status = inRange ? (lookup.get(key) ?? "none") : "none";

      week.push({
        date,
        key,
        inRange,
        beforeStart,
        isFuture,
        isToday: key === todayKey,
        status,
      });

      if (showAxes && date.getMonth() !== previousMonth) {
        monthLabelMap[weekIndex] = MONTHS[date.getMonth()];
        previousMonth = date.getMonth();
      }
    }

    weeks.push(week);
  }

  const svgWidth = numWeeks * (cellSize + cellGap) + (showAxes ? 40 : 0);
  const svgHeight = 7 * (cellSize + cellGap) + (showAxes ? 34 : 0);

  const legends =
    variant === "dashboard"
      ? [
          { label: "Present", swatch: "bg-green-700 border-green-800" },
          { label: "Pending", swatch: "bg-amber-100 border-amber-200" },
          { label: "Absent", swatch: "bg-red-600 border-red-700" },
          { label: "Upcoming", swatch: "bg-gray-100 border-gray-300" },
          { label: "No record", swatch: "bg-gray-300 border-gray-400" },
        ]
      : [
          { label: "Present", swatch: "bg-emerald-500 border-emerald-600" },
          { label: "Absent", swatch: "bg-rose-200 border-rose-300" },
          { label: "Pending", swatch: "bg-amber-200 border-amber-300" },
          { label: "No record", swatch: "bg-gray-200 border-gray-300" },
        ];

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ display: "block", fontFamily: "inherit" }}
        >
          {showAxes
            ? weeks.map((_, weekIndex) =>
                monthLabelMap[weekIndex] ? (
                  <text
                    key={weekIndex}
                    x={offsetX + weekIndex * (cellSize + cellGap)}
                    y={12}
                    fontSize={10}
                    fill="#b4b8c2"
                    fontWeight="700"
                    letterSpacing="0.04em"
                  >
                    {monthLabelMap[weekIndex]}
                  </text>
                ) : null,
              )
            : null}

          {showAxes
            ? ["Mon", "", "Wed", "", "Fri", "", ""].map((label, dayIndex) =>
                label ? (
                  <text
                    key={dayIndex}
                    x={0}
                    y={
                      offsetY +
                      dayIndex * (cellSize + cellGap) +
                      cellSize * 0.75
                    }
                    fontSize={10}
                    fill="#b4b8c2"
                    fontWeight="700"
                  >
                    {label}
                  </text>
                ) : null,
              )
            : null}

          {weeks.map((week, weekIndex) =>
            week.map((cell, dayIndex) => {
              const x = offsetX + weekIndex * (cellSize + cellGap);
              const y = offsetY + dayIndex * (cellSize + cellGap);

              let fill = "#e5e7eb";
              let opacity = 1;
              let title = "No record";

              if (cell.beforeStart) {
                fill = "#f3f4f6";
                opacity = 0.3;
                title = "Before internship";
              } else if (cell.isFuture) {
                fill = "#f3f4f6";
                title =
                  variant === "dashboard" ? "Upcoming" : "After internship";
              } else if (cell.status === "present") {
                fill = variant === "dashboard" ? "#15803d" : "#10b981";
                title = "Present";
              } else if (cell.status === "absent") {
                fill = variant === "dashboard" ? "#dc2626" : "#fecdd3";
                title = "Absent";
              } else if (cell.status === "pending") {
                fill = variant === "dashboard" ? "#fef3c7" : "#fde68a";
                title = "Pending";
              }

              return (
                <g key={`${weekIndex}-${dayIndex}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={showAxes ? 3 : 2}
                    ry={showAxes ? 3 : 2}
                    fill={fill}
                    opacity={opacity}
                  />
                  <title>
                    {cell.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {": "}
                    {title}
                  </title>
                </g>
              );
            }),
          )}
        </svg>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-4 text-xs text-gray-500",
          variant === "dashboard"
            ? "mt-4 justify-between px-6 pb-5"
            : "justify-between",
        )}
      >
        <div className="flex flex-wrap gap-4">
          {legends.map((legend) => (
            <div key={legend.label} className="flex items-center gap-2">
              <div
                className={cn("h-3 w-3 rounded-[3px] border", legend.swatch)}
              />
              <span>{legend.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
