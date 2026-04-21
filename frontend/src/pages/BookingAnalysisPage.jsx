import React, { useEffect, useState } from "react";
import API from "../services/api";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Layers,
  Users,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function BookingAnalysisPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    byCategory: {},
    byStatus: {}
  });

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings");
      const bookings = res.data;

      const stats = {
        total: bookings.length,
        approved: bookings.filter(b => b.status === "APPROVED").length,
        rejected: bookings.filter(b => b.status === "REJECTED").length,
        pending: bookings.filter(b => b.status === "PENDING").length,
        byCategory: {},
        byStatus: {
          APPROVED: bookings.filter(b => b.status === "APPROVED").length,
          REJECTED: bookings.filter(b => b.status === "REJECTED").length,
          PENDING: bookings.filter(b => b.status === "PENDING").length,
        }
      };

      bookings.forEach(b => {
        const cat = b.category || "General";
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      });

      setData(stats);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Analysis...</p>
      </div>
    );
  }

  const maxCatValue = Math.max(...Object.values(data.byCategory), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Booking Analysis</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Detailed utilization & performance metrics</p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalysisCard label="Total Requests" value={data.total} icon={<Layers className="text-indigo-600" />} color="bg-indigo-50" />
        <AnalysisCard label="Approval Rate" value={`${Math.round((data.approved / (data.total || 1)) * 100)}%`} icon={<CheckCircle2 className="text-emerald-600" />} color="bg-emerald-50" />
        <AnalysisCard label="Rejection Rate" value={`${Math.round((data.rejected / (data.total || 1)) * 100)}%`} icon={<XCircle className="text-rose-600" />} color="bg-rose-50" />
        <AnalysisCard label="Pending Ratio" value={`${Math.round((data.pending / (data.total || 1)) * 100)}%`} icon={<Clock className="text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution Chart */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 p-8">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
               <BarChart3 className="w-5 h-5 text-indigo-600" />
               <h2 className="text-lg font-black text-slate-900 tracking-tight">Usage by Category</h2>
             </div>
          </div>
          
          <div className="space-y-6">
            {Object.entries(data.byCategory).map(([cat, count]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                  <span className="text-xs font-black text-slate-900">{count} Bookings</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${(count / maxCatValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 p-8">
           <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
               <PieChart className="w-5 h-5 text-indigo-600" />
               <h2 className="text-lg font-black text-slate-900 tracking-tight">Status Breakdown</h2>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <StatusRow label="Approved" count={data.approved} total={data.total} color="bg-emerald-500" />
             <StatusRow label="Pending" count={data.pending} total={data.total} color="bg-amber-500" />
             <StatusRow label="Rejected" count={data.rejected} total={data.total} color="bg-rose-500" />
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                   <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency Insight</p>
                   <p className="text-xs font-bold text-slate-700 mt-1">Resource allocation is optimal this month.</p>
                </div>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm group hover:border-indigo-100 transition-all">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  );
}

function StatusRow({ label, count, total, color }) {
  const percentage = Math.round((count / (total || 1)) * 100);
  return (
    <div className="p-4 border border-slate-50 rounded-2xl flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
       <div className={`w-3 h-3 rounded-full ${color}`}></div>
       <div className="flex-1">
          <p className="text-xs font-black text-slate-800">{label}</p>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-2">
             <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
          </div>
       </div>
       <div className="text-right">
          <p className="text-xs font-black text-slate-900">{percentage}%</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{count} Units</p>
       </div>
    </div>
  );
}

export default BookingAnalysisPage;
