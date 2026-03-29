import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('healthlens_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/update-profile', data);

// Lab Reports
export const addReport = (data) => API.post('/reports', data);
export const getReports = () => API.get('/reports');
export const getReport = (id) => API.get(`/reports/${id}`);
export const updateReport = (id, data) => API.put(`/reports/${id}`, data);
export const deleteReport = (id) => API.delete(`/reports/${id}`);
export const getReportStats = () => API.get('/reports/stats/summary');
export const compareReports = () => API.get('/reports/compare');
export const seedDemoData = () => API.post('/reports/seed');

// Alerts
export const getAlerts = () => API.get('/alerts');

// AI
export const extractPdf = (formData) => API.post('/ai/extract-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const predictRisk = (data) => API.post('/ai/predict-risk', data);
export const simulateLifestyle = (data) => API.post('/ai/simulate-lifestyle', data);
export const getDoctorSummary = () => API.post('/ai/doctor-summary', {});
export const getExplainableAI = (data) => API.post('/ai/explainable-ai', data);
export const healthChat = (data) => API.post('/ai/health-chat', data);
export const getNutritionPlan = (data) => API.post('/ai/nutrition-plan', data);
export const getWeeklyDigest = () => API.get('/ai/weekly-digest');

export default API;
