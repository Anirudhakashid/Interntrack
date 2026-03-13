"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  Search,
  User,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  AttendanceHeatmap,
  type AttendanceHeatmapRecord,
} from "@/components/student/attendance-heatmap";
import { cn } from "@/lib/utils";

export type AttendanceRow = {
  id: string;
  date: string;
  status: string;
  createdAt: string;
  location?: string | null;
  verifiedAt?: string | null;
};

export type AttendanceTrackerForm = {
  id: string;
  companyName: string;
  domain?: string;
  companyLocation?: string;
  status: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  teacher: { name: string; email: string };
  attendances: AttendanceRow[];
};

interface AttendanceTrackerProps {
  forms: AttendanceTrackerForm[];
  onAttendanceRequest: () => void | Promise<void>;
  onSelectedCompanyChange?: (companyName: string | null) => void;
}

type UiAttendanceStatus = "present" | "absent" | "pending";
type RecordFilter = "all" | UiAttendanceStatus;

const PAGE_SIZE = 8;

const STATUS_META: Record<
  UiAttendanceStatus,
  {
    label: string;
    badgeClass: string;
    icon: typeof CheckCircle2;
  }
> = {
  present: {
    label: "Present",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  absent: {
    label: "Absent",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    icon: AlertCircle,
  },
};

function normalizeStatus(status: string): UiAttendanceStatus {
  if (status === "VERIFIED") return "present";
  if (status === "ABSENT") return "absent";
  return "pending";
}

function toDayStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function formatDate(value?: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  });
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatWeekday(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function durationDays(start?: string, end?: string) {
  if (!start || !end) return "—";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "—";
  }

  const diff = Math.max(
    0,
    Math.round(
      (toDayStart(endDate).getTime() - toDayStart(startDate).getTime()) /
        86400000,
    ),
  );
  return `${diff} days`;
}

