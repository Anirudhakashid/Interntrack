import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get all approved internship forms with student and company info
    const internships = await prisma.internshipForm.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
        companyName: true,
        student: {
          select: {
            id: true,
            name: true,
            branch: true,
          },
        },
      },
    })

    // Calculate analytics
    const branchMap = new Map<string, number>()
    const companyMap = new Map<string, number>()
    const branchCompanyMap = new Map<string, Map<string, number>>()
    const studentsByBranchCompany = new Map<string, Array<{ id: string; name: string; branch: string }>>()

    internships.forEach((internship) => {
      const branch = internship.student.branch || 'Not Specified'
      const company = internship.companyName

      // Count by branch
      branchMap.set(branch, (branchMap.get(branch) || 0) + 1)

      // Count by company
      companyMap.set(company, (companyMap.get(company) || 0) + 1)

      // Count by branch-company combination
      if (!branchCompanyMap.has(branch)) {
        branchCompanyMap.set(branch, new Map())
      }
      const companyCount = branchCompanyMap.get(branch)
      if (companyCount) {
        companyCount.set(company, (companyCount.get(company) || 0) + 1)
      }

      // Store students for details
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

    // Convert maps to arrays
    const branchAnalytics = Array.from(branchMap.entries())
      .map(([branch, count]) => ({
        branch,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    const companyAnalytics = Array.from(companyMap.entries())
      .map(([company, count]) => ({
        company,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    const topCompanies = companyAnalytics.slice(0, 10)

    // Get total stats
    const totalApproved = internships.length
    const uniqueBranches = branchMap.size
    const uniqueCompanies = companyMap.size

    // Convert branchCompanyMap for response
    // Restructure data for company-based X-axis with branches as stacked bars
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
        // Sort by total count descending
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
      rawInternships: internships, // Include raw data for filtering
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
