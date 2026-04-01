import React from "react";

function Header() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <span className="text-gray-600">Welcome, Admin</span>
    </div>
  );
}

export default Header;