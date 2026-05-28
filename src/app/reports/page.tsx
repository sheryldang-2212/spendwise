'use client'

import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  icon: string
}

interface Expense {
  id: string
  amount: number
  category_id: string
}

interface Budget {
  id: string
  amount: number
  category_id: string
}

export default function ReportsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, expRes, budRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/expenses?month=${month}&year=${year}`),
        fetch(`/api/budgets?month=${month}&year=${year}`)
      ])
      
      const catData = await catRes.json()
      const expData = await expRes.json()
      const budData = await budRes.json()

      setCategories(catData.categories || [])
      setExpenses(expData.expenses || [])
      setBudgets(budData.budgets || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [month, year])

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  const getCategoryReport = (categoryId: string) => {
    const catExpenses = expenses.filter(e => e.category_id === categoryId)
    const totalExpense = catExpenses.reduce((sum, e) => sum + e.amount, 0)
    
    const catBudget = budgets.find(b => b.category_id === categoryId)
    const totalBudget = catBudget ? catBudget.amount : 0

    const percentage = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0
    let statusColor = 'bg-primary'
    if (percentage >= 100) statusColor = 'bg-danger'
    else if (percentage >= 80) statusColor = 'bg-warning'

    return { totalExpense, totalBudget, percentage, statusColor }
  }

  return (
    <div className="space-y-6 pb-16">
      <h2 className="text-2xl font-bold">Báo cáo & Phân tích</h2>

      <div className="glass p-4 rounded-xl border border-border flex gap-4">
        <select 
          value={month} 
          onChange={e => setMonth(Number(e.target.value))}
          className="bg-card border border-border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>Tháng {m}</option>
          ))}
        </select>
        <select 
          value={year} 
          onChange={e => setYear(Number(e.target.value))}
          className="bg-card border border-border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-foreground/5 text-sm uppercase text-foreground/60">
                    <th className="p-4 font-medium">Danh mục</th>
                    <th className="p-4 font-medium text-right">Ngân sách</th>
                    <th className="p-4 font-medium text-right">Thực chi</th>
                    <th className="p-4 font-medium text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map(cat => {
                    const report = getCategoryReport(cat.id)
                    // Bỏ qua nếu không có ngân sách và không có chi tiêu
                    if (report.totalBudget === 0 && report.totalExpense === 0) return null

                    return (
                      <tr key={cat.id} className="hover:bg-foreground/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">{cat.icon}</span>
                          <span className="font-medium whitespace-nowrap">{cat.name}</span>
                        </td>
                        <td className="p-4 text-right font-medium">{formatCurrency(report.totalBudget)}</td>
                        <td className="p-4 text-right font-medium text-danger">{formatCurrency(report.totalExpense)}</td>
                        <td className="p-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold mb-1">{report.percentage}%</span>
                            <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${report.statusColor}`}
                                style={{ width: `${Math.min(report.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
