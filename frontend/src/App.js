import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UserBookingPage from "./pages/UserBookingPage";
import AdminBookingPage from "./pages/AdminBookingPage";
import ResourcePage from "./pages/ResourcePage";
import BookingPage from "./pages/BookingPage";
import TicketPage from "./pages/TicketPage";

function AppLayout() {
  return (
    <Router>
     
      <div className="flex">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 bg-gray-100 min-h-screen">

          <Header />

          <div className="p-6">

            <Routes>
              <Route path="/" element={<ResourcePage />} />
              <Route path="/resources" element={<ResourcePage />} />
              <Route path="/bookings" element={<BookingPage />} />
              <Route path="/tickets" element={<TicketPage />} />
              <Route path="/user-bookings" element={<UserBookingPage />} />
              <Route path="/admin-bookings" element={<AdminBookingPage />} />
            </Routes>

          </div>

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