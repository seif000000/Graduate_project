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
export const getAllRequests = () => api.get('/requests/all');
export const getMedicineAnalytics = () => api.get('/requests/stats/analytics');

// ─── Profile ──────────────────────────────────────────────────────────────
export const getMyProfile = () => api.get('/users/me');
export const updateMyProfile = (data) => api.patch('/users/me', data);

// ─── Medicine & Donations ─────────────────────────────────────────────────
export const getInventory = (q) => api.get(`/medicine/inventory${q ? `?q=${q}` : ''}`);
export const donateMedicine = (data) => api.post('/medicine/donate', data);

// ─── Pharmacy Inventory & Stats ───────────────────────────────────────────
export const getPharmacyInventory = () => api.get('/inventory/pharmacy');
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

export default api;
