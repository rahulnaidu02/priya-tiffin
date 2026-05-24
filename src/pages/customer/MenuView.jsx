import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, groupByDay } from '../../lib/utils'
import { ShoppingBag, Plus, Minus } from 'lucide-react'
import { isAfter } from 'date-fns'

export default function MenuView() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [week, setWeek] = useState(null)
  const [items, setItems] = useState([])
  const [cart, setCart] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMenu() }, [token])

  async function loadMenu() {
    const { data: weeks } = await supabase
      .from('weeks').select('*').eq('share_token', token).single()
    if (!weeks) { setLoading(false); return }
    setWeek(weeks)

    if (weeks.status === 'closed' || weeks.status === 'archived') {
      navigate('/closed'); return
    }
    if (weeks.order_deadline) {
      const [datePart, timePart] = weeks.order_deadline.split('T')
      const deadline = new Date(`${datePart}T${timePart}`)
      if (!isNaN(deadline.getTime()) && isAfter(new Date(), deadline)) {
        navigate('/closed'); return
      }
    }

    const { data: menuItems } = await supabase
      .from('menu_items').select('*').eq('week_id', weeks.id).order('pickup_day')
    setItems(menuItems || [])
    setLoading(false)
  }

  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0)
  const totalAmount = items.reduce((s, item) =>
    s + (parseFloat(item.price) || 0) * (cart[item.id] || 0), 0)

  function addItem(id) {
    if ((cart[id] || 0) >= 3) return   // max 3 of the same item
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  }
  function removeItem(id) {
    setCart(c => {
      const n = { ...c }
      if (n[id] > 1) n[id]--
      else delete n[id]
      return n
    })
  }

  function goToOrder() {
    const cartItems = Object.entries(cart).map(([id, qty]) => {
      const item = items.find(i => i.id === id)
      return { id, qty, name: item.name, price: item.price, pickup_day: item.pickup_day }
    })
    sessionStorage.setItem('priya_cart', JSON.stringify({
      weekId: week.id, weekTitle: week.title,
      items: cartItems, total: totalAmount,
      venmo: week.payment_venmo, zelle: week.payment_zelle
    }))
    navigate(`/m/${token}/order`)
  }

  if (loading) return (
    <div className="min-h-dvh bg-orange-50 flex items-center justify-center">
      <div className="text-orange-400">Loading menu...</div>
    </div>
  )

  if (!week) return (
    <div className="min-h-dvh bg-orange-50 flex items-center justify-center p-4">
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">🔍</div>
        <p>Menu not found.</p>
      </div>
    </div>
  )

  const byDay = groupByDay(items)

  return (
    <div className="min-h-dvh bg-gray-50 pb-32">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 pt-10 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="text-4xl mb-2">🍱</div>
          <h1 className="text-2xl font-bold">Priya's Tiffin</h1>
          <p className="text-orange-100 text-sm mt-1">{week.title}</p>
          {week.order_deadline && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-orange-600/50 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-orange-100">
                Order by {new Date(`${week.order_deadline}`).toLocaleString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: 'numeric', minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subtitle */}
      <div className="max-w-lg mx-auto px-4 pt-3">
        <p className="text-xs text-gray-400 text-center">Order from any day · Max 3 of the same item</p>
      </div>

      {/* Menu grouped by day */}
      <div className="max-w-lg mx-auto px-4 pt-3 space-y-6">
        {Object.entries(byDay).map(([day, dayItems]) => (
          <div key={day}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <div>
                <p className="font-bold text-gray-800 text-sm">{formatDate(day)}</p>
                {dayItems[0]?.pickup_time_start && (
                  <p className="text-xs text-gray-400">
                    Pickup {formatTime(dayItems[0].pickup_time_start)} – {formatTime(dayItems[0].pickup_time_end)}
                  </p>
                )}
              </div>
            </div>

            {/* Item cards - DoorDash style */}
            <div className="space-y-2">
              {dayItems.map(item => {
                const qty = cart[item.id] || 0
                const atItemMax = qty >= 3
                return (
                  <div key={item.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-center gap-3 p-3 transition">
                    {/* Thumbnail */}
                    {item.image_urls?.[0] ? (
                      <img src={item.image_urls[0]} alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">🍛</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-orange-500 font-bold text-sm mt-1">
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-orange-50 rounded-full px-2 py-1">
                          <button onClick={() => removeItem(item.id)}
                            className="w-7 h-7 rounded-full bg-white text-orange-600 flex items-center justify-center shadow-sm active:scale-90 transition">
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center font-bold text-orange-600 text-sm">{qty}</span>
                          <button onClick={() => addItem(item.id)} disabled={atItemMax}
                            className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm active:scale-90 transition disabled:opacity-40">
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addItem(item.id)}
                          className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition">
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Place Order button */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-4 py-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm text-gray-500">{totalItems} item{totalItems > 1 ? 's' : ''} selected</span>
              <span className="text-sm font-bold text-gray-800">${totalAmount.toFixed(2)}</span>
            </div>
            <button onClick={goToOrder}
              className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-base shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
