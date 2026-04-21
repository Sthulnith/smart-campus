import React, { useEffect, useState } from "react";
import API from "../services/api";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to load notifications");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>

      <div className="bg-white p-6 rounded-xl shadow-md">
        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-lg shadow-sm border flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{n.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 rounded text-white text-sm ${
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