import axios from 'axios';

// Use environment variable, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const verifyPharmacy = (userId) => api.post(`/auth/verify-pharmacy/${userId}`);
export const getUnverifiedPharmacies = () => api.get('/auth/unverified-pharmacies');
export const getMyRequests = () => api.get('/requests/me');
export const updateMyRequest = (id, data) => api.patch(`/requests/my-request/${id}`, data);
export const deleteMyRequest = (id) => api.delete(`/requests/my-request/${id}`);
export const getAllRequests = () => api.get('/requests/all');
export const getMedicineAnalytics = () => api.get('/requests/stats/analytics');

// ─── Profile ──────────────────────────────────────────────────────────────
export const getMyProfile = () => api.get('/users/me');
export const updateMyProfile = (data) => api.patch('/users/me', data);
export const verifyDocuments = (formData) => api.post('/users/me/verify-documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// ─── Dashboard ────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/me');

// ─── Medicine & Donations ─────────────────────────────────────────────────
export const getInventory = (q) => api.get(`/medicine/inventory${q ? `?q=${q}` : ''}`);
export const donateMedicine = (data) => api.post('/medicine/donate', data);
export const getMyDonations = () => api.get('/medicine/me');
export const updateDonation = (id, data) => api.patch(`/medicine/donation/${id}`, data);
export const deleteDonation = (id) => api.delete(`/medicine/donation/${id}`);

// ─── Pharmacy Inventory & Stats ───────────────────────────────────────────
export const getPharmacyInventory = () => api.get('/inventory/pharmacy');
export const addPharmacyInventory = (data) => api.post('/inventory/pharmacy', data);
export const updatePharmacyInventory = (id, data) => api.patch(`/inventory/pharmacy/${id}`, data);
export const deletePharmacyInventory = (id) => api.delete(`/inventory/pharmacy/${id}`);
export const getNearExpiry = () => api.get('/inventory/near-expiry');
export const getPharmacyStats = () => api.get('/users/pharmacy/stats');

// ─── Emergency / SOS ─────────────────────────────────────────────────────
export const getEmergencyBoard = () => api.get('/requests/emergency-board');
export const createSOSRequest = (data) => api.post('/requests/emergency', data);
export const respondToSOS = (requestId, message) =>
  api.post(`/requests/respond/${requestId}?message=${encodeURIComponent(message)}`);

// ─── Admin ────────────────────────────────────────────────────────────────
export const getAllUsers = (role) => api.get(`/users/${role ? `?role=${role}` : ''}`);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
export const adminDeleteRequest = (requestId) => api.delete(`/requests/admin/request/${requestId}`);
export const getAdminStats = () => api.get('/users/admin/stats');
export const getMyNotifications = () => api.get('/users/me/notifications');
export const markNotificationsRead = () => api.post('/users/me/notifications/read-all');
export const getAdminReports = () => api.get('/users/admin/reports');
export const submitReport = (data) => api.post('/users/me/report', data);

// ─── Health AI ────────────────────────────────────────────────────────────
export const askAI = (message) => api.post('/chat/ask', { message });

// ─── Vouchers ─────────────────────────────────────────────────────────────
export const getMyVouchers = () => api.get('/vouchers/me');
export const redeemVoucher = (voucherId) => api.post(`/vouchers/redeem/${voucherId}`);

// ─── Medical History ──────────────────────────────────────────────────────
export const getMedicalReports = () => api.get('/medical-history/reports');
export const getMedicationLogs = () => api.get('/medical-history/logs');
export const uploadMedicalReport = (data) => api.post('/medical-history/reports', data);

// ─── Inbox (Chat) ─────────────────────────────────────────────────────────
export const getInboxChats = () => api.get('/inbox/chats');
export const getInboxMessages = (userId) => api.get(`/inbox/messages/${userId}`);
export const sendInboxMessage = (data) => api.post('/inbox/messages', data);

export default api;
