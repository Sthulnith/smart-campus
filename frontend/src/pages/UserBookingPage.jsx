import React, { useEffect, useState } from "react";
import API from "../services/api";

function UserBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    resourceId: "",
    userId: localStorage.getItem("userId"),
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });

  useEffect(() => {
    fetchBookings();
    fetchResources();
  }, []);

  const fetchBookings = async () => {
    const userId = localStorage.getItem("userId");
    const res = await API.get(`/bookings/user/${userId}`);
    setBookings(res.data);
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const res = await API.get(`/bookings/user/${userId}`);
      setBookings(res.data);
    } catch (err) {
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    const res = await API.get("/resources");
    setResources(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/bookings", form);
      alert("Booking created!");

      setForm({
        resourceId: "",
        userId: localStorage.getItem("userId"),
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendees: "",
      });

      fetchBookings();
    } catch (err) {
      alert("Booking failed");
    }
  };

  // Cancel Booking
  const cancelBooking = async (id, status) => {
    if (status === "CANCELLED") {
      alert("Already cancelled!");
      return;
    }

    if (!window.confirm("Are you sure to cancel this booking?")) return;

    try {
      await API.put(`/bookings/${id}/cancel`);
      alert("Booking cancelled!");
      fetchBookings();
    } catch (err) {
      alert("Cancel failed");
    }
  };

  // Filter logic
  // ✅ FILTER + SORT
  const filteredBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">User Booking</h2>

      {/* CREATE FORM */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Create Booking</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">

          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            className="border p-2 rounded-lg"
          >
            <option value="">Select Resource</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded-lg" />
          {/* ✅ DISABLE PAST DATES */}
          <input
            type="date"
            name="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.date}
            onChange={handleChange}
            className="border p-2 rounded-lg"
          />

          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="border p-2 rounded-lg" />
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="border p-2 rounded-lg" />
          <input name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} className="border p-2 rounded-lg" />
          <input name="attendees" placeholder="Attendees" value={form.attendees} onChange={handleChange} className="border p-2 rounded-lg" />

          <button className="col-span-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Book Resource
          </button>

        </form>
      </div>

      {/* USER BOOKINGS */}
      <div className="bg-white p-6 rounded-xl shadow-md">

        {/* HEADER + FILTER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">My Bookings</h3>

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
        {loading ? (
          <p className="text-center text-blue-500 py-4">
            Loading bookings...
          </p>
        ) : (
          filteredBookings.map((b) => {
            const resource = resources.find(r => r.id === b.resourceId);

            return (
              <div
                key={b.id}
                className="p-4 bg-gray-50 rounded-lg mb-2 flex justify-between items-center"
          <>
            {/* HEADER + FILTER */}
            <div className="flex justify-between items-center mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">My Bookings</h3>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border p-2 rounded-lg"
              >

                {/* INFO */}
                <div>
                  <p className="font-medium">
                    Resource: {resource ? resource.name : b.resourceId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {b.date} | {b.startTime} - {b.endTime}
                  </p>
                  <p className="text-sm">
                    Status:{" "}
                    <span className={
                      b.status === "CANCELLED"
                        ? "text-red-600"
                        : b.status === "PENDING"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }>
                      {b.status}
                    </span>
                  </p>
                </div>

                {/* ACTION */}
                <button
                  disabled={b.status === "CANCELLED"}
                  onClick={() => cancelBooking(b.id, b.status)}
                  className={`px-3 py-1 rounded text-white ${
                    b.status === "CANCELLED"
                      ? "bg-gray-400"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Cancel
                </button>

              </div>
            );
          })
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* ✅ BOOKING COUNT */}
            <p className="text-sm text-gray-500 mb-4">
              Total: {filteredBookings.length} bookings
            </p>

            {/* EMPTY STATE */}
            {filteredBookings.length === 0 ? (
            {sortedBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-6 italic">
                No bookings found
              </p>
            ) : (
              filteredBookings.map((b) => {
              sortedBookings.map((b) => {
                const resource = resources.find(r => r.id === b.resourceId);

                return (
                  <div
                    key={b.id}
                    className="p-4 bg-gray-50 rounded-lg mb-2 flex justify-between items-center"
                  >

                    {/* INFO */}
                    <div>
                      <p className="font-medium">
                        Resource: {resource ? resource.name : b.resourceId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {b.date} | {b.startTime} - {b.endTime}
                      </p>
                      <p className="text-sm">
                        Status:{" "}
                        <span className={
                          b.status === "CANCELLED"
                            ? "text-red-600"
                            : b.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }>
                          {b.status}
                        </span>
                      </p>
                    </div>

                    {/* ACTION */}
                    <button
                      disabled={b.status === "CANCELLED"}
                      onClick={() => cancelBooking(b.id, b.status)}
                      className={`px-3 py-1 rounded text-white ${
                        b.status === "CANCELLED"
                          ? "bg-gray-400"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Cancel
                    </button>

                  </div>
                );
              })
            )}
          </>
        )}

      </div>

    </div>
  );
}

export default UserBookingPage;