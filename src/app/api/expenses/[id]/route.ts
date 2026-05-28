import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const userId = payload.userId as string
    const { id } = await params

    const expense = await prisma.expense.findUnique({ where: { id } })
    
    if (!expense || expense.user_id !== userId) {
      return NextResponse.json({ error: 'Không tìm thấy chi tiêu hoặc không có quyền xóa' }, { status: 403 })
    }

    await prisma.expense.delete({ where: { id } })

    return NextResponse.json({ message: 'Xóa thành công' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const userId = payload.userId as string
    const { id } = await params
    
    const body = await req.json()
    const { amount, category_id, note, expense_date } = body

    if (amount <= 0) {
      return NextResponse.json({ error: 'Số tiền phải lớn hơn 0' }, { status: 400 })
    }

    const expenseDate = new Date(expense_date)
    if (expenseDate > new Date()) {
      return NextResponse.json({ error: 'Ngày chi tiêu không được ở tương lai' }, { status: 400 })
    }

    const expense = await prisma.expense.findUnique({ where: { id } })
    
    if (!expense || expense.user_id !== userId) {
      return NextResponse.json({ error: 'Không tìm thấy chi tiêu hoặc không có quyền sửa' }, { status: 403 })
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount,
        category_id,
        note,
        expense_date: expenseDate,
      }
    })

    return NextResponse.json({ message: 'Cập nhật thành công', expense: updatedExpense })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