function companyTone(name: string) {
  const palettes = [
    {
      icon: "border-blue-200/70 bg-blue-50 text-blue-600",
      accent: "from-blue-500 to-blue-700",
    },
    {
      icon: "border-emerald-200/70 bg-emerald-50 text-emerald-600",
      accent: "from-emerald-500 to-emerald-700",
    },
    {
      icon: "border-amber-200/70 bg-amber-50 text-amber-600",
      accent: "from-amber-500 to-orange-600",
    },
    {
      icon: "border-rose-200/70 bg-rose-50 text-rose-600",
      accent: "from-rose-500 to-red-700",
    },
    {
      icon: "border-violet-200/70 bg-violet-50 text-violet-600",
      accent: "from-violet-500 to-fuchsia-700",
    },
  ];

  const hash = Array.from(name).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return palettes[hash % palettes.length];
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAttendanceStats(records: AttendanceRow[]) {
  const present = records.filter(
    (record) => normalizeStatus(record.status) === "present",
  ).length;
  const absent = records.filter(
    (record) => normalizeStatus(record.status) === "absent",
  ).length;
  const pending = records.filter(
    (record) => normalizeStatus(record.status) === "pending",
  ).length;
  const total = records.length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  return { present, absent, pending, total, rate };
}

function getFormStatus(form: AttendanceTrackerForm) {
  const today = toDayStart(new Date());
  const startDate = form.startDate
    ? toDayStart(new Date(form.startDate))
    : null;
  const endDate = form.endDate ? toDayStart(new Date(form.endDate)) : null;
  const isCompleted = form.status === "COMPLETED";
  const hasNotStarted = !!startDate && today < startDate;
  const hasEnded = !!endDate && today > endDate;
  const canRequestAttendance =
    !isCompleted &&
    form.status === "APPROVED" &&
    form.isActive &&
    !hasNotStarted &&
    !hasEnded;

  let label = "Approved";
  let badgeClass = "bg-emerald-50 text-emerald-700";
  let ctaLabel = "Request Attendance";

  if (isCompleted) {
    label = "Completed";
    badgeClass = "bg-green-50 text-green-700";
    ctaLabel = "Internship Completed";
  } else if (hasNotStarted) {
    label = "Starts Soon";
    badgeClass = "bg-sky-50 text-sky-700";
    ctaLabel = "Internship Not Started Yet";
  } else if (hasEnded) {
    label = "Ended";
    badgeClass = "bg-rose-50 text-rose-700";
    ctaLabel = "Internship Ended";
  } else if (form.isActive) {
    label = "Active";
    badgeClass = "bg-blue-50 text-blue-700";
    ctaLabel = "I'm at the Company";
  } else if (form.status !== "APPROVED") {
    label = form.status.charAt(0) + form.status.slice(1).toLowerCase();
    badgeClass = "bg-slate-100 text-slate-700";
    ctaLabel = "Attendance Unavailable";
  } else {
    label = "Inactive";
    badgeClass = "bg-slate-100 text-slate-700";
    ctaLabel = "Internship Inactive";
  }

  return {
    label,
    badgeClass,
    ctaLabel,
    canRequestAttendance,
  };
}

function InfoChip({
  icon: Icon,
  label,
  value,
  emphasis = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
        emphasis
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </span>
      <span className={cn("font-medium", emphasis && "text-emerald-700")}>
        {value}
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  tone: "green" | "red" | "blue" | "amber";
}) {
  const toneMap = {
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  } as const;

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl",
            toneMap[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight text-gray-950">
            {value}
          </div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function PageButton({
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid h-9 min-w-9 place-items-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition",
        active && "border-blue-600 bg-blue-600 text-white",
        !active && !disabled && "hover:border-gray-300 hover:bg-gray-100",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}

export function AttendanceTracker({
  forms,
  onAttendanceRequest,
  onSelectedCompanyChange,
}: AttendanceTrackerProps) {
  const visibleForms = useMemo(
    () =>
      forms.filter(
        (form) => form.status === "APPROVED" || form.status === "COMPLETED",
      ),
    [forms],
  );
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RecordFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortDescending, setSortDescending] = useState(true);
  const [loadingId, setLoadingId] = useState("");

  useEffect(() => {
    if (!visibleForms.length) {
      setSelectedFormId(null);
      return;
    }

    if (
      selectedFormId &&
      visibleForms.some((form) => form.id === selectedFormId)
    ) {
      return;
    }

    setSelectedFormId(null);
  }, [selectedFormId, visibleForms]);

  const selectedForm = useMemo(
    () => visibleForms.find((form) => form.id === selectedFormId) ?? null,
    [selectedFormId, visibleForms],
  );

  useEffect(() => {
    onSelectedCompanyChange?.(selectedForm?.companyName ?? null);
  }, [onSelectedCompanyChange, selectedForm]);

  const filteredRecords = useMemo(() => {
    if (!selectedForm) return [];

    const rows = [...selectedForm.attendances].sort((left, right) => {
      const leftDate = new Date(left.date).getTime();
      const rightDate = new Date(right.date).getTime();
      return sortDescending ? rightDate - leftDate : leftDate - rightDate;
    });

    return rows.filter((record) => {
      const normalized = normalizeStatus(record.status);
      if (filter !== "all" && normalized !== filter) return false;

      if (!search.trim()) return true;
      const query = search.trim().toLowerCase();
      const dateLabel = formatDate(record.date).toLowerCase();
      const weekday = formatWeekday(record.date).toLowerCase();
      return (
        dateLabel.includes(query) ||
        weekday.includes(query) ||
        record.date.toLowerCase().includes(query)
      );
    });
  }, [filter, search, selectedForm, sortDescending]);

  useEffect(() => {
    setPage(1);
  }, [filter, search, selectedFormId, sortDescending]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleAttendanceRequest = async (formId: string) => {
    setLoadingId(formId);

    try {
      const response = await fetch("/api/attendance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipFormId: formId }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to request attendance");
        return;
      }

      toast.success("Attendance verification email sent to HR.");
      await onAttendanceRequest();
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingId("");
    }
  };

  const exportCsv = () => {
    if (!selectedForm) return;

    const csv = [
      ["#", "Date", "Day", "Location", "Check-in", "Status"],
      ...filteredRecords.map((record, index) => [
        String(index + 1),
        record.date.slice(0, 10),
        formatWeekday(record.date),
        record.location || "—",
        formatTime(record.createdAt),
        STATUS_META[normalizeStatus(record.status)].label,
      ]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedForm.companyName.replace(/\s+/g, "-").toLowerCase()}-attendance.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (!visibleForms.length) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="py-14">
          <div className="mx-auto max-w-md text-center">
            <Calendar className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900">
              No attendance data yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Once an internship is approved, it will appear here with its
              attendance history.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedForm) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleForms.map((form) => {
            const stats = getAttendanceStats(form.attendances);
            const tone = companyTone(form.companyName);
            const state = getFormStatus(form);

            return (
              <button
                key={form.id}
                type="button"
                onClick={() => setSelectedFormId(form.id)}
                className="group text-left"
              >
                <Card className="h-full rounded-xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "grid h-11 w-11 place-items-center rounded-lg border text-sm font-bold",
                            tone.icon,
                          )}
                        >
                          {initials(form.companyName)}
                        </div>
                        <div>
                          <div className="text-base font-semibold text-gray-950">
                            {form.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {form.domain || "Internship Attendance Tracking"}
                          </div>
                        </div>
                      </div>
                      <Badge className={cn("border-0", state.badgeClass)}>
                        {state.label}
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-md bg-white px-3 py-2.5 text-center shadow-sm ring-1 ring-gray-100">
                          <div className="text-xl font-semibold text-emerald-600">
                            {stats.present}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Present
                          </div>
                        </div>
                        <div className="rounded-md bg-white px-3 py-2.5 text-center shadow-sm ring-1 ring-gray-100">
                          <div className="text-xl font-semibold text-rose-600">
                            {stats.absent}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Absent
                          </div>
                        </div>
                        <div className="rounded-md bg-white px-3 py-2.5 text-center shadow-sm ring-1 ring-gray-100">
                          <div className="text-xl font-semibold text-blue-600">
                            {stats.rate}%
                          </div>
                          <div className="mt-1 text-xs text-gray-500">Rate</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(form.startDate)}</span>
                      <span className="text-gray-300">to</span>
                      <span>{formatDate(form.endDate)}</span>
                      <span className="text-gray-300">•</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const selectedStats = getAttendanceStats(selectedForm.attendances);
  const selectedTone = companyTone(selectedForm.companyName);
  const formState = getFormStatus(selectedForm);
  const heatmapRecords: AttendanceHeatmapRecord[] =
    selectedForm.attendances.map((record) => ({
      date: record.date,
      status: normalizeStatus(record.status),
    }));

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-fit rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900"
        onClick={() => setSelectedFormId(null)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all internships
      </Button>

      <div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          {selectedForm.companyName} Attendance
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {selectedForm.domain || "Internship Attendance Tracking"}
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-2xl border text-base font-bold",
                  selectedTone.icon,
                )}
              >
                {initials(selectedForm.companyName)}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-950">
                  {selectedForm.companyName}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedForm.domain || "Internship Attendance Tracking"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border-0", formState.badgeClass)}>
                {formState.label}
              </Badge>
              <Button
                onClick={() => handleAttendanceRequest(selectedForm.id)}
                disabled={
                  !formState.canRequestAttendance ||
                  loadingId === selectedForm.id
                }
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {loadingId === selectedForm.id ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    {formState.ctaLabel}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <InfoChip
              icon={Calendar}
              label="Start"
              value={formatDate(selectedForm.startDate)}
            />
            <InfoChip
              icon={Calendar}
              label="End"
              value={formatDate(selectedForm.endDate)}
            />
            <InfoChip
              icon={BriefcaseBusiness}
              label="Duration"
              value={durationDays(selectedForm.startDate, selectedForm.endDate)}
            />
            <InfoChip
              icon={User}
              label="Teacher"
              value={selectedForm.teacher.name}
            />
          </div>
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Activity Overview
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(selectedForm.startDate)} to{" "}
                {formatDate(selectedForm.endDate)}
              </div>
            </div>
          </div>
          <AttendanceHeatmap
            startDate={selectedForm.startDate}
            endDate={selectedForm.endDate}
            records={heatmapRecords}
            variant="detail"
            emptyMessage="Add internship start and end dates to render the attendance activity overview."
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          value={selectedStats.present}
          label="Present"
          tone="green"
        />
        <StatCard
          icon={XCircle}
          value={selectedStats.absent}
          label="Absent"
          tone="red"
        />
        <StatCard
          icon={Calendar}
          value={selectedStats.total}
          label="Total Logged"
          tone="blue"
        />
        <StatCard
          icon={Clock3}
          value={`${selectedStats.rate}%`}
          label="Rate"
          tone="amber"
        />
      </div>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-950">
              Attendance Records
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredRecords.length} of{" "}
              {selectedForm.attendances.length}
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              {(["all", "present", "absent", "pending"] as const).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                      filter === value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    {value === "all" ? "All" : STATUS_META[value].label}
                  </button>
                ),
              )}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search date..."
                className="w-full min-w-[220px] rounded-xl border-gray-200 pl-9 xl:w-[220px]"
              />
            </div>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={exportCsv}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setSortDescending((current) => !current)}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortDescending ? "Newest first" : "Oldest first"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[48px_1.6fr_1.2fr_120px_120px] gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              <div>#</div>
              <div>Date</div>
              <div>Location</div>
              <div>Check-in</div>
              <div>Status</div>
            </div>

            {pagedRecords.length ? (
              pagedRecords.map((record, index) => {
                const status = normalizeStatus(record.status);
                const Icon = STATUS_META[status].icon;

                return (
                  <div
                    key={record.id}
                    className="grid grid-cols-[48px_1.6fr_1.2fr_120px_120px] items-center gap-3 border-b border-gray-100 px-5 py-4 text-sm transition hover:bg-gray-50/70"
                  >
                    <div className="text-center font-medium text-gray-400">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formatDate(record.date)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatWeekday(record.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {record.location ? (
                        <MapPin className="h-4 w-4 text-gray-400" />
                      ) : null}
                      <span className="truncate">{record.location || "—"}</span>
                    </div>
                    <div className="font-medium text-gray-700">
                      {formatTime(record.createdAt)}
                    </div>
                    <div>
                      <Badge
                        className={cn(
                          "gap-1.5 border",
                          STATUS_META[status].badgeClass,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {STATUS_META[status].label}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-16 text-center text-sm text-gray-500">
                No records match this filter.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {pageCount} • {filteredRecords.length} records
          </div>
          <div className="flex flex-wrap gap-2">
            <PageButton
              disabled={currentPage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              ←
            </PageButton>
            {Array.from({ length: pageCount }, (_, index) => index + 1)
              .filter((pageNumber) => {
                if (pageCount <= 7) return true;
                return (
                  pageNumber === 1 ||
                  pageNumber === pageCount ||
                  Math.abs(pageNumber - currentPage) <= 1
                );
              })
              .map((pageNumber, index, pages) => {
                const previous = pages[index - 1];
                return (
                  <div key={pageNumber} className="flex items-center gap-2">
                    {previous && pageNumber - previous > 1 ? (
                      <span className="px-1 text-sm text-gray-400">...</span>
                    ) : null}
                    <PageButton
                      active={pageNumber === currentPage}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PageButton>
                  </div>
                );
              })}
            <PageButton
              disabled={currentPage === pageCount}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
            >
              →
            </PageButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
