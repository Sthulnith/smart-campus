import React, { useEffect, useState } from "react";
import API from "../services/api";

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    resourceId: "",
    userId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const res = await API.get("/bookings");
    setBookings(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/bookings", form);

    setForm({
      resourceId: "",
      userId: "",
      date: "",
      startTime: "",
      endTime: "",
      purpose: "",
      attendees: "",
    });

    fetchBookings();
  };

  // CANCELLING (DELETE)
const cancelBooking = async (id, status) => {
  if (status === "CANCELLED") {
    alert("Already cancelled!");
    return;
  }

  try {
    await API.put(`/bookings/${id}/cancel`);
    fetchBookings();
  } catch (err) {
    alert("Cancel failed");
  }
};
const [resources, setResources] = useState([]);
useEffect(() => {
  fetchBookings();
  fetchResources();
}, []);

const fetchResources = async () => {
  const res = await API.get("/resources");
  setResources(res.data);
};

  //  EDITING BOOKING
  const editBooking = async (b) => {
  const updated = {
    ...b,
    resourceId: prompt("Resource ID", b.resourceId),
    userId: prompt("User ID", b.userId),
    date: prompt("Date (YYYY-MM-DD)", b.date),
    startTime: prompt("Start Time (HH:mm:ss)", b.startTime),
    endTime: prompt("End Time (HH:mm:ss)", b.endTime),
    purpose: prompt("Purpose", b.purpose),
    attendees: prompt("Attendees", b.attendees),
  };

  try {
    await API.put(`/bookings/${b.id}`, updated);
    fetchBookings();
  } catch (err) {
    alert("Update failed");
  }
};

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Bookings</h2>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Create Booking</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
          <select name="resourceId" value={form.resourceId} onChange={handleChange} className="border p-2 rounded-lg">
          <option value="">Select Resource</option>

          {resources.map((r) => (
          <option key={r.id} value={r.id}>
          {r.name}
          </option>
         ))}

          </select>
          <input name="userId" placeholder="User ID" value={form.userId} onChange={handleChange} className="border p-2 rounded-lg" />
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

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Booking List</h3>

        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
            >

              {/* INFO */}
              <div>
                <p className="font-medium">Resource {b.resourceId}</p>
                <p className="text-sm text-gray-500">
                  {b.date} | {b.startTime} - {b.endTime}
                </p>
                <p className="text-sm text-gray-400">
                  Purpose: {b.purpose}
                </p>
              </div>

              {/* STATUS */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  b.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : b.status === "CANCELLED"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {b.status}
              </span>

              {/* ACTIONS */}
              <div className="flex gap-2">

                <button
                  onClick={() => editBooking(b)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>

                <button
                   onClick={() => cancelBooking(b.id, b.status)}
                   className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                 Cancel
                </button>

              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

export default BookingPage;