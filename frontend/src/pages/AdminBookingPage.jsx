import React, { useEffect, useState } from "react";
import API from "../services/api";

function AdminBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ✅ FILTER

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const res = await API.get("/bookings");
    setBookings(res.data);
    try {
      const res = await API.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      alert("Failed to load bookings");
    }
  };

  // ✅ APPROVE
  const approveBooking = async (id) => {
    if (!window.confirm("Approve this booking?")) return;

    try {
      await API.put(`/bookings/${id}/approve`);
      alert("Booking approved!");
      fetchBookings();
    } catch (err) {
      alert("Approve failed");
    }
  };

  // ❌ REJECT (CANCEL)
  // ❌ REJECT
  const cancelBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/cancel`);
      alert("Booking rejected!");
      fetchBookings();
    } catch (err) {
      alert("Cancel failed");
    }
  };

  // ✅ FILTER LOGIC
  const filteredBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

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
      {/* ✅ FILTER DROPDOWN */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Bookings</h3>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* ✅ EMPTY STATE */}
      {filteredBookings.length === 0 ? (
        <p className="text-center text-gray-500 py-6 italic">
          No bookings found
        </p>
      ) : (
        filteredBookings.map((b) => (
          <div
            key={b.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
          >

            {/* INFO */}
            <div>
              <p className="font-medium">Resource: {b.resourceId}</p>
              <p className="text-sm text-gray-500">User: {b.userId}</p>
              <p className="text-sm text-gray-500">
                {b.date} | {b.startTime} - {b.endTime}
              </p>

              <p className="text-sm">
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

            {/* ACTIONS */}
            <div className="flex gap-2">
              {b.status === "PENDING" && (
                <>
                  <button
                    onClick={() => approveBooking(b.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>

          </div>

        </div>
      ))}
        ))
      )}

    </div>
  );
}

export default AdminBookingPage;