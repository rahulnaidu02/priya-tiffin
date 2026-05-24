import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderForm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const cart = JSON.parse(sessionStorage.getItem('priya_cart') || 'null')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!cart) {
    navigate(`/m/${token}`)
    return null
  }

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return toast.error('Enter your name')
    if (!phone.trim() || phone.length < 10) return toast.error('Enter a valid phone number')
    setSubmitting(true)

    // Check duplicate
    const { data: existing } = await supabase.from('orders').select('id').eq('week_id', cart.weekId).eq('customer_phone', phone.trim()).single()
    if (existing) {
      toast.error('You already placed an order for this week!')
      setSubmitting(false)
      return
    }

    const { data: order, error } = await supabase.from('orders').insert({
      week_id: cart.weekId,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      total_amount: cart.total,
    }).select().single()

    if (error || !order) { toast.error('Something went wrong. Try again.'); setSubmitting(false); return }

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
    <div className="min-h-dvh bg-orange-50">
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} className="text-gray-600" /></button>
        <h1 className="font-bold text-gray-800">Your Order</h1>
      </header>

      <div className="p-4 max-w-md mx-auto">
        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Order Summary</h2>
          {cart.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
              <span className="font-medium">${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-800 mt-3 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-orange-500">${cart.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pickup info */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-orange-700 mb-1">Pickup days</p>
          {[...new Set(cart.items.map(i => i.pickup_day))].map(day => (
            <p key={day} className="text-sm text-orange-600">{formatDate(day)}</p>
          ))}
          <p className="text-xs text-orange-500 mt-2">You'll get a reminder before each pickup day.</p>
        </div>

        {/* Contact form */}
        <form onSubmit={submit} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-700">Your Details</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name *"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number *" type="tel"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          <button type="submit" disabled={submitting}
            className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-base hover:bg-orange-600 transition active:scale-95 disabled:opacity-60 mt-2">
            {submitting ? 'Placing order...' : 'Confirm Order'}
          </button>
        </form>
      </div>
    </div>
  )
}
