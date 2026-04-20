import React, { useEffect, useState } from "react";
import API from "../services/api";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  X, 
  Users,
  MapPin
} from "lucide-react";

function UserBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "1",
    campus: "Malabe Campus",
    category: "Lecture Hall",
    building: "",
    floor: ""
  });

  useEffect(() => {
    fetchBookings();
    fetchResources();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/user");
      setBookings(res.data);
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await API.get("/resources");
      setResources(res.data);
    } catch (err) {
      console.error("Fetch resources error:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/bookings", form);
      setIsModalOpen(false);
      setForm({
        resourceId: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendees: "1",
        campus: "Malabe Campus",
        category: "Lecture Hall",
        building: "",
        floor: ""
      });
      fetchBookings();
      alert("Booking request submitted!");
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.message || err.message));
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking request?")) return;
    try {
      await API.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert("Cancel failed");
    }
  };

  const filteredBookings = bookings.filter((b) =>
    (statusFilter === "ALL" || b.status === statusFilter) &&
    (b.purpose || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-2 rounded-[24px] border border-white/20">
        <div className="flex items-center gap-4 px-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Facility Reservations</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Space Management</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-indigo-700 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 min-h-[500px] flex flex-col relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>

        {/* Toolbar */}
        <div className="p-8 flex justify-between items-center border-b border-slate-50 relative z-10">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">My Bookings Timeline</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-100 outline-none transition text-xs font-bold"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-transparent rounded-xl outline-none transition text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative z-10">
          {loading ? (
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
              <div className="h-4 w-32 bg-slate-100 rounded"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100 group">
                <Calendar className="w-10 h-10 text-slate-200 group-hover:text-indigo-200 transition-colors" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No matching bookings found.</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={() => cancelBooking(b.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request a Facility</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Fill in the details below</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* User Identity Banner */}
              <div className="bg-slate-50/50 p-6 rounded-[32px] flex items-center justify-between border border-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black">S</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Requested By</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">Senuda</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Verified Identity</div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Campus">
                  <select name="campus" value={form.campus} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition">
                    <option value="Malabe Campus">Malabe Campus</option>
                    <option value="Metro Campus">Metro Campus</option>
                  </select>
                </FormField>
                <FormField label="Category">
                   <select name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition">
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Discussion Room">Discussion Room</option>
                  </select>
                </FormField>
                <FormField label="Building">
                   <select name="resourceId" value={form.resourceId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" required>
                    <option value="">Select Building..</option>
                    {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Floor">
                   <select name="floor" value={form.floor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition">
                    <option value="">Select Floor...</option>
                    <option value="Ground">Ground</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Reason for Booking">
                <textarea 
                  name="purpose" 
                  value={form.purpose} 
                  onChange={handleChange} 
                  placeholder="Tell us what the facility will be used for..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-xs font-bold outline-none focus:border-indigo-500 transition min-h-[120px] resize-none"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <FormField label="Start Date" required>
                  <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                </FormField>
                <FormField label="End Date">
                  <input type="date" name="endDate" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" />
                </FormField>
                <FormField label="Start Time" required>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                </FormField>
                <FormField label="End Time" required>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                </FormField>
              </div>

              <FormField label="Attendees">
                <input type="number" name="attendees" value={form.attendees} onChange={handleChange} min="1" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" />
              </FormField>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition active:scale-95"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  const statusColors = {
    PENDING: "text-amber-500",
    APPROVED: "text-emerald-500",
    REJECTED: "text-rose-500",
    CANCELLED: "text-slate-400"
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:border-indigo-50 transition-all group flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
            <MapPin className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${statusColors[booking.status] || "text-slate-400"}`}>
            {booking.status}
          </span>
        </div>
        
        <div>
          <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-1">
            {booking.purpose || "Resource Booking"}
          </h4>
          <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
            Resource #{booking.resourceId}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{booking.date}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{booking.attendees} Attendees</span>
          </div>
        </div>
      </div>

      {booking.status === "PENDING" && (
        <button 
          onClick={onCancel}
          className="mt-6 w-full py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition shadow-sm shadow-rose-100"
        >
          Cancel Request
        </button>
      )}
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default UserBookingPage;