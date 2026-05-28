'use client'

import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, AlertCircle, TrendingDown } from 'lucide-react'

interface DashboardData {
  totalToday: number
  totalMonth: number
  totalYear: number
  totalBudget: number
  budgetPercentage: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(resData => {
        setData(resData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  const { totalToday = 0, totalMonth = 0, totalYear = 0, totalBudget = 0, budgetPercentage = 0 } = data || {}

  let progressColor = 'bg-primary'
  let alertMessage = null

  if (budgetPercentage >= 100) {
    progressColor = 'bg-danger'
    alertMessage = { type: 'danger', text: 'Bạn đã tiêu hết hoặc vượt quá ngân sách tháng này!' }
  } else if (budgetPercentage >= 80) {
    progressColor = 'bg-warning'
    alertMessage = { type: 'warning', text: 'Cảnh báo: Bạn đã tiêu hơn 80% ngân sách tháng này.' }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>
      
      {alertMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          alertMessage.type === 'danger' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-warning/10 text-warning border border-warning/20'
        }`}>
          <AlertCircle size={20} />
          <span className="font-medium">{alertMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Chi tiêu hôm nay */}
        <div className="glass p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium mb-1">Đã chi hôm nay</p>
            <p className="text-2xl font-bold">{formatCurrency(totalToday)}</p>
          </div>
        </div>

        {/* Card Chi tiêu tháng */}
        <div className="glass p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium mb-1">Đã chi tháng này</p>
            <p className="text-2xl font-bold">{formatCurrency(totalMonth)}</p>
          </div>
        </div>

        {/* Card Chi tiêu năm */}
        <div className="glass p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium mb-1">Đã chi năm nay</p>
            <p className="text-2xl font-bold">{formatCurrency(totalYear)}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar Ngân sách */}
      <div className="glass p-6 rounded-2xl border border-border shadow-sm mt-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="font-semibold text-lg">Ngân sách tháng này</h3>
            <p className="text-sm text-foreground/60 mt-1">Đã dùng {budgetPercentage}%</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
        </div>
        
        <div className="w-full bg-border rounded-full h-4 overflow-hidden relative">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${progressColor}`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
