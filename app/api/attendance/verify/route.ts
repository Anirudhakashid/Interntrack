import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP, getLocationFromIP } from '@/lib/utils/ip'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const status = searchParams.get('status')
    
    if (!token || !status || !['present', 'absent'].includes(status)) {
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #EF4444;">Invalid Request</h1>
            <p>The verification link is invalid or expired.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    const payload = verifyToken(token)
    if (!payload || payload.type !== 'attendance') {
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #EF4444;">Token Expired</h1>
            <p>The verification link has expired or is invalid.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    const attendance = await prisma.attendance.findUnique({
      where: { id: payload.attendanceId },
      include: {
        student: { select: { name: true } },
        internshipForm: { select: { companyName: true } }
      }
    })
    
    if (!attendance) {
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #EF4444;">Attendance Record Not Found</h1>
            <p>The attendance record could not be found.</p>
          </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    if (attendance.status !== 'PENDING') {
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #F59E0B;">Already Verified</h1>
            <p>This attendance has already been verified as <strong>${attendance.status.toLowerCase()}</strong>.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    // Get client information for logging
    const ip = getClientIP(request)
    const location = await getLocationFromIP(ip)
    const userAgent = request.headers.get('user-agent') || ''
    
    // Update attendance status
    const updatedStatus = status === 'present' ? 'VERIFIED' : 'ABSENT'
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { status: updatedStatus }
    })
    
    // Log the verification
    await prisma.verificationLog.create({
      data: {
        attendanceId: attendance.id,
        ipAddress: ip,
        location,
        userAgent,
        action: status
      }
    })
    
    const color = status === 'present' ? '#10B981' : '#EF4444'
    const icon = status === 'present' ? '✓' : '✗'
    
    return new NextResponse(`
      <html>
        <head>
          <title>Attendance Verified</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: ${color}; margin-bottom: 20px;">
              ${icon} Attendance Verified
            </h1>
            <p style="font-size: 18px; margin-bottom: 10px;">
              <strong>${attendance.student.name}</strong>
            </p>
            <p style="color: #666; margin-bottom: 20px;">
              ${attendance.internshipForm.companyName}
            </p>
            <p style="font-size: 16px; padding: 20px; background-color: ${color}20; border-radius: 5px; color: ${color};">
              Marked as <strong>${status.toUpperCase()}</strong>
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Thank you for verifying the attendance.<br>
              You can now close this window.
            </p>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Attendance verification error:', error)
    return new NextResponse(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #EF4444;">Server Error</h1>
          <p>An error occurred while processing the verification.</p>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}