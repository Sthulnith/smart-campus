import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, CheckCircle2, Clock, Search, Ticket } from "lucide-react";
import { getApiErrorMessage } from "../utils/authApi";

function TechnicianTicketPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/api/tickets");
      // Filter tickets assigned to the current technician
      const assignedToMe = response.data.filter(
        (ticket) => ticket.assignedTo === user?.id
      );
      setTickets(assignedToMe);
    } catch (err) {
      setError(getApiErrorMessage(err) || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await API.put(`/api/tickets/${ticketId}`, { status: newStatus });
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (err) {
      alert(getApiErrorMessage(err) || "Failed to update ticket status");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-50 text-green-700 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle2 size={18} />;
      case "IN_PROGRESS":
        return <Clock size={18} />;
      case "PENDING":
        return <AlertCircle size={18} />;
      default:
        return null;
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
              placeholder="Search by title or category..."
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
            <option value="PENDING">Pending</option>
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{ticket.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{ticket.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {ticket.priority || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {ticket.createdBy?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          updateTicketStatus(ticket.id, e.target.value)
                        }
                        className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnicianTicketPage;
