'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, PieChart, Wallet, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { name: 'Tổng quan', href: '/', icon: Home },
    { name: 'Chi tiêu', href: '/expenses', icon: Wallet },
    { name: 'Báo cáo', href: '/reports', icon: PieChart },
    { name: 'Ngân sách', href: '/budgets', icon: Settings },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  // Ẩn Navigation trên trang login/register
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-card border-b border-border sticky top-0 z-50 glass">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-primary tracking-tight">SpendWise</h1>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'text-primary bg-primary/10 font-medium' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-foreground/70 hover:text-danger transition-colors px-3 py-2 rounded-md hover:bg-danger/10"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 glass pb-safe">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-all ${
                  isActive ? 'text-primary' : 'text-foreground/50'
                }`}
              >
                <div className={`p-1.5 rounded-full mb-1 ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
