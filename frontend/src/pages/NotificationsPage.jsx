import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  Filter,
  MailOpen,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const STORAGE_KEY = "unisync_notifications_v1";

function buildDefaultNotifications(user) {
  const role = (user?.role || "ROLE_USER").replace("ROLE_", "");
  const name = user?.name || "Campus User";

  const base = [
    {
      id: "welcome",
      title: `Welcome, ${name.split(" ")[0] || "there"}!`,
      message: "Your UniSync profile is ready. You can manage bookings, tickets, and facilities from the sidebar.",
      type: "INFO",
      createdAt: Date.now() - 1000 * 60 * 30,
      read: false,
    },
    {
      id: "security",
      title: "Security reminder",
      message: "Use a strong password and keep your session secure—especially on shared devices.",
      type: "SECURITY",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      read: true,
    },
  ];

  if (role === "ADMIN") {
    base.unshift({
      id: "admin-tools",
      title: "Admin tools unlocked",
      message: "You can approve bookings, manage tickets, and create admin accounts from Manage Users.",
      type: "ADMIN",
      createdAt: Date.now() - 1000 * 60 * 10,
      read: false,
    });
  }

  if (role === "TECHNICIAN") {
    base.unshift({
      id: "tech-workflow",
      title: "Technician workflow",
      message: "Assigned tickets will appear in My Tickets. Update status with resolution notes when resolving.",
      type: "TECHNICIAN",
      createdAt: Date.now() - 1000 * 60 * 12,
      read: false,
    });
  }

  return base;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function formatTimeAgo(ts) {
  const delta = Date.now() - ts;
  const minutes = Math.max(1, Math.floor(delta / (1000 * 60)));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all"); // all | unread
  const [type, setType] = useState("any"); // any | INFO | SECURITY | ADMIN | TECHNICIAN

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;

    if (Array.isArray(parsed) && parsed.length > 0) {
      setItems(parsed);
      return;
    }

    const defaults = buildDefaultNotifications(user);
    setItems(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  }, [user]);

  useEffect(() => {
    if (items.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

  const visible = useMemo(() => {
    let next = [...items].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "unread") next = next.filter((n) => !n.read);
    if (type !== "any") next = next.filter((n) => n.type === type);
    return next;
  }, [items, filter, type]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const resetDefaults = () => {
    const defaults = buildDefaultNotifications(user);
    setItems(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  };

  const toggleRead = (id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Notifications
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Updates, security alerts, and system messages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-50 shadow-sm">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Unread
            </span>
            <span className="ml-1 text-xs font-black text-slate-900">
              {unreadCount}
            </span>
          </span>

          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>

          <button
            onClick={resetDefaults}
            className="px-4 py-2 rounded-2xl bg-white border border-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-2xl bg-white border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Inbox
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
              ]}
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="any">Any type</option>
              <option value="INFO">Info</option>
              <option value="SECURITY">Security</option>
              <option value="ADMIN">Admin</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-4">
          {visible.length === 0 ? (
            <EmptyState />
          ) : (
            visible.map((n) => (
              <NotificationCard
                key={n.id}
                item={n}
                onToggleRead={() => toggleRead(n.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-1 flex">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={[
              "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function typeMeta(type) {
  switch (type) {
    case "SECURITY":
      return {
        badge: "Security",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
        icon: <CircleAlert className="w-4 h-4 text-amber-600" />,
      };
    case "ADMIN":
      return {
        badge: "Admin",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
        icon: <Bell className="w-4 h-4 text-indigo-600" />,
      };
    case "TECHNICIAN":
      return {
        badge: "Technician",
        badgeClass: "bg-teal-50 text-teal-700 border-teal-100",
        icon: <Bell className="w-4 h-4 text-teal-600" />,
      };
    default:
      return {
        badge: "Info",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
        icon: <Bell className="w-4 h-4 text-slate-600" />,
      };
  }
}

function NotificationCard({ item, onToggleRead }) {
  const meta = typeMeta(item.type);
  return (
    <div
      className={[
        "rounded-3xl border p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition",
        item.read
          ? "bg-white border-slate-100"
          : "bg-indigo-50/40 border-indigo-100",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
          {meta.icon}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={[
                "inline-flex items-center px-3 py-1 rounded-2xl border text-[9px] font-black uppercase tracking-widest",
                meta.badgeClass,
              ].join(" ")}
            >
              {meta.badge}
            </span>
            {!item.read && (
              <span className="inline-flex items-center px-3 py-1 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-black uppercase tracking-widest">
                Unread
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {formatTimeAgo(item.createdAt)}
            </span>
          </div>

          <p className="text-sm font-black text-slate-900 tracking-tight">
            {item.title}
          </p>
          <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1">
            {item.message}
          </p>
        </div>
      </div>

      <button
        onClick={onToggleRead}
        className="w-full md:w-auto px-4 py-2 rounded-2xl bg-white border border-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition active:scale-95"
      >
        <MailOpen className="w-4 h-4" />
        {item.read ? "Mark unread" : "Mark read"}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-slate-100 bg-slate-50/60 p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-3xl bg-white border border-slate-100 flex items-center justify-center">
        <Bell className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="mt-5 text-lg font-black text-slate-900 tracking-tight">
        You’re all caught up
      </h3>
      <p className="mt-2 text-sm font-semibold text-slate-600">
        No notifications match your current filters.
      </p>
    </div>
  );
}

export default NotificationsPage;

