import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

function Header() {
  const { user } = useAuth();
  const location = useLocation();

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
        <div className="hidden md:flex items-center gap-3 text-slate-300">
           <Search size={18} />
           <span className="text-xs font-bold uppercase tracking-widest">Search anything...</span>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
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