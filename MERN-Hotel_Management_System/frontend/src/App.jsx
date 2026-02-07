import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import RoomManagement from './pages/RoomManagement';
import ReservationManagement from './pages/ReservationManagement';
import BillingDashboard from './pages/BillingDashboard';
import HousekeepingDashboard from './pages/HousekeepingDashboard';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManagement from './pages/UserManagement';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Rooms from './pages/Rooms';
import Booking from './pages/Booking';
import Contact from './pages/Contact';

import GuestDashboard from './pages/GuestDashboard';

const ThemeWrapper = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Only apply if user is NOT logged in or has no server preference
    // AuthContext handles the server-side preference sync
    if (!user?.preferences?.theme) {
      const storedTheme = localStorage.getItem('appTheme') || 'light';
      const root = document.documentElement;
      root.classList.remove('dark', 'glass');
      if (storedTheme === 'dark') root.classList.add('dark');
      if (storedTheme === 'glass') root.classList.add('glass');
    }
  }, [user]);

  return children;
};

const DashboardIndex = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      if (user?.department === 'Management') return <ManagerDashboard />;
      if (user?.department === 'Housekeeping') return <HousekeepingDashboard />;
      if (user?.department === 'Maintenance') return <HousekeepingDashboard />; // Or MaintenanceDashboard if exists
      return <AdminDashboard />; // Default for Reception/Front Office
    case 'guest':
      return <GuestDashboard />;
    default:
      return <GuestDashboard />;
  }
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeWrapper>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Dashboard Routes (Protected) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardIndex />} />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="rooms"
                  element={
                    <ProtectedRoute roles={['admin', 'staff']}>
                      <RoomManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reservations"
                  element={
                    <ProtectedRoute roles={['admin', 'staff', 'guest']}>
                      <ReservationManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="billing"
                  element={
                    <ProtectedRoute roles={['admin', 'staff']}>
                      <BillingDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="housekeeping"
                  element={
                    <ProtectedRoute roles={['admin', 'staff']}>
                      <HousekeepingDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute roles={['admin', 'staff']}>
                      <ReportsAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </ThemeWrapper>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
