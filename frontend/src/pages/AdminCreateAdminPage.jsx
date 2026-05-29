import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { RefreshCcw, UsersRound } from "lucide-react";
import { getApiErrorMessage } from "../utils/authApi";

const ROLE_OPTIONS = ["ROLE_USER", "ROLE_ADMIN", "ROLE_STUDENT", "ROLE_STAFF", "ROLE_TECHNICIAN"];

function AdminCreateAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    setError("");
    setSuccessMessage("");
    try {
      setLoading(true);
      const { data } = await API.get("/admin/users");
      const list = Array.isArray(data) ? data : [];
      setUsers(list);

      const nextSelected = {};
      list.forEach((user) => {
        nextSelected[user.id] = user.role;
      });
      setSelectedRoles(nextSelected);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [users]
  );

  const saveRole = async (user) => {
    const selectedRole = selectedRoles[user.id];
    if (!selectedRole || selectedRole === user.role) return;

    setSavingUserId(user.id);
    setError("");
    setSuccessMessage("");
    try {
      const { data } = await API.put(`/admin/users/${user.id}/role`, {
        role: selectedRole,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                role: data?.role || selectedRole,
              }
            : item
        )
      );

      setSuccessMessage(data?.message || "Role updated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update role."));
    } finally {
      setSavingUserId(null);
    }
  };

  const getDisplayRole = (role) => String(role || "").replace("ROLE_", "");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UsersRound className="w-7 h-7 text-slate-800" />
          <h1 className="text-4xl font-black tracking-tight text-slate-900">User Role Management</h1>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
          disabled={loading}
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr className="text-left text-slate-700 text-sm font-black">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4">New Role</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-10 text-sm text-slate-500" colSpan={6}>Loading users...</td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-sm text-slate-500" colSpan={6}>No users found.</td>
              </tr>
            ) : (
              sortedUsers.map((user) => {
                const selectedRole = selectedRoles[user.id] || user.role;
                const saving = savingUserId === user.id;

                return (
                  <tr key={user.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-6 py-4 text-slate-800 font-semibold">{user.name || "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{user.email || "-"}</td>
                    <td className="px-6 py-4 text-slate-700 uppercase">{user.provider || "LOCAL"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black tracking-wide uppercase">
                        {getDisplayRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="w-full md:w-56 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-700 text-sm outline-none focus:border-emerald-500"
                        value={selectedRole}
                        onChange={(e) =>
                          setSelectedRoles((prev) => ({
                            ...prev,
                            [user.id]: e.target.value,
                          }))
                        }
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {getDisplayRole(role)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => saveRole(user)}
                        disabled={saving || selectedRole === user.role}
                        className="inline-flex items-center justify-center min-w-20 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCreateAdminPage;

