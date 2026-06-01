import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

// Layouts
import LayoutAdmin from './components/layouts/LayoutAdmin';
import LayoutPharmacy from './components/layouts/LayoutPharmacy';
import LayoutUser from './components/layouts/LayoutUser';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// User / Shared Pages
import Search from './pages/Search';
import Donate from './pages/Donate';
import Map from './pages/Map';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import HealthAI from './pages/HealthAI';
import Verification from './pages/Verification';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Inbox from './pages/Inbox';
import HelpCenter from './pages/HelpCenter';
import MyRequests from './pages/MyRequests';
import MedicalHistory from './pages/MedicalHistory';
import MyVouchers from './pages/MyVouchers';
import MyDonations from './pages/MyDonations';
import AccountVerification from './pages/AccountVerification';
import Community from './pages/Community';

// Admin Pages
import Admin from './pages/Admin';
import UsersManagement from './pages/UsersManagement';
import MedicinesAnalytics from './pages/MedicinesAnalytics';
import Reports from './pages/Reports';

// Pharmacy Pages
import PharmacyInventory from './pages/PharmacyInventory';
import NearExpiry from './pages/NearExpiry';
import PharmacyStats from './pages/PharmacyStats';
import PricingControl from './pages/PricingControl';

import ChatbotGate from './components/ChatbotGate';

// Helper component to add titles dynamically
function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={true} />
        <Routes>
          {/* Public — landing & auth (guests only) */}
          <Route path="/" element={
            <GuestRoute><Landing /></GuestRoute>
          } />
          <Route path="/login" element={
            <GuestRoute><Login /></GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute><Register /></GuestRoute>
          } />
          <Route path="/unauthorized" element={
            <div className="flex bg-[#FAF9F6] min-h-screen items-center justify-center">
              <div className="text-center space-y-4">
                <h1 className="text-6xl font-black text-red-500">403</h1>
                <p className="text-xl font-bold">غير مصرح لك بالوصول لهذه الصفحة</p>
                <div className="pt-4">
                   <button onClick={() => window.history.back()} className="btn-primary px-8">عودة للخلف</button>
                </div>
              </div>
            </div>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="لوحة التحكم"><Admin /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="إدارة المستخدمين"><UsersManagement /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="إحصائيات الأدوية"><MedicinesAnalytics /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="سجلات النظام والشكاوى"><Reports /></LayoutAdmin>
            </ProtectedRoute>
          } />

          {/* Pharmacy Routes */}
          <Route path="/pharmacy/inventory" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="مخزون الصيدلية"><PharmacyInventory /></LayoutPharmacy>
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/near-expiry" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="الأدوية قرب الانتهاء"><NearExpiry /></LayoutPharmacy>
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/stats" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="إحصائيات الصيدلية"><PharmacyStats /></LayoutPharmacy>
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/pricing" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="التحكم في الأسعار"><PricingControl /></LayoutPharmacy>
            </ProtectedRoute>
          } />

          {/* User app — requires login */}
          <Route path="/search" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="البحث عن دواء"><Search /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="الخريطة التفاعلية"><Map /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/help-center" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="مركز المساعدة"><HelpCenter /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/donate" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="تبرع بدواء"><Donate /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <LayoutUser title="لوحة المتبرع"><Dashboard /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/emergency" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="طلبات الاستغاثة"><Emergency /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/health-ai" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="مساعد المزمن"><HealthAI /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/verification" element={
             <ProtectedRoute>
                <LayoutUser title="دواء مجاني"><Verification /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/account-verification" element={
             <ProtectedRoute>
                <LayoutUser title="تحقق الهوية"><AccountVerification /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/requests" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="طلباتي"><MyRequests /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/my-donations" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="تبرعاتي"><MyDonations /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/vouchers" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="كوبونات الخصم"><MyVouchers /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/medical-history" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="السجل الطبي"><MedicalHistory /></LayoutUser>
             </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
             <ProtectedRoute>
                <LayoutUser title="الملف الشخصي"><Profile /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/settings" element={
             <ProtectedRoute>
                <LayoutUser title="الإعدادات"><Settings /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/notifications" element={
             <ProtectedRoute>
                <LayoutUser title="الإشعارات"><Notifications /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/inbox" element={
             <ProtectedRoute>
                <LayoutUser title="الرسائل"><Inbox /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/community" element={
             <ProtectedRoute>
                <LayoutUser title="المجتمع"><Community /></LayoutUser>
             </ProtectedRoute>
          } />

          {/* Redirect /pharmacy-inventory to new route */}
          <Route path="/pharmacy-inventory" element={<Navigate to="/pharmacy/inventory" replace />} />
          <Route path="/near-expiry" element={<Navigate to="/pharmacy/near-expiry" replace />} />
          
        </Routes>
        <ChatbotGate />
      </Router>
    </AuthProvider>
  );
}

export default App;
