'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, LogOut, BookOpen, Building2, Users, TrendingUp, Download } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Dummy data
const branchData = [
  { branch: 'Computer Science', count: 45 },
  { branch: 'Mechanical', count: 32 },
  { branch: 'Electrical', count: 28 },
  { branch: 'Civil', count: 22 },
  { branch: 'Electronics', count: 18 }
]

const companyData = [
  { company: 'Google', count: 12 },
  { company: 'Microsoft', count: 10 },
  { company: 'Amazon', count: 9 },
  { company: 'Apple', count: 8 },
  { company: 'Meta', count: 7 },
  { company: 'IBM', count: 6 },
  { company: 'Intel', count: 5 },
  { company: 'Others', count: 88 }
]

const topCompanies = [
  { company: 'Google', count: 12 },
  { company: 'Microsoft', count: 10 },
  { company: 'Amazon', count: 9 },
  { company: 'Apple', count: 8 },
  { company: 'Meta', count: 7 }
]

const branchCompanyData = [
  { branch: 'Computer Science', Google: 8, Microsoft: 7, Amazon: 6, Apple: 5, Others: 19 },
  { branch: 'Mechanical', Google: 2, Microsoft: 1, Amazon: 2, Apple: 2, Others: 25 },
  { branch: 'Electrical', Google: 1, Microsoft: 1, Amazon: 1, Apple: 1, Others: 24 },
  { branch: 'Civil', Google: 1, Microsoft: 1, Amazon: 0, Apple: 0, Others: 20 },
  { branch: 'Electronics', Google: 0, Microsoft: 0, Amazon: 0, Apple: 0, Others: 18 }
]

const branchDetails: Record<string, { count: number; companies: Array<{ name: string; count: number }> }> = {
  'Computer Science': { 
    count: 45, 
    companies: [
      { name: 'Google', count: 8 },
      { name: 'Microsoft', count: 7 },
      { name: 'Amazon', count: 6 },
      { name: 'Apple', count: 5 },
      { name: 'Others', count: 19 }
    ]
  },
  'Mechanical': { 
    count: 32, 
    companies: [
      { name: 'Google', count: 2 },
      { name: 'Microsoft', count: 1 },
      { name: 'Amazon', count: 2 },
      { name: 'Apple', count: 2 },
      { name: 'Others', count: 25 }
    ]
  },
  'Electrical': { 
    count: 28, 
    companies: [
      { name: 'Google', count: 1 },
      { name: 'Microsoft', count: 1 },
      { name: 'Amazon', count: 1 },
      { name: 'Apple', count: 1 },
      { name: 'Others', count: 24 }
    ]
  },
  'Civil': { 
    count: 22, 
    companies: [
      { name: 'Google', count: 1 },
      { name: 'Microsoft', count: 1 },
      { name: 'Amazon', count: 0 },
      { name: 'Apple', count: 0 },
      { name: 'Others', count: 20 }
    ]
  },
  'Electronics': { 
    count: 18, 
    companies: [
      { name: 'Google', count: 0 },
      { name: 'Microsoft', count: 0 },
      { name: 'Amazon', count: 0 },
      { name: 'Apple', count: 0 },
      { name: 'Others', count: 18 }
    ]
  }
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function AnalyticsPage() {
  const router = useRouter()
  const [selectedBranch, setSelectedBranch] = useState('all')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/teacher/login')
    router.refresh()
  }

  const generateCSV = () => {
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
    ;(filteredData?.branchDistribution || []).forEach((item: any) => {
      csvContent += `${item.branch},${item.count}\n`
    })
    csvContent += '\n'

    // Add company distribution
    csvContent += 'COMPANY DISTRIBUTION\n'
    csvContent += 'Company,Number of Internships\n'
    ;(filteredData?.companyDistribution || []).forEach((item: any) => {
      csvContent += `${item.name || item.company},${item.count}\n`
    })
    csvContent += '\n'

    // Add top companies
    csvContent += 'TOP COMPANIES\n'
    csvContent += 'Rank,Company,Number of Interns\n'
    ;(filteredData?.topCompanies || []).forEach((item: any, index: number) => {
      csvContent += `${index + 1},${item.name || item.company},${item.count}\n`
    })
    csvContent += '\n'

    // Add branch-wise company distribution
    if (filteredData?.branchCompanyChart && filteredData.branchCompanyChart.length > 0) {
      csvContent += 'BRANCH-WISE COMPANY DISTRIBUTION\n'
      csvContent += 'Branch,Google,Microsoft,Amazon,Apple,Others\n'
      ;(filteredData?.branchCompanyChart || []).forEach((item: any) => {
        csvContent += `${item.branch},${item.Google || 0},${item.Microsoft || 0},${item.Amazon || 0},${item.Apple || 0},${item.Others || 0}\n`
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

  // Calculate filtered data
  const filteredData = useMemo(() => {
    if (selectedBranch === 'all') {
      const totalInternships = branchData.reduce((sum, d) => sum + d.count, 0)
      const filteredCompanies = companyData.map(c => ({ ...c }))
      return {
        totalInternships,
        uniqueBranches: branchData.length,
        uniqueCompanies: companyData.length,
        branchDistribution: branchData,
        companyDistribution: companyData,
        topCompanies: topCompanies,
        branchCompanyChart: branchCompanyData
      }
    } else {
      const branchInfo = branchDetails[selectedBranch]
      if (!branchInfo) return null

      return {
        totalInternships: branchInfo.count,
        uniqueBranches: 1,
        uniqueCompanies: branchInfo.companies.length,
        branchDistribution: [{ branch: selectedBranch, count: branchInfo.count }],
        companyDistribution: branchInfo.companies,
        topCompanies: branchInfo.companies.slice(0, 5),
        branchCompanyChart: branchCompanyData.filter(d => d.branch === selectedBranch)
      }
    }
  }, [selectedBranch])

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
              <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1 sm:mb-2">Filter by Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
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
        {filteredData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Total Internships</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{filteredData.totalInternships}</p>
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
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{filteredData.uniqueBranches}</p>
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
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{filteredData.uniqueCompanies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

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
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Company Distribution Pie */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Company Distribution</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Internships by company</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData?.companyDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(filteredData?.companyDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Companies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Companies</CardTitle>
            <CardDescription>Companies with most internship placements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(filteredData?.topCompanies || []).map((item: any, index: number) => (
                <div key={item.name || item.company} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{item.name || item.company}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Branch-wise Company Distribution */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Branch-wise Distribution</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Students per branch in top companies</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="h-64 sm:h-96 overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData?.branchCompanyChart || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Google" fill="#3b82f6" />
                  <Bar dataKey="Microsoft" fill="#ef4444" />
                  <Bar dataKey="Amazon" fill="#10b981" />
                  <Bar dataKey="Apple" fill="#f59e0b" />
                  <Bar dataKey="Others" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
