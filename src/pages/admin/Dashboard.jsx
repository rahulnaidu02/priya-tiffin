import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime } from '../../lib/utils'
import { CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  picked_up: 'bg-green-100 text-green-700',
  no_show: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [week, setWeek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    const { data: weeks } = await supabase.from('weeks').select('*').in('status', ['active', 'closed']).order('created_at', { ascending: false }).limit(1)
    if (!weeks?.length) { setLoading(false); return }
    const w = weeks[0]
    setWeek(w)

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name, pickup_day, pickup_time_start, pickup_time_end))')
      .eq('week_id', w.id)
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, field, value) {
    await supabase.from('orders').update({ [field]: value }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o))
    toast.success('Updated')
  }

  const total = orders.length
  const pickedUp = orders.filter(o => o.status === 'picked_up').length
  const noShow = orders.filter(o => o.status === 'no_show').length
  const unpaid = orders.filter(o => o.payment_status === 'unpaid' && o.status !== 'no_show').length

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  if (!week) return (
    <div className="p-4 text-center mt-16 text-gray-400">
      <div className="text-4xl mb-3">📋</div>
      <p>No active week. Go to Menu to create one.</p>
    </div>
  )

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">{week.title}</h2>
      <p className="text-sm text-gray-400 mb-4 capitalize">{week.status}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Orders', value: total, color: 'bg-blue-50 text-blue-600' },
          { label: 'Picked up', value: pickedUp, color: 'bg-green-50 text-green-600' },
          { label: 'No-show', value: noShow, color: 'bg-red-50 text-red-600' },
          { label: 'Unpaid', value: unpaid, color: 'bg-yellow-50 text-yellow-600' },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-2xl p-3 text-center`}>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs font-medium mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          <div className="text-4xl mb-2">🕐</div>
          <p>No orders yet</p>
        </div>
      )}

      {/* Order list */}
      <div className="space-y-2">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full p-4 text-left flex items-center gap-3" onClick={() => setExpanded(e => ({ ...e, [order.id]: !e[order.id] }))}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{order.customer_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  {order.payment_status === 'paid' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Paid</span>}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{order.customer_phone} · ${order.total_amount}</p>
                <p className="text-xs text-gray-300 mt-0.5">{order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded[order.id] ? 'rotate-180' : ''}`} />
            </button>

            {expanded[order.id] && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <div className="py-3 space-y-1">
                  {order.order_items?.map(oi => (
                    <div key={oi.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{oi.menu_items?.name || oi.menu_item_name} ×{oi.quantity}</span>
                      <span className="text-gray-400">{oi.menu_items?.pickup_day ? formatDate(oi.menu_items.pickup_day) : ''}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateStatus(order.id, 'status', 'picked_up')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition ${order.status === 'picked_up' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    <CheckCircle size={14} /> Picked up
                  </button>
                  <button onClick={() => updateStatus(order.id, 'status', 'no_show')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition ${order.status === 'no_show' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                    <XCircle size={14} /> No-show
                  </button>
                  <button onClick={() => updateStatus(order.id, 'payment_status', order.payment_status === 'paid' ? 'unpaid' : 'paid')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition ${order.payment_status === 'paid' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <Clock size={14} /> {order.payment_status === 'paid' ? 'Paid ✓' : 'Mark paid'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
