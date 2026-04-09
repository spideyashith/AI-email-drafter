"use client";

import { Sparkles, Zap, LayoutGrid, Settings } from "lucide-react";

type Page = "analyzer" | "dashboard";

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenSettings: () => void;
}

const NAV_ITEMS: { key: Page; label: string; Icon: React.ElementType }[] = [
  { key: "analyzer",  label: "Job Analyzer",  Icon: Zap },
  { key: "dashboard", label: "Dashboard",     Icon: LayoutGrid },
];

export default function Navbar({ currentPage, onNavigate, onOpenSettings }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center px-5 gap-1">
      {/* Brand */}
      <div className="flex items-center gap-2 pr-4 mr-2 border-r border-slate-100 py-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="font-medium text-sm text-slate-900">CoPilot</span>
      </div>

      {NAV_ITEMS.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onNavigate(key)}
          className={`flex items-center gap-1.5 text-sm px-3 py-4 border-b-2 transition-colors
            ${currentPage === key
              ? "border-indigo-600 text-indigo-600 font-medium"
              : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Settings size={13} />
          Settings
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-medium text-indigo-600">
          AK
        </div>
      </div>
    </nav>
  );
}
