import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let whereClause: any = { user_id: userId }
    if (month && year) {
      whereClause.month = parseInt(month)
      whereClause.year = parseInt(year)
    }

    const budgets = await prisma.budget.findMany({
      where: whereClause,
      include: {
        category: true,
      }
    })

    return NextResponse.json({ budgets })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { category_id, amount, month, year } = await req.json()

    if (!category_id || amount === undefined || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < 0) {
      return NextResponse.json({ error: 'Amount cannot be negative' }, { status: 400 })
    }

    // Upsert budget (create or update)
    const budget = await prisma.budget.upsert({
      where: {
        user_id_category_id_month_year: {
          user_id: userId,
          category_id,
          month: parseInt(month),
          year: parseInt(year),
        }
      },
      update: {
        amount,
      },
      create: {
        user_id: userId,
        category_id,
        amount,
        month: parseInt(month),
        year: parseInt(year),
      },
      include: { category: true }
    })

    return NextResponse.json({ budget })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
