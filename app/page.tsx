import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, Shield, Mail, Clock, MapPin } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Internship Manager</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/student/login">
              <Button variant="outline">Student Login</Button>
            </Link>
            <Link href="/teacher/login">
              <Button>Teacher Login</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Internship
            <span className="block text-blue-600">Attendance Verification</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A comprehensive email-based system for managing student internships, 
            teacher approvals, and HR attendance verification with complete audit trails.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/student/login">
              <Button size="lg" className="w-full sm:w-auto">
                <GraduationCap className="w-5 h-5 mr-2" />
                Student Portal
              </Button>
            </Link>
            <Link href="/teacher/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <BookOpen className="w-5 h-5 mr-2" />
                Teacher Portal
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-blue-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Student Flow</CardTitle>
              <CardDescription>Simple internship registration and attendance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Submit internship forms with company details</li>
                <li>• Wait for teacher approval</li>
                <li>• Request daily attendance verification</li>
                <li>• Automated email to HR for confirmation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle>Teacher Control</CardTitle>
              <CardDescription>Review applications and monitor student progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Review internship applications</li>
                <li>• Approve or reject submissions</li>
                <li>• Monitor attendance patterns</li>
                <li>• Access comprehensive audit logs</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>HR Verification</CardTitle>
              <CardDescription>One-click attendance confirmation via email</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• No login required for HR staff</li>
                <li>• Simple Present/Absent email buttons</li>
                <li>• Secure JWT token verification</li>
                <li>• Automatic attendance recording</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with modern web technologies and security best practices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">JWT Security</h4>
              <p className="text-sm text-gray-600">Secure token-based email verification</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Audit Logging</h4>
              <p className="text-sm text-gray-600">Track IP, location, and timestamp</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email Integration</h4>
              <p className="text-sm text-gray-600">Automated verification emails</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Location Tracking</h4>
              <p className="text-sm text-gray-600">IP-based location verification</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Internship Management System. Built with Next.js, Prisma, and PostgreSQL.
          </p>
        </div>
      </footer>
    </div>
  )
}