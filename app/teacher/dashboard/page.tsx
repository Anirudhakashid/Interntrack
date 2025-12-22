'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormApproval } from '@/components/teacher/form-approval'
import { AuditLogs } from '@/components/teacher/audit-logs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BookOpen, FileText, CheckCircle, Clock, XCircle, Activity, LogOut, BarChart3 } from 'lucide-react'

interface InternshipFormData {
  id: string
  companyName: string
  status: string
  createdAt: string
  student: { name: string; email: string }
  attendances: any[]
}

export default function TeacherDashboard() {
  const [forms, setForms] = useState<InternshipFormData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/internship-form')
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/teacher/login')
    router.refresh()
  }

  const stats = {
    total: forms.length,
    pending: forms.filter(f => f.status === 'PENDING').length,
    approved: forms.filter(f => f.status === 'APPROVED').length,
    rejected: forms.filter(f => f.status === 'REJECTED').length,
    totalAttendance: forms.reduce((sum, f) => sum + f.attendances.length, 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">Manage student internships</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals 
              {stats.pending > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => router.push('/teacher/analytics')} className="bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-sm text-gray-600">Total Forms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                      <p className="text-sm text-gray-600">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                      <p className="text-sm text-gray-600">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalAttendance}</p>
                      <p className="text-sm text-gray-600">Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {forms.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Student Forms Yet</h3>
                    <p className="text-gray-600">
                      When students submit internship forms, they will appear here for your review.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest internship form submissions from your students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forms.slice(0, 5).map((form) => (
                      <div key={form.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {form.student.name} - {form.companyName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Submitted {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            form.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {form.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
            </div>
            <FormApproval
              forms={forms.map(f => ({
                ...f,
                offerLetterURL: (f as any).offerLetterURL ?? '',
                supervisorEmail: (f as any).supervisorEmail ?? '',
                hrEmail: (f as any).hrEmail ?? '',
              }))}
              onStatusChange={fetchForms}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">All Student Forms</h2>
            </div>
            <div className="space-y-4">
              {forms.map((form) => (
                <Card key={form.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{form.student.name}</CardTitle>
                        <CardDescription>
                          {form.companyName} • {new Date(form.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        form.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        form.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {form.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Attendance records: {form.attendances.length}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
            </div>
            <AuditLogs forms={forms} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}