import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import UserBookingPage from "./pages/UserBookingPage";
import AdminBookingPage from "./pages/AdminBookingPage";
import AdminCreateAdminPage from "./pages/AdminCreateAdminPage";
import AdminTicketPage from "./pages/AdminTicketPage";
import TechnicianTicketPage from "./pages/TechnicianTicketPage";
import ResourcePage from "./pages/ResourcePage";
import TicketPage from "./pages/TicketPage";
import DashboardPage from "./pages/DashboardPage";
import BookingAnalysisPage from "./pages/BookingAnalysisPage";

function AppLayout() {
  const { isAdmin, isTechnician } = useAuth();

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header />

        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/facilities" element={<ResourcePage />} />
            <Route 
              path="/bookings" 
              element={isAdmin ? <Navigate to="/admin-bookings" replace /> : <UserBookingPage />} 
            />
            <Route path="/tickets" element={isAdmin ? <Navigate to="/admin-tickets" replace /> : isTechnician ? <Navigate to="/technician-tickets" replace /> : <TicketPage />} />
            <Route path="/notifications" element={<div className="p-8 text-center font-bold text-slate-400">Notifications coming soon...</div>} />
            <Route path="/profile" element={<div className="p-8 text-center font-bold text-slate-400">Profile page coming soon...</div>} />
            <Route path="/booking-analysis" element={<BookingAnalysisPage />} />
            
            <Route
              path="/admin-bookings"
              element={
                <AdminRoute>
                  <AdminBookingPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/create-admin"
              element={
                <AdminRoute>
                  <AdminCreateAdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-tickets"
              element={
                <AdminRoute>
                  <AdminTicketPage />
                </AdminRoute>
              }
            />
            <Route path="/technician-tickets" element={<TechnicianTicketPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;