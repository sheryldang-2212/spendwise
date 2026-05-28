import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || new Date().getMonth() + 1
    const year = searchParams.get('year') || new Date().getFullYear()

    const startDate = new Date(Number(year), Number(month) - 1, 1)
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999)

    // Lấy tổng chi tiêu trong ngày hôm nay
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    const todayExpenses = await prisma.expense.aggregate({
      where: {
        user_id: userId,
        expense_date: {
          gte: today,
          lte: endOfToday,
        }
      },
      _sum: { amount: true }
    })

    // Lấy tổng chi tiêu trong tháng
    const monthExpenses = await prisma.expense.aggregate({
      where: {
        user_id: userId,
        expense_date: {
          gte: startDate,
          lte: endDate,
        }
      },
      _sum: { amount: true }
    })

    // Lấy tổng ngân sách trong tháng
    const monthBudgets = await prisma.budget.aggregate({
      where: {
        user_id: userId,
        month: Number(month),
        year: Number(year),
      },
      _sum: { amount: true }
    })

    const totalToday = todayExpenses._sum.amount || 0
    const totalMonth = monthExpenses._sum.amount || 0
    const totalBudget = monthBudgets._sum.amount || 0
    const budgetPercentage = totalBudget > 0 ? Math.round((totalMonth / totalBudget) * 100) : 0

    return NextResponse.json({
      totalToday,
      totalMonth,
      totalBudget,
      budgetPercentage
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
