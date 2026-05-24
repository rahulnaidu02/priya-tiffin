import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { compressImage, formatDate, formatTime } from '../../lib/utils'
import { Plus, Trash2, ImagePlus, Share2, X, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays, startOfWeek } from 'date-fns'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getWeekDates() {
  const today = new Date()
  const mon = startOfWeek(today, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => format(addDays(mon, i), 'yyyy-MM-dd'))
}

function emptyItem(pickupDay) {
  return { name: '', description: '', price: '', pickup_day: pickupDay, pickup_time_start: '11:00', pickup_time_end: '13:00', image_urls: [], _files: [] }
}

export default function MenuBuilder() {
  const [week, setWeek] = useState(null)
  const [items, setItems] = useState([])
  const [deadline, setDeadline] = useState('')
  const [venmo, setVenmo] = useState('')
  const [zelle, setZelle] = useState('')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [library, setLibrary] = useState([])
  const [showLibrary, setShowLibrary] = useState(false)
  const weekDates = getWeekDates()

  useEffect(() => { loadWeek() }, [])

  async function loadWeek() {
    setLoading(true)
    const { data: weeks } = await supabase
      .from('weeks')
      .select('*')
      .in('status', ['draft', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (weeks?.length) {
      const w = weeks[0]
      setWeek(w)
      setDeadline(w.order_deadline ? w.order_deadline.slice(0, 16) : '')
      setVenmo(w.payment_venmo || '')
      setZelle(w.payment_zelle || '')
      if (w.status === 'active') setShareUrl(`${window.location.origin}/m/${w.share_token}`)

      const { data: menuItems } = await supabase.from('menu_items').select('*').eq('week_id', w.id).order('pickup_day')
      setItems(menuItems?.map(i => ({ ...i, _files: [] })) || [])
    } else {
      // Create a new draft week automatically
      const { data: newWeek } = await supabase.from('weeks').insert({ title: `Week of ${format(new Date(), 'MMM d')}`, status: 'draft' }).select().single()
      setWeek(newWeek)
    }
    setLoading(false)

    const { data: lib } = await supabase.from('item_library').select('*').order('use_count', { ascending: false }).limit(20)
    setLibrary(lib || [])
  }

  function addItem(day) {
    setItems(prev => [...prev, { ...emptyItem(day), _id: crypto.randomUUID(), _new: true }])
  }

  function removeItem(idx) {
    const item = items[idx]
    if (item.id) {
      supabase.from('menu_items').delete().eq('id', item.id)
    }
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function handleImageUpload(idx, files) {
    const item = items[idx]
    const compressed = await Promise.all(Array.from(files).slice(0, 3 - item.image_urls.length).map(compressImage))
    const urls = await Promise.all(compressed.map(async file => {
      const path = `items/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('tiffin-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('tiffin-images').getPublicUrl(path)
      return data.publicUrl
    }))
    updateItem(idx, 'image_urls', [...item.image_urls, ...urls])
    toast.success('Images uploaded')
  }

  async function saveItems() {
    for (const item of items) {
      const payload = {
        week_id: week.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price) || 0,
        pickup_day: item.pickup_day,
        pickup_time_start: item.pickup_time_start,
        pickup_time_end: item.pickup_time_end,
        image_urls: item.image_urls,
      }
      if (item.id) {
        await supabase.from('menu_items').update(payload).eq('id', item.id)
      } else if (item.name) {
        const { data } = await supabase.from('menu_items').insert(payload).select().single()
        item.id = data?.id
      }
    }

    // Update week settings
    await supabase.from('weeks').update({
      order_deadline: deadline || null,
      payment_venmo: venmo,
      payment_zelle: zelle,
    }).eq('id', week.id)

    toast.success('Saved!')
  }

  async function publish() {
    if (!items.filter(i => i.name).length) return toast.error('Add at least one item first')
    if (!deadline) return toast.error('Set an order deadline')
    setPublishing(true)
    await saveItems()
    const { data } = await supabase.from('weeks').update({ status: 'active' }).eq('id', week.id).select().single()
    setWeek(data)
    const url = `${window.location.origin}/m/${data.share_token}`
    setShareUrl(url)
    toast.success('Published! Share the link.')
    setPublishing(false)
  }

  async function closeOrders() {
    await supabase.from('weeks').update({ status: 'closed' }).eq('id', week.id)
    setWeek(prev => ({ ...prev, status: 'closed' }))
    toast.success('Orders closed')
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied!')
  }

  function useLibraryItem(libItem) {
    const today = weekDates[0]
    setItems(prev => [...prev, {
      ...emptyItem(today),
      _id: crypto.randomUUID(),
      _new: true,
      name: libItem.name,
      description: libItem.description || '',
      image_urls: libItem.image_urls || [],
      price: libItem.last_price || '',
    }])
    setShowLibrary(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  const byDay = weekDates.reduce((acc, d) => {
    acc[d] = items.filter(i => i.pickup_day === d)
    return acc
  }, {})

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">This Week's Menu</h2>
        <button onClick={() => setShowLibrary(true)} className="flex items-center gap-1 text-sm text-orange-600 font-medium">
          <BookOpen size={16} /> Library
        </button>
      </div>

      {/* Order deadline + payment */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Deadline</label>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Venmo</label>
            <input value={venmo} onChange={e => setVenmo(e.target.value)} placeholder="@yourhandle"
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Zelle</label>
            <input value={zelle} onChange={e => setZelle(e.target.value)} placeholder="phone or email"
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>
      </div>

      {/* Items by day */}
      {weekDates.map((date, di) => (
        <div key={date} className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700">{DAYS[di]}</span>
            <span className="text-xs text-gray-400">{formatDate(date)}</span>
          </div>
          {byDay[date].map((item, globalIdx) => {
            const idx = items.indexOf(item)
            return (
              <div key={item.id || item._id} className="bg-white rounded-2xl p-4 mb-2 shadow-sm border border-gray-100">
                <div className="flex gap-2 mb-2">
                  <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)}
                    placeholder="Item name" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                  <input value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)}
                    placeholder="$0" type="number" className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                  <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                  placeholder="Description (optional)" rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-2" />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs text-gray-400">Pickup from</label>
                    <input type="time" value={item.pickup_time_start} onChange={e => updateItem(idx, 'pickup_time_start', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Until</label>
                    <input type="time" value={item.pickup_time_end} onChange={e => updateItem(idx, 'pickup_time_end', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>
                {/* Images */}
                <div className="flex gap-2 flex-wrap">
                  {item.image_urls.map((url, ui) => (
                    <div key={ui} className="relative">
                      <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <button onClick={() => updateItem(idx, 'image_urls', item.image_urls.filter((_, i) => i !== ui))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                  {item.image_urls.length < 3 && (
                    <label className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-400 transition">
                      <ImagePlus size={20} className="text-gray-300" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(idx, e.target.files)} />
                    </label>
                  )}
                </div>
              </div>
            )
          })}
          <button onClick={() => addItem(date)} className="w-full border-2 border-dashed border-orange-200 rounded-2xl py-2.5 text-orange-500 text-sm font-medium flex items-center justify-center gap-1 hover:border-orange-400 transition active:scale-95">
            <Plus size={16} /> Add item for {DAYS[di]}
          </button>
        </div>
      ))}

      {/* Actions */}
      <div className="space-y-2 mt-6">
        <button onClick={saveItems} className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-200 transition active:scale-95">
          Save Draft
        </button>
        {week?.status !== 'active' && week?.status !== 'closed' && (
          <button onClick={publish} disabled={publishing} className="w-full bg-orange-500 text-white rounded-2xl py-3 font-semibold hover:bg-orange-600 transition active:scale-95 disabled:opacity-60">
            {publishing ? 'Publishing...' : 'Publish & Get Link'}
          </button>
        )}
        {week?.status === 'active' && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-green-700 text-sm font-medium mb-2">Menu is live! Share this link:</p>
              <div className="flex gap-2">
                <input readOnly value={shareUrl} className="flex-1 text-xs border border-green-200 rounded-xl px-3 py-2 bg-white" />
                <button onClick={copyLink} className="bg-green-500 text-white px-4 rounded-xl text-sm font-medium flex items-center gap-1">
                  <Share2 size={14} /> Copy
                </button>
              </div>
            </div>
            <button onClick={closeOrders} className="w-full bg-red-50 text-red-600 border border-red-200 rounded-2xl py-3 font-semibold hover:bg-red-100 transition active:scale-95">
              Close Orders Now
            </button>
          </>
        )}
        {week?.status === 'closed' && (
          <div className="bg-gray-100 rounded-2xl p-4 text-center text-gray-500">
            Orders are closed for this week. Go to Archive to start a new week.
          </div>
        )}
      </div>

      {/* Library modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Item Library</h3>
              <button onClick={() => setShowLibrary(false)}><X size={20} /></button>
            </div>
            {library.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No saved items yet. They appear here after archiving a week.</p>}
            {library.map(lib => (
              <button key={lib.id} onClick={() => useLibraryItem(lib)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition border border-transparent hover:border-orange-200 mb-1">
                {lib.image_urls?.[0] && <img src={lib.image_urls[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />}
                <div>
                  <p className="font-medium text-gray-800">{lib.name}</p>
                  <p className="text-xs text-gray-400">${lib.last_price} · used {lib.use_count}x</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
