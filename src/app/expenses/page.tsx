'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Filter, Edit2, Trash2 } from 'lucide-react'

interface Expense {
  id: string
  amount: number
  note: string
  expense_date: string
  category: {
    id: string
    name: string
    icon: string
  }
}

interface Category {
  id: string
  name: string
  icon: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [filterCategory, setFilterCategory] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchExpenses = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterMonth) params.append('month', filterMonth.toString())
    if (filterYear) params.append('year', filterYear.toString())
    if (filterCategory) params.append('category_id', filterCategory)

    fetch(`/api/expenses?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setExpenses(data.expenses || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [filterMonth, filterYear, filterCategory])

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          category_id: categoryId,
          note,
          expense_date: expenseDate,
        }),
      })

      if (res.ok) {
        closeModal()
        fetchExpenses()
      } else {
        const data = await res.json()
        setError(data.error || 'Lỗi khi lưu chi tiêu')
      }
    } catch (err) {
      setError('Lỗi kết nối')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) return
    
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchExpenses()
      } else {
        alert('Lỗi khi xóa chi tiêu')
      }
    } catch (err) {
      alert('Lỗi kết nối')
    }
  }

  const openEditModal = (expense: Expense) => {
    setEditingId(expense.id)
    setAmount(expense.amount.toString())
    setCategoryId(expense.category.id)
    setNote(expense.note)
    setExpenseDate(expense.expense_date.split('T')[0])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setAmount('')
    setCategoryId('')
    setNote('')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setError('')
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val)
  const formatDate = (dateString: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString))

  return (
    <div className="space-y-6 relative pb-16">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lịch sử chi tiêu</h2>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-xl border border-border shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-foreground/70">
          <Filter size={18} />
          <span className="font-medium text-sm">Lọc:</span>
        </div>
        <select 
          value={filterMonth} 
          onChange={e => setFilterMonth(Number(e.target.value))}
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>Tháng {m}</option>
          ))}
        </select>
        <select 
          value={filterYear} 
          onChange={e => setFilterYear(Number(e.target.value))}
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
        <select 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-foreground/50">
          Không có dữ liệu chi tiêu nào.
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="glass p-4 rounded-xl border border-border shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                  {expense.category.icon}
                </div>
                <div>
                  <p className="font-semibold">{expense.category.name}</p>
                  <div className="flex items-center gap-2 text-xs text-foreground/60 mt-1">
                    <span>{formatDate(expense.expense_date)}</span>
                    {expense.note && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[120px] md:max-w-xs">{expense.note}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-bold text-danger">
                  -{formatCurrency(expense.amount)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(expense)} className="p-2 text-foreground/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(expense.id)} className="p-2 text-foreground/50 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 md:bottom-12 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingId ? 'Cập nhật chi tiêu' : 'Thêm chi tiêu'}</h3>
              <button onClick={closeModal} className="text-foreground/50 hover:text-foreground p-2 rounded-full hover:bg-foreground/5">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 space-y-5">
              {error && <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Số tiền</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-semibold rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Danh mục</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        categoryId === c.id 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border bg-background hover:bg-foreground/5'
                      }`}
                    >
                      <span className="text-2xl mb-1">{c.icon}</span>
                      <span className="text-xs font-medium text-center line-clamp-1">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ngày chi</label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ghi chú</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Tùy chọn..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !amount || !categoryId}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật chi tiêu' : 'Lưu chi tiêu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
