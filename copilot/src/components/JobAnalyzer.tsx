"use client";

import { useState } from "react";
import {
  Zap, FileText, RefreshCw, Send, Edit3, Copy, CheckCheck,
  Loader2, Sparkles, Check,
} from "lucide-react";
import { MOCK_ANALYSIS, type AnalysisResult } from "@/lib/mockData";

interface MatchRingProps {
  pct: number;
  size?: number;
}

function MatchRing({ pct, size = 72 }: MatchRingProps) {
  const r = 28;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const color = pct >= 80 ? "#10b981" : pct >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="500" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

interface JobAnalyzerProps {
  onApplicationSent: (company: string, role: string, email: string) => void;
}

type AnalyzerState = "idle" | "loading" | "analyzed";

export default function JobAnalyzer({ onApplicationSent }: JobAnalyzerProps) {
  const [state, setState] = useState<AnalyzerState>("idle");
  const [jdText, setJdText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [extractedData, setExtractedData] = useState({ company: "", role: "", recruiterEmail: "" });
  const [bulletCopied, setBulletCopied] = useState(false);

  async function handleAnalyze() {
      if (!jdText.trim()) return;
      setState("loading");

      try {
        // 1. Send the actual HTTP request to your Python server
        const response = await fetch("http://localhost:8000/api/generate-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: "Pending AI Extraction", // We hardcode this until the AI is built
            job_description: jdText,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 2. Receive the data from Python
        const data = await response.json();

        // 3. Update the React state with the real Python data
        setEmailContent(data.generated_email);
        
        // 4. We map the real data (score and email) and use placeholders for the rest
        //    until we program Gemini in the Python backend to return all these fields.
        setAnalysis({
          company: "Pending AI Extraction",
          role: "Pending AI Extraction",
          recruiterEmail: "pending@email.com",
          matchScore: data.match_score, // Real data from Python
          matched: ["MERN", "Next.js"], // Placeholder
          missing: ["Docker", "AWS"],   // Placeholder
          suggestedBullet: "Built full-stack applications using Next.js and FastAPI.", // Placeholder
          email: data.generated_email   // Real data from Python
        });

        setExtractedData({
          company: "Pending AI Extraction",
          role: "Pending AI Extraction",
          recruiterEmail: "pending@email.com",
        });

        setState("analyzed");

      } catch (error) {
        console.error("FastAPI Connection Error:", error);
        alert("Failed to connect to the backend. Make sure uvicorn is running on port 8000!");
        setState("idle");
      }
    }

  function handleRegenerate() {
    if (!analysis) return;
    setState("loading");
    setTimeout(() => {
      setState("analyzed");
    }, 1200);
  }

  function handleSend() {
    if (!analysis) return;
    onApplicationSent(extractedData.company, extractedData.role, extractedData.recruiterEmail);
    setState("idle");
    setJdText("");
    setAnalysis(null);
    setEditingEmail(false);
  }

  function copyBullet() {
    if (analysis) {
      navigator.clipboard.writeText("• " + analysis.suggestedBullet).catch(() => {});
      setBulletCopied(true);
      setTimeout(() => setBulletCopied(false), 2000);
    }
  }

  const isAnalyzed = state === "analyzed";
  const isLoading = state === "loading";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-medium text-slate-900 mb-1">Job Analyzer</h1>
        <p className="text-sm text-slate-500">Paste a job description and CoPilot will score your resume, draft your email, and send — all in one flow.</p>
      </div>

      {/* JD Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <label className="text-sm font-medium text-slate-700">Paste job description here</label>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <FileText size={12} className="text-indigo-600" />
            <span className="text-xs text-slate-500">Active resume:</span>
            <span className="text-xs font-medium text-indigo-600">Arjun_Kumar_Resume_2025.pdf</span>
          </div>
        </div>

        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className={`w-full border border-slate-200 rounded-xl px-4 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${isAnalyzed ? "h-28" : "h-52"}`}
          placeholder="Paste the full job description here — requirements, responsibilities, and tech stack. The more detail, the more accurate the ATS scoring..."
        />

        <div className="flex justify-end mt-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !jdText.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Zap size={14} />
                Analyze &amp; Match
              </>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mt-3">
            <Loader2 size={14} className="animate-spin text-indigo-500 shrink-0" />
            <span className="text-sm text-indigo-700">Analyzing JD, scoring resume, and drafting your email…</span>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {isAnalyzed && analysis && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="flex items-center gap-2 px-1">
            <Zap size={13} className="text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600">Analysis complete</span>
            <span className="bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 px-2 py-0.5 rounded-full">JD matched</span>
          </div>

          {/* Extracted Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-slate-700 mb-4">Extracted details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Company", key: "company" },
                { label: "Target Role", key: "role" },
                { label: "Recruiter Email", key: "recruiterEmail" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</label>
                  <input
                    value={extractedData[key as keyof typeof extractedData]}
                    onChange={(e) => setExtractedData((d) => ({ ...d, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ATS Matcher */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-slate-700 mb-4">ATS keyword match</p>
            <div className="flex items-start gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-1">
                <MatchRing pct={analysis.matchScore} />
                <span className="text-xs text-slate-400">match score</span>
              </div>
              <div className="flex-1 min-w-[200px] space-y-4">
                <div>
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-2">Matched keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matched.map((k) => (
                      <span key={k} className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2">Missing keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missing.map((k) => (
                      <span key={k} className="bg-red-50 text-red-700 text-xs px-2.5 py-0.5 rounded-full border border-red-200">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Bullet */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-indigo-500" />
                <span className="text-xs font-medium text-indigo-700">AI-suggested resume bullet</span>
              </div>
              <div className="bg-indigo-50 border-l-[3px] border-indigo-500 rounded-r-xl px-4 py-3 text-sm leading-relaxed text-slate-800">
                • {analysis.suggestedBullet}
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={copyBullet}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {bulletCopied ? <Check size={11} /> : <Copy size={11} />}
                  {bulletCopied ? "Copied!" : "Copy bullet"}
                </button>
              </div>
            </div>
          </div>

          {/* Email Drafter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Send size={14} className="text-sky-500" />
                <span className="text-sm font-medium text-slate-700">AI-drafted email</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw size={11} />
                  Regenerate
                </button>
                <button
                  onClick={() => setEditingEmail((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Edit3 size={11} />
                  {editingEmail ? "Preview" : "Edit manually"}
                </button>
                <button
                  onClick={handleSend}
                  className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-colors"
                >
                  <CheckCheck size={11} />
                  Approve &amp; Send
                </button>
              </div>
            </div>

            {editingEmail ? (
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full h-64 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            ) : (
              <pre className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
                {emailContent}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
