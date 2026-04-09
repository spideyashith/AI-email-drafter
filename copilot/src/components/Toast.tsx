"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", onDismiss, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [onDismiss, duration]);

  const bg = type === "success" ? "bg-slate-900" : "bg-red-600";
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${bg} text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-lg transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      style={{ maxWidth: 360 }}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="hover:opacity-70 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}
