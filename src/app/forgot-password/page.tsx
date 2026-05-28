'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('Tên vật nuôi đầu tiên của bạn là gì?')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    if (!securityAnswer.trim()) {
      setError('Vui lòng trả lời câu hỏi bảo mật')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityQuestion, securityAnswer, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 rounded-2xl glass shadow-xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">SpendWise</h1>
          <p className="text-foreground/60">Khôi phục mật khẩu</p>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-primary/10 text-primary p-3 rounded-lg mb-6 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Câu hỏi bảo mật</label>
            <select
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4"
            >
              <option value="Tên vật nuôi đầu tiên của bạn là gì?">Tên vật nuôi đầu tiên của bạn là gì?</option>
              <option value="Tên trường tiểu học của bạn là gì?">Tên trường tiểu học của bạn là gì?</option>
              <option value="Thành phố nơi bạn sinh ra là gì?">Thành phố nơi bạn sinh ra là gì?</option>
            </select>
            <input
              type="text"
              required
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Câu trả lời của bạn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu mới</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Nhớ mật khẩu rồi?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
