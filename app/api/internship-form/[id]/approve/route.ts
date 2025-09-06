import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = verifyToken(token)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { status } = await request.json()
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    const form = await prisma.internshipForm.findUnique({
      where: { id: params.id }
    })
    
    if (!form || form.teacherId !== user.id) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }
    
    const updatedForm = await prisma.internshipForm.update({
      where: { id: params.id },
      data: { status },
      include: {
        student: { select: { name: true, email: true } },
        teacher: { select: { name: true, email: true } }
      }
    })
    
    return NextResponse.json(updatedForm)
  } catch (error) {
    console.error('Form approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}