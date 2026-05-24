import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ChefHat, CreditCard, Archive, LogOut, Terminal, Sparkles } from 'lucide-react'
import { isAdminAuthed, clearAdminAuth } from '../lib/utils'
import { useEffect } from 'react'

const navItems = [
  { to: '/admin/menu', icon: ChefHat, label: 'Menu' },
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Orders' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/archive', icon: Archive, label: 'Archive' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdminAuthed()) navigate('/admin', { replace: true })
  }, [])

  function logout() {
    clearAdminAuth()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍱</span>
          <span className="font-bold text-lg">Priya's Tiffin</span>
          <span className="text-xs bg-orange-600 px-2 py-0.5 rounded-full ml-1">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/ask')}
            className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 transition px-2.5 py-1.5 rounded-lg text-xs font-semibold">
            <Sparkles size={13} />
            Ask AI
          </button>
          <button
            onClick={() => navigate('/admin/dev')}
            className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 transition px-2.5 py-1.5 rounded-lg text-xs font-semibold">
            <Terminal size={13} />
            Dev
          </button>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-orange-600 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
