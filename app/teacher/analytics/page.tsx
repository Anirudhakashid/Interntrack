'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, LogOut, BookOpen, Building2, Users, TrendingUp, Download } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

// Branch color mapping
const BRANCH_COLORS: Record<string, string> = {
  'Computer Science': '#3b82f6',
  'Mechanical': '#ef4444',
  'Electrical': '#10b981',
  'Civil': '#f59e0b',
  'Electronics': '#8b5cf6',
  'Chemical': '#ec4899',
  'Aerospace': '#06b6d4',
  'Biomedical': '#84cc16',
  'Not Specified': '#9ca3af'
}

interface AnalyticsData {
  summary: {
    totalApproved: number
    uniqueBranches: number
    uniqueCompanies: number
  }
  branchAnalytics: Array<{ branch: string; count: number }>
  companyAnalytics: Array<{ company: string; count: number }>
  topCompanies: Array<{ company: string; count: number }>
  branchCompanyChartData: Array<Record<string, string | number>>
  rawInternships: Array<{
    id: string
    companyName: string
    student: { id: string; name: string; branch: string | null }
  }>
}

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-semibold">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allBranches, setAllBranches] = useState<string[]>([])

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/analytics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })
        
        const text = await response.text()
        console.log('API Response status:', response.status)
        console.log('API Response text:', text.substring(0, 200))
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} - ${text}`)
        }
        
        const data: AnalyticsData = JSON.parse(text)
        console.log('Parsed analytics data:', data)
        setAnalyticsData(data)
        
        // Extract unique branches for the select dropdown (exclude "Not Specified")
        const branches = data.branchAnalytics
          .map(b => b.branch)
          .filter(b => b !== 'Not Specified')
          .sort()
        setAllBranches(branches)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/teacher/login')
    router.refresh()
  }

  const generateCSV = () => {
    if (!analyticsData) return

    let csvContent = 'data:text/csv;charset=utf-8,'

    // Add header information
    csvContent += 'INTERNSHIP ANALYTICS REPORT\n'
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n`
    csvContent += `Filter: ${selectedBranch === 'all' ? 'All Branches' : selectedBranch}\n\n`

    // Add summary statistics
    csvContent += 'SUMMARY STATISTICS\n'
    csvContent += `Total Internships,${filteredData?.totalInternships || 0}\n`
    csvContent += `Number of Branches,${filteredData?.uniqueBranches || 0}\n`
    csvContent += `Number of Companies,${filteredData?.uniqueCompanies || 0}\n\n`

    // Add branch distribution
    csvContent += 'BRANCH DISTRIBUTION\n'
    csvContent += 'Branch,Number of Internships\n'
    ;(filteredData?.branchDistribution || []).forEach((item: { branch: string; count: number }) => {
      csvContent += `${item.branch},${item.count}\n`
    })
    csvContent += '\n'

    // Add company distribution
    csvContent += 'COMPANY DISTRIBUTION\n'
    csvContent += 'Company,Number of Internships\n'
    ;(filteredData?.companyDistribution || []).forEach((item: { company: string; count: number }) => {
      csvContent += `${item.company},${item.count}\n`
    })
    csvContent += '\n'

    // Add top companies
    csvContent += 'TOP COMPANIES\n'
    csvContent += 'Rank,Company,Number of Interns\n'
    ;(filteredData?.topCompanies || []).forEach((item: { company: string; count: number }, index: number) => {
      csvContent += `${index + 1},${item.company},${item.count}\n`
    })
    csvContent += '\n'

    // Add branch-wise company distribution
    if (filteredData?.branchCompanyChart && filteredData.branchCompanyChart.length > 0) {
      csvContent += 'BRANCH-WISE COMPANY DISTRIBUTION\n'
      const branches = Object.keys(filteredData.branchCompanyChart[0] || {}).filter(k => k !== 'company')
      csvContent += `Company,${branches.join(',')}\n`
      ;(filteredData?.branchCompanyChart || []).forEach((item: Record<string, string | number>) => {
        const values = branches.map(b => item[b] || 0)
        csvContent += `${item.company},${values.join(',')}\n`
      })
    }

    // Create blob and trigger download
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `internship-analytics-${selectedBranch}-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate filtered data based on selected branch
  const filteredData = useMemo(() => {
    if (!analyticsData) return null

    if (selectedBranch === 'all') {
      // Include all data
      return {
        totalInternships: analyticsData.summary.totalApproved,
        uniqueBranches: analyticsData.summary.uniqueBranches,
        uniqueCompanies: analyticsData.summary.uniqueCompanies,
        branchDistribution: analyticsData.branchAnalytics,
        companyDistribution: analyticsData.companyAnalytics,
        topCompanies: analyticsData.topCompanies,
        branchCompanyChart: analyticsData.branchCompanyChartData
      }
    } else {
      // Filter for selected branch
      const selectedBranchData = analyticsData.branchAnalytics.find(b => b.branch === selectedBranch)
      const branchInternships = analyticsData.rawInternships.filter(
        i => (i.student.branch || 'Not Specified') === selectedBranch
      )
      
      // Get companies for this branch
      const branchCompanies = new Map<string, number>()
      branchInternships.forEach((internship: {
        id: string
        companyName: string
        student: { id: string; name: string; branch: string | null }
      }) => {
        const company = internship.companyName
        branchCompanies.set(company, (branchCompanies.get(company) || 0) + 1)
      })
      
      const companyDistribution = Array.from(branchCompanies.entries())
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => b.count - a.count)

      // Filter branchCompanyChart to only show companies that have the selected branch
      const filteredChart = analyticsData.branchCompanyChartData
        .filter(d => d[selectedBranch] !== undefined) // Only companies with this branch
        .map(d => ({
          company: d.company,
          [selectedBranch]: d[selectedBranch]
        }))

      return {
        totalInternships: selectedBranchData?.count || 0,
        uniqueBranches: 1,
        uniqueCompanies: companyDistribution.length,
        branchDistribution: [{ branch: selectedBranch, count: selectedBranchData?.count || 0 }],
        companyDistribution,
        topCompanies: companyDistribution.slice(0, 5),
        branchCompanyChart: filteredChart
      }
    }
  }, [analyticsData, selectedBranch])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">Internship Analytics</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Student placement analytics</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto text-xs sm:text-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-96">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error loading analytics</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && analyticsData && (
          <>
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm order-1"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                Back
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto order-3 sm:order-2">
                <div className="w-full sm:w-56">
                  <label htmlFor="branch-select" className="text-xs sm:text-sm font-medium text-gray-700 block mb-1 sm:mb-2">Filter by Branch</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-full text-xs sm:text-sm" id="branch-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {allBranches.map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateCSV}
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm order-2 sm:order-3"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Export</span> CSV
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Total Internships</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{filteredData?.totalInternships || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Branches</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{filteredData?.uniqueBranches || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Companies</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{filteredData?.uniqueCompanies || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Branch Distribution */}
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Student Distribution by Branch</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Internships per branch</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredData?.branchDistribution || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="branch" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {(filteredData?.branchDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BRANCH_COLORS[entry.branch] || '#9ca3af'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Company Distribution Donut */}
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Company Distribution</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Internships by company</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <div className="flex flex-col items-center">
                    <div className="h-64 sm:h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={filteredData?.companyDistribution || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={90}
                            innerRadius={50}
                            fill="#8884d8"
                            dataKey="count"
                            paddingAngle={2}
                          >
                            {(filteredData?.companyDistribution || []).map((entry: { company: string; count: number }, index: number) => (
                              <Cell key={`${entry.company}-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full mt-4 grid grid-cols-2 gap-2">
                      {(filteredData?.companyDistribution || []).slice(0, 6).map((entry: { company: string; count: number }, index: number) => (
                        <div key={entry.company} className="flex items-center gap-2 text-xs sm:text-sm p-2 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="truncate font-medium">{entry.company}</span>
                          <span className="text-gray-600 flex-shrink-0">({entry.count})</span>
                        </div>
                      ))}
                    </div>
                    {(filteredData?.companyDistribution || []).length > 6 && (
                      <p className="text-xs text-gray-500 mt-2">+{(filteredData?.companyDistribution || []).length - 6} more companies</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Companies */}
            <Card className="mb-6 sm:mb-8">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Top Companies</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Companies with most internship placements</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {(filteredData?.topCompanies || []).map((item: { company: string; count: number }, index: number) => (
                    <div key={item.company} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-blue-600 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 truncate text-xs sm:text-base">{item.company}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm flex-shrink-0 ml-2">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Branch-wise Company Distribution */}
            {filteredData?.branchCompanyChart && filteredData.branchCompanyChart.length > 0 && (
              <Card className="mb-6 sm:mb-8">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Branch-wise Distribution</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Students per branch by company</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <div className="h-64 sm:h-96 w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                      <BarChart data={filteredData.branchCompanyChart} margin={{ top: 20, right: 10, left: 0, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="company" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        {Object.keys(filteredData.branchCompanyChart[0] || {})
                          .filter(key => key !== 'company')
                          .map((branch, index) => (
                            <Bar key={branch} dataKey={branch} stackId="a" fill={BRANCH_COLORS[branch] || '#9ca3af'} />
                          ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
