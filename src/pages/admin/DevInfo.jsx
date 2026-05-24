import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

const GITHUB_DEVNOTES = 'https://github.com/rahulnaidu02/priya-tiffin/blob/main/DEVNOTES.md'

const stack = [
  {
    group: 'Frontend',
    items: [
      { name: 'React 18', role: 'UI component framework', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { name: 'Vite', role: 'Build tool and dev server', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { name: 'Tailwind CSS v4', role: 'Utility-first styling', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      { name: 'React Router v6', role: 'Client-side routing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { name: 'vite-plugin-pwa', role: 'PWA manifest and service worker', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    ],
  },
  {
    group: 'Backend and Data',
    items: [
      { name: 'Supabase', role: 'PostgreSQL database and image storage', color: 'bg-green-50 text-green-700 border-green-200' },
    ],
  },
  {
    group: 'Hosting and Deploy',
    items: [
      { name: 'Vercel', role: 'Hosting, CDN, and auto-deploys', color: 'bg-gray-800 text-white border-gray-700' },
      { name: 'GitHub', role: 'Version control and deploy trigger', color: 'bg-gray-50 text-gray-700 border-gray-300' },
    ],
  },
  {
    group: 'Integrations',
    items: [
      { name: 'Twilio', role: 'SMS pickup reminders to customers', color: 'bg-red-50 text-red-700 border-red-200' },
    ],
  },
  {
    group: 'Libraries used in the codebase',
    items: [
      { name: 'date-fns', role: 'Timezone-safe date formatting', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      { name: 'Lucide React', role: 'Icon set (SVG components)', color: 'bg-orange-50 text-orange-700 border-orange-200' },
      { name: 'react-hot-toast', role: 'Toast notifications', color: 'bg-pink-50 text-pink-700 border-pink-200' },
      { name: 'browser-image-compression', role: 'Compress photos before upload', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ],
  },
]

const metrics = [
  { label: 'Orders per week', desc: 'Total orders placed per published week', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { label: 'Revenue per week', desc: 'Sum of total_amount across all orders', color: 'bg-green-50 border-green-200 text-green-800' },
  { label: 'Payment collected %', desc: 'Orders marked Paid vs. total orders', color: 'bg-green-50 border-green-200 text-green-800' },
  { label: 'No-show rate', desc: 'Orders marked No-show vs. total orders', color: 'bg-red-50 border-red-200 text-red-800' },
  { label: 'Most ordered items', desc: 'Items by order_items quantity across weeks', color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { label: 'Repeat customer rate', desc: 'Phones that appear in more than one week', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { label: 'Average order value', desc: 'Total revenue divided by number of orders', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  { label: 'SMS opt-in rate', desc: 'Orders where sms_reminders = true', color: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
]

function Arrow() {
  return (
    <div className="flex justify-center my-1">
      <div className="flex flex-col items-center">
        <div className="w-px h-4 bg-orange-300" />
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-orange-400" />
      </div>
    </div>
  )
}

function Box({ label, sub, color = 'bg-white border-gray-200' }) {
  return (
    <div className={`border rounded-xl px-4 py-2.5 mx-auto max-w-xs text-center ${color}`}>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function DevInfo() {
  return (
    <div className="p-4 max-w-lg mx-auto pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dev Notes</h2>
          <p className="text-xs text-gray-400">Internal view</p>
        </div>
        <a
          href={GITHUB_DEVNOTES}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs bg-gray-800 text-white px-3 py-2 rounded-xl font-medium hover:bg-gray-700 transition">
          <ExternalLink size={13} />
          Full Story on GitHub
        </a>
      </div>

      {/* Architecture Flow */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-bold text-gray-800 mb-4">Architecture Flow</h3>

        {/* Deploy pipeline */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Deploy Pipeline</p>
        <Box label="Code pushed to GitHub" sub="rahulnaidu02/priya-tiffin (main branch)" color="bg-gray-50 border-gray-200" />
        <Arrow />
        <Box label="Vercel detects push" sub="Auto-builds React app in ~60 seconds" color="bg-gray-800 border-gray-700 [&_p]:text-white [&_.text-gray-400]:text-gray-300" />
        <Arrow />
        <Box label="Live at priya-tiffin.vercel.app" sub="Served globally via Vercel CDN" color="bg-gray-50 border-gray-200" />

        <div className="border-t border-dashed border-gray-200 my-4" />

        {/* App runtime */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">App Runtime</p>
        <Box label="Priya creates weekly menu" sub="Items, photos, deadline, Venmo/Zelle" color="bg-orange-50 border-orange-200" />
        <Arrow />
        <Box label="Supabase (PostgreSQL)" sub="weeks + menu_items tables" color="bg-green-50 border-green-200" />
        <Arrow />
        <Box label="Publish generates share token" sub="One unique link per week" color="bg-orange-50 border-orange-200" />
        <Arrow />
        <Box label="Customer opens WhatsApp link" sub="No install, no login" color="bg-white border-gray-200" />
        <Arrow />
        <Box label="Browse, add to cart, place order" sub="Name, phone, SMS opt-in" color="bg-white border-gray-200" />
        <Arrow />
        <Box label="Order saved to Supabase" sub="orders + order_items tables" color="bg-green-50 border-green-200" />

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Arrow />
            <div className="border rounded-xl px-3 py-2 text-center bg-white border-gray-200">
              <p className="text-xs font-semibold text-gray-700">Customer sees confirmation</p>
              <p className="text-xs text-gray-400 mt-0.5">Pickup days and payment info</p>
            </div>
          </div>
          <div>
            <Arrow />
            <div className="border rounded-xl px-3 py-2 text-center bg-orange-50 border-orange-200">
              <p className="text-xs font-semibold text-gray-700">Priya sees new order</p>
              <p className="text-xs text-gray-400 mt-0.5">Admin dashboard updates</p>
            </div>
          </div>
        </div>

        <Arrow />
        <Box label="Mark Paid and Picked up" sub="PaymentTracker per customer" color="bg-orange-50 border-orange-200" />
        <Arrow />
        <Box label="Archive week" sub="Items saved to reuse library" color="bg-purple-50 border-purple-200" />

        {/* Side services */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 text-center">
            <p className="text-xs font-bold text-green-700">Supabase Storage</p>
            <p className="text-xs text-green-500">Menu photos via CDN public URLs</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
            <p className="text-xs font-bold text-red-700">Twilio SMS</p>
            <p className="text-xs text-red-500">Pickup reminders to customer phones</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-bold text-gray-800 mb-3">Tech Stack</h3>
        <div className="space-y-3">
          {stack.map(group => (
            <div key={group.group}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{group.group}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.map(s => (
                  <div key={s.name} className={`border rounded-xl p-2.5 ${s.color}`}>
                    <p className="text-xs font-bold">{s.name}</p>
                    <p className="text-xs opacity-70 mt-0.5">{s.role}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-1">Metrics to Track</h3>
        <p className="text-xs text-gray-400 mb-3">Key signals for the business, all queryable from Supabase</p>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map(m => (
            <div key={m.label} className={`border rounded-xl p-2.5 ${m.color}`}>
              <p className="text-xs font-bold">{m.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
