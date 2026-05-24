import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { Archive, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ArchivePage() {
  const [currentWeek, setCurrentWeek] = useState(null)
  const [archived, setArchived] = useState([])
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: weeks } = await supabase.from('weeks').select('*').order('created_at', { ascending: false })
    const current = weeks?.find(w => w.status === 'closed')
    setCurrentWeek(current || null)
    setArchived(weeks?.filter(w => w.status === 'archived') || [])
    setLoading(false)
  }

  async function archiveWeek() {
    if (!currentWeek) return
    setArchiving(true)

    // Get all items for item_library upsert
    const { data: items } = await supabase.from('menu_items').select('*').eq('week_id', currentWeek.id)
    for (const item of items || []) {
      const { data: existing } = await supabase.from('item_library').select('id, use_count').eq('name', item.name).single()
      if (existing) {
        await supabase.from('item_library').update({ last_price: item.price, use_count: existing.use_count + 1, image_urls: item.image_urls }).eq('id', existing.id)
      } else {
        await supabase.from('item_library').insert({ name: item.name, description: item.description, image_urls: item.image_urls, last_price: item.price })
      }
    }

    await supabase.from('weeks').update({ status: 'archived' }).eq('id', currentWeek.id)
    toast.success('Week archived! Start a new menu anytime.')
    setCurrentWeek(null)
    load()
    setArchiving(false)
  }

  async function loadWeekOrders(weekId) {
    if (expanded[weekId]) { setExpanded(e => ({ ...e, [weekId]: null })); return }
    const { data } = await supabase.from('orders').select('*, order_items(menu_item_name, quantity, menu_item_price)').eq('week_id', weekId)
    setExpanded(e => ({ ...e, [weekId]: data || [] }))
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Archive</h2>

      {currentWeek && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <h3 className="font-bold text-orange-800 mb-1">Ready to archive: {currentWeek.title}</h3>
          <p className="text-sm text-orange-600 mb-3">Orders are closed. Archive this week to start a fresh menu. Item names and photos will be saved to your library.</p>
          <button onClick={archiveWeek} disabled={archiving}
            className="w-full bg-orange-500 text-white rounded-xl py-2.5 font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition active:scale-95 disabled:opacity-60">
            <Archive size={16} />
            {archiving ? 'Archiving...' : 'Archive This Week'}
          </button>
        </div>
      )}

      {!currentWeek && archived.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          <div className="text-4xl mb-2">📦</div>
          <p>No archived weeks yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {archived.map(week => (
          <div key={week.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button onClick={() => loadWeekOrders(week.id)} className="w-full p-4 text-left flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{week.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">Archived</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded[week.id] ? 'rotate-180' : ''}`} />
            </button>

            {expanded[week.id] && (
              <div className="px-4 pb-4 border-t border-gray-50">
                {expanded[week.id].length === 0 && <p className="text-sm text-gray-400 py-2">No orders this week.</p>}
                <div className="space-y-2 mt-2">
                  {expanded[week.id].map(order => (
                    <div key={order.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-gray-700">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${order.total_amount}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {expanded[week.id].length > 0 && (
                  <p className="text-sm text-gray-500 mt-3 font-medium">
                    Total: ${expanded[week.id].reduce((s, o) => s + parseFloat(o.total_amount || 0), 0).toFixed(2)} · {expanded[week.id].length} orders
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
