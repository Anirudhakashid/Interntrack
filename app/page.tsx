"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Shield,
  ClipboardList,
  Mail,
  MapPin,
  UserCircle,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("reveal-in");
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111318] antialiased">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#e8eaed] px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-lg bg-[#111318] grid place-items-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
              <rect
                x="9"
                y="2"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                opacity=".5"
              />
              <rect
                x="2"
                y="9"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                opacity=".5"
              />
              <rect
                x="9"
                y="9"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                opacity=".8"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-[#111318] leading-tight tracking-tight">
              Interntrack
            </span>
            <span className="text-xs text-[#878c97] leading-none">
              Attendance &amp; Internship SaaS
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/student/login"
            className="hidden sm:inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium text-[#3d4047] border border-[#d1d5dc] bg-transparent hover:bg-white transition-all no-underline"
          >
            <UserCircle className="w-4 h-4" />
            Student Login
          </Link>
          <Link
            href="/teacher/login"
            className="hidden sm:inline-flex items-center px-4 h-10 rounded-lg text-sm font-medium text-white bg-[#111318] hover:bg-[#1d2028] transition-all no-underline"
          >
            Teacher Login
          </Link>
          <Link
            href="/student/login"
            className="sm:hidden inline-flex items-center px-4 h-10 rounded-lg text-sm font-medium text-white bg-[#111318] hover:bg-[#1d2028] transition-all no-underline"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-[1280px] mx-auto px-8 pt-[88px] pb-24 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <div className="animate-fade-up inline-flex items-center gap-2 bg-blue-50 border border-blue-600/15 text-blue-600 rounded-full text-sm font-medium px-3.5 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Built for colleges &amp; HR teams
          </div>
          <h1 className="animate-fade-up [animation-delay:50ms] text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-[-0.035em] leading-[1.1] text-[#111318] mb-5">
            Streamline internship
            <br />
            <span className="text-blue-600">attendance</span> verification
          </h1>
          <p className="animate-fade-up [animation-delay:100ms] text-base leading-[1.7] text-[#878c97] max-w-[480px] mb-8">
            Email driven attendance confirmations, teacher approvals and full
            audit trails built for colleges and HR teams. Fast to set up,
            secure, and mobile friendly.
          </p>
          <div className="animate-fade-up [animation-delay:150ms] flex items-center gap-3 flex-wrap">
            <Link
              href="/student/login"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-xl text-base font-medium text-white bg-[#111318] hover:bg-[#1d2028] transition-all no-underline"
            >
              <UserCircle className="w-4.5 h-4.5" />
              Student Portal
            </Link>
            <Link
              href="/teacher/login"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-xl text-base font-medium text-[#3d4047] border border-[#d1d5dc] bg-transparent hover:bg-white transition-all no-underline"
            >
              <ClipboardList className="w-4.5 h-4.5" />
              Teacher Portal
            </Link>
          </div>
          <div className="animate-fade-up [animation-delay:200ms] flex items-center gap-3 mt-8">
            <div className="flex">
              <div className="w-9 h-9 rounded-full border-2 border-[#fafafa] bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center -mr-2">
                AK
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-[#fafafa] bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center -mr-2">
                SS
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-[#fafafa] bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center -mr-2">
                DR
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-[#fafafa] bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center">
                DV
              </div>
            </div>
            <span className="text-sm text-[#878c97] pl-4">
              <strong className="text-[#3d4047] font-semibold">
                500+ institutions
              </strong>{" "}
              already onboarded
            </span>
          </div>
        </div>

        {/* Hero Cards */}
        <div className="animate-fade-up [animation-delay:100ms] grid grid-cols-2 gap-4">
          <div className="bg-[#111318] border border-[#111318] rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-default">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-base font-semibold text-white mb-1.5">
              Student Flow
            </div>
            <div className="text-sm text-white/50 leading-relaxed">
              Simple internship registration + attendance
            </div>
          </div>
          <div className="bg-white border border-[#e8eaed] rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-lg hover:border-[#d1d5dc] hover:-translate-y-0.5 cursor-default">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-base font-semibold text-[#111318] mb-1.5">
              Teacher Control
            </div>
            <div className="text-sm text-[#878c97] leading-relaxed">
              Approve, monitor and audit student progress
            </div>
          </div>
          <div className="bg-white border border-[#e8eaed] rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-lg hover:border-[#d1d5dc] hover:-translate-y-0.5 cursor-default">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-base font-semibold text-[#111318] mb-1.5">
              HR Verification
            </div>
            <div className="text-sm text-[#878c97] leading-relaxed">
              One-click email confirmations
            </div>
          </div>
          <div className="bg-white border border-[#e8eaed] rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-lg hover:border-[#d1d5dc] hover:-translate-y-0.5 cursor-default">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-base font-semibold text-[#111318] mb-1.5">
              Location
            </div>
            <div className="text-sm text-[#878c97] leading-relaxed">
              IP-based verification
            </div>
          </div>
        </div>
      </section>

      {/* ── STRIP — scrolling marquee ── */}
      <div className="border-t border-b border-[#e8eaed] bg-white py-4 overflow-hidden">
        <div className="strip-inner flex w-max gap-10">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-10 shrink-0">
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <path
                    d="M7 1L12.5 3.5v4C12.5 10.5 10 12.5 7 13 4 12.5 1.5 10.5 1.5 7.5v-4L7 1z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
                Secure &amp; encrypted
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M7 4v3.5l2 2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                Real-time tracking
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <rect
                    x="1.5"
                    y="3.5"
                    width="11"
                    height="7"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M1.5 6.5l5.5 3 5.5-3"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                Email integration
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <path
                    d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6c0 3.5 4.5 6.5 4.5 6.5S11.5 9.5 11.5 6c0-2.5-2-4.5-4.5-4.5z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle
                    cx="7"
                    cy="6"
                    r="1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
                IP-based location
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <path
                    d="M2 11L4.5 5l3 4.5L10 7l2 4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Full audit logs
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <rect
                    x="3"
                    y="1.5"
                    width="8"
                    height="11"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5 5h4M5 7.5h4M5 10h2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                No hardware needed
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <rect
                    x="1.5"
                    y="3"
                    width="11"
                    height="8"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5 3V2M9 3V2M1.5 6h11"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                30-min setup
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5 7l1.5 1.5L9 5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Teacher approvals
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#878c97] whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#b8bcc6]"
                >
                  <rect
                    x="4"
                    y="1"
                    width="6"
                    height="12"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle cx="7" cy="11" r="0.75" fill="currentColor" />
                </svg>
                Mobile friendly
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KEY FEATURES ── */}
      <section className="reveal max-w-[1280px] mx-auto px-8 py-[88px]">
        <div className="text-center mb-14">
          <div className="text-sm font-semibold tracking-[0.1em] uppercase text-blue-600 mb-3">
            Key Features
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] text-[#111318] mb-3">
            Everything you need to manage internships
          </h2>
          <p className="text-base text-[#878c97] leading-[1.7] max-w-[540px] mx-auto">
            Built with modern web technologies and security best practices so
            your institution stays audit-ready at all times.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "🔒",
              bg: "bg-blue-50",
              title: "Security",
              desc: "Role-based access control, encrypted sessions, and tamper-proof audit records.",
              delay: "",
            },
            {
              icon: "📋",
              bg: "bg-green-50",
              title: "Audit Logging",
              desc: "Every action timestamped and stored — full compliance reports available instantly.",
              delay: "delay-1",
            },
            {
              icon: "✉️",
              bg: "bg-purple-50",
              title: "Email Integration",
              desc: "Automated one-click confirmations sent directly to HR contacts — no chasing required.",
              delay: "delay-2",
            },
            {
              icon: "📍",
              bg: "bg-amber-50",
              title: "Location Tracking",
              desc: "IP-based geolocation verifies that students are on-site when marking attendance.",
              delay: "delay-3",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`reveal ${f.delay} bg-white border border-[#e8eaed] rounded-2xl p-6 transition-all hover:shadow-lg hover:border-[#d1d5dc] hover:-translate-y-[3px]`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center text-xl mb-4`}
              >
                {f.icon}
              </div>
              <div className="text-base font-semibold text-[#111318] mb-2">
                {f.title}
              </div>
              <div className="text-sm text-[#878c97] leading-relaxed">
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div className="bg-white border-t border-b border-[#e8eaed]">
        <div className="max-w-[1280px] mx-auto px-8 py-[88px]">
          <div className="reveal text-center mb-14">
            <div className="text-sm font-semibold tracking-[0.1em] uppercase text-blue-600 mb-3">
              How It Works
            </div>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] text-[#111318] mb-3">
              Four steps. Zero friction.
            </h2>
            <p className="text-base text-[#878c97] leading-[1.7] max-w-[540px] mx-auto">
              A closed-loop workflow connecting students, teachers, and HR teams
              automatically.
            </p>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 mt-12">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[19px] left-[9%] right-[9%] h-px bg-[#e8eaed] z-0" />
            {[
              {
                num: "1",
                title: "Student Registers",
                desc: "Student submits internship details and company info through the portal.",
                delay: "",
              },
              {
                num: "2",
                title: "Teacher Approves",
                desc: "Assigned teacher reviews and approves the registration in their dashboard.",
                delay: "delay-1",
              },
              {
                num: "3",
                title: "HR Confirms",
                desc: "HR receives a daily email with a single-click attendance confirmation button.",
                delay: "delay-2",
              },
              {
                num: "4",
                title: "Audit Trail",
                desc: "Every step is logged. Export compliance reports anytime.",
                delay: "delay-3",
              },
            ].map((s) => (
              <div
                key={s.num}
                className={`reveal ${s.delay} group flex flex-col items-center text-center px-4 relative z-[1]`}
              >
                <div className="w-11 h-11 rounded-full bg-white border-[1.5px] border-[#d1d5dc] flex items-center justify-center text-base font-bold text-[#878c97] mb-5 transition-all group-hover:border-blue-600 group-hover:text-blue-600 group-hover:bg-blue-50">
                  {s.num}
                </div>
                <div className="text-base font-semibold text-[#111318] mb-2">
                  {s.title}
                </div>
                <div className="text-sm text-[#878c97] leading-relaxed">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRUSTED BY ── */}
      <section className="reveal max-w-[1280px] mx-auto px-8 py-[88px] grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <div className="text-sm font-semibold tracking-[0.1em] uppercase text-blue-600 mb-3">
            Trusted By
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] text-[#111318] mb-3 text-left">
            Colleges &amp; HR teams
            <br />
            rely on Interntrack.
          </h2>
          <p className="text-base text-[#878c97] leading-[1.7] text-left">
            From large universities to boutique HR departments Interntrack
            scales to your needs without any extra setup.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-7">
            {[
              "Engineering Colleges",
              "Management Institutes",
              "HR Departments",
              "Placement Cells",
              "Corporate Training",
              "Remote Teams",
            ].map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 bg-white border border-[#e8eaed] rounded-full px-4 py-2 text-sm font-medium text-[#3d4047]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { val: "500", suffix: "+", label: "Institutions onboarded" },
            { val: "50", suffix: "K+", label: "Students tracked" },
            { val: "99", suffix: "%", label: "Uptime SLA" },
            { val: "<30", suffix: "m", label: "Average setup time" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#e8eaed] rounded-2xl p-6"
            >
              <div className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#111318] leading-none mb-2">
                {stat.val}
                <span className="text-blue-600">{stat.suffix}</span>
              </div>
              <div className="text-sm text-[#878c97] font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#e8eaed] bg-white px-8 py-6 flex flex-col sm:flex-row items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-[#878c97]">
            © 2026 Internship Management System
          </span>
          <span className="text-[#d1d5dc]">·</span>
          <span className="text-sm text-[#878c97]">
            Built with{" "}
            <strong className="text-[#3d4047] font-medium">Next.js</strong>,{" "}
            <strong className="text-[#3d4047] font-medium">Prisma</strong> &amp;{" "}
            <strong className="text-[#3d4047] font-medium">PostgreSQL</strong>
          </span>
        </div>
        <div className="text-sm text-[#878c97]">
          Made for colleges{" "}
          <strong className="text-[#3d4047] font-medium">·</strong> HR teams
        </div>
      </footer>
    </div>
  );
}
