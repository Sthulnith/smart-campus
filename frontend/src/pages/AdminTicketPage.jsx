import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { Ticket, Search, UserCog, RefreshCcw } from "lucide-react";

function AdminTicketPage() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningByTicket, setAssigningByTicket] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

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

  const technicianNameById = useMemo(() => {
    const map = new Map();
    technicians.forEach((tech) => map.set(tech.id, tech.name));
    return map;
  }, [technicians]);

  const filteredTickets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter((ticket) => {
      const assignedName = technicianNameById.get(ticket.assignedTo) || "";
      return [
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.status,
        assignedName
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [tickets, searchTerm, technicianNameById]);

  const assignTechnician = async (ticketId, technicianId) => {
    if (!technicianId) return;

    setAssigningByTicket((prev) => ({ ...prev, [ticketId]: true }));
    try {
      await API.put(`/tickets/${ticketId}/assign`, null, {
        params: { technicianId }
      });

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Ticket Dashboard</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Assign technicians and track work</p>
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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Assign Technician</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={5}>Loading tickets...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={5}>No tickets found.</td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const assignedName = technicianNameById.get(ticket.assignedTo) || "Unassigned";
                  const assigning = !!assigningByTicket[ticket.id];

                  return (
                    <tr key={ticket.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-slate-900">{ticket.title || `Ticket #${ticket.id}`}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description || "No description provided"}</p>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-700">{ticket.category || "GENERAL"}</td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {ticket.status || "OPEN"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">{assignedName}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative min-w-[220px]">
                            <UserCog className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                              disabled={assigning || technicians.length === 0}
                              defaultValue=""
                              onChange={(e) => {
                                assignTechnician(ticket.id, e.target.value);
                                e.target.value = "";
                              }}
                              className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                            >
                              <option value="" disabled>
                                {technicians.length === 0 ? "No technicians available" : "Select technician"}
                              </option>
                              {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>
                                  {tech.name} ({tech.role?.replace("ROLE_", "")})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminTicketPage;
