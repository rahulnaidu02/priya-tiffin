import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { ArrowLeft, Bell, BellOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderForm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const cart = JSON.parse(sessionStorage.getItem('priya_cart') || 'null')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [smsReminders, setSmsReminders] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  if (!cart) { navigate(`/m/${token}`); return null }

  const venmo = cart.venmo
  const zelle = cart.zelle
  const pickupDays = [...new Set(cart.items.map(i => i.pickup_day))]

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return toast.error('Enter your name')
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10)
      return toast.error('Enter a valid phone number')
    setSubmitting(true)

    const { data: existing } = await supabase
      .from('orders').select('id')
      .eq('week_id', cart.weekId).eq('customer_phone', phone.trim()).single()
    if (existing) {
      toast.error('You already ordered this week!')
      setSubmitting(false)
      return
    }

    const { data: order, error } = await supabase.from('orders').insert({
      week_id: cart.weekId,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      total_amount: cart.total,
      sms_reminders: smsReminders,
    }).select().single()

    if (error || !order) {
      toast.error('Something went wrong. Try again.')
      setSubmitting(false)
      return
    }

    await supabase.from('order_items').insert(
      cart.items.map(i => ({
        order_id: order.id,
        menu_item_id: i.id,
        menu_item_name: i.name,
        menu_item_price: i.price,
        pickup_day: i.pickup_day,
        quantity: i.qty,
      }))
    )

    sessionStorage.removeItem('priya_cart')
    navigate(`/confirmed/${order.id}`, { state: { order, cart, name } })
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-800">Your Order</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-3">

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">Order Summary</h2>
          {cart.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                <span className="text-sm text-gray-400"> ×{item.qty}</span>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.pickup_day)}</p>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                ${(parseFloat(item.price) * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 pt-2 border-t border-gray-100">
            <span className="text-gray-800">Total</span>
            <span className="text-orange-500 text-lg">${cart.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment options */}
        {(venmo || zelle) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-1">Payment</h2>
            <p className="text-xs text-gray-400 mb-3">Pay now or after pickup — your choice</p>
            {venmo && (
              <div className="flex items-center justify-between bg-purple-50 rounded-xl px-3 py-3 mb-2">
                <div>
                  <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Venmo</p>
                  <p className="text-purple-700 font-bold">{venmo}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(venmo); toast.success('Copied!') }}
                  className="text-xs bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg font-medium active:scale-95 transition">
                  Copy
                </button>
              </div>
            )}
            {zelle && (
              <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-3">
                <div>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">Zelle</p>
                  <p className="text-blue-700 font-bold">{zelle}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(zelle); toast.success('Copied!') }}
                  className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium active:scale-95 transition">
                  Copy
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 text-center mt-3">
              Amount due: <span className="font-bold text-gray-600">${cart.total.toFixed(2)}</span>
            </p>
          </div>
        )}

        {/* Pickup days */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-2">Pickup Days</h2>
          {pickupDays.map(day => (
            <div key={day} className="flex items-center gap-2 py-1.5">
              <span className="text-orange-500">📅</span>
              <span className="text-sm text-gray-700 font-medium">{formatDate(day)}</span>
            </div>
          ))}
        </div>

        {/* SMS reminder toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="font-bold text-gray-800">Pickup Reminders</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {smsReminders ? 'SMS reminder before your pickup day' : 'No reminders'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSmsReminders(r => !r)}
              className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${smsReminders ? 'bg-orange-500 justify-end' : 'bg-gray-200 justify-start'}`}>
              <span className="w-5 h-5 bg-white rounded-full shadow-sm block" />
            </button>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={submit} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-bold text-gray-800">Your Details</h2>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name *"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          <input value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Phone number *" type="tel"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />

          <button type="submit" disabled={submitting}
            className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-base hover:bg-orange-600 transition active:scale-95 disabled:opacity-60">
            {submitting ? 'Placing order...' : `Confirm Order · $${cart.total.toFixed(2)}`}
          </button>
        </form>

      </div>
    </div>
  )
}
