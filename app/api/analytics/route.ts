import { prisma } from "@/lib/prisma";
import {
  getAnalyticsDisplayLabel,
  getNormalizedAnalyticsKey,
  getPreferredAnalyticsLabel,
} from "@/lib/analytics-normalization";
import { NextResponse } from "next/server";

const ANALYTICS_STATUSES = ["APPROVED", "COMPLETED"] as const;

function getAcademicYear(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 5) {
    return `${year}-${String(year + 1).slice(2)}`;
  }
  return `${year - 1}-${String(year).slice(2)}`;
}

export async function GET() {
  try {
    const internships = await prisma.internshipForm.findMany({
      where: {
        status: {
          in: [...ANALYTICS_STATUSES],
        },
      },
      select: {
        id: true,
        companyName: true,
        companyLocation: true,
        domain: true,
        stipend: true,
        stipendAmount: true,
        mode: true,
        durationWeeks: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        studentBranch: true,
        student: {
          select: {
            id: true,
            name: true,
            branch: true,
          },
        },
      },
    });

    // Attendance analytics - group by branch
    const attendances = await prisma.attendance.findMany({
      where: {
        internshipForm: {
          status: {
            in: [...ANALYTICS_STATUSES],
          },
        },
      },
      select: {
        status: true,
        internshipForm: {
          select: {
            student: {
              select: {
                branch: true,
              },
            },
          },
        },
      },
    });

    const branchAttendanceMap = new Map<
      string,
      { label: string; total: number; verified: number }
    >();
    attendances.forEach((a) => {
      const branchValue = a.internshipForm.student.branch;
      const branchKey = getNormalizedAnalyticsKey(branchValue);
      if (!branchAttendanceMap.has(branchKey)) {
        branchAttendanceMap.set(branchKey, {
          label: getAnalyticsDisplayLabel(branchValue),
          total: 0,
          verified: 0,
        });
      }
      const entry = branchAttendanceMap.get(branchKey)!;
      entry.label = getPreferredAnalyticsLabel(entry.label, branchValue);
      entry.total++;
      if (a.status === "VERIFIED") entry.verified++;
    });

    const attendanceAnalytics = Array.from(branchAttendanceMap.entries())
      .map(([, { label, total, verified }]) => ({
        branch: label,
        total,
        verified,
        rate: total > 0 ? Math.round((verified / total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate);

    // Calculate analytics
    const branchMap = new Map<string, { label: string; count: number }>();
    const companyMap = new Map<string, { label: string; count: number }>();
    const branchCompanyMap = new Map<
      string,
      {
        label: string;
        companies: Map<string, { label: string; count: number }>;
      }
    >();
    const studentsByBranchCompany = new Map<
      string,
      Array<{ id: string; name: string; branch: string }>
    >();

    internships.forEach((internship) => {
      const branchValue = internship.studentBranch || internship.student.branch;
      const branchKey = getNormalizedAnalyticsKey(branchValue);
      const branchLabel = getAnalyticsDisplayLabel(branchValue);
      const companyKey = getNormalizedAnalyticsKey(internship.companyName);
      const companyLabel = getAnalyticsDisplayLabel(internship.companyName);

      if (!branchMap.has(branchKey)) {
        branchMap.set(branchKey, { label: branchLabel, count: 0 });
      }
      if (!companyMap.has(companyKey)) {
        companyMap.set(companyKey, { label: companyLabel, count: 0 });
      }
      const branchEntry = branchMap.get(branchKey)!;
      branchEntry.label = getPreferredAnalyticsLabel(
        branchEntry.label,
        branchValue,
      );
      branchEntry.count++;

      const companyEntry = companyMap.get(companyKey)!;
      companyEntry.label = getPreferredAnalyticsLabel(
        companyEntry.label,
        internship.companyName,
      );
      companyEntry.count++;

      if (!branchCompanyMap.has(branchKey)) {
        branchCompanyMap.set(branchKey, {
          label: branchLabel,
          companies: new Map(),
        });
      }
      const branchCompanyEntry = branchCompanyMap.get(branchKey)!;
      branchCompanyEntry.label = getPreferredAnalyticsLabel(
        branchCompanyEntry.label,
        branchValue,
      );
      if (!branchCompanyEntry.companies.has(companyKey)) {
        branchCompanyEntry.companies.set(companyKey, {
          label: companyLabel,
          count: 0,
        });
      }
      const companyCount = branchCompanyEntry.companies.get(companyKey)!;
      companyCount.label = getPreferredAnalyticsLabel(
        companyCount.label,
        internship.companyName,
      );
      companyCount.count++;

      const key = `${branchKey}|${companyKey}`;
      if (!studentsByBranchCompany.has(key)) {
        studentsByBranchCompany.set(key, []);
      }
      studentsByBranchCompany.get(key)?.push({
        id: internship.student.id,
        name: internship.student.name,
        branch: getAnalyticsDisplayLabel(branchValue),
      });
    });

    const branchAnalytics = Array.from(branchMap.entries())
      .map(([, { label, count }]) => ({ branch: label, count }))
      .sort((a, b) => b.count - a.count);

    const companyAnalytics = Array.from(companyMap.entries())
      .map(([, { label, count }]) => ({ company: label, count }))
      .sort((a, b) => b.count - a.count);

    const topCompanies = companyAnalytics.slice(0, 10);

    const totalApproved = internships.length;
    const uniqueBranches = branchMap.size;
    const uniqueCompanies = companyMap.size;

    // Stipend analytics
    let paidCount = 0;
    let unpaidCount = 0;
    let stipendUnknown = 0;
    internships.forEach((i) => {
      const val = i.stipend?.toLowerCase();
      if (val === "paid") paidCount++;
      else if (val === "unpaid") unpaidCount++;
      else stipendUnknown++;
    });
    const stipendAnalytics = {
      paid: paidCount,
      unpaid: unpaidCount,
      unknown: stipendUnknown,
    };

    const stipendAmounts = internships
      .map((i) => i.stipendAmount)
      .filter(
        (amount): amount is number => amount !== null && amount !== undefined,
      );

    const stipendAmountRanges = [
      { range: "Below 5k", min: 0, max: 4999 },
      { range: "5k-10k", min: 5000, max: 10000 },
      { range: "10k-20k", min: 10001, max: 20000 },
      { range: "20k-40k", min: 20001, max: 40000 },
      { range: "40k+", min: 40001, max: Infinity },
    ];

    const stipendAmountAnalytics = {
      average:
        stipendAmounts.length > 0
          ? Math.round(
              stipendAmounts.reduce((sum, amount) => sum + amount, 0) /
                stipendAmounts.length,
            )
          : null,
      min: stipendAmounts.length > 0 ? Math.min(...stipendAmounts) : null,
      max: stipendAmounts.length > 0 ? Math.max(...stipendAmounts) : null,
      total: stipendAmounts.reduce((sum, amount) => sum + amount, 0),
      count: stipendAmounts.length,
      distribution: stipendAmountRanges.map(({ range, min, max }) => ({
        range,
        count: stipendAmounts.filter((amount) => amount >= min && amount <= max)
          .length,
      })),
    };

    // Mode analytics
    let onlineCount = 0;
    let offlineCount = 0;
    let hybridCount = 0;
    let modeUnknown = 0;
    internships.forEach((i) => {
      const val = i.mode?.toLowerCase();
      if (val === "online") onlineCount++;
      else if (val === "offline") offlineCount++;
      else if (val === "hybrid") hybridCount++;
      else modeUnknown++;
    });
    const modeAnalytics = {
      online: onlineCount,
      offline: offlineCount,
      hybrid: hybridCount,
      unknown: modeUnknown,
    };

    // Duration analytics
    const durations = internships
      .map((i) => i.durationWeeks)
      .filter((d): d is number => d !== null && d !== undefined);

    const durationRanges = [
      { range: "1-4 weeks", min: 1, max: 4 },
      { range: "5-8 weeks", min: 5, max: 8 },
      { range: "9-12 weeks", min: 9, max: 12 },
      { range: "13+ weeks", min: 13, max: Infinity },
    ];

    const durationAnalytics = {
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

    // Year analytics (academic year: June-May)
    const yearMap = new Map<string, number>();
    internships.forEach((i) => {
      const date = i.startDate || i.createdAt;
      const academicYear = getAcademicYear(new Date(date));
      yearMap.set(academicYear, (yearMap.get(academicYear) || 0) + 1);
    });
    const yearAnalytics = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    // Branch-company chart data
    const companyBranchMap = new Map<
      string,
      { label: string; branches: Map<string, { label: string; count: number }> }
    >();
    branchCompanyMap.forEach(({ label: branchLabel, companies }, branchKey) => {
      companies.forEach(({ label: companyLabel, count }, companyKey) => {
        if (!companyBranchMap.has(companyKey)) {
          companyBranchMap.set(companyKey, {
            label: companyLabel,
            branches: new Map(),
          });
        }
        const companyEntry = companyBranchMap.get(companyKey)!;
        companyEntry.label = getPreferredAnalyticsLabel(
          companyEntry.label,
          companyLabel,
        );
        if (!companyEntry.branches.has(branchKey)) {
          companyEntry.branches.set(branchKey, {
            label: branchLabel,
            count: 0,
          });
        }
        const branchEntry = companyEntry.branches.get(branchKey)!;
        branchEntry.label = getPreferredAnalyticsLabel(
          branchEntry.label,
          branchLabel,
        );
        branchEntry.count = count;
      });
    });

    const branchCompanyChartData = Array.from(companyBranchMap.entries())
      .sort((a, b) => {
        const totalA = Array.from(a[1].branches.values()).reduce(
          (sum, val) => sum + val.count,
          0,
        );
        const totalB = Array.from(b[1].branches.values()).reduce(
          (sum, val) => sum + val.count,
          0,
        );
        return totalB - totalA;
      })
      .map(([, { label, branches }]) => {
        const data: Record<string, string | number> = { company: label };
        branches.forEach(({ label: branchLabel, count }) => {
          data[branchLabel] = count;
        });
        return data;
      });

    // Location analytics
    const locationMap = new Map<string, { label: string; count: number }>();
    internships.forEach((i) => {
      const locationKey = getNormalizedAnalyticsKey(i.companyLocation);
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          label: getAnalyticsDisplayLabel(i.companyLocation),
          count: 0,
        });
      }
      const locationEntry = locationMap.get(locationKey)!;
      locationEntry.label = getPreferredAnalyticsLabel(
        locationEntry.label,
        i.companyLocation,
      );
      locationEntry.count++;
    });
    const locationAnalytics = Array.from(locationMap.entries())
      .map(([, { label, count }]) => ({ location: label, count }))
      .sort((a, b) => b.count - a.count);

    // Domain analytics
    const domainMap = new Map<string, { label: string; count: number }>();
    internships.forEach((i) => {
      const domainKey = getNormalizedAnalyticsKey(i.domain);
      if (!domainMap.has(domainKey)) {
        domainMap.set(domainKey, {
          label: getAnalyticsDisplayLabel(i.domain),
          count: 0,
        });
      }
      const domainEntry = domainMap.get(domainKey)!;
      domainEntry.label = getPreferredAnalyticsLabel(
        domainEntry.label,
        i.domain,
      );
      domainEntry.count++;
    });
    const domainAnalytics = Array.from(domainMap.entries())
      .map(([, { label, count }]) => ({ domain: label, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      summary: {
        totalApproved,
        uniqueBranches,
        uniqueCompanies,
      },
      branchAnalytics,
      companyAnalytics,
      topCompanies,
      branchCompanyChartData,
      stipendAnalytics,
      stipendAmountAnalytics,
      modeAnalytics,
      durationAnalytics,
      yearAnalytics,
      locationAnalytics,
      domainAnalytics,
      attendanceAnalytics,
      rawInternships: internships,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
