import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

function ResourcePage() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "",
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await API.get("/resources");
      setResources(res.data);
    } catch (error) {
      toast.error("Failed to load resources");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      capacity: "",
      location: "",
      status: "",
    });
    setEditingId(null);
  };

  const deleteResource = async (id) => {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await API.delete(`/resources/${id}`);
      toast.success("Resource deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchResources();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete resource"
      );
    }
  };

  const editResource = (r) => {
    setForm({
      name: r.name || "",
      type: r.type || "",
      capacity: r.capacity ?? "",
      location: r.location || "",
      status: r.status || "",
    });
    setEditingId(r.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      capacity: Number(form.capacity),
    };

    if (!form.name || !form.type || !form.capacity || !form.location) {
      toast.error("All fields are required!");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/resources/${editingId}`, payload);
        toast.success("Resource updated successfully");
      } else {
        await API.post("/resources", payload);
        toast.success("Resource added successfully");
      }

      resetForm();
      fetchResources();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Operation failed"
      );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resources</h2>

      {isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Resource" : "Add Resource"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />
            <input
              name="type"
              placeholder="Type"
              value={form.type}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />
            <input
              name="capacity"
              placeholder="Capacity"
              value={form.capacity}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            >
              <option value="">Select Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <button
              type="submit"
              className="col-span-5 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              {editingId ? "Update Resource" : "Add Resource"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="col-span-5 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Resource List</h3>

        <div className="grid grid-cols-6 gap-4 text-gray-500 font-medium mb-2">
          <span>Name</span>
          <span>Type</span>
          <span>Capacity</span>
          <span>Location</span>
          <span>Status</span>
          <span>{isAdmin ? "Actions" : ""}</span>
        </div>

        <div className="space-y-2">
          {resources.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-6 gap-4 bg-gray-50 p-3 rounded-lg shadow-sm items-center"
            >
              <span>{r.name}</span>
              <span>{r.type}</span>
              <span>{r.capacity}</span>
              <span>{r.location}</span>

              <span
                className={`font-semibold ${
                  r.status === "ACTIVE"
                    ? "text-green-600"
                    : r.status === "MAINTENANCE"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {r.status}
              </span>

              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editResource(r)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteResource(r.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResourcePage;