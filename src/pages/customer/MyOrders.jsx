import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { Search } from 'lucide-react'

export default function MyOrders() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)

  async function lookup(e) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(menu_item_name, pickup_day, quantity, menu_item_price), weeks(title, payment_venmo, payment_zelle)')
      .eq('customer_phone', phone.trim())
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-orange-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center pt-8 mb-6">
          <div className="text-4xl mb-2">🍱</div>
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your phone to see your orders</p>
        </div>

        <form onSubmit={lookup} className="flex gap-2 mb-6">
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" type="tel"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
          <button type="submit" disabled={loading}
            className="bg-orange-500 text-white px-4 rounded-xl font-medium flex items-center gap-1 hover:bg-orange-600 transition active:scale-95 disabled:opacity-60">
            <Search size={16} />
          </button>
        </form>

        {orders !== null && orders.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-3xl mb-2">🔍</div>
            <p>No orders found for this number.</p>
          </div>
        )}

        {orders?.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-gray-800">{order.weeks?.title}</p>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === 'picked_up' ? 'bg-green-100 text-green-600' : order.status === 'no_show' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-600'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              {order.order_items?.map((oi, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700">{oi.menu_item_name} ×{oi.quantity}</span>
                  <span className="text-gray-400">{oi.pickup_day ? formatDate(oi.pickup_day) : ''}</span>
                </div>
              ))}

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800">Total: ${parseFloat(order.total_amount).toFixed(2)}</span>
                {order.payment_status === 'unpaid' && (
                  <div className="text-right text-xs text-gray-500">
                    {order.weeks?.payment_venmo && <p>Venmo: {order.weeks.payment_venmo}</p>}
                    {order.weeks?.payment_zelle && <p>Zelle: {order.weeks.payment_zelle}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
