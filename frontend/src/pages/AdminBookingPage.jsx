import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  Search, 
  Filter, 
  Calendar, 
  Eye,
  Plus,
  Trash2,
  X,
  MapPin,
  Users,
  Info,
  ChevronRight,
  Bell,
  Microscope,
  Cpu,
  BookOpen
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function AdminBookingPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    resourceId: "",
    campus: "Malabe Campus",
    category: "Lecture Hall",
    floor: "",
    date: "",
    endDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: 1
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([
        API.get("/bookings"),
        API.get("/resources")
      ]);
      setBookings(bookingsRes.data);
      setResources(resourcesRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const getResourceName = (id) => {
    const res = resources.find(r => r.id === id);
    return res ? res.name : `Resource #${id}`;
  };

  const approveBooking = async (id) => {
    if (!window.confirm("Approve this booking?")) return;
    try {
      await API.put(`/bookings/${id}/approve`);
      fetchData();
    } catch (err) {
      alert("Approve failed");
    }
  };

  const rejectBooking = async (id) => {
    if (!window.confirm("Reject this booking?")) return;
    try {
      await API.put(`/bookings/${id}/reject`);
      fetchData();
    } catch (err) {
      alert("Reject failed");
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Permanently delete this booking record? This cannot be undone.")) return;
    try {
      await API.delete(`/bookings/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Delete failed: Server error or unauthorized.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/bookings", form);
      setIsModalOpen(false);
      setForm({
        resourceId: "", campus: "Malabe Campus", category: "Lecture Hall",
        floor: "", date: "", endDate: "", startTime: "", endTime: "",
        purpose: "", attendees: 1
      });
      fetchData();
      alert("Request submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Booking failed");
    }
  };

  const handleReviewAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await API.put(`/bookings/${id}/approve`);
      } else {
        await API.put(`/bookings/${id}/reject`);
      }
      setIsReviewModalOpen(false);
      setSelectedBooking(null);
      fetchData();
    } catch (err) {
      alert(`${action} failed: ` + (err.response?.data?.message || err.response?.data || ""));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "date") {
      setForm({ ...form, [name]: value, endDate: value });
    } else if (name === "category") {
      setForm({ ...form, [name]: value, resourceId: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesSearch = 
      (b.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.purpose || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      getResourceName(b.resourceId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    approved: bookings.filter(b => b.status === "APPROVED").length,
    pending: bookings.filter(b => b.status === "PENDING").length,
    rejected: bookings.filter(b => b.status === "REJECTED").length,
  };

  const typeConfigs = {
    "Lecture Hall": { icon: <BookOpen size={14} />, color: "bg-blue-600", shadow: "shadow-blue-100" },
    "Laboratory": { icon: <Microscope size={14} />, color: "bg-emerald-600", shadow: "shadow-emerald-100" },
    "Equipment": { icon: <Cpu size={14} />, color: "bg-amber-600", shadow: "shadow-amber-100" },
    "Meeting Room": { icon: <Users size={14} />, color: "bg-rose-600", shadow: "shadow-rose-100" },
    "default": { icon: <Users size={14} />, color: "bg-indigo-600", shadow: "shadow-indigo-100" }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Bookings</h1>
          <p className="text-slate-500 font-medium uppercase text-xs tracking-widest mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => navigate("/booking-analysis")}
             className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition"
           >
             <BarChart3 className="w-4 h-4" />
             Booking Analysis
           </button>
           <div className="relative">
             <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 cursor-pointer">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
             </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Bookings" value={stats.total} icon={<BarChart3 className="w-6 h-6 text-indigo-600" />} color="bg-indigo-50" />
        <StatCard label="Approved Today" value={stats.approved} icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Pending Requests" value={stats.pending} icon={<Clock className="w-6 h-6 text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Rejected Today" value={stats.rejected} icon={<XCircle className="w-6 h-6 text-rose-600" />} color="bg-rose-50" />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Calendar className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Requests Overview</h2>
              <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest">Logistics Management</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Admin Request
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-6 bg-slate-50/50 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user or reason..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm font-medium"
            />
          </div>
          <div className="flex gap-3">
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition text-sm font-bold text-slate-700"
             >
               <option value="ALL">All Statuses</option>
               <option value="PENDING">Pending</option>
               <option value="APPROVED">Approved</option>
               <option value="REJECTED">Rejected</option>
             </select>
             <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition">
               <Filter className="w-5 h-5 text-slate-600" />
             </button>
          </div>
        </div>

        {/* List View */}
        <div className="p-8 overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-4 pb-2 text-left">Booking ID</th>
                <th className="px-4 pb-2 text-left">Requested By</th>
                <th className="px-4 pb-2 text-left">Room / Lab</th>
                <th className="px-4 pb-2 text-left">Category</th>
                <th className="px-4 pb-2 text-left">Date & Time</th>
                <th className="px-4 pb-2 text-left">Status</th>
                <th className="px-4 pb-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-4 py-4 bg-white first:rounded-l-[24px] border-y border-l border-slate-50 group-hover:border-indigo-100 transition-colors">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">ID</span>
                    <span className="font-black text-slate-900">#{1000 + b.id}</span>
                  </td>
                  <td className="px-4 py-4 bg-white border-y border-slate-50 group-hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                        {b.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{b.user?.name || "Unknown User"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: US-{500 + (b.user?.id || 0)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 bg-white border-y border-slate-50 group-hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${(typeConfigs[b.category] || typeConfigs.default).color} flex items-center justify-center text-white shadow-sm`}>
                        {(typeConfigs[b.category] || typeConfigs.default).icon}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-[11px] leading-tight">{getResourceName(b.resourceId)}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{b.campus || 'Main Campus'} - {b.floor || 'G-Floor'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 bg-white border-y border-slate-50 group-hover:border-indigo-100 transition-colors">
                    <span className="px-2 py-0.5 bg-slate-50 text-indigo-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-indigo-50">
                       {b.category || 'GENERAL'}
                    </span>
                  </td>
                  <td className="px-4 py-4 bg-white border-y border-slate-50 group-hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      <span className="font-bold text-slate-700 text-[10px]">{b.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500">{b.startTime} - {b.endTime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 bg-white border-y border-slate-50 group-hover:border-indigo-100 transition-colors">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-4 bg-white last:rounded-r-[24px] border-y border-r border-slate-50 group-hover:border-indigo-100 transition-colors">
                    <div className="flex justify-center gap-2">
                      {b.status === "PENDING" ? (
                        <>
                          <button onClick={() => approveBooking(b.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => rejectBooking(b.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition shadow-sm" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                      <button 
                        onClick={() => {
                          setSelectedBooking(b);
                          setIsReviewModalOpen(true);
                        }}
                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-sm" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      )}
                      <button 
                        onClick={() => deleteBooking(b.id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-600 hover:text-white transition shadow-sm" 
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Calendar className="w-16 h-16 text-slate-100" />
                      <p className="text-slate-400 font-bold tracking-tight uppercase text-xs">No records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request a Facility</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 bg-slate-50/30">
               <div className="bg-white p-6 rounded-[32px] border border-indigo-100/50 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg">
                      {currentUser?.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Requested By</p>
                      <p className="text-sm font-black text-slate-900 tracking-tight">{currentUser?.name || "Administrator"}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                     Verified Identity
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Campus">
                   <select name="campus" value={form.campus} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition cursor-pointer">
                      <option>Malabe Campus</option>
                      <option>Metro Campus</option>
                      <option>Matara Campus</option>
                   </select>
                </FormField>
                 <FormField label="Category">
                   <select name="category" value={form.category} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition cursor-pointer">
                      <option value="Lecture Hall">Lecture Hall</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Meeting Room">Meeting Room</option>
                   </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Building">
                   <select name="building" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition cursor-pointer">
                      <option>Main Building</option>
                      <option>New Building</option>
                   </select>
                </FormField>
                 <FormField label="Floor">
                   <input 
                    name="floor" 
                    value={form.floor} 
                    onChange={handleFormChange} 
                    placeholder="Enter Floor (e.g. Floor 01)"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" 
                  />
                </FormField>
              </div>

               <FormField label="Specific Resources">
                 <select name="resourceId" value={form.resourceId} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition cursor-pointer" required>
                    <option value="">Choose Resource...</option>
                    {resources
                      .filter(r => r.type === form.category)
                      .map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                    }
                 </select>
              </FormField>

              <FormField label="Reason for Booking">
                 <textarea name="purpose" value={form.purpose} onChange={handleFormChange} placeholder="Tell us what the facility will be used for..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition min-h-[100px] resize-none" required />
              </FormField>

              <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 grid grid-cols-2 gap-6">
                 <FormField label="Start Date">
                    <input type="date" name="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={handleFormChange} className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                 </FormField>
                 <FormField label="End Date">
                    <input type="date" name="endDate" value={form.endDate} min={form.date || new Date().toISOString().split("T")[0]} onChange={handleFormChange} className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                 </FormField>
                 <FormField label="Start Time">
                    <input type="time" name="startTime" value={form.startTime} onChange={handleFormChange} className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                 </FormField>
                 <FormField label="End Time">
                    <input type="time" name="endTime" value={form.endTime} onChange={handleFormChange} className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                 </FormField>
              </div>

              <FormField label="Attendees">
                 <input type="number" name="attendees" value={form.attendees} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" min="1" required />
              </FormField>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition active:scale-95">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {isReviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Request</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Booking ID: #{1000 + selectedBooking.id}</p>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-6 rounded-[32px] space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm uppercase">
                      {selectedBooking.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{selectedBooking.user?.name || "Unknown User"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Requested by User</p>
                    </div>
                  </div>
                  <StatusBadge status={selectedBooking.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Resource</p>
                    <p className="text-xs font-black text-slate-800">{getResourceName(selectedBooking.resourceId)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="text-xs font-black text-indigo-600">{selectedBooking.category || "General"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-xs font-black text-slate-800">{selectedBooking.date} | {selectedBooking.startTime}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Floor</p>
                    <p className="text-xs font-black text-slate-800">{selectedBooking.floor || "Not Specified"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/50">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Purpose</p>
                   <p className="text-xs font-medium text-slate-600 italic">"{selectedBooking.purpose}"</p>
                </div>
              </div>

               <div className="flex gap-4">
                {selectedBooking.status === "PENDING" ? (
                  <>
                    <button 
                      onClick={() => handleReviewAction(selectedBooking.id, 'reject')}
                      className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition shadow-sm"
                    >
                      Reject Request
                    </button>
                    <button 
                      onClick={() => handleReviewAction(selectedBooking.id, 'approve')}
                      className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition"
                    >
                      Approve Request
                    </button>
                  </>
                ) : selectedBooking.status === "APPROVED" ? (
                  <>
                    <button 
                      onClick={() => handleReviewAction(selectedBooking.id, 'reject')}
                      className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition shadow-sm"
                    >
                      Reject Booking
                    </button>
                    <button 
                      onClick={() => setIsReviewModalOpen(false)}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg"
                    >
                      Close
                    </button>
                  </>
                ) : selectedBooking.status === "REJECTED" ? (
                  <>
                    <button 
                      onClick={() => handleReviewAction(selectedBooking.id, 'approve')}
                      className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition"
                    >
                      Approve Booking
                    </button>
                    <button 
                      onClick={() => setIsReviewModalOpen(false)}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsReviewModalOpen(false)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg"
                  >
                    Close Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all cursor-default">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
      <div className={`p-4 ${color} rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
    DECLINED: "bg-rose-50 text-rose-600 border-rose-100",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <span className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}

export default AdminBookingPage;