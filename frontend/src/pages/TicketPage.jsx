import React, { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { 
  Ticket, Plus, Search, Clock, CheckCircle2, AlertCircle, BarChart3, X, Send,
  Upload, ChevronDown, Edit2, Trash2, MessageSquare, XCircle
} from "lucide-react";

function TicketPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicketId, setDeletingTicketId] = useState(null);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [existingEditImages, setExistingEditImages] = useState([]);

  const backendUrl = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api").replace(/\/api$/, "");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "LOW",
    category: "Hardware",
    location: "",
    contact: ""
  });


  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "LOW",
    category: "Hardware",
    location: "",
    contact: ""
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tickets/my");
      setTickets(res.data);
    } catch (err) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setEditForm({
      title: ticket.title || "",
      description: ticket.description || "",
      priority: ticket.priority || "LOW",
      category: ticket.category || "Hardware",
      location: ticket.location || "",
      contact: ticket.contact || ""
    });
    setExistingEditImages(ticket.imageUrls || []);
    setEditImages([]);
    setIsEditModalOpen(true);
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/tickets/${editingTicket.id}`, editForm);

      // Upload new images if any
      if (editImages.length > 0) {
        const formData = new FormData();
        editImages.forEach(img => formData.append("files", img.file));
        await API.post(`/tickets/${editingTicket.id}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setIsEditModalOpen(false);
      setEditingTicket(null);
      setEditImages([]);
      fetchTickets();
    } catch (err) {
      console.error("Edit error:", err);
      alert(err.response?.data?.message || "Failed to update ticket");
    }
  };
  


  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const validFiles = files.filter(f => validTypes.includes(f.type));
    if (validFiles.length !== files.length) {
      alert("Only JPG, JPEG, and PNG images are allowed.");
    }
    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => ({ file, preview: URL.createObjectURL(file) }));
      setEditImages(prev => [...prev, ...newImages].slice(0, 3));
    }
  };

  const openDeleteModal = (ticketId) => {
    setDeletingTicketId(ticketId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/tickets/${deletingTicketId}`);
      setIsDeleteModalOpen(false);
      setDeletingTicketId(null);
      fetchTickets();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete ticket");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const validFiles = files.filter(f => validTypes.includes(f.type));
    if (validFiles.length !== files.length) {
      alert("Only JPG, JPEG, and PNG images are allowed.");
    }
    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => ({ file, preview: URL.createObjectURL(file) }));
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 3));
    }
  };


  const removeImage = (index) => setSelectedImages(prev => prev.filter((_, i) => i !== index));

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Title is required";
    else if (form.title.trim().length < 5) errors.title = "Title must be at least 5 characters";
    if (!form.description.trim()) errors.description = "Description is required";
    else if (form.description.trim().length < 10) errors.description = "Description must be at least 10 characters";
    if (!form.location.trim()) errors.location = "Location is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await API.post("/tickets", form);
      const ticketId = res.data.id;

      // Upload images if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(img => formData.append("files", img.file));
        await API.post(`/tickets/${ticketId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setIsModalOpen(false);
      setForm({ title: "", description: "", priority: "LOW", category: "Hardware", location: "", contact: "" });
      setSelectedImages([]);
      setFormErrors({});
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Report failed");
    }
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === "OPEN").length,
    active: tickets.filter(t => t.status === "IN_PROGRESS").length,
    completed: tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length,
  };

  const filteredTickets = tickets.filter(t => 
    (statusFilter === "ALL" || t.status === statusFilter) &&
    ((t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
     (t.description || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-2 rounded-[24px] border border-white/20">
        <div className="flex items-center gap-4 px-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ticketing System</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Campus Management</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-indigo-700 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Report Issue
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Influx" value={stats.total} icon={<BarChart3 className="w-6 h-6 text-indigo-600" />} color="bg-indigo-50" active={true} />
        <StatCard label="Open" value={stats.pending} icon={<AlertCircle className="w-6 h-6 text-amber-600" />} color="bg-amber-50" />
        <StatCard label="In Progress" value={stats.active} icon={<Clock className="w-6 h-6 text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50" />
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 min-h-[500px] flex flex-col overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-slate-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none transition text-xs font-bold"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50/50 rounded-xl border border-transparent hover:bg-white hover:border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Tickets Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
          {loading ? (
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
              <div className="h-4 w-32 bg-slate-100 rounded"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center text-center max-w-sm animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100 group">
                <div className="p-4 bg-white rounded-2xl shadow-sm"><Ticket className="w-10 h-10 text-slate-200 group-hover:text-indigo-200 transition-colors" /></div>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Tickets Found</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                There are no maintenance records recorded in the system yet.
              </p>
            </div>
          ) : (
             <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map(t => (
                  <TicketCard 
                    key={t.id} 
                    ticket={t} 
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    expanded={expandedTicketId === t.id}
                    onToggleComments={() => setExpandedTicketId(expandedTicketId === t.id ? null : t.id)}
                    currentUser={user}
                  />
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Report Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Incident</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full inline-block"></span> Maintenance Operations</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setSelectedImages([]); }} className="p-2 hover:bg-slate-50 rounded-full transition">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <FormField label="Incident Title" hint={`${form.title.length}/200`}>
                  <input name="title" value={form.title} onChange={(e) => { handleChange(e); setFormErrors(prev => ({...prev, title: ""})); }} placeholder="e.g. Broken Lighting in Hallway B" className={`w-full bg-slate-50 border rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition ${formErrors.title ? "border-rose-400" : "border-slate-100"}`} maxLength={200} />
                   {formErrors.title && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{formErrors.title}</p>}
                </FormField>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Priority Level">
                    <select name="priority" value={form.priority} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-indigo-500 transition cursor-pointer">
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </FormField>
                  <FormField label="Issue Category">
                    <select name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-indigo-500 transition cursor-pointer">
                      <option value="Hardware">HARDWARE</option>
                      <option value="Software">SOFTWARE</option>
                      <option value="Network">NETWORK</option>
                      <option value="Facility">FACILITY</option>
                      <option value="Other">OTHER</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Facility / Location">
                    <input name="location" value={form.location} onChange={(e) => { handleChange(e); setFormErrors(prev => ({...prev, location: ""})); }} placeholder="e.g. Block C - 302" className={`w-full bg-slate-50 border rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition ${formErrors.location ? "border-rose-400" : "border-slate-100"}`} />
                     {formErrors.location && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{formErrors.location}</p>}
                  </FormField>
                  <FormField label="Preferred Contact">
                    <input name="contact" value={form.contact} onChange={handleChange} placeholder="e.g. +94 77..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" />
                  </FormField>
                </div>

                <FormField label="Visual Evidence" hint={`${selectedImages.length}/3 images`} hintColor={selectedImages.length >= 3 ? "text-rose-500" : "text-slate-300"}>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept=".jpg,.jpeg,.png" className="hidden" />
                   
                   {selectedImages.length > 0 ? (
                     <div className="grid grid-cols-3 gap-4">
                        {selectedImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-100">
                             <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                             <button 
                               type="button"
                               onClick={() => removeImage(idx)}
                               className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition shadow-sm"
                             >
                               <X size={14} />
                             </button>
                          </div>
                        ))}
                        {selectedImages.length < 3 && (
                          <button 
                            type="button"
                            onClick={handleUploadClick}
                            className="aspect-video rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 bg-slate-50/30 hover:bg-slate-50 transition"
                          >
                             <Plus className="w-5 h-5 text-slate-300" />
                             <span className="text-[10px] font-black text-slate-400 uppercase">Add More</span>
                          </button>
                        )}
                     </div>
                   ) : (
                     <div onClick={handleUploadClick} className="w-full border-2 border-dashed border-slate-100 rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 bg-slate-50/30 hover:bg-slate-50 transition cursor-pointer group">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-indigo-500 group-hover:shadow-indigo-50 transition-all">
                          <Upload size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black text-slate-900 tracking-tight">Click to upload photos</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">JPG, JPEG OR PNG (MAX 3)</p>
                        </div>
                     </div>
                   )}
                </FormField>

                <FormField label="Incident Description" hint="Required">
                   <textarea name="description" value={form.description} onChange={(e) => { handleChange(e); setFormErrors(prev => ({...prev, description: ""})); }} placeholder="Provide technical details about the issue..." className={`w-full bg-slate-50 border rounded-[24px] p-6 text-xs font-bold outline-none focus:border-indigo-500 transition min-h-[120px] resize-none ${formErrors.description ? "border-rose-400" : "border-slate-100"}`} />
                   {formErrors.description && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{formErrors.description}</p>}
                </FormField>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setSelectedImages([]); }} className="flex-1 py-4 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition flex items-center justify-center gap-3 active:scale-95">
                  <Send size={16} />
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {isEditModalOpen && editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Ticket</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full inline-block"></span> Update Maintenance Record</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <FormField label="Incident Title" hint={`${editForm.title.length}/200`}>
                  <input name="title" value={editForm.title} onChange={handleEditChange} placeholder="e.g. Broken Lighting" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" required maxLength={200} />
                </FormField>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Priority Level">
                    <select name="priority" value={editForm.priority} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-indigo-500 transition cursor-pointer">
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </FormField>
                  <FormField label="Issue Category">
                    <select name="category" value={editForm.category} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-indigo-500 transition cursor-pointer">
                      <option value="Hardware">HARDWARE</option>
                      <option value="Software">SOFTWARE</option>
                      <option value="Network">NETWORK</option>
                      <option value="Facility">FACILITY</option>
                      <option value="Other">OTHER</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Facility / Location">
                    <input name="location" value={editForm.location} onChange={handleEditChange} placeholder="e.g. Block C - 302" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" required />
                  </FormField>
                  <FormField label="Preferred Contact">
                    <input name="contact" value={editForm.contact} onChange={handleEditChange} placeholder="e.g. +94 77..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition" />
                  </FormField>
                </div>

                <FormField label="Visual Evidence" hint={`${editImages.length}/3 new images`} hintColor={editImages.length >= 3 ? "text-rose-500" : "text-slate-300"}>
                   <input type="file" ref={editFileInputRef} onChange={handleEditFileChange} multiple accept=".jpg,.jpeg,.png" className="hidden" />

                   {/* Existing images */}
                   {existingEditImages.length > 0 && (
                     <div className="mb-3">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Images</p>
                       <div className="grid grid-cols-3 gap-3">
                         {existingEditImages.map((url, idx) => (
                           <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100">
                             <img src={`${backendUrl}/uploads/${url}`} alt={`Existing ${idx + 1}`} className="w-full h-full object-cover" />
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* New images to upload */}
                   {editImages.length > 0 ? (
                     <div className="grid grid-cols-3 gap-4">
                       {editImages.map((img, idx) => (
                         <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-100">
                           <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                           <button
                             type="button"
                             onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                             className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition shadow-sm"
                           >
                             <X size={14} />
                           </button>
                         </div>
                       ))}
                       {editImages.length < 3 && (
                         <button
                           type="button"
                           onClick={() => editFileInputRef.current?.click()}
                           className="aspect-video rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 bg-slate-50/30 hover:bg-slate-50 transition"
                         >
                           <Plus className="w-5 h-5 text-slate-300" />
                           <span className="text-[10px] font-black text-slate-400 uppercase">Add More</span>
                         </button>
                       )}
                     </div>
                   ) : (
                     <div onClick={() => editFileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-100 rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/30 hover:bg-slate-50 transition cursor-pointer group">
                       <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-indigo-500 transition-all">
                         <Upload size={20} />
                       </div>
                       <div className="text-center">
                         <p className="text-xs font-black text-slate-900 tracking-tight">Upload new photos</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">JPG, JPEG OR PNG (MAX 3) — replaces existing</p>
                       </div>
                     </div>
                   )}
                </FormField>

                <FormField label="Incident Description">
                   <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Provide details..." className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-xs font-bold outline-none focus:border-indigo-500 transition min-h-[120px] resize-none" required />
                </FormField>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition flex items-center justify-center gap-3 active:scale-95">
                  <Send size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-rose-50 rounded-full">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delete Ticket?</h2>
                <p className="text-sm text-slate-500 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex gap-4 w-full pt-4">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-100 transition flex items-center justify-center gap-3 active:scale-95">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, active }) {
  return (
    <div className={`p-6 rounded-[32px] border ${active ? 'bg-white border-indigo-500 ring-4 ring-indigo-50' : 'bg-white border-slate-50'} shadow-sm flex items-center justify-between group transition-all`}>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Tickets</span>
        </div>
      </div>
      <div className={`p-4 ${color} rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
        {icon}
      </div>
    </div>
  );
}

function FormField({ label, children, hint, hintColor = "text-slate-300" }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {hint && <span className={`text-[9px] font-black uppercase tracking-widest ${hintColor}`}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TicketCard({ ticket, onEdit, onDelete, expanded, onToggleComments, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const formatDuration = (start, end) => {
    const diffMs = end - start;
    const totalMin = Math.floor(diffMs / 60000);
    if (totalMin < 1) return "< 1 min";
    const days = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const mins = totalMin % 60;
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hr`);
    if (mins > 0) parts.push(`${mins} min`);
    return parts.join(" ") || "< 1 min";
  };

  const priorityColors = {
    LOW: "text-emerald-500 bg-emerald-50 border-emerald-100",
    MEDIUM: "text-amber-500 bg-amber-50 border-amber-100",
    HIGH: "text-rose-500 bg-rose-50 border-rose-100",
    URGENT: "text-red-600 bg-red-50 border-red-200"
  };

  const statusColors = {
    OPEN: "text-blue-600 bg-blue-50",
    IN_PROGRESS: "text-amber-600 bg-amber-50",
    RESOLVED: "text-emerald-600 bg-emerald-50",
    CLOSED: "text-slate-600 bg-slate-100",
    REJECTED: "text-rose-600 bg-rose-50"
  };

  useEffect(() => {
    if (expanded) fetchComments();
  }, [expanded]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await API.get(`/tickets/${ticket.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await API.post(`/tickets/${ticket.id}/comments`, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const saveEditComment = async (commentId) => {
    try {
      await API.put(`/tickets/${ticket.id}/comments/${commentId}`, { content: editCommentText });
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to edit comment");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await API.delete(`/tickets/${ticket.id}/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
           <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
              <Ticket className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
           </div>
           <div className="flex gap-2">
             <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[ticket.status] || "text-slate-500 bg-slate-50"}`}>
                {(ticket.status || "OPEN").replace("_", " ")}
             </span>
             <span className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${priorityColors[ticket.priority] || priorityColors.LOW}`}>
                {ticket.priority}
             </span>
           </div>
        </div>

        <div>
          <h4 className="text-lg font-black text-slate-900 tracking-tight line-clamp-1">{ticket.title || ticket.description}</h4>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{ticket.category}</p>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ticket.description}</p>
        
        {ticket.location && (
          <p className="text-[10px] text-slate-400"><span className="font-bold">Location:</span> {ticket.location}</p>
        )}

        {ticket.rejectionReason && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-600">Rejection Reason: {ticket.rejectionReason}</p>
          </div>
        )}

        {ticket.resolutionNotes && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600">Resolution: {ticket.resolutionNotes}</p>
          </div>
        )}

        {/* Timeline Details */}
        <div className="p-4 bg-slate-50/80 rounded-2xl space-y-2.5 border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Timeline</p>

          {ticket.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500">Created</span>
              <span className="text-[10px] font-semibold text-slate-700">
                {new Date(ticket.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
              </span>
            </div>
          )}

          {ticket.firstResponseAt && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500">First Response</span>
                <span className="text-[10px] font-semibold text-slate-700">
                  {new Date(ticket.firstResponseAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-blue-500">Response Time</span>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  {formatDuration(new Date(ticket.createdAt), new Date(ticket.firstResponseAt))}
                </span>
              </div>
            </>
          )}

          {ticket.resolvedAt && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500">Resolved</span>
                <span className="text-[10px] font-semibold text-slate-700">
                  {new Date(ticket.resolvedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-500">Resolution Time</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  {formatDuration(new Date(ticket.createdAt), new Date(ticket.resolvedAt))}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: T-{100 + ticket.id}</span>
           <button onClick={onToggleComments} className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700">
             <MessageSquare size={12} />
             Comments
           </button>
        </div>
      </div>

      {/* Comments Section */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-slate-400">Loading comments...</p>
          ) : (
            <>
              {comments.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl">
                  {editingCommentId === c.id ? (
                    <div className="space-y-2">
                      <textarea value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-indigo-500" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEditComment(c.id)} className="text-[10px] font-bold text-indigo-600 hover:underline">Save</button>
                        <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-bold text-slate-400 hover:underline">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold text-indigo-600">{c.userName}</p>
                        <div className="flex gap-1">
                          {currentUser?.id === c.userId && (
                            <button onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content); }} className="p-1 hover:bg-white rounded">
                              <Edit2 size={10} className="text-slate-400" />
                            </button>
                          )}
                          {(currentUser?.id === c.userId || currentUser?.role === "ROLE_ADMIN") && (
                            <button onClick={() => deleteComment(c.id)} className="p-1 hover:bg-white rounded">
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
                  onKeyDown={e => e.key === "Enter" && addComment()}
                />
                <button onClick={addComment} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition">
                  <Send size={12} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {ticket.status === "OPEN" && (
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
          <button 
            onClick={() => onEdit(ticket)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button 
            onClick={() => onDelete(ticket.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default TicketPage;