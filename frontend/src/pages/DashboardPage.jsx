import React, { useEffect, useState } from "react";
import API from "../services/api";
import { 
  LayoutDashboard, 
  Layers, 
  Clock, 
  Ticket, 
  CheckCircle2, 
  Plus, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  BarChart3
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalResources: 0,
    pendingBookings: 0,
    openTickets: 0,
    resolvedTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resourcesRes, bookingsRes, ticketsRes] = await Promise.all([
        API.get("/resources"),
        API.get(isAdmin ? "/bookings" : "/bookings/user"),
        API.get("/tickets")
      ]);

      const allBookings = bookingsRes.data;
      const allTickets = ticketsRes.data;

      setStats({
        totalResources: resourcesRes.data.length,
        pendingBookings: allBookings.filter(b => b.status === "PENDING").length,
        openTickets: allTickets.filter(t => t.status === "OPEN").length,
        resolvedTasks: allBookings.filter(b => b.status === "APPROVED").length + allTickets.filter(t => t.status === "RESOLVED").length
      });

      // Dynamic Activities Generation
      const activities = [];

      // 1. Booking Status Changes (Approved/Rejected)
      allBookings
        .filter(b => b.status === "APPROVED" || b.status === "REJECTED")
        .sort((a, b) => b.id - a.id) // Recent IDs first
        .slice(0, 3)
        .forEach(b => {
          activities.push({
            id: `booking-${b.id}`,
            type: b.status === "APPROVED" ? "BOOKING_APPROVED" : "BOOKING_REJECTED",
            message: `Booking for ${resourcesRes.data.find(r => r.id === b.resourceId)?.name || 'Resource'} was ${b.status.toLowerCase()} by Admin.`,
            time: "Recently",
            icon: b.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />,
            status: b.status
          });
        });

      // 2. Resource Additions
      resourcesRes.data
        .sort((a, b) => b.id - a.id)
        .slice(0, 2)
        .forEach(r => {
          activities.push({
            id: `resource-${r.id}`,
            type: "RESOURCE_ADDED",
            message: `New ${r.type.toLowerCase()} "${r.name}" has been registered in ${r.location}.`,
            time: "New",
            icon: <Plus className="w-4 h-4 text-indigo-500" />,
            status: "ACTIVE"
          });
        });

      setRecentActivities(activities);

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Resources" 
          value={stats.totalResources.toString().padStart(2, '0')} 
          icon={<Layers className="w-6 h-6 text-white" />} 
          iconBg="bg-indigo-600" 
        />
        <StatCard 
          label="Pending Bookings" 
          value={stats.pendingBookings.toString().padStart(2, '0')} 
          icon={<Clock className="w-6 h-6 text-white" />} 
          iconBg="bg-blue-600" 
        />
        <StatCard 
          label="Open Tickets" 
          value={stats.openTickets.toString().padStart(2, '0')} 
          icon={<Ticket className="w-6 h-6 text-white" />} 
          iconBg="bg-rose-600" 
        />
        <StatCard 
          label="Resolved Tasks" 
          value={stats.resolvedTasks.toString().padStart(2, '0')} 
          icon={<CheckCircle2 className="w-6 h-6 text-white" />} 
          iconBg="bg-teal-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <Activity className="w-5 h-5 text-indigo-600" />
               <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Activities</h2>
            </div>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="p-8 space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{activity.type}</p>
                    <p className="text-sm font-bold text-slate-700 tracking-tight">{activity.message}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
             <AlertCircle className="w-5 h-5 text-amber-500" />
             <h2 className="text-lg font-black text-slate-900 tracking-tight">Actions</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <button 
              onClick={() => navigate("/bookings")}
              className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              New Booking
            </button>
            
            <button 
              onClick={() => navigate("/tickets")}
              className="w-full bg-white border border-slate-100 text-slate-600 p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              Report Incident
            </button>

            <button 
              onClick={() => navigate("/booking-analysis")}
              className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-xl shadow-slate-100 active:scale-95"
            >
              <BarChart3 className="w-4 h-4" />
              Booking Analysis
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Unisync Management v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, iconBg }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-6 group hover:border-indigo-100 transition-all cursor-default">
      <div className={`p-4 ${iconBg} rounded-2xl shadow-lg shadow-indigo-50 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

export default DashboardPage;
