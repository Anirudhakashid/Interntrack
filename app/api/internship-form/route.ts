import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    
    const { teacherId, companyName, offerLetterURL, supervisorEmail, hrEmail } = await request.json()
    
    if (!teacherId || !companyName || !offerLetterURL || !supervisorEmail || !hrEmail) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    const form = await prisma.internshipForm.create({
      data: {
        studentId: user.id,
        teacherId,
        companyName,
        offerLetterURL,
        supervisorEmail,
        hrEmail,
      },
      include: {
        student: { select: { name: true, email: true } },
        teacher: { select: { name: true, email: true } },
      }
    })
    
    return NextResponse.json(form)
  } catch (error) {
    console.error('Internship form creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let forms
    if (user.role === 'STUDENT') {
      forms = await prisma.internshipForm.findMany({
        where: { studentId: user.id },
        include: {
          teacher: { select: { name: true, email: true } },
          attendances: {
            orderBy: { date: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (user.role === 'TEACHER') {
      forms = await prisma.internshipForm.findMany({
        where: { teacherId: user.id },
        include: {
          student: { select: { name: true, email: true } },
          attendances: {
            orderBy: { date: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }
    
    return NextResponse.json(forms)
  } catch (error) {
    console.error('Fetch forms error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}