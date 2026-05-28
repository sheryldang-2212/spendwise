import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const categoryId = searchParams.get('category_id')

    let whereClause: any = { user_id: userId }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      whereClause.expense_date = {
        gte: startDate,
        lte: endDate,
      }
    }

    if (categoryId) {
      whereClause.category_id = categoryId
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        expense_date: 'desc',
      },
    })

    return NextResponse.json({ expenses })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { category_id, amount, note, expense_date } = await req.json()

    if (!category_id || amount === undefined || !expense_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const date = new Date(expense_date)
    if (date > new Date()) {
      return NextResponse.json({ error: 'Expense date cannot be in the future' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        user_id: userId,
        category_id,
        amount,
        note,
        expense_date: date,
      },
      include: { category: true }
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
