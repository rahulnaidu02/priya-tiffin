import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './pages/admin/AdminLogin'
import MenuBuilder from './pages/admin/MenuBuilder'
import Dashboard from './pages/admin/Dashboard'
import PaymentTracker from './pages/admin/PaymentTracker'
import ArchivePage from './pages/admin/ArchivePage'
import DevInfo from './pages/admin/DevInfo'
import AskAI from './pages/admin/AskAI'
import MenuView from './pages/customer/MenuView'
import OrderForm from './pages/customer/OrderForm'
import OrderConfirm from './pages/customer/OrderConfirm'
import MyOrders from './pages/customer/MyOrders'
import ClosedPage from './pages/ClosedPage'
import AdminLayout from './components/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer routes */}
        <Route path="/m/:token" element={<MenuView />} />
        <Route path="/m/:token/order" element={<OrderForm />} />
        <Route path="/confirmed/:orderId" element={<OrderConfirm />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/closed" element={<ClosedPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="menu" element={<MenuBuilder />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="payments" element={<PaymentTracker />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="dev" element={<DevInfo />} />
          <Route path="ask" element={<AskAI />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
