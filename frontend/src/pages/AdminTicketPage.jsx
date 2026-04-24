import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Ticket, Search, UserCog, RefreshCcw, XCircle, MessageSquare, Send, Edit2, Trash2 } from "lucide-react";

function AdminTicketPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningByTicket, setAssigningByTicket] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, ticketId: null, reason: "" });
  const [expandedComments, setExpandedComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Load tickets and technicians on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all tickets and available technicians
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, techniciansRes] = await Promise.all([
        API.get("/tickets"),
        API.get("/admin/users/technicians")
      ]);
      setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      const allTechs = Array.isArray(techniciansRes.data) ? techniciansRes.data : [];
      setTechnicians(allTechs.filter((tech) => tech.role === "ROLE_TECHNICIAN"));
    } catch (err) {
      console.error("Failed to load admin ticket data", err);
      alert(err.response?.data?.message || "Failed to load tickets and technicians.");
    } finally {
      setLoading(false);
    }
  };

  // Map technician ID to technician name for quick lookup
  const technicianNameById = useMemo(() => {
    const map = new Map();
    technicians.forEach((tech) => map.set(tech.id, tech.name));
    return map;
  }, [technicians]);

  // Filter tickets based on search keyword
  const filteredTickets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((ticket) => {
      const assignedName = technicianNameById.get(ticket.assignedTo) || "";
      return [ticket.title, ticket.description, ticket.category, ticket.status, assignedName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [tickets, searchTerm, technicianNameById]);

  // Assign selected technician to a ticket
  const assignTechnician = async (ticketId, technicianId) => {
    if (!technicianId) return;
    setAssigningByTicket((prev) => ({ ...prev, [ticketId]: true }));
    try {
      await API.put(`/tickets/${ticketId}/assign`, null, { params: { technicianId } });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, assignedTo: Number(technicianId), status: "IN_PROGRESS" }
            : ticket
        )
      );
    } catch (err) {
      console.error("Assignment failed", err);
      alert(err.response?.data?.message || "Could not assign technician.");
    } finally {
      setAssigningByTicket((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    try {
      await API.put(`/tickets/${rejectModal.ticketId}/status`, {
        status: "REJECTED",
        rejectionReason: rejectModal.reason
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === rejectModal.ticketId
            ? { ...t, status: "REJECTED", rejectionReason: rejectModal.reason }
            : t
        )
      );
      setRejectModal({ open: false, ticketId: null, reason: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject ticket.");
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await API.put(`/tickets/${ticketId}/status`, { status: "CLOSED" });
      setTickets((prev) =>
        prev.map((t) => t.id === ticketId ? { ...t, status: "CLOSED" } : t)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close ticket.");
    }
  };

  // Comments
  const fetchComments = async (ticketId) => {
    try {
      const res = await API.get(`/tickets/${ticketId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const toggleComments = (ticketId) => {
    if (expandedComments === ticketId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(ticketId);
      fetchComments(ticketId);
    }
  };

  const addComment = async (ticketId) => {
    if (!newComment.trim()) return;
    try {
      await API.post(`/tickets/${ticketId}/comments`, { content: newComment });
      setNewComment("");
      fetchComments(ticketId);
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const deleteComment = async (ticketId, commentId) => {
    try {
      await API.delete(`/tickets/${ticketId}/comments/${commentId}`);
      fetchComments(ticketId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const statusColors = {
    OPEN: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-amber-50 text-amber-700",
    RESOLVED: "bg-emerald-50 text-emerald-700",
    CLOSED: "bg-slate-100 text-slate-600",
    REJECTED: "bg-rose-50 text-rose-700"
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Ticket Dashboard</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Assign technicians and manage workflow</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition"
        >
          <RefreshCcw size={14} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, category, status or technician..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-indigo-300 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Assign Technician</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-8 text-sm text-slate-500" colSpan={7}>Loading tickets...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr><td className="px-4 py-8 text-sm text-slate-500" colSpan={7}>No tickets found.</td></tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const assignedName = technicianNameById.get(ticket.assignedTo) || "Unassigned";
                  const assigning = !!assigningByTicket[ticket.id];
                  const isCommentsOpen = expandedComments === ticket.id;

                  return (
                    <React.Fragment key={ticket.id}>
                      <tr className="border-b border-slate-100 last:border-b-0">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900">{ticket.title || `Ticket #${ticket.id}`}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description || "No description"}</p>
                          {ticket.location && <p className="text-[10px] text-slate-400 mt-0.5">📍 {ticket.location}</p>}
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-700">{ticket.category || "GENERAL"}</td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                            ticket.priority === "URGENT" ? "bg-red-50 text-red-700" :
                            ticket.priority === "HIGH" ? "bg-rose-50 text-rose-600" :
                            ticket.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" :
                            "bg-emerald-50 text-emerald-600"
                          }`}>
                            {ticket.priority || "LOW"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusColors[ticket.status] || "bg-slate-100 text-slate-700"}`}>
                            {(ticket.status || "OPEN").replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-600">{assignedName}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="relative min-w-[200px]">
                              <UserCog className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <select
                                disabled={assigning || technicians.length === 0 || ticket.status === "CLOSED" || ticket.status === "REJECTED" || ticket.status === "RESOLVED"}
                                defaultValue=""
                                onChange={(e) => {
                                  assignTechnician(ticket.id, e.target.value);
                                  e.target.value = "";
                                }}
                                className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                <option value="" disabled>
                                  {technicians.length === 0 ? "No technicians" : "Select technician"}
                                </option>
                                {technicians.map((tech) => (
                                  <option key={tech.id} value={tech.id}>
                                    {tech.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            {ticket.status !== "REJECTED" && ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
                              <button
                                onClick={() => setRejectModal({ open: true, ticketId: ticket.id, reason: "" })}
                                className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition"
                                title="Reject"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                            {ticket.status === "RESOLVED" && (
                              <button
                                onClick={() => handleCloseTicket(ticket.id)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition"
                                title="Close Ticket"
                              >
                                Close
                              </button>
                            )}
                            <button
                              onClick={() => toggleComments(ticket.id)}
                              className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition"
                              title="Comments"
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Comments Row */}
                      {isCommentsOpen && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-slate-50/50">
                            <div className="max-w-2xl space-y-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comments</p>
                              {comments.map(c => (
                                <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-100">
                                  <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-bold text-indigo-600">{c.userName}</p>
                                    <div className="flex gap-1">
                                      {(user?.id === c.userId || user?.role === "ROLE_ADMIN") && (
                                        <button onClick={() => deleteComment(ticket.id, c.id)} className="p-1 hover:bg-slate-50 rounded">
                                          <Trash2 size={10} className="text-rose-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1">{c.content}</p>
                                  <p className="text-[9px] text-slate-300 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <input
                                  value={newComment}
                                  onChange={e => setNewComment(e.target.value)}
                                  placeholder="Add a comment..."
                                  className="flex-1 p-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-indigo-400"
                                  onKeyDown={e => e.key === "Enter" && addComment(ticket.id)}
                                />
                                <button onClick={() => addComment(ticket.id)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition">
                                  <Send size={12} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="p-4 bg-rose-50 rounded-full inline-block mb-4">
                <XCircle className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Reject Ticket</h2>
              <p className="text-sm text-slate-500 mt-1">Please provide a reason for rejection</p>
            </div>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter rejection reason (required)..."
              className="w-full p-4 border border-slate-200 rounded-2xl text-sm outline-none focus:border-rose-400 min-h-[100px] resize-none"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal({ open: false, ticketId: null, reason: "" })}
                className="flex-1 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Reject Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTicketPage;
