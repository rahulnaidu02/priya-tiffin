import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAdminAuth, isAdminAuthed } from '../../lib/utils'
import { useEffect } from 'react'

export default function AdminLogin() {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdminAuthed()) navigate('/admin/dashboard', { replace: true })
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (setAdminAuth(pass)) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError(true)
      setPass('')
    }
  }

  return (
    <div className="min-h-dvh bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍱</div>
          <h1 className="text-2xl font-bold text-gray-800">Priya's Tiffin</h1>
          <p className="text-gray-500 text-sm mt-1">Admin access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError(false) }}
            placeholder="Enter passphrase"
            className={`w-full border rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 transition ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">Wrong passphrase. Try again.</p>}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold hover:bg-orange-600 active:scale-95 transition"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
