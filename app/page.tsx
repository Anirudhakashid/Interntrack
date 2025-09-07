import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, Shield, Mail, Clock, MapPin } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50 text-slate-900">
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-white/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold">Interntrack</h1>
              <p className="text-xs text-slate-500 -mt-1">Attendance & Internship SaaS</p>
            </div>
          </div>

         

          <div className="flex items-center gap-3">
            <Link href="/student/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Student Login</Button>
            </Link>
            <Link href="/teacher/login">
              <Button className="hidden sm:inline-flex">Teacher Login</Button>
            </Link>
            {/* Mobile CTA */}
            <div className="sm:hidden">
              <Link href="/student/login">
                <Button aria-label="Open student login">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
              Streamline internship attendance verification
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl">
              Email-driven attendance confirmations, teacher approvals and full audit trails — built for colleges and HR teams. Fast to set up, secure, and mobile friendly.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/student/login">
                <Button size="lg" className="w-full sm:w-auto inline-flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student Portal
                </Button>
              </Link>

              <Link href="/teacher/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Teacher Portal
                </Button>
              </Link>
            </div>

            
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="transform transition hover:scale-[1.02] hover:shadow-xl rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle>Student Flow</CardTitle>
                  <CardDescription>Simple internship registration + attendance</CardDescription>
                </CardHeader>
               
              </Card>

              <Card className="transform transition hover:scale-[1.02] hover:shadow-xl rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle>Teacher Control</CardTitle>
                  <CardDescription>Approve, monitor and audit student progress</CardDescription>
                </CardHeader>
                
              </Card>

              <Card className="transform transition hover:scale-[1.02] hover:shadow-xl rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>HR Verification</CardTitle>
                  <CardDescription>One-click email confirmations</CardDescription>
                </CardHeader>
               
              </Card>

              <Card className="transform transition hover:scale-[1.02] hover:shadow-xl rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>IP-based verification</CardDescription>
                </CardHeader>
              
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="mt-12 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Key Features</h3>
            <p className="text-sm text-slate-500 mt-2">Built with modern web technologies and security best practices</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-emerald-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-7 h-7 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Security</h4>
             
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-50 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-7 h-7 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Audit Logging</h4>
              
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-50 rounded-full flex items-center justify-center mb-3">
                <Mail className="w-7 h-7 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Email Integration</h4>
             
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-7 h-7 text-orange-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Location Tracking</h4>
              
            </div>
          </div>
        </section>

        {/* Trusted logos + Testimonials + Pricing (non-technical marketing content) */}
        <section className="mt-12">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-slate-900">Trusted by colleges & HR teams</h3>
              

            
            </div>
          </div>
        </section>

        {/* <section className="mt-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 text-center">What our users say</h3>
              <p className="text-sm text-slate-500 text-center mt-2">Real feedback from lecturers and HR managers using Interntrack.</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-slate-700">“Interntrack made it so easy to confirm student attendance with minimal effort — the email confirmations save us hours each week.”</p>
                  <div className="mt-4">
                    <div className="text-sm font-semibold">Dr. Aisha Khan</div>
                    <div className="text-xs text-slate-500">Computer Science Department</div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-slate-700">“We finally have an auditable trail for internship approvals — the teachers and HR love the transparency.”</p>
                  <div className="mt-4">
                    <div className="text-sm font-semibold">Ravi Patel</div>
                    <div className="text-xs text-slate-500">HR Manager</div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-slate-700">“Setup was quick and students picked it up immediately. Mobile friendly and reliable.”</p>
                  <div className="mt-4">
                    <div className="text-sm font-semibold">Meera Joshi</div>
                    <div className="text-xs text-slate-500">Placement Cell</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* <section className="mt-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Simple pricing that scales</h3>
                <p className="text-sm text-slate-500 mt-2">A plan for classrooms, departments and enterprise teams — transparent billing and no hidden fees.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-lg border border-slate-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
                  <div className="text-lg font-semibold">Free</div>
                  <div className="mt-2 text-3xl font-extrabold">$0<span className="text-base font-medium">/mo</span></div>
                  <p className="text-sm text-slate-500 mt-2">For small classes and trials.</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>Student registrations</li>
                    <li>Basic email confirmations</li>
                    <li>Community support</li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/student/signup">
                      <Button className="w-full">Get started</Button>
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-lg border-2 border-emerald-500 shadow-md bg-emerald-50">
                  <div className="text-lg font-semibold">Pro</div>
                  <div className="mt-2 text-3xl font-extrabold">$49<span className="text-base font-medium">/mo</span></div>
                  <p className="text-sm text-slate-700 mt-2">For departments and placement cells.</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    <li>All Free features</li>
                    <li>Teacher approvals & audit logs</li>
                    <li>Email templates & priority support</li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/teacher/signup">
                      <Button className="w-full">Start trial</Button>
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-slate-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
                  <div className="text-lg font-semibold">Enterprise</div>
                  <div className="mt-2 text-3xl font-extrabold">Custom</div>
                  <p className="text-sm text-slate-500 mt-2">For large institutions and HR teams.</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>SAML / SSO</li>
                    <li>Dedicated support & onboarding</li>
                    <li>Custom SLAs</li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/teacher/login">
                      <Button className="w-full" variant="outline">Contact sales</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

      </main>

      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2025 Internship Management System. Built with Next.js, Prisma, and PostgreSQL.</p>
          <div className="text-sm text-slate-400">Made for colleges • HR teams</div>
        </div>
      </footer>
    </div>
  )
}