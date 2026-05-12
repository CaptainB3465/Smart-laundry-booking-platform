import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { SettingsProvider } from './context/SettingsContext';
import app from './firebase';
import './index.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Login = lazy(() => import('./pages/Auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Auth/Register').then(module => ({ default: module.Register })));
const BookingForm = lazy(() => import('./pages/Booking/BookingForm').then(module => ({ default: module.BookingForm })));
const BookingSuccess = lazy(() => import('./pages/Booking/BookingSuccess').then(module => ({ default: module.BookingSuccess })));
const UserDashboard = lazy(() => import('./pages/Dashboard/UserDashboard').then(module => ({ default: module.UserDashboard })));
const AdminDashboard = lazy(() => import('./pages/Dashboard/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Settings = lazy(() => import('./pages/Dashboard/Settings').then(module => ({ default: module.Settings })));

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
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
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
