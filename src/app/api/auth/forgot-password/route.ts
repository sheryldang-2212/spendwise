import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, securityQuestion, securityAnswer, newPassword } = await req.json()

    if (!email || !securityQuestion || !securityAnswer || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin và mật khẩu mới ít nhất 8 ký tự.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Vì lý do bảo mật, không nên trả về lỗi "Email không tồn tại"
      // Nhưng để UX tốt hơn cho app nội bộ, ta có thể báo lỗi
      return NextResponse.json(
        { error: 'Email không tồn tại trong hệ thống.' },
        { status: 400 }
      )
    }

    if (user.securityQuestion !== securityQuestion || user.securityAnswer?.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
      return NextResponse.json(
        { error: 'Câu trả lời bảo mật không chính xác.' },
        { status: 400 }
      )
    }

    const password_hash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash },
    })

    return NextResponse.json({
      message: 'Đổi mật khẩu thành công',
    })
  } catch (error) {
    console.error('Forgot password error', error)
    return NextResponse.json(
      { error: 'Lỗi máy chủ' },
      { status: 500 }
    )
  }
}
