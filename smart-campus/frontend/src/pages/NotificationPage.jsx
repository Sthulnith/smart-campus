import React, { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch latest notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-gray-500">
            Total Notifications: {notifications.length}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchNotifications}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        {loading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No notifications available
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-lg shadow-sm border flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-lg">{n.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded text-white text-sm ${
                    n.actionType === "ADD"
                      ? "bg-green-600"
                      : n.actionType === "UPDATE"
                      ? "bg-blue-600"
                      : "bg-red-600"
                  }`}
                >
                  {n.actionType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationPage;