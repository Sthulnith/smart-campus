import React from "react";

function AdminPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Admin Panel</h2>
      <p className="text-gray-700">
        This section is available only to users with the ADMIN role.
      </p>
    </div>
  );
}

export default AdminPage;

