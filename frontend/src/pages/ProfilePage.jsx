import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  IdCard,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, fetchCurrentUser } = useAuth();

  const profile = useMemo(
    () => ({
      name: user?.name || "Campus User",
      email: user?.email || "Not available",
      role: (user?.role || "ROLE_USER").replace("ROLE_", ""),
      provider: user?.provider || "LOCAL",
      initials:
        user?.name
          ?.split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("") || "CU",
    }),
    [user]
  );

  const handleRefresh = async () => {
    try {
      await fetchCurrentUser();
    } catch (error) {
      console.error("Failed to refresh profile", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          Profile
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
          Manage your account information and security
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 text-2xl font-black">
                {profile.initials}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Account owner
                </p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {profile.name}
                </h2>
                <p className="text-sm font-bold text-slate-500 mt-1">
                  {profile.email}
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black tracking-widest uppercase">
              <BadgeCheck className="w-4 h-4" />
              Verified session
            </span>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoCard
              icon={<UserCircle2 className="w-5 h-5 text-indigo-600" />}
              label="Full name"
              value={profile.name}
            />
            <InfoCard
              icon={<Mail className="w-5 h-5 text-indigo-600" />}
              label="Email address"
              value={profile.email}
            />
            <InfoCard
              icon={<IdCard className="w-5 h-5 text-indigo-600" />}
              label="Role"
              value={profile.role}
            />
            <InfoCard
              icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
              label="Sign-in provider"
              value={profile.provider}
            />
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm p-8 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Account Actions
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Keep your session and details up to date.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-white border border-rose-100 text-rose-600 p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>

          <div className="mt-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Session note
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              Your current access is controlled by role permissions. Contact an
              administrator if role or account details need changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 hover:bg-white hover:shadow-sm transition">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-black text-slate-800 break-all">{value}</p>
    </div>
  );
}

export default ProfilePage;
