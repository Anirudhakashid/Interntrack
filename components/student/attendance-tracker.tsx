'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface InternshipForm {
  id: string
  companyName: string
  status: string
  attendances: Attendance[]
}

interface Attendance {
  id: string
  date: string
  status: string
}

interface AttendanceTrackerProps {
  forms: InternshipForm[]
  onAttendanceRequest: () => void
}

export function AttendanceTracker({ forms, onAttendanceRequest }: AttendanceTrackerProps) {
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const approvedForms = forms.filter(form => form.status === 'APPROVED')

  const handleAttendanceRequest = async (formId: string) => {
    setError('')
    setSuccess('')
    setLoading(formId)

    try {
      const response = await fetch('/api/attendance/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipFormId: formId }),
      })

      if (response.ok) {
        setSuccess('Attendance verification email sent to HR!')
        setTimeout(() => {
          onAttendanceRequest()
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to request attendance')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading('')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'ABSENT':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'PENDING':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'ABSENT':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (approvedForms.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Internships</h3>
            <p className="text-gray-600">
              Once your internship form is approved by your teacher, you'll be able to request attendance verification here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {approvedForms.map((form) => (
        <Card key={form.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{form.companyName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="w-4 h-4" />
                  Internship Attendance Tracking
                </CardDescription>
              </div>
              <Button
                onClick={() => handleAttendanceRequest(form.id)}
                disabled={loading === form.id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading === form.id ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    I'm at the Company
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Attendance Records</h4>
                {form.attendances.length > 0 ? (
                  <div className="space-y-2">
                    {form.attendances.map((attendance) => (
                      <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(attendance.status)}
                          <span className="text-sm text-gray-600">
                            {new Date(attendance.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <Badge className={getStatusColor(attendance.status)}>
                          {attendance.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No attendance records yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}