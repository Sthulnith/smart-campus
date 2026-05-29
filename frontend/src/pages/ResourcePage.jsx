import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Users, 
  Layers,
  Search,
  Filter,
  Monitor,
  Microscope,
  Cpu,
  BookOpen,
  WifiOff,
  CheckCircle2,
  Clock
} from "lucide-react";

function ResourcePage() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    name: "",
    type: "Lecture Hall",
    capacity: "",
    location: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await API.get("/resources");
      setResources(res.data);
    } catch (err) {
      console.error("Fetch resources failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const deleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await API.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const editResource = async (r) => {
    const name = prompt("Enter new name for the resource:", r.name);
    if (!name) return;
    try {
      await API.put(`/resources/${r.id}`, { ...r, name });
      fetchResources();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/resources", form);
      setForm({ name: "", type: "Lecture Hall", capacity: "", location: "", status: "ACTIVE" });
      fetchResources();
    } catch (err) {
      alert("Addition failed");
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const resourceTypes = [
    { label: "Lecture Hall", icon: <BookOpen size={14} />, count: resources.filter(r => r.type === "Lecture Hall").length },
    { label: "Laboratory", icon: <Microscope size={14} />, count: resources.filter(r => r.type === "Laboratory").length },
    { label: "Equipment", icon: <Cpu size={14} />, count: resources.filter(r => r.type === "Equipment").length },
    { label: "Meeting Room", icon: <Users size={14} />, count: resources.filter(r => r.type === "Meeting Room").length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
           <div className="p-2 bg-indigo-100 rounded-xl"><Building2 className="w-8 h-8 text-indigo-600" /></div>
           Campus Resources
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-14">Facility Inventory</p>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setTypeFilter("ALL")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${typeFilter === "ALL" ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200"}`}
          >
            All Resources <span className="opacity-60">{resources.length}</span>
          </button>
          {resourceTypes.map((t) => (
            <button 
              key={t.label}
              onClick={() => setTypeFilter(t.label)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${typeFilter === t.label ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200"}`}
            >
              {t.icon} {t.label} <span className="opacity-60">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">Results: {filteredResources.length}</div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden min-h-[500px]">
        
        {/* Search Bar */}
        <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none transition text-xs font-bold"
            />
          </div>
          <div className="flex gap-2">
             <select className="px-4 py-3 bg-slate-50/50 border border-transparent rounded-2xl text-xs font-bold text-slate-500 outline-none hover:bg-white transition cursor-pointer">
                <option>All Types</option>
             </select>
             <select className="px-4 py-3 bg-slate-50/50 border border-transparent rounded-2xl text-xs font-bold text-slate-500 outline-none hover:bg-white transition cursor-pointer">
                <option>All Locations</option>
             </select>
             <button className="p-3 bg-slate-50/50 border border-transparent rounded-2xl hover:bg-white transition text-slate-400">
               <Filter size={18} />
             </button>
          </div>
        </div>

        {/* Admin Section (Add Resource) */}
        {isAdmin && (
           <div className="mx-8 mt-8 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-indigo-900 tracking-tight">Register New Facility</h3>
                <Plus className="w-5 h-5 text-indigo-400" />
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                 <input name="name" placeholder="Facility Name" value={form.name} onChange={handleChange} className="bg-white border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-300 transition" required />
                 <select name="type" value={form.type} onChange={handleChange} className="bg-white border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-300 transition">
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Meeting Room">Meeting Room</option>
                 </select>
                 <input name="capacity" placeholder="Capacity" value={form.capacity} onChange={handleChange} className="bg-white border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-300 transition" required />
                 <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="bg-white border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-300 transition" required />
                 <button type="submit" className="bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-100">Add Facility</button>
              </form>
           </div>
        )}

        {/* Resources Grid */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
               <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning inventory...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                <Layers className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No facilities found.</h3>
              <p className="text-slate-400 text-sm font-medium">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredResources.map((r) => (
                <ResourceCard 
                  key={r.id} 
                  resource={r} 
                  isAdmin={isAdmin}
                  onEdit={() => editResource(r)}
                  onDelete={() => deleteResource(r.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource, isAdmin, onEdit, onDelete }) {
  const typeConfigs = {
    "Lecture Hall": { icon: <BookOpen size={18} />, color: "bg-blue-600", shadow: "shadow-blue-100" },
    "Laboratory": { icon: <Microscope size={18} />, color: "bg-emerald-600", shadow: "shadow-emerald-100" },
    "Equipment": { icon: <Cpu size={18} />, color: "bg-amber-600", shadow: "shadow-amber-100" },
    "Meeting Room": { icon: <Users size={18} />, color: "bg-rose-600", shadow: "shadow-rose-100" },
    "default": { icon: <Users size={18} />, color: "bg-indigo-600", shadow: "shadow-indigo-100" }
  };

  const typeConfig = typeConfigs[resource.type] || typeConfigs.default;

  const statusConfig = {
    ACTIVE: { label: "ACTIVE", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500", topBorder: "border-emerald-500" },
    MAINTENANCE: { label: "OUT OF SERVICE", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100", dot: "bg-rose-500", topBorder: "border-rose-500" },
    INACTIVE: { label: "INACTIVE", color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", dot: "bg-slate-400", topBorder: "border-slate-400" }
  };

  const config = statusConfig[resource.status] || statusConfig.ACTIVE;

  return (
    <div className={`bg-white rounded-[28px] border-t-4 ${config.topBorder} border-x border-b border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group overflow-hidden flex flex-col justify-between`}>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className={`p-3 ${typeConfig.color} rounded-2xl shadow-lg ${typeConfig.shadow} text-white`}>
            {typeConfig.icon}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${config.bg} ${config.color} ${config.border} text-[9px] font-black uppercase tracking-widest`}>
            {resource.status === 'MAINTENANCE' && <WifiOff size={10} />}
            {resource.status === 'ACTIVE' && <CheckCircle2 size={10} />}
            {config.label}
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-900 tracking-tight line-clamp-1">{resource.name}</h4>
          <span className="px-2 py-0.5 bg-slate-50 text-indigo-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-indigo-50 inline-block">{resource.type}</span>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-3 text-slate-400">
             <MapPin size={12} />
             <span className="text-[10px] font-bold truncate">{resource.location}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
             <Users size={12} />
             <span className="text-[10px] font-bold">Capacity: {resource.capacity}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
             <Clock size={12} />
             <span className="text-[10px] font-bold">Mon-Fri, 08:00 AM - 05:00 PM</span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="p-4 bg-slate-50/50 flex gap-2 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={onEdit} className="flex-1 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 border border-slate-100 hover:bg-indigo-600 hover:text-white transition shadow-sm flex items-center justify-center gap-1">
              <Edit3 size={10} /> Edit
           </button>
           <button onClick={onDelete} className="flex-1 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-500 border border-slate-100 hover:bg-rose-600 hover:text-white transition shadow-sm flex items-center justify-center gap-1">
              <Trash2 size={10} /> Delete
           </button>
        </div>
      )}
    </div>
  );
}

export default ResourcePage;