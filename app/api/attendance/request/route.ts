import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { verifyToken, generateAttendanceToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateAttendanceEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = verifyToken(token)
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { internshipFormId } = await request.json()
    
    // Check if form exists and is approved
    const form = await prisma.internshipForm.findFirst({
      where: { 
        id: internshipFormId,
        studentId: user.id,
        status: 'APPROVED'
      },
      include: {
        student: { select: { name: true } }
      }
    })
    
    if (!form) {
      return NextResponse.json(
        { error: 'Approved internship form not found' },
        { status: 404 }
      )
    }
    
    // Check if attendance already requested for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: user.id,
        internshipFormId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })
    
    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already requested for today' },
        { status: 400 }
      )
    }
    
    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: user.id,
        internshipFormId,
        verificationToken: ''
      }
    })
    
    // Generate verification token
    const verificationToken = generateAttendanceToken(attendance.id)
    
    // Update attendance with token
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { verificationToken }
    })
    
    // Send email to HR
    const emailHTML = generateAttendanceEmail(
      form.student.name,
      form.companyName,
      verificationToken
    )
    
    await sendEmail({
      to: form.hrEmail,
      subject: `Attendance Verification Required - ${form.student.name}`,
      html: emailHTML
    })
    
    return NextResponse.json({ 
      message: 'Attendance verification email sent to HR',
      attendanceId: attendance.id
    })
  } catch (error) {
    console.error('Attendance request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}