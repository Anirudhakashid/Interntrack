"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  AnalyticsData,
  FilteredData,
  StatusFilter,
  ModeFilter,
  DurationAnalytics,
  DomainTrend,
} from "./types";

function getAcademicYear(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 5) return `${year}-${String(year + 1).slice(2)}`;
  return `${year - 1}-${String(year).slice(2)}`;
}

export function useAnalyticsData() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBranches, setAllBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/analytics", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} - ${text}`);
        }

        const data: AnalyticsData = JSON.parse(text);
        setAnalyticsData(data);

        const branches = data.branchAnalytics
          .map((b) => b.branch)
          .filter((b) => b !== "Not Specified")
          .sort();
        setAllBranches(branches);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/teacher/login");
    router.refresh();
  }, [router]);

  const filteredData: FilteredData | null = useMemo(() => {
    if (!analyticsData) return null;

    // Start with all raw internships, then apply filters
    let internships = analyticsData.rawInternships;

    // Branch filter
    if (selectedBranch !== "all") {
      internships = internships.filter(
        (i) => (i.student.branch || "Not Specified") === selectedBranch,
      );
    }

    // Status filter
    const now = new Date();
    if (statusFilter === "ongoing") {
      internships = internships.filter(
        (i) => !i.endDate || new Date(i.endDate) > now,
      );
    } else if (statusFilter === "completed") {
      internships = internships.filter(
        (i) => i.endDate && new Date(i.endDate) <= now,
      );
    }

    // Mode filter
    if (modeFilter !== "all") {
      const modeMap: Record<string, string> = {
        onsite: "offline",
        remote: "online",
        hybrid: "hybrid",
      };
      internships = internships.filter(
        (i) => i.mode?.toLowerCase() === modeMap[modeFilter],
      );
    }

    // Compute all analytics from filtered internships
    const branchMap = new Map<string, number>();
    const companyMap = new Map<string, number>();
    internships.forEach((i) => {
      const branch = i.student.branch || "Not Specified";
      branchMap.set(branch, (branchMap.get(branch) || 0) + 1);
      companyMap.set(i.companyName, (companyMap.get(i.companyName) || 0) + 1);
    });

    const branchDistribution = Array.from(branchMap.entries())
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count);

    const companyDistribution = Array.from(companyMap.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count);

    // Stipend
    const stipendAnalytics = { paid: 0, unpaid: 0, unknown: 0 };
    internships.forEach((i) => {
      const val = i.stipend?.toLowerCase();
      if (val === "paid") stipendAnalytics.paid++;
      else if (val === "unpaid") stipendAnalytics.unpaid++;
      else stipendAnalytics.unknown++;
    });

    // Mode
    const modeAnalytics = { online: 0, offline: 0, hybrid: 0, unknown: 0 };
    internships.forEach((i) => {
      const val = i.mode?.toLowerCase();
      if (val === "online") modeAnalytics.online++;
      else if (val === "offline") modeAnalytics.offline++;
      else if (val === "hybrid") modeAnalytics.hybrid++;
      else modeAnalytics.unknown++;
    });

    // Duration
    const durations = internships
      .map((i) => i.durationWeeks)
      .filter((d): d is number => d !== null && d !== undefined);
    const durationRanges = [
      { range: "1-4 weeks", min: 1, max: 4 },
      { range: "5-8 weeks", min: 5, max: 8 },
      { range: "9-12 weeks", min: 9, max: 12 },
      { range: "13+ weeks", min: 13, max: Infinity },
    ];
    const durationAnalytics: DurationAnalytics = {
      average:
        durations.length > 0
          ? Math.round(
              (durations.reduce((a, b) => a + b, 0) / durations.length) * 10,
            ) / 10
          : 0,
      min: durations.length > 0 ? Math.min(...durations) : 0,
      max: durations.length > 0 ? Math.max(...durations) : 0,
      distribution: durationRanges.map(({ range, min, max }) => ({
        range,
        count: durations.filter((d) => d >= min && d <= max).length,
      })),
    };

    // Year analytics
    const yearMap = new Map<string, number>();
    internships.forEach((i) => {
      const date = i.startDate || i.createdAt;
      const academicYear = getAcademicYear(new Date(date));
      yearMap.set(academicYear, (yearMap.get(academicYear) || 0) + 1);
    });
    const yearAnalytics = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    // Branch-company chart
    const branchCompanyMap = new Map<string, Map<string, number>>();
    internships.forEach((i) => {
      const branch = i.student.branch || "Not Specified";
      if (!branchCompanyMap.has(i.companyName)) {
        branchCompanyMap.set(i.companyName, new Map());
      }
      const bm = branchCompanyMap.get(i.companyName)!;
      bm.set(branch, (bm.get(branch) || 0) + 1);
    });
    const branchCompanyChart = Array.from(branchCompanyMap.entries())
      .sort((a, b) => {
        const totalA = Array.from(a[1].values()).reduce(
          (sum, val) => sum + val,
          0,
        );
        const totalB = Array.from(b[1].values()).reduce(
          (sum, val) => sum + val,
          0,
        );
        return totalB - totalA;
      })
      .map(([company, bMap]) => {
        const data: Record<string, string | number> = { company };
        bMap.forEach((count, branch) => {
          data[branch] = count;
        });
        return data;
      });

    // Location distribution
    const locationMap = new Map<string, number>();
    internships.forEach((i) => {
      const loc = i.companyLocation || "Not Specified";
      locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
    });
    const locationDistribution = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    // Domain distribution
    const domainMap = new Map<string, number>();
    internships.forEach((i) => {
      const dom = i.domain || "Not Specified";
      domainMap.set(dom, (domainMap.get(dom) || 0) + 1);
    });
    const domainDistribution = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);

    // Domain trends over time (top domains by academic year)
    const domainYearMap = new Map<string, Map<string, number>>();
    internships.forEach((i) => {
      const dom = i.domain || "Not Specified";
      const date = i.startDate || i.createdAt;
      const year = getAcademicYear(new Date(date));
      if (!domainYearMap.has(year)) {
        domainYearMap.set(year, new Map());
      }
      const yearDomains = domainYearMap.get(year)!;
      yearDomains.set(dom, (yearDomains.get(dom) || 0) + 1);
    });
    // Get top 6 domains for the chart
    const topDomains = domainDistribution.slice(0, 6).map((d) => d.domain);
    const domainTrends: DomainTrend[] = Array.from(domainYearMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, domains]) => {
        const entry: DomainTrend = { year };
        topDomains.forEach((dom) => {
          entry[dom] = domains.get(dom) || 0;
        });
        return entry;
      });

    // Attendance by branch (from server, filter by selected branch)
    const attendanceByBranch =
      selectedBranch === "all"
        ? analyticsData.attendanceAnalytics
        : analyticsData.attendanceAnalytics.filter(
            (a) => a.branch === selectedBranch,
          );

    // Active vs completed counts
    const activeNow = internships.filter(
      (i) => !i.endDate || new Date(i.endDate) > now,
    ).length;
    const completed = internships.filter(
      (i) => i.endDate && new Date(i.endDate) <= now,
    ).length;

    return {
      totalInternships: internships.length,
      activeNow,
      completed,
      uniqueBranches: branchMap.size,
      uniqueCompanies: companyMap.size,
      branchDistribution,
      companyDistribution,
      topCompanies: companyDistribution.slice(0, 10),
      branchCompanyChart,
      stipendAnalytics,
      modeAnalytics,
      durationAnalytics,
      yearAnalytics,
      locationDistribution,
      domainDistribution,
      domainTrends,
      domainTrendKeys: topDomains,
      attendanceByBranch,
    };
  }, [analyticsData, selectedBranch, statusFilter, modeFilter]);

  const paidPercent = useMemo(() => {
    if (!filteredData) return 0;
    const total =
      filteredData.stipendAnalytics.paid +
      filteredData.stipendAnalytics.unpaid +
      filteredData.stipendAnalytics.unknown;
    if (total === 0) return 0;
    return Math.round((filteredData.stipendAnalytics.paid / total) * 100);
  }, [filteredData]);

  const topMode = useMemo(() => {
    if (!filteredData) return "N/A";
    const { online, offline, hybrid } = filteredData.modeAnalytics;
    const max = Math.max(online, offline, hybrid);
    if (max === 0) return "N/A";
    if (max === offline) return "On-site";
    if (max === online) return "Remote";
    return "Hybrid";
  }, [filteredData]);

  const generateCSV = useCallback(() => {
    if (!analyticsData || !filteredData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "INTERNSHIP ANALYTICS REPORT\n";
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    csvContent += `Filter: ${selectedBranch === "all" ? "All Branches" : selectedBranch}\n\n`;

    csvContent += "SUMMARY STATISTICS\n";
    csvContent += `Total Internships,${filteredData.totalInternships}\n`;
    csvContent += `Number of Branches,${filteredData.uniqueBranches}\n`;
    csvContent += `Number of Companies,${filteredData.uniqueCompanies}\n\n`;

    csvContent += "BRANCH DISTRIBUTION\n";
    csvContent += "Branch,Number of Internships\n";
    filteredData.branchDistribution.forEach((item) => {
      csvContent += `${item.branch},${item.count}\n`;
    });
    csvContent += "\n";

    csvContent += "COMPANY DISTRIBUTION\n";
    csvContent += "Company,Number of Internships\n";
    filteredData.companyDistribution.forEach((item) => {
      csvContent += `${item.company},${item.count}\n`;
    });
    csvContent += "\n";

    csvContent += "TOP COMPANIES\n";
    csvContent += "Rank,Company,Number of Interns\n";
    filteredData.topCompanies.forEach((item, index) => {
      csvContent += `${index + 1},${item.company},${item.count}\n`;
    });
    csvContent += "\n";

    csvContent += "STIPEND DISTRIBUTION\n";
    csvContent += "Type,Count\n";
    csvContent += `Paid,${filteredData.stipendAnalytics.paid}\n`;
    csvContent += `Unpaid,${filteredData.stipendAnalytics.unpaid}\n`;
    csvContent += `Unknown,${filteredData.stipendAnalytics.unknown}\n\n`;

    csvContent += "MODE DISTRIBUTION\n";
    csvContent += "Mode,Count\n";
    csvContent += `Online,${filteredData.modeAnalytics.online}\n`;
    csvContent += `Offline,${filteredData.modeAnalytics.offline}\n`;
    csvContent += `Hybrid,${filteredData.modeAnalytics.hybrid}\n`;
    csvContent += `Unknown,${filteredData.modeAnalytics.unknown}\n\n`;

    csvContent += "DURATION STATISTICS\n";
    csvContent += `Average Duration (weeks),${filteredData.durationAnalytics.average}\n`;
    csvContent += `Min Duration (weeks),${filteredData.durationAnalytics.min}\n`;
    csvContent += `Max Duration (weeks),${filteredData.durationAnalytics.max}\n\n`;
    csvContent += "DURATION DISTRIBUTION\n";
    csvContent += "Range,Count\n";
    filteredData.durationAnalytics.distribution.forEach((d) => {
      csvContent += `${d.range},${d.count}\n`;
    });
    csvContent += "\n";

    csvContent += "YEAR-WISE DISTRIBUTION\n";
    csvContent += "Academic Year,Count\n";
    filteredData.yearAnalytics.forEach((y) => {
      csvContent += `${y.year},${y.count}\n`;
    });
    csvContent += "\n";

    csvContent += "LOCATION DISTRIBUTION\n";
    csvContent += "Location,Count\n";
    filteredData.locationDistribution.forEach((l) => {
      csvContent += `${l.location},${l.count}\n`;
    });
    csvContent += "\n";

    csvContent += "DOMAIN DISTRIBUTION\n";
    csvContent += "Domain,Count\n";
    filteredData.domainDistribution.forEach((d) => {
      csvContent += `${d.domain},${d.count}\n`;
    });
    csvContent += "\n";

    if (filteredData.domainTrends.length > 0 && filteredData.domainTrendKeys.length > 0) {
      csvContent += "DOMAIN TRENDS BY ACADEMIC YEAR\n";
      csvContent += `Academic Year,${filteredData.domainTrendKeys.join(",")}\n`;
      filteredData.domainTrends.forEach((row) => {
        const values = filteredData.domainTrendKeys.map((k) => row[k] || 0);
        csvContent += `${row.year},${values.join(",")}\n`;
      });
      csvContent += "\n";
    }

    csvContent += "ATTENDANCE BY BRANCH\n";
    csvContent += "Branch,Total,Verified,Rate %\n";
    filteredData.attendanceByBranch.forEach((a) => {
      csvContent += `${a.branch},${a.total},${a.verified},${a.rate}\n`;
    });
    csvContent += "\n";

    if (
      filteredData.branchCompanyChart &&
      filteredData.branchCompanyChart.length > 0
    ) {
      csvContent += "BRANCH-WISE COMPANY DISTRIBUTION\n";
      const branches = Object.keys(
        filteredData.branchCompanyChart[0] || {},
      ).filter((k) => k !== "company");
      csvContent += `Company,${branches.join(",")}\n`;
      filteredData.branchCompanyChart.forEach(
        (item: Record<string, string | number>) => {
          const values = branches.map((b) => item[b] || 0);
          csvContent += `${item.company},${values.join(",")}\n`;
        },
      );
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `internship-analytics-${selectedBranch}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [analyticsData, filteredData, selectedBranch]);

  return {
    analyticsData,
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
    topMode,
    generateCSV,
    handleLogout,
  };
}
