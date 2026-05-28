'use client'

import { useEffect, useState } from 'react'
import { Edit2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
}

interface Budget {
  id: string
  category_id: string
  amount: number
  month: number
  year: number
}

export default function BudgetsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const [savingId, setSavingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Local state to track inputs
  const [inputs, setInputs] = useState<Record<string, string>>({})

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`)
      const data = await res.json()
      setBudgets(data.budgets || [])
      
      const newInputs: Record<string, string> = {}
      data.budgets?.forEach((b: Budget) => {
        newInputs[b.category_id] = b.amount.toString()
      })
      setInputs(newInputs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || [])
      })
  }, [])

  useEffect(() => {
    if (categories.length > 0) {
      fetchBudgets()
    }
  }, [month, year, categories])

  const handleSaveBudget = async (categoryId: string) => {
    setSavingId(categoryId)
    const amount = Number(inputs[categoryId] || 0)

    try {
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          amount,
          month,
          year,
        })
      })
      setSuccessId(categoryId)
      setEditingId(null)
      setTimeout(() => setSuccessId(null), 2000)
    } catch (error) {
      console.error(error)
    } finally {
      setSavingId(null)
    }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val)

  const totalBudget = categories.reduce((sum, cat) => sum + Number(inputs[cat.id] || 0), 0)

  return (
    <div className="space-y-6 pb-16">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cài đặt Ngân sách</h2>
      </div>

      <div className="glass p-6 rounded-2xl border border-border flex flex-col items-center justify-center bg-primary/5">
        <p className="text-sm text-foreground/70 mb-1">Tổng ngân sách tháng {month}/{year}</p>
        <h3 className="text-3xl font-bold text-primary">{formatCurrency(totalBudget)}</h3>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-lg">{cat.name}</h3>
              </div>
              
              
              {editingId === cat.id ? (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60 mb-1 block">Số tiền mới</label>
                    <input
                      type="number"
                      min="0"
                      value={inputs[cat.id] || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSaveBudget(cat.id)}
                    disabled={savingId === cat.id}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {savingId === cat.id ? '...' : 'Lưu'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-sm text-foreground/60">Ngân sách hiện tại</p>
                    <p className="text-xl font-bold text-primary">
                      {inputs[cat.id] ? new Intl.NumberFormat('vi-VN').format(Number(inputs[cat.id])) : 'Chưa thiết lập'}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingId(cat.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors"
                  >
                    <Edit2 size={16} />
                    <span>{successId === cat.id ? 'Đã lưu!' : 'Sửa'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
