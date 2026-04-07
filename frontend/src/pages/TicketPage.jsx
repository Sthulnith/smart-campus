import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function TicketPage() {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    category: "",
    description: "",
    priority: "",
    resourceId: "",
    status: "OPEN"
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await API.get("/tickets");
    setTickets(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await API.put(`/tickets/${editingId}`, form);
      setEditingId(null);
    } else {
      await API.post("/tickets", form);
    }

    setForm({
      category: "",
      description: "",
      priority: "",
      resourceId: "",
      status: "OPEN"
    });

    fetchTickets();
  };

  // ✅ DELETE
  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;

    await API.delete(`/tickets/${id}`);
    fetchTickets();
  };

  // ✅ EDIT
  const editTicket = (t) => {
    setForm(t);
    setEditingId(t.id);
  };

  // ✅ ASSIGN
  const assignTechnician = async (id) => {
    const techId = prompt("Enter Technician ID:");
    if (!techId) return;

    await API.put(`/tickets/${id}/assign?technicianId=${techId}`);
    fetchTickets();
  };

  // ✅ FILE
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };


  const uploadImage = async (id) => {
    const formData = new FormData();
    formData.append("files", selectedFile);

    await API.post(`/tickets/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Image uploaded!");
  };

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">Tickets</h2>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Update Ticket" : "Create Ticket"}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">

          <input name="category" value={form.category} onChange={handleChange}
            placeholder="Category" className="border p-2 rounded-lg" />

          <input name="description" value={form.description} onChange={handleChange}
            placeholder="Description" className="border p-2 rounded-lg" />

          <select name="priority" value={form.priority} onChange={handleChange}
            className="border p-2 rounded-lg">
            <option value="">Priority</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <input name="resourceId" value={form.resourceId} onChange={handleChange}
            placeholder="Resource ID" className="border p-2 rounded-lg" />

          <button className="col-span-4 bg-blue-600 text-white py-2 rounded-lg">
            {editingId ? "Update" : "Create"}
          </button>

        </form>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Ticket List</h3>

        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">

              <p className="font-semibold">{t.category}</p>
              <p>{t.description}</p>
              <p>Priority: {t.priority}</p>
              <p>Status: {t.status}</p>

              {/* BUTTONS */}
              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => editTicket(t)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => deleteTicket(t.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => assignTechnician(t.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Assign
                    </button>
                  </>
                )}

                <input type="file" onChange={handleFileChange} />

                <button
                  onClick={() => uploadImage(t.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Upload
                </button>

              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

export default TicketPage;