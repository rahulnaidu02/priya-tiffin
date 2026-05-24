import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { CheckCircle, Bell, BellOff } from 'lucide-react'

export default function OrderConfirm() {
  const { orderId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(location.state?.order || null)
  const [cart, setCart] = useState(location.state?.cart || null)
  const [loading, setLoading] = useState(!order)
  const [notifStatus, setNotifStatus] = useState('default') // default | granted | denied

  useEffect(() => {
    if (!order) loadOrder()
    if ('Notification' in window) setNotifStatus(Notification.permission)
  }, [orderId])

  async function loadOrder() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(menu_item_name, menu_item_price, pickup_day, quantity), weeks(payment_venmo, payment_zelle, title)')
      .eq('id', orderId).single()
    setOrder(data)
    setLoading(false)
  }

  async function enableReminders() {
    if (!('Notification' in window)) return alert('Your browser does not support notifications')
    const result = await Notification.requestPermission()
    setNotifStatus(result)
    if (result === 'granted') {
      new Notification("Priya's Tiffin", {
        body: "You'll get reminders before your pickup days!",
        icon: '/icons/icon-192.png'
      })
    }
  }

  if (loading) return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center text-gray-400">
      Loading...
    </div>
  )
  if (!order) return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center text-gray-500">
      Order not found.
    </div>
  )

  const week = order.weeks || cart
  const venmo = week?.payment_venmo || week?.venmo
  const zelle = week?.payment_zelle || week?.zelle
  const orderItems = order.order_items || cart?.items || []
  const pickupDays = [...new Set(orderItems.map(i => i.pickup_day).filter(Boolean))]

  return (
    <div className="min-h-dvh bg-gray-50 pb-8">
      {/* Success header */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 pt-12 pb-8 text-center">
        <CheckCircle className="mx-auto mb-3" size={52} strokeWidth={1.5} />
        <h1 className="text-2xl font-bold">Order Confirmed!</h1>
        <p className="text-green-100 text-sm mt-1">Priya will have it ready for you 🍱</p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-3">

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 mb-3">Your Order</p>
          {orderItems.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="text-gray-700 font-medium">
                  {item.menu_item_name || item.name}
                </span>
                <span className="text-gray-400 ml-1">×{item.quantity || item.qty}</span>
                {item.pickup_day && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.pickup_day)}</p>
                )}
              </div>
              <span className="font-semibold text-gray-800">
                ${((parseFloat(item.menu_item_price || item.price)) * (item.quantity || item.qty)).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 pt-2 border-t border-gray-100">
            <span className="text-gray-800">Total</span>
            <span className="text-orange-500 text-lg">
              ${parseFloat(order.total_amount || cart?.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pickup info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 mb-2">Pickup Days</p>
          {pickupDays.length > 0 ? pickupDays.map(day => (
            <div key={day} className="flex items-center gap-2 py-1.5">
              <span className="text-orange-500">📅</span>
              <span className="text-sm text-gray-700 font-medium">{formatDate(day)}</span>
            </div>
          )) : (
            <p className="text-sm text-gray-400">Check with Priya for pickup times</p>
          )}
        </div>

        {/* Reminder toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 mb-1">Pickup Reminders</p>
          <p className="text-xs text-gray-400 mb-3">Get notified before your pickup day</p>
          {notifStatus === 'granted' ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-3 py-2.5">
              <Bell size={16} />
              <span className="text-sm font-medium">Reminders are on ✓</span>
            </div>
          ) : notifStatus === 'denied' ? (
            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5">
              <BellOff size={16} />
              <span className="text-sm">Blocked in browser settings</span>
            </div>
          ) : (
            <button onClick={enableReminders}
              className="w-full flex items-center justify-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 rounded-xl py-2.5 text-sm font-medium hover:bg-orange-100 transition active:scale-95">
              <Bell size={16} />
              Enable Reminders
            </button>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-gray-800 mb-1">Payment</p>
          <p className="text-xs text-gray-400 mb-3">
            You can pay now or after pickup — whatever works for you
          </p>
          {venmo && (
            <div className="flex items-center justify-between bg-purple-50 rounded-xl px-3 py-3 mb-2">
              <div>
                <p className="text-xs text-purple-400 font-medium uppercase tracking-wide">Venmo</p>
                <p className="text-purple-700 font-bold">{venmo}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(venmo)}
                className="text-xs bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg font-medium active:scale-95 transition">
                Copy
              </button>
            </div>
          )}
          {zelle && (
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-3">
              <div>
                <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">Zelle</p>
                <p className="text-blue-700 font-bold">{zelle}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(zelle)}
                className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium active:scale-95 transition">
                Copy
              </button>
            </div>
          )}
          {!venmo && !zelle && (
            <p className="text-sm text-gray-400">Priya will share payment details with you.</p>
          )}
          <p className="text-xs text-gray-400 mt-3 text-center">
            Amount: <span className="font-bold text-gray-600">
              ${parseFloat(order.total_amount || cart?.total).toFixed(2)}
            </span>
          </p>
        </div>

        {/* View orders */}
        <button onClick={() => navigate('/my-orders')}
          className="w-full bg-white border border-gray-200 text-gray-600 rounded-2xl py-3.5 font-medium text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
          View All My Orders
        </button>
      </div>
    </div>
  )
}
