import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import TrendsPage from './pages/TrendsPage';
import PredictPage from './pages/PredictPage';
import SimulatePage from './pages/SimulatePage';
import AlertsPage from './pages/AlertsPage';
import SummaryPage from './pages/SummaryPage';
import HealthChatPage from './pages/HealthChatPage';
import NutritionPage from './pages/NutritionPage';
import ProfilePage from './pages/ProfilePage';
import HealthScanPage from './pages/HealthScanPage';
import SettingsPage from './pages/SettingsPage';

// Layout
import AppLayout from './components/AppLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050508' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Avoid redirecting while checking auth status
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected — wrapped in AppLayout (sidebar) */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/trends" element={<ProtectedRoute><AppLayout><TrendsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/predict" element={<ProtectedRoute><AppLayout><PredictPage /></AppLayout></ProtectedRoute>} />
      <Route path="/simulate" element={<ProtectedRoute><AppLayout><SimulatePage /></AppLayout></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><AppLayout><AlertsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/summary" element={<ProtectedRoute><AppLayout><SummaryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><AppLayout><HealthChatPage /></AppLayout></ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><AppLayout><NutritionPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute><AppLayout><HealthScanPage /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d0d14',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
