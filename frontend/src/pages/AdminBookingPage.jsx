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

  // ✅ APPROVE
  const approveBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/approve`);
      alert("Booking approved!");
      fetchBookings();
    } catch (err) {
      alert("Approve failed");
    }
  };

  // ❌ REJECT (CANCEL)
  const cancelBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/cancel`);
      alert("Booking rejected!");
      fetchBookings();
    } catch (err) {
      alert("Cancel failed");
    }
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

            <p>
              Status:{" "}
              <span className={
                b.status === "PENDING"
                  ? "text-yellow-600"
                  : b.status === "APPROVED"
                  ? "text-green-600"
                  : "text-red-600"
              }>
                {b.status}
              </span>
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2">

            {/* ✅ ONLY SHOW IF PENDING */}
            {b.status === "PENDING" && (
              <>
                <button
                  onClick={() => approveBooking(b.id)}
                  className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  onClick={() => cancelBooking(b.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </>
            )}

          </div>

        </div>
      ))}

    </div>
  );
}

export default AdminBookingPage;