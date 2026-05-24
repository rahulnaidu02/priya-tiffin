import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { CheckCircle } from 'lucide-react'

export default function OrderConfirm() {
  const { orderId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(location.state?.order || null)
  const [cart, setCart] = useState(location.state?.cart || null)
  const [loading, setLoading] = useState(!order)

  useEffect(() => {
    if (!order) loadOrder()
  }, [orderId])

  async function loadOrder() {
    const { data } = await supabase.from('orders').select('*, order_items(menu_item_name, menu_item_price, pickup_day, quantity), weeks(payment_venmo, payment_zelle, title)').eq('id', orderId).single()
    setOrder(data)
    setLoading(false)
  }

  if (loading) return <div className="min-h-dvh bg-orange-50 flex items-center justify-center text-gray-400">Loading...</div>
  if (!order) return <div className="min-h-dvh bg-orange-50 flex items-center justify-center text-gray-500">Order not found.</div>

  const week = order.weeks || cart
  const venmo = week?.payment_venmo || week?.venmo
  const zelle = week?.payment_zelle || week?.zelle

  return (
    <div className="min-h-dvh bg-orange-50 flex flex-col items-center justify-start pt-10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <CheckCircle className="text-green-500 mx-auto mb-3" size={56} strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mt-1">Priya will have it ready for you.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="font-semibold text-gray-700 mb-3">Your items</p>
          {(order.order_items || cart?.items)?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-700">{item.menu_item_name || item.name} ×{item.quantity || item.qty}</span>
              <span className="text-gray-500">{item.pickup_day ? formatDate(item.pickup_day) : ''}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-orange-500">${parseFloat(order.total_amount || cart?.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <p className="font-semibold text-blue-800 mb-2">Payment</p>
          <p className="text-sm text-blue-600 mb-2">Pay after pickup:</p>
          {venmo && <p className="text-sm text-blue-700 font-medium">💸 Venmo: {venmo}</p>}
          {zelle && <p className="text-sm text-blue-700 font-medium">🏦 Zelle: {zelle}</p>}
          {!venmo && !zelle && <p className="text-sm text-blue-400">Priya will share payment details.</p>}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-green-700">
            You'll get a reminder before your pickup day. Check back here anytime to see your order.
          </p>
        </div>

        <button onClick={() => navigate('/my-orders')} className="w-full border border-gray-200 bg-white text-gray-700 rounded-2xl py-3 font-medium hover:bg-gray-50 transition active:scale-95">
          View My Orders
        </button>
      </div>
    </div>
  )
}
