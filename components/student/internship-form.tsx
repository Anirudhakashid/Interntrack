'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Upload, Send } from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
}

interface InternshipFormProps {
  onSubmit: () => void
}

export function InternshipForm({ onSubmit }: InternshipFormProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    teacherId: '',
    companyName: '',
    offerLetterURL: '',
    supervisorEmail: '',
    hrEmail: '',
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/users/teachers')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/internship-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({
          teacherId: '',
          companyName: '',
          offerLetterURL: '',
          supervisorEmail: '',
          hrEmail: '',
        })
        setTimeout(() => {
          onSubmit()
        }, 1500)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit form')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Submitted Successfully!</h3>
            <p className="text-gray-600">Your internship form has been sent to your academic teacher for approval.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internship Registration Form</CardTitle>
        <CardDescription>
          Submit your internship details for teacher approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="teacher">Academic Teacher *</Label>
              <Select 
                value={formData.teacherId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your academic teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="offerLetterURL">Offer Letter URL *</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="offerLetterURL"
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.offerLetterURL}
                  onChange={(e) => setFormData(prev => ({ ...prev, offerLetterURL: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-sm text-gray-500">
                Upload your offer letter to Google Drive and paste the shareable link
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisorEmail">Supervisor Email *</Label>
              <Input
                id="supervisorEmail"
                type="email"
                placeholder="supervisor@company.com"
                value={formData.supervisorEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, supervisorEmail: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hrEmail">HR Email *</Label>
              <Input
                id="hrEmail"
                type="email"
                placeholder="hr@company.com"
                value={formData.hrEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, hrEmail: e.target.value }))}
                required
              />
              <p className="text-sm text-gray-500">
                HR will receive attendance verification emails
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}