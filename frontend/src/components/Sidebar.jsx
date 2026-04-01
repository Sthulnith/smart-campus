import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
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

      </nav>

    </div>
  );
}

export default Sidebar;