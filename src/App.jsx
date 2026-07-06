import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { useLang } from './context/LanguageContext';


// Layouts
import LayoutAdmin from './components/layouts/LayoutAdmin';
import LayoutPharmacy from './components/layouts/LayoutPharmacy';
import LayoutUser from './components/layouts/LayoutUser';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

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
import TeamManagement from './pages/TeamManagement';
import AdminSettings from './pages/AdminSettings';

// Pharmacy Pages
import PharmacyInventory from './pages/PharmacyInventory';
import NearExpiry from './pages/NearExpiry';
import PharmacyStats from './pages/PharmacyStats';
import PricingControl from './pages/PricingControl';

import ChatbotGate from './components/ChatbotGate';

// Bilingual 403 page
function UnauthorizedPage() {
  const { t } = useLang();
  return (
    <div className="flex bg-[#FAF9F6] min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-red-500">{t('page403.title')}</h1>
        <p className="text-xl font-bold text-slate-700">{t('page403.message')}</p>
        <div className="pt-4">
          <button onClick={() => window.history.back()} className="btn-primary px-8">
            {t('page403.back')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component to add titles dynamically
function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#fff',
              color: '#334155',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              borderRadius: '1.5rem',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: '900',
              fontFamily: 'inherit',
            },
            success: {
              style: {
                background: '#F0FDF4',
                color: '#166534',
                border: '1px solid #DCFCE7',
              },
              iconTheme: {
                primary: '#22C55E',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FEE2E2',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }} 
        />
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
          <Route path="/about" element={<About />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="routes.adminDashboard"><Admin /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="routes.usersManagement"><UsersManagement /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="routes.medicinesAnalytics"><MedicinesAnalytics /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="routes.systemLogs"><Reports /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/pharmacies" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="routes.pharmacyVerification"><Admin /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/team" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="routes.teamManagement"><TeamManagement /></LayoutAdmin>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutAdmin title="routes.settings"><AdminSettings /></LayoutAdmin>
            </ProtectedRoute>
          } />

          {/* Pharmacy Routes */}
          <Route path="/pharmacy/inventory" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="routes.pharmacyInventory"><PharmacyInventory /></LayoutPharmacy>
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/near-expiry" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="routes.nearExpiry"><NearExpiry /></LayoutPharmacy>
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/stats" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="routes.pharmacyStats"><PharmacyStats /></LayoutPharmacy>
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/pricing" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <LayoutPharmacy title="routes.pricingControl"><PricingControl /></LayoutPharmacy>
            </ProtectedRoute>
          } />

          {/* User app — requires login */}
          <Route path="/search" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="routes.search"><Search /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="routes.map"><Map /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/help-center" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="routes.helpCenter"><HelpCenter /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/donate" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="routes.donate"><Donate /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <LayoutUser title="routes.donorDashboard"><Dashboard /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/emergency" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="routes.emergency"><Emergency /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/health-ai" element={
            <ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}>
              <LayoutUser title="routes.healthAI"><HealthAI /></LayoutUser>
            </ProtectedRoute>
          } />
          <Route path="/verification" element={
             <ProtectedRoute>
                <LayoutUser title="routes.freeMedicine"><Verification /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/account-verification" element={
             <ProtectedRoute>
                <LayoutUser title="routes.verification"><AccountVerification /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/requests" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="routes.myRequests"><MyRequests /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/my-donations" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="routes.myDonations"><MyDonations /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/vouchers" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="routes.myVouchers"><MyVouchers /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/medical-history" element={
             <ProtectedRoute allowedRoles={['user', 'admin']}>
                <LayoutUser title="routes.medicalHistory"><MedicalHistory /></LayoutUser>
             </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
             <ProtectedRoute>
                <LayoutUser title="routes.profile"><Profile /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/settings" element={
             <ProtectedRoute>
                <LayoutUser title="routes.settings"><Settings /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/notifications" element={
             <ProtectedRoute>
                <LayoutUser title="routes.notifications"><Notifications /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/inbox" element={
             <ProtectedRoute>
                <LayoutUser title="routes.inbox"><Inbox /></LayoutUser>
             </ProtectedRoute>
          } />
          <Route path="/community" element={
             <ProtectedRoute>
                <LayoutUser title="routes.community"><Community /></LayoutUser>
             </ProtectedRoute>
          } />

          {/* Redirect /pharmacy-inventory to new route */}
          <Route path="/pharmacy-inventory" element={<Navigate to="/pharmacy/inventory" replace />} />
          <Route path="/near-expiry" element={<Navigate to="/pharmacy/near-expiry" replace />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
        <ChatbotGate />
      </Router>
    </AuthProvider>
  );
}

export default App;
