import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, groupByDay } from '../../lib/utils'
import { ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { isAfter, parseISO } from 'date-fns'

export default function MenuView() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [week, setWeek] = useState(null)
  const [items, setItems] = useState([])
  const [cart, setCart] = useState({})
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState({})

  useEffect(() => { loadMenu() }, [token])

  async function loadMenu() {
    const { data: weeks } = await supabase.from('weeks').select('*').eq('share_token', token).single()
    if (!weeks) { setLoading(false); return }
    setWeek(weeks)

    if (weeks.status === 'closed' || weeks.status === 'archived' || (weeks.order_deadline && isAfter(new Date(), parseISO(weeks.order_deadline)))) {
      navigate('/closed')
      return
    }

    const { data: menuItems } = await supabase.from('menu_items').select('*').eq('week_id', weeks.id).order('pickup_day')
    setItems(menuItems || [])
    setLoading(false)
  }

  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0)
  const totalAmount = items.reduce((s, item) => s + (parseFloat(item.price) || 0) * (cart[item.id] || 0), 0)

  function addItem(id) {
    if (totalItems >= 3) return
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  }
  function removeItem(id) {
    setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n })
  }

  function goToOrder() {
    const cartItems = Object.entries(cart).map(([id, qty]) => {
      const item = items.find(i => i.id === id)
      return { id, qty, name: item.name, price: item.price, pickup_day: item.pickup_day }
    })
    sessionStorage.setItem('priya_cart', JSON.stringify({ weekId: week.id, weekTitle: week.title, items: cartItems, total: totalAmount, venmo: week.payment_venmo, zelle: week.payment_zelle }))
    navigate(`/m/${token}/order`)
  }

  if (loading) return (
    <div className="min-h-dvh bg-orange-50 flex items-center justify-center">
      <div className="text-orange-400 text-sm">Loading menu...</div>
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
    <div className="min-h-dvh bg-orange-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 text-white px-4 pt-10 pb-6">
        <div className="text-3xl mb-1">🍱</div>
        <h1 className="text-2xl font-bold">Priya's Tiffin</h1>
        <p className="text-orange-100 text-sm mt-1">{week.title}</p>
        {week.order_deadline && (
          <p className="text-orange-200 text-xs mt-1">
            Order by {new Date(week.order_deadline).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Menu grouped by day */}
      <div className="px-4 pt-4 space-y-4">
        {Object.entries(byDay).map(([day, dayItems]) => (
          <div key={day}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-gray-700">{formatDate(day)}</span>
              {dayItems[0]?.pickup_time_start && (
                <span className="text-xs text-gray-400">Pickup: {formatTime(dayItems[0].pickup_time_start)} – {formatTime(dayItems[0].pickup_time_end)}</span>
              )}
            </div>
            <div className="space-y-3">
              {dayItems.map(item => {
                const qty = cart[item.id] || 0
                const imgs = item.image_urls || []
                const imgIdx = imgIndex[item.id] || 0
                return (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {imgs.length > 0 && (
                      <div className="relative">
                        <img src={imgs[imgIdx]} alt={item.name} className="w-full h-44 object-cover" />
                        {imgs.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between px-2">
                            <button onClick={() => setImgIndex(p => ({ ...p, [item.id]: (imgIdx - 1 + imgs.length) % imgs.length }))}
                              className="bg-black/30 text-white rounded-full p-1"><ChevronLeft size={14} /></button>
                            <button onClick={() => setImgIndex(p => ({ ...p, [item.id]: (imgIdx + 1) % imgs.length }))}
                              className="bg-black/30 text-white rounded-full p-1"><ChevronRight size={14} /></button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                          <p className="text-orange-500 font-bold mt-2">${parseFloat(item.price).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {qty > 0 ? (
                            <>
                              <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                <Minus size={14} />
                              </button>
                              <span className="w-5 text-center font-bold text-gray-800">{qty}</span>
                            </>
                          ) : null}
                          <button onClick={() => addItem(item.id)} disabled={totalItems >= 3}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${totalItems >= 3 && !qty ? 'bg-gray-100 text-gray-300' : 'bg-orange-500 text-white active:scale-90'}`}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {totalItems === 0 && items.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">Select up to 3 items</p>
      )}

      {/* Cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4">
          <button onClick={goToOrder}
            className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold shadow-lg flex items-center justify-between px-5 active:scale-95 transition">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            </div>
            <span>Place Order · ${totalAmount.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
