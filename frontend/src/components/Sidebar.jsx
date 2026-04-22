import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Ticket, 
  Bell, 
  Users, 
  User, 
  LogOut,
  GraduationCap
} from "lucide-react";

function Sidebar() {
  const { user, isAdmin, isTechnician, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="w-72 bg-white h-screen sticky top-0 border-r border-slate-50 flex flex-col p-8 gap-10">
      
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">UniSync</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/facilities" icon={<Building2 size={20} />} label="Facilities" />
        
        {!isAdmin && (
          <SidebarLink to="/bookings" icon={<Calendar size={20} />} label="My Bookings" />
        )}
        
        {isAdmin && (
          <SidebarLink to="/admin-bookings" icon={<Calendar size={20} />} label="Bookings" />
        )}

        {isAdmin && (
          <SidebarLink to="/admin-tickets" icon={<Ticket size={20} />} label="Tickets" />
        )}
        
        {isTechnician && (
          <SidebarLink to="/technician-tickets" icon={<Ticket size={20} />} label="My Tickets" />
        )}
        
        {!isAdmin && !isTechnician && (
          <SidebarLink to="/tickets" icon={<Ticket size={20} />} label="Tickets" />
        )}
        
        <SidebarLink to="/notifications" icon={<Bell size={20} />} label="Notifications" />
        
        {isAdmin && (
          <SidebarLink to="/admin/create-admin" icon={<Users size={20} />} label="Manage Users" />
        )}
        
        <SidebarLink to="/profile" icon={<User size={20} />} label="Profile" />
      </nav>

      {/* Footer User Card */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-50/50 flex items-center gap-4 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200">
               <img 
                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover"
               />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-800 truncate tracking-tight leading-tight">{user?.name || "User"}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user?.role?.replace("ROLE_", "") || "Guest"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-2 text-rose-500 font-black text-xs tracking-tight hover:opacity-80 transition-all group"
        >
          <LogOut size={18} className="text-rose-500 transition-transform group-hover:translate-x-1" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
}

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
        ${isActive 
          ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}
      `}
    >
      <span className="transition-transform duration-300">{icon}</span>
      <span className="text-xs font-bold tracking-tight">{label}</span>
    </NavLink>
  );
}

export default Sidebar;