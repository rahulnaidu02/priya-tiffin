import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

const GITHUB_DEVNOTES = 'https://github.com/rahulnaidu02/priya-tiffin/blob/main/DEVNOTES.md'

const stack = [
  { name: 'React 18 + Vite', role: 'Frontend + build tool', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Tailwind CSS v4', role: 'Styling (utility-first)', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'React Router v6', role: 'Client-side routing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Supabase', role: 'PostgreSQL DB + image storage', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'vite-plugin-pwa', role: 'PWA + service worker', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Twilio', role: 'SMS pickup reminders', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Vercel', role: 'Hosting + auto-deploys', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { name: 'GitHub', role: 'Version control + CI/CD trigger', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { name: 'date-fns', role: 'Timezone-safe date formatting', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Lucide React', role: 'Icon set', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'react-hot-toast', role: 'Toast notifications', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'browser-image-compression', role: 'Compress images before upload', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]

const decisions = [
  {
    title: 'Share token = customer gate',
    did: 'URL token as access control — no login for customers',
    didnt: 'Accounts, OAuth, email login',
    why: 'Colony customers just need a WhatsApp link. No signup friction.',
  },
  {
    title: 'UTC ISO deadline storage',
    did: 'Convert local time → UTC ISO before saving to Supabase',
    didnt: 'Store raw "2026-06-01T17:42" string',
    why: 'Raw string treated as UTC by Supabase → 6-hour display bug. ISO + timezone conversion fixes it everywhere.',
  },
  {
    title: 'vercel.json SPA rewrite',
    did: 'Rewrite all paths to index.html on Vercel',
    didnt: 'Hash-based routing (#/path)',
    why: 'Clean shareable URLs for WhatsApp. Without this, /m/token returns 404 on direct access.',
  },
  {
    title: 'Client-side image compression',
    did: 'Compress before upload using browser-image-compression',
    didnt: 'Upload raw phone photos (3–8 MB each)',
    why: 'Supabase free tier = 1 GB storage. Phone photos need to be under 200 KB.',
  },
  {
    title: 'Per-item max 3 (not cart cap)',
    did: 'Max 3 quantity per individual dish',
    didnt: 'Total cart limit of 3',
    why: 'User said: "3 of the same dish" — not "only 3 things total". Cart has no hard cap.',
  },
  {
    title: 'sessionStorage for cart + auth',
    did: 'Cart and admin auth in sessionStorage',
    didnt: 'localStorage or cookies',
    why: 'Clears automatically when tab closes. No stale cart from last week, no lingering admin session.',
  },
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

function FlowBox({ label, sub, color = 'bg-white border-gray-200' }) {
  return (
    <div className={`border rounded-xl px-4 py-2.5 mx-auto max-w-xs text-center ${color}`}>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function DevInfo() {
  const navigate = useNavigate()

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dev Notes</h2>
          <p className="text-xs text-gray-400">Internal only — not visible to customers</p>
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

      {/* Tech Stack */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-bold text-gray-800 mb-3">Tech Stack</h3>
        <div className="grid grid-cols-2 gap-2">
          {stack.map(s => (
            <div key={s.name} className={`border rounded-xl p-2.5 ${s.color}`}>
              <p className="text-xs font-bold">{s.name}</p>
              <p className="text-xs opacity-70 mt-0.5">{s.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Flow */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-bold text-gray-800 mb-4">Architecture Flow</h3>

        <FlowBox label="Priya creates weekly menu" sub="MenuBuilder → items, deadline, Venmo/Zelle" color="bg-orange-50 border-orange-200" />
        <Arrow />
        <FlowBox label="Supabase (PostgreSQL)" sub="weeks + menu_items tables" color="bg-green-50 border-green-200" />
        <Arrow />
        <FlowBox label="Publish → share_token generated" sub="One unique link per week" color="bg-orange-50 border-orange-200" />
        <Arrow />
        <FlowBox label="WhatsApp link shared" sub="priya-tiffin.vercel.app/m/{token}" color="bg-blue-50 border-blue-200" />
        <Arrow />
        <FlowBox label="Customer opens on phone" sub="No install, no login needed" color="bg-white border-gray-200" />
        <Arrow />
        <FlowBox label="Browse → Cart → Order Form" sub="Name + phone, SMS opt-in" color="bg-white border-gray-200" />
        <Arrow />
        <FlowBox label="Order saved to Supabase" sub="orders + order_items tables" color="bg-green-50 border-green-200" />

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Arrow />
            <FlowBox label="Customer sees confirmation" sub="Pickup days + payment info" color="bg-white border-gray-200" />
          </div>
          <div>
            <Arrow />
            <FlowBox label="Admin Dashboard updates" sub="Priya sees new order" color="bg-orange-50 border-orange-200" />
          </div>
        </div>

        <Arrow />
        <FlowBox label="Mark Paid / Picked up / No-show" sub="PaymentTracker" color="bg-orange-50 border-orange-200" />
        <Arrow />
        <FlowBox label="Archive week → Item Library" sub="Dishes saved for reuse next week" color="bg-purple-50 border-purple-200" />

        {/* Side connections */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-center">
            <p className="text-xs font-bold text-indigo-700">Supabase Storage</p>
            <p className="text-xs text-indigo-500">Images → CDN public URLs</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
            <p className="text-xs font-bold text-red-700">Twilio SMS</p>
            <p className="text-xs text-red-500">Pickup reminders → customer phone</p>
          </div>
        </div>
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-center">
          <p className="text-xs font-bold text-gray-700">Deploy pipeline</p>
          <p className="text-xs text-gray-500">git push → GitHub → Vercel auto-build → live in ~60 sec</p>
        </div>
      </div>

      {/* Key Decisions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Key Technical Decisions</h3>
        <div className="space-y-3">
          {decisions.map(d => (
            <div key={d.title} className="border border-gray-100 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-800 mb-1.5">{d.title}</p>
              <div className="grid grid-cols-2 gap-2 mb-1.5">
                <div className="bg-green-50 rounded-lg px-2 py-1.5">
                  <p className="text-xs text-green-600 font-semibold mb-0.5">Did ✓</p>
                  <p className="text-xs text-green-800">{d.did}</p>
                </div>
                <div className="bg-red-50 rounded-lg px-2 py-1.5">
                  <p className="text-xs text-red-500 font-semibold mb-0.5">Skipped ✗</p>
                  <p className="text-xs text-red-700">{d.didnt}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">{d.why}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
