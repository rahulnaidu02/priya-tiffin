export default function ClosedPage() {
  return (
    <div className="min-h-dvh bg-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Orders Closed</h1>
        <p className="text-gray-500 max-w-xs mx-auto">
          The order window for this week has closed. Check back when Priya shares the next week's menu!
        </p>
      </div>
    </div>
  )
}
