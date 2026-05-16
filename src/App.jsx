import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { BookingForm } from './pages/Booking/BookingForm';
import { BookingSuccess } from './pages/Booking/BookingSuccess';
import { UserDashboard } from './pages/Dashboard/UserDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';
import { Settings } from './pages/Dashboard/Settings';
import { SettingsProvider } from './context/SettingsContext';
import app from './firebase';
import './index.css';

console.log("Firebase App Initialized:", app);

// Protected Route for Authenticated Users
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route to redirect authenticated users AWAY from login/signup
const PublicOnlyRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (currentUser) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

// Wrapper to redirect Admins away from Customer Booking
const BookingWrapper = ({ children }) => {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          }>
            <Routes>
            {/* Landing Page without standard App Layout to allow full screen Hero */}
            <Route path="/" element={<Home />} />

            {/* Auth Layout - Strict separation for Login/Register */}
            <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* App Layout - For Dashboard and internal pages */}
            <Route element={<AppLayout />}>
              <Route 
                path="/booking" 
                element={
                  <ProtectedRoute>
                    <BookingWrapper>
                      <BookingForm />
                    </BookingWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking/success" 
                element={
                  <ProtectedRoute>
                    <BookingSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
