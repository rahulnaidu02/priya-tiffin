import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { differenceInDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

export default function PaymentTracker() {
  const [unpaid, setUnpaid] = useState([])
  const [paid, setPaid] = useState([])
  const [week, setWeek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('unpaid')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: weeks } = await supabase.from('weeks').select('*').in('status', ['active', 'closed']).order('created_at', { ascending: false }).limit(1)
    if (!weeks?.length) { setLoading(false); return }
    setWeek(weeks[0])

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(menu_item_name, menu_item_price, quantity)')
      .eq('week_id', weeks[0].id)
      .neq('status', 'no_show')
      .order('created_at')

    setUnpaid(data?.filter(o => o.payment_status === 'unpaid') || [])
    setPaid(data?.filter(o => o.payment_status === 'paid') || [])
    setLoading(false)
  }

  async function markPaid(orderId) {
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId)
    const order = unpaid.find(o => o.id === orderId)
    setUnpaid(prev => prev.filter(o => o.id !== orderId))
    setPaid(prev => [{ ...order, payment_status: 'paid' }, ...prev])
    toast.success('Marked as paid')
  }

  function daysAgo(dateStr) {
    return differenceInDays(new Date(), parseISO(dateStr))
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  const totalOwed = unpaid.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0)
  const totalCollected = paid.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0)
  const list = tab === 'unpaid' ? unpaid : paid

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Payments</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-red-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-red-600">${totalOwed.toFixed(2)}</p>
          <p className="text-sm text-red-400 mt-0.5">Outstanding</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-600">${totalCollected.toFixed(2)}</p>
          <p className="text-sm text-green-400 mt-0.5">Collected</p>
        </div>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button onClick={() => setTab('unpaid')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'unpaid' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
          Unpaid ({unpaid.length})
        </button>
        <button onClick={() => setTab('paid')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'paid' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
          Paid ({paid.length})
        </button>
      </div>

      {list.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          <div className="text-3xl mb-2">{tab === 'unpaid' ? '🎉' : '📭'}</div>
          <p>{tab === 'unpaid' ? 'Everyone has paid!' : 'No payments recorded yet'}</p>
        </div>
      )}

      <div className="space-y-2">
        {list.map(order => {
          const days = daysAgo(order.created_at)
          const urgent = days >= 3 && tab === 'unpaid'
          return (
            <div key={order.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${urgent ? 'border-red-200' : 'border-transparent'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{order.customer_name}</p>
                  <p className="text-sm text-gray-400">{order.customer_phone}</p>
                  <p className="text-xs text-gray-300 mt-0.5">Ordered {days} day{days !== 1 ? 's' : ''} ago</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">${order.total_amount}</p>
                  {tab === 'unpaid' && (
                    <button onClick={() => markPaid(order.id)}
                      className="mt-2 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition active:scale-95">
                      Mark paid
                    </button>
                  )}
                  {tab === 'paid' && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Paid ✓</span>}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-50">
                {order.order_items?.map((oi, i) => (
                  <p key={i} className="text-xs text-gray-400">{oi.menu_item_name} ×{oi.quantity} — ${oi.menu_item_price}</p>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
