import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Donate from './pages/Donate';
import Map from './pages/Map';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import HealthAI from './pages/HealthAI';
import Admin from './pages/Admin';
import Verification from './pages/Verification';
import Login from './pages/Login';
import Register from './pages/Register';
import PharmacyInventory from './pages/PharmacyInventory';
import NearExpiry from './pages/NearExpiry';
import Chatbot from './components/Chatbot';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Inbox from './pages/Inbox';
import HelpCenter from './pages/HelpCenter';
import UsersManagement from './pages/UsersManagement';
import MedicinesAnalytics from './pages/MedicinesAnalytics';
import Reports from './pages/Reports';
import PharmacyStats from './pages/PharmacyStats';
import PricingControl from './pages/PricingControl';
import MyRequests from './pages/MyRequests';
import MedicalHistory from './pages/MedicalHistory';
import MyVouchers from './pages/MyVouchers';
import AccountVerification from './pages/AccountVerification';
import Community from './pages/Community';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={true} />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/map" element={<Map />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/health-ai" element={<HealthAI />} />
          <Route path="/pharmacy/stats" element={<PharmacyStats />} />
          <Route path="/pharmacy/pricing" element={<PricingControl />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
          <Route path="/vouchers" element={<MyVouchers />} />
          <Route path="/account-verification" element={<AccountVerification />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/analytics" element={<MedicinesAnalytics />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/pharmacy-inventory" element={<PharmacyInventory />} />
          <Route path="/near-expiry" element={<NearExpiry />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </MainLayout>
      <Chatbot />
    </Router>
  );
}

export default App;
