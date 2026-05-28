'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

type Message = {
  id: string
  sender: 'bot' | 'user'
  text: string
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý SpendWise. Bạn cần hướng dẫn về vấn đề gì?',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickReplies = [
    'Làm sao để thêm chi tiêu?',
    'Cách cài đặt ngân sách?',
    'Xem báo cáo ở đâu?',
  ]

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
    }

    setMessages((prev) => [...prev, newUserMsg])
    setInputValue('')

    // Bot response logic
    setTimeout(() => {
      let botResponse = ''
      const lowerText = text.toLowerCase()

      if (lowerText.includes('thêm') || lowerText.includes('chi tiêu')) {
        botResponse = "Để thêm chi tiêu, bạn vào mục 'Chi tiêu' (biểu tượng ví tiền), nhấn vào dấu '+' màu cam ở góc dưới. Sau đó nhập số tiền, chọn danh mục và ngày rồi nhấn 'Lưu chi tiêu' nhé."
      } else if (lowerText.includes('ngân sách') || lowerText.includes('cài đặt')) {
        botResponse = "Bạn vào mục 'Ngân sách' (biểu tượng bánh răng). Chọn Tháng/Năm, sau đó nhập số tiền mong muốn cho từng danh mục rồi nhấn 'Lưu' để hệ thống ghi nhận."
      } else if (lowerText.includes('báo cáo') || lowerText.includes('thống kê') || lowerText.includes('xem')) {
        botResponse = "Để xem báo cáo, bạn hãy vào mục 'Báo cáo' (biểu tượng biểu đồ). Ở đó sẽ hiển thị tỷ lệ chi tiêu theo danh mục và tình trạng ngân sách của bạn trong tháng."
      } else if (lowerText.includes('chào')) {
        botResponse = "Chào bạn! Chúc bạn một ngày vui vẻ. Tôi có thể giúp gì cho bạn với ứng dụng SpendWise?"
      } else {
        botResponse = "Xin lỗi, tôi vẫn đang học hỏi và chỉ hỗ trợ các câu hỏi liên quan đến cách dùng app. Bạn có thể chọn các gợi ý hoặc dùng từ khóa rõ hơn (ví dụ: 'thêm chi tiêu', 'cài ngân sách') nhé."
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponse,
        },
      ])
    }, 500)
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-[calc(100vw-32px)] md:w-96 h-[500px] max-h-[80vh] bg-card glass border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="bg-primary/10 border-b border-border p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ lý SpendWise</h3>
                <p className="text-[10px] text-foreground/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                  Đang hoạt động
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-foreground/50 hover:text-foreground p-2 rounded-full hover:bg-foreground/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-background border border-border rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages[messages.length - 1]?.sender === 'bot' && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar snap-x">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(reply)}
                  className="snap-start shrink-0 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-background/50">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend(inputValue)
              }}
              className="flex items-center gap-2 relative"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-4 py-2.5 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-1 w-8 h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
