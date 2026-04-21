import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Sidebar() {
  const { isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-blue-700 text-white min-h-screen p-6 space-y-6">
      
      <h1 className="text-xl font-bold">Smart Campus</h1>

      <nav className="space-y-3">

        <NavLink
          to="/resources"
          className={({ isActive }) =>
            isActive
              ? "block bg-blue-600 p-2 rounded"
              : "block hover:bg-blue-600 p-2 rounded"
          }
        >
          Resources
        </NavLink>

        <NavLink
          to="/bookings"
          className={({ isActive }) =>
            isActive
              ? "block bg-blue-600 p-2 rounded"
              : "block hover:bg-blue-600 p-2 rounded"
          }
        >
          Bookings
        </NavLink>

        <NavLink
          to="/tickets"
          className={({ isActive }) =>
            isActive
              ? "block bg-blue-600 p-2 rounded"
              : "block hover:bg-blue-600 p-2 rounded"
          }
        >
          Tickets
        </NavLink>

        {isAdmin && (
          <>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                isActive
                  ? "block bg-blue-600 p-2 rounded"
                  : "block hover:bg-blue-600 p-2 rounded"
              }
            >
              Notifications
            </NavLink>

            <NavLink
              to="/admin-bookings"
              className={({ isActive }) =>
                isActive
                  ? "block bg-blue-600 p-2 rounded"
                  : "block hover:bg-blue-600 p-2 rounded"
              }
            >
              Admin Bookings
            </NavLink>

            <NavLink
              to="/admin/create-admin"
              className={({ isActive }) =>
                isActive
                  ? "block bg-blue-600 p-2 rounded"
                  : "block hover:bg-blue-600 p-2 rounded"
              }
            >
              Create Admin
            </NavLink>
          </>
        )}

      </nav>

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;