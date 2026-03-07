import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function getAcademicYear(date: Date): string {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month >= 5) {
    return `${year}-${String(year + 1).slice(2)}`
  }
  return `${year - 1}-${String(year).slice(2)}`
}

export async function GET() {
  try {
    const internships = await prisma.internshipForm.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
        companyName: true,
        companyLocation: true,
        domain: true,
        stipend: true,
        mode: true,
        durationWeeks: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
            branch: true,
          },
        },
      },
    })

    // Attendance analytics - group by branch
    const attendances = await prisma.attendance.findMany({
      where: {
        internshipForm: {
          status: 'APPROVED',
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
    })

    const branchAttendanceMap = new Map<string, { total: number; verified: number }>()
    attendances.forEach((a) => {
      const branch = a.internshipForm.student.branch || 'Not Specified'
      if (!branchAttendanceMap.has(branch)) {
        branchAttendanceMap.set(branch, { total: 0, verified: 0 })
      }
      const entry = branchAttendanceMap.get(branch)!
      entry.total++
      if (a.status === 'VERIFIED') entry.verified++
    })

    const attendanceAnalytics = Array.from(branchAttendanceMap.entries())
      .map(([branch, { total, verified }]) => ({
        branch,
        total,
        verified,
        rate: total > 0 ? Math.round((verified / total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)

    // Calculate analytics
    const branchMap = new Map<string, number>()
    const companyMap = new Map<string, number>()
    const branchCompanyMap = new Map<string, Map<string, number>>()
    const studentsByBranchCompany = new Map<string, Array<{ id: string; name: string; branch: string }>>()

    internships.forEach((internship) => {
      const branch = internship.student.branch || 'Not Specified'
      const company = internship.companyName

      branchMap.set(branch, (branchMap.get(branch) || 0) + 1)
      companyMap.set(company, (companyMap.get(company) || 0) + 1)

      if (!branchCompanyMap.has(branch)) {
        branchCompanyMap.set(branch, new Map())
      }
      const companyCount = branchCompanyMap.get(branch)
      if (companyCount) {
        companyCount.set(company, (companyCount.get(company) || 0) + 1)
      }

      const key = `${branch}|${company}`
      if (!studentsByBranchCompany.has(key)) {
        studentsByBranchCompany.set(key, [])
      }
      studentsByBranchCompany.get(key)?.push({
        id: internship.student.id,
        name: internship.student.name,
        branch: internship.student.branch || 'Not Specified',
      })
    })

    const branchAnalytics = Array.from(branchMap.entries())
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count)

    const companyAnalytics = Array.from(companyMap.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)

    const topCompanies = companyAnalytics.slice(0, 10)

    const totalApproved = internships.length
    const uniqueBranches = branchMap.size
    const uniqueCompanies = companyMap.size

    // Stipend analytics
    let paidCount = 0
    let unpaidCount = 0
    let stipendUnknown = 0
    internships.forEach((i) => {
      const val = i.stipend?.toLowerCase()
      if (val === 'paid') paidCount++
      else if (val === 'unpaid') unpaidCount++
      else stipendUnknown++
    })
    const stipendAnalytics = { paid: paidCount, unpaid: unpaidCount, unknown: stipendUnknown }

    // Mode analytics
    let onlineCount = 0
    let offlineCount = 0
    let hybridCount = 0
    let modeUnknown = 0
    internships.forEach((i) => {
      const val = i.mode?.toLowerCase()
      if (val === 'online') onlineCount++
      else if (val === 'offline') offlineCount++
      else if (val === 'hybrid') hybridCount++
      else modeUnknown++
    })
    const modeAnalytics = { online: onlineCount, offline: offlineCount, hybrid: hybridCount, unknown: modeUnknown }

    // Duration analytics
    const durations = internships
      .map((i) => i.durationWeeks)
      .filter((d): d is number => d !== null && d !== undefined)

    const durationRanges = [
      { range: '1-4 weeks', min: 1, max: 4 },
      { range: '5-8 weeks', min: 5, max: 8 },
      { range: '9-12 weeks', min: 9, max: 12 },
      { range: '13+ weeks', min: 13, max: Infinity },
    ]

    const durationAnalytics = {
      average: durations.length > 0
        ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
        : 0,
      min: durations.length > 0 ? Math.min(...durations) : 0,
      max: durations.length > 0 ? Math.max(...durations) : 0,
      distribution: durationRanges.map(({ range, min, max }) => ({
        range,
        count: durations.filter((d) => d >= min && d <= max).length,
      })),
    }

    // Year analytics (academic year: June-May)
    const yearMap = new Map<string, number>()
    internships.forEach((i) => {
      const date = i.startDate || i.createdAt
      const academicYear = getAcademicYear(new Date(date))
      yearMap.set(academicYear, (yearMap.get(academicYear) || 0) + 1)
    })
    const yearAnalytics = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year))

    // Branch-company chart data
    const companyBranchMap = new Map<string, Map<string, number>>()
    branchCompanyMap.forEach((companyMap, branch) => {
      companyMap.forEach((count, company) => {
        if (!companyBranchMap.has(company)) {
          companyBranchMap.set(company, new Map())
        }
        companyBranchMap.get(company)?.set(branch, count)
      })
    })

    const branchCompanyChartData = Array.from(companyBranchMap.entries())
      .sort((a, b) => {
        const totalA = Array.from(a[1].values()).reduce((sum, val) => sum + val, 0)
        const totalB = Array.from(b[1].values()).reduce((sum, val) => sum + val, 0)
        return totalB - totalA
      })
      .map(([company, branchMap]) => {
        const data: Record<string, string | number> = { company }
        branchMap.forEach((count, branch) => {
          data[branch] = count
        })
        return data
      })

    // Location analytics
    const locationMap = new Map<string, number>()
    internships.forEach((i) => {
      const loc = i.companyLocation || 'Not Specified'
      locationMap.set(loc, (locationMap.get(loc) || 0) + 1)
    })
    const locationAnalytics = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)

    // Domain analytics
    const domainMap = new Map<string, number>()
    internships.forEach((i) => {
      const dom = i.domain || 'Not Specified'
      domainMap.set(dom, (domainMap.get(dom) || 0) + 1)
    })
    const domainAnalytics = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)

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
      modeAnalytics,
      durationAnalytics,
      yearAnalytics,
      locationAnalytics,
      domainAnalytics,
      attendanceAnalytics,
      rawInternships: internships,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
