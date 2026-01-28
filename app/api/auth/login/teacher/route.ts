import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Development default login
    if (
      process.env.NODE_ENV === 'development' &&
      email === 'admin' &&
      password === 'admin123'
    ) {
      const devUser = {
        id: 'dev-teacher',
        name: 'Dev Teacher',
        email: 'admin',
        role: 'TEACHER',
      }
      const token = generateToken({
        id: devUser.id,
        email: devUser.email,
        role: devUser.role,
      })
      const response = NextResponse.json({
        user: devUser,
      })
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: (process.env.NODE_ENV as string) === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      })
      return response
    }

    const user = await authenticateUser(email, password, 'TEACHER')
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return response
  } catch (error) {
    console.error('Teacher login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}