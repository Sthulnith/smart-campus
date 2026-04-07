import React from "react";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <span className="text-gray-600">
        {user ? `Welcome, ${user.name} (${user.role.replace("ROLE_", "")})` : "Welcome"}
      </span>
    </div>
  );
}

export default Header;