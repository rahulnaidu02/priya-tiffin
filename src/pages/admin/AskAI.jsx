import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Database } from 'lucide-react'

const SUGGESTIONS = [
  'How many orders this week?',
  'Which item sold the most?',
  'Who hasn\'t paid yet?',
  'Total revenue across all weeks?',
  'Repeat customers in the last 4 weeks?',
  'Average order value?',
]

export default function AskAI() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  async function ask(question) {
    if (!question.trim() || loading) return
    const userMsg = { role: 'user', text: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages(prev => [...prev, { role: 'ai', text: data.answer, meta: data.rowCounts }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}`, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    ask(input)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)] max-w-lg mx-auto">

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          <h2 className="text-xl font-bold text-gray-800">Ask AI</h2>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Natural-language questions about your live Supabase data. Admin only (not visible to customers).
        </p>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">

        {messages.length === 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Database size={14} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Try a question</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="text-left text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-xl transition active:scale-95">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : m.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100'
              }`}>
              {m.text}
              {m.meta && (
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                  Read {m.meta.orders} orders, {m.meta.menu_items} items, {m.meta.weeks} weeks
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 shadow-sm border border-gray-100 rounded-2xl px-3.5 py-2.5 text-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="px-4 pt-2 pb-3 bg-orange-50/50 sticky bottom-16">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about orders, items, payments..."
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-orange-500 text-white rounded-2xl px-4 font-bold disabled:opacity-50 active:scale-95 transition">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
