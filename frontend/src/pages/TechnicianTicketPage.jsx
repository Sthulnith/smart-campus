import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, CheckCircle2, Clock, Search, Ticket, Send, MessageSquare, Edit2, Trash2, Image } from "lucide-react";
import { getApiErrorMessage } from "../utils/authApi";

function TechnicianTicketPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]); // assigned tickets list
  const [loading, setLoading] = useState(true); // loading indicator
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [resolutionModal, setResolutionModal] = useState({ open: false, ticketId: null, notes: "" });
  
  // Comment system states
  const [expandedComments, setExpandedComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Image viewer states
  const [viewingImages, setViewingImages] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Backend base URL configuration
  const backendUrl = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api").replace(/\/api$/, "");

  // Load assigned tickets when page loads
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch technician assigned tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/tickets/assigned");
      setTickets(response.data.filter(t => t.status !== "CLOSED"));
    } catch (err) {
      setError(getApiErrorMessage(err) || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  // Allow technician to resolve ticket
  const handleStatusChange = (ticketId, newStatus) => {
    if (newStatus === "RESOLVED") {
      setResolutionModal({ open: true, ticketId, notes: "" });
    } else {
      alert("You can only change status to RESOLVED.");
    }
  };

  // Submit resolution notes and update status
  const submitResolution = async () => {
    if (!resolutionModal.notes.trim()) {
      alert("Resolution notes are required.");
      return;
    }
    try {
      await API.put(`/tickets/${resolutionModal.ticketId}/status`, {
        status: "RESOLVED",
        resolutionNotes: resolutionModal.notes
      });
      // Update UI instantly
      setTickets((prev) =>
        prev.map((t) =>
          t.id === resolutionModal.ticketId
            ? { ...t, status: "RESOLVED", resolutionNotes: resolutionModal.notes }
            : t
        )
      );
      setResolutionModal({ open: false, ticketId: null, notes: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
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

  // Expand or collapse comments panel
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

  const saveEditComment = async (ticketId, commentId) => {
    try {
      await API.put(`/tickets/${ticketId}/comments/${commentId}`, { content: editCommentText });
      setEditingCommentId(null);
      fetchComments(ticketId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to edit comment");
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      (ticket.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED": return "bg-green-50 text-green-700 border-green-200";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
      case "OPEN": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "CLOSED": return "bg-slate-100 text-slate-600 border-slate-200";
      case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED": return <CheckCircle2 size={18} />;
      case "IN_PROGRESS": return <Clock size={18} />;
      case "OPEN": return <AlertCircle size={18} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading assigned tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Clock size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Assigned Tickets</h1>
            <p className="text-slate-500 text-sm">Track and manage tickets assigned to you</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
            <Ticket size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">
            {tickets.length === 0 ? "No tickets assigned to you yet" : "No tickets match your search"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{ticket.title || ticket.description}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">{ticket.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {(ticket.status || "").replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          ticket.priority === "URGENT" ? "bg-red-50 text-red-700" :
                          ticket.priority === "HIGH" ? "bg-rose-50 text-rose-600" :
                          ticket.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                        }`}>
                          {ticket.priority || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{ticket.location || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {ticket.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleStatusChange(ticket.id, "RESOLVED")}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1"
                            >
                              <CheckCircle2 size={14} />
                              Resolve
                            </button>
                          )}
                          {ticket.status === "RESOLVED" && (
                            <span className="text-xs text-emerald-600 font-medium">✓ Resolved</span>
                          )}
                          <button
                            onClick={() => toggleComments(ticket.id)}
                            className="px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                            title="Comments"
                          >
                            <MessageSquare size={14} />
                          </button>
                          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
                            <button
                              onClick={() => { setViewingImages(ticket.imageUrls); setSelectedImageIdx(0); }}
                              className="px-2 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition relative"
                              title="View Images"
                            >
                              <Image size={14} />
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                {ticket.imageUrls.length}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>


                    {/* Resolution Notes Display */}
                    {ticket.resolutionNotes && (
                      <tr>
                        <td colSpan={6} className="px-6 py-2 bg-emerald-50/50">
                          <p className="text-xs"><span className="font-bold text-emerald-700">Resolution Notes:</span> <span className="text-slate-600">{ticket.resolutionNotes}</span></p>
                        </td>
                      </tr>
                    )}

                    {/* Comments Section */}
                    {expandedComments === ticket.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-slate-50/50">
                          <div className="max-w-2xl space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comments</p>
                            {comments.map(c => (
                              <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-100">
                                {editingCommentId === c.id ? (
                                  <div className="space-y-2">
                                    <textarea value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-indigo-500" />
                                    <div className="flex gap-2">
                                      <button onClick={() => saveEditComment(ticket.id, c.id)} className="text-[10px] font-bold text-indigo-600 hover:underline">Save</button>
                                      <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-bold text-slate-400 hover:underline">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex justify-between items-start">
                                      <p className="text-[10px] font-bold text-indigo-600">{c.userName}</p>
                                      <div className="flex gap-1">
                                        {user?.id === c.userId && (
                                          <button onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content); }} className="p-1 hover:bg-slate-50 rounded">
                                            <Edit2 size={10} className="text-slate-400" />
                                          </button>
                                        )}
                                        {(user?.id === c.userId || user?.role === "ROLE_ADMIN") && (
                                          <button onClick={() => deleteComment(ticket.id, c.id)} className="p-1 hover:bg-slate-50 rounded">
                                            <Trash2 size={10} className="text-rose-400" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">{c.content}</p>
                                    <p className="text-[9px] text-slate-300 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                                  </>
                                )}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {viewingImages && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={() => setViewingImages(null)}
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Image size={18} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Uploaded Photos</h3>
                  <p className="text-[10px] text-slate-400 font-bold">{selectedImageIdx + 1} of {viewingImages.length}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingImages(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-center min-h-[400px]">
              <img
                src={`${backendUrl}/uploads/${viewingImages[selectedImageIdx]}`}
                alt={`Attachment ${selectedImageIdx + 1}`}
                className="max-w-full max-h-[400px] object-contain rounded-xl shadow-sm"
              />
            </div>

            {viewingImages.length > 1 && (
              <div className="p-4 border-t border-slate-100 flex gap-2 overflow-x-auto">
                {viewingImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      idx === selectedImageIdx ? "border-amber-500 ring-2 ring-amber-200 scale-105" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={`${backendUrl}/uploads/${url}`}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolution Notes Modal */}
      {resolutionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="p-4 bg-emerald-50 rounded-full inline-block mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Resolve Ticket</h2>
              <p className="text-sm text-slate-500 mt-1">Please provide resolution details</p>
            </div>
            <textarea
              value={resolutionModal.notes}
              onChange={(e) => setResolutionModal({ ...resolutionModal, notes: e.target.value })}
              placeholder="Describe how the issue was resolved (required)..."
              className="w-full p-4 border border-slate-200 rounded-2xl text-sm outline-none focus:border-emerald-400 min-h-[120px] resize-none"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => setResolutionModal({ open: false, ticketId: null, notes: "" })}
                className="flex-1 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitResolution}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnicianTicketPage;
