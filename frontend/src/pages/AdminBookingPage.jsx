import React, { useEffect, useState } from "react";
import API from "../services/api";

function AdminBookingPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const res = await API.get("/bookings");
    setBookings(res.data);
  };

  // CANCEL
  const cancelBooking = async (id) => {
    await API.put(`/bookings/${id}/cancel`);
    fetchBookings();
  };

  // EDIT
  const editBooking = async (b) => {
    const updated = {
      ...b,
      purpose: prompt("New Purpose", b.purpose),
    };

    await API.put(`/bookings/${b.id}`, updated);
    fetchBookings();
  };

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Admin Booking Management</h2>

      {bookings.map((b) => (
        <div key={b.id} className="flex justify-between p-4 bg-gray-50 rounded-lg">

          <div>
            <p>Resource: {b.resourceId}</p>
            <p>User: {b.userId}</p>
            <p>{b.date} | {b.startTime} - {b.endTime}</p>
            <p>Status: {b.status}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => editBooking(b)}
              className="bg-yellow-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>

            <button
              onClick={() => cancelBooking(b.id)}
              className="bg-red-600 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>

        </div>
      ))}

    </div>
  );
}

export default AdminBookingPage;