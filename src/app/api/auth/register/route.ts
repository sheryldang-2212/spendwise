import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password, name, securityQuestion, securityAnswer } = await req.json()

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Email hợp lệ và mật khẩu tối thiểu 8 ký tự.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng.' },
        { status: 400 }
      )
    }

    const password_hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        name,
        securityQuestion,
        securityAnswer,
      },
    })

    const token = await signToken({ userId: user.id })
    
    // Đợi cookies() (ở Next.js 15, cookies() trả về Promise)
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      message: 'Đăng ký thành công',
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error('Register error', error)
    return NextResponse.json(
      { error: 'Lỗi máy chủ' },
      { status: 500 }
    )
  }
}
