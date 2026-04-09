"use client";

import { useState } from "react";
import { LayoutGrid, List, Zap, AlertTriangle, Download } from "lucide-react";
import { type Application, type AppStatus } from "@/lib/mockData";

const STATUS_CONFIG: Record<AppStatus, { dot: string; bg: string; text: string; border: string }> = {
  Applied:      { dot: "#0ea5e9", bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200" },
  Interviewing: { dot: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Rejected:     { dot: "#ef4444", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
};

const KANBAN_COLUMNS: AppStatus[] = ["Applied", "Interviewing", "Rejected"];

function CompanyLogo({ app, size = 32 }: { app: Application; size?: number }) {
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-lg text-white font-medium"
      style={{ width: size, height: size, background: app.logoColor, fontSize: size * 0.44 }}
    >
      {app.logo}
    </div>
  );
}

function StatusBadge({ status }: { status: AppStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function FollowUpBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
      <AlertTriangle size={11} className="text-amber-500 shrink-0" />
      <span className="text-xs font-medium text-amber-700">Follow-up due</span>
    </div>
  );
}

interface DashboardProps {
  applications: Application[];
  onNewApplication: () => void;
}

export default function Dashboard({ applications, onNewApplication }: DashboardProps) {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  const stats = [
    { label: "Total sent",      value: applications.length },
    { label: "Interviewing",    value: applications.filter((a) => a.status === "Interviewing").length },
    { label: "Pending reply",   value: applications.filter((a) => a.status === "Applied").length },
    { label: "Follow-ups due",  value: applications.filter((a) => a.followUp).length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-medium text-slate-900 mb-1">Application Dashboard</h1>
          <p className="text-sm text-slate-500">Track every application and follow-up in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewApplication}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Zap size={13} />
            New Application
          </button>
          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${view === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid size={12} /> Board
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${view === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <List size={12} /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-100 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-medium text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {KANBAN_COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col);
            const c = STATUS_CONFIG[col];
            return (
              <div key={col} className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{col}</span>
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{colApps.length}</span>
                </div>
                <div className="space-y-2">
                  {colApps.length === 0 && (
                    <div className="border border-dashed border-slate-200 rounded-xl p-5 text-center text-xs text-slate-400">
                      No applications
                    </div>
                  )}
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <CompanyLogo app={app} size={30} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{app.role}</p>
                          <p className="text-xs text-slate-500">{app.company}</p>
                        </div>
                      </div>
                      {app.followUp && (
                        <div className="mb-2">
                          <FollowUpBadge />
                        </div>
                      )}
                      <p className="text-xs text-slate-400">{app.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-700">{applications.length} applications</span>
            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={11} />
              Export to Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Company", "Role", "Status", "Applied", "Follow-Up"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <CompanyLogo app={app} size={26} />
                        <span className="text-sm font-medium text-slate-900">{app.company}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{app.role}</td>
                    <td className="px-5 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{app.date}</td>
                    <td className="px-5 py-3">
                      {app.followUp ? (
                        <FollowUpBadge />
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
