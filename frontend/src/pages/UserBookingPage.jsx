import React, { useEffect, useState } from "react";
import API from "../services/api";

function UserBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);

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

  // ✅ NEW: Cancel Booking
  const cancelBooking = async (id, status) => {
    if (status === "CANCELLED") {
      alert("Already cancelled!");
      return;
    }

    try {
      await API.put(`/bookings/${id}/cancel`);
      alert("Booking cancelled!");
      fetchBookings();
    } catch (err) {
      alert("Cancel failed");
    }
  };

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
        <h3 className="text-lg font-semibold mb-4">My Bookings</h3>

        {bookings.map((b) => {
          // ✅ Find resource name instead of ID
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
        })}
      </div>

    </div>
  );
}

export default UserBookingPage;