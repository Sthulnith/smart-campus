import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import ResourcePage from "./pages/ResourcePage";
import BookingPage from "./pages/BookingPage";
import TicketPage from "./pages/TicketPage";

function App() {
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
            </Routes>

          </div>

        </div>
      </div>
    </Router>
  );
}

export default App;