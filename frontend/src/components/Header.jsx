import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Bell, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const updateCount = () => {
      const raw = localStorage.getItem("unisync_notifications_v1");
      if (raw) {
        try {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            setUnreadCount(items.filter(n => !n.read).length);
          }
        } catch (e) {
          console.error("Failed to parse notifications", e);
        }
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    const interval = setInterval(updateCount, 3000); // Poll since storage event only fires across tabs

    return () => {
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // For now, let's just alert or navigate to a search page if it existed
      console.log("Searching for:", searchTerm);
    }
  };

  // Map path to Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/resources" || path === "/facilities") return "FACILITIES";
    if (path === "/bookings" || path === "/admin-bookings") return "BOOKINGS";
    if (path === "/tickets" || path === "/admin-tickets" || path === "/technician-tickets") return "TICKETS";
    if (path === "/notifications") return "NOTIFICATIONS";
    if (path === "/profile") return "PROFILE";
    if (path === "/admin/create-admin") return "MANAGE USERS";
    return "DASHBOARD";
  };

  return (
    <div className="bg-white/70 backdrop-blur-md px-10 py-6 flex justify-between items-center sticky top-0 z-40 border-b border-slate-50/50">
      <div className="flex items-center gap-4">
         <h1 className="text-sm font-black text-slate-900 tracking-widest uppercase">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-8">
        {/* Search placeholder */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-3 text-slate-300 bg-slate-50/50 px-4 py-2 rounded-xl border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
           <Search size={18} className="text-slate-400" />
           <input 
             type="text"
             placeholder="Search anything..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-slate-600 placeholder:text-slate-300 w-48"
           />
        </form>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/notifications")}
            className="relative p-2 text-slate-400 hover:text-indigo-600 transition"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black text-slate-400 text-right uppercase tracking-tighter">
              Welcome, <br />
              <span className="text-slate-900 text-xs tracking-tight capitalize">
                {user?.name?.toLowerCase() || "User"}
              </span>
            </p>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-50 overflow-hidden">
               {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;