import imageCompression from 'browser-image-compression'
import { format, parseISO, isAfter } from 'date-fns'

export async function compressImage(file) {
  return imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1080,
    useWebWorker: true,
  })
}

export function formatDate(dateStr) {
  return format(parseISO(dateStr), 'EEE, MMM d')
}

export function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const d = new Date(); d.setHours(+h, +m)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function isExpired(deadline) {
  if (!deadline) return false
  return isAfter(new Date(), parseISO(deadline))
}

export function isAdminAuthed() {
  return sessionStorage.getItem('priya_admin') === import.meta.env.VITE_ADMIN_PASS
}

export function setAdminAuth(pass) {
  if (pass === import.meta.env.VITE_ADMIN_PASS) {
    sessionStorage.setItem('priya_admin', pass)
    return true
  }
  return false
}

export function clearAdminAuth() {
  sessionStorage.removeItem('priya_admin')
}

export function groupByDay(items) {
  return items.reduce((acc, item) => {
    const day = item.pickup_day
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {})
}
