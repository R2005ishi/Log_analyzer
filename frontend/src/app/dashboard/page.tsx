"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield,
  Terminal,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Download,
  AlertOctagon,
  Info,
  ArrowLeft,
  Loader2,
  Eye,
  Server,
  Sparkles,
} from "lucide-react";
import { SAMPLE_LOGS, SampleLog } from "./samples";

interface AnalysisResult {
  log_type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  summary: string;
  explanation: string;
  possible_causes: string[];
  recommended_actions: string[];
  detected_type: string;
  raw_log: string;
  truncated: boolean;
  live_ai: boolean;
  filename: string;
}

export default function Dashboard() {
  // App States
  const [selectedSample, setSelectedSample] = useState<string>("");
  const [logText, setLogText] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Initializing...");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // UI States
  const [activeTab, setActiveTab] = useState<
    "explanation" | "causes" | "actions"
  >("explanation");
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>(
    {},
  );
  const [apiHealth, setApiHealth] = useState<{
    status: string;
    mock_mode: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch API Health on load
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/health")
      .then((res) => res.json())
      .then((data) => setApiHealth(data))
      .catch(() => setApiHealth({ status: "offline", mock_mode: true }));
  }, []);

  // Loading screen text cycle effect
  useEffect(() => {
    if (!isLoading) return;
    const steps = [
      "Reading log buffers...",
      "Analyzing log headers and system tags...",
      "Matching log syntax with rules...",
      "Consulting Gemini Core security definitions...",
      "Synthesizing threat severity classifications...",
      "Assembling remediation guidelines...",
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setLoadingStep(steps[index]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle sample selection
  const handleSelectSample = (sample: SampleLog) => {
    setSelectedSample(sample.id);
    setLogText(sample.content);
    setFilename(sample.filename);
    setErrorMessage("");
    setAnalysis(null);
    setCheckedActions({});
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Handle file select button
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (
      !file.name.endsWith(".txt") &&
      !file.name.endsWith(".log") &&
      file.name.includes(".")
    ) {
      setErrorMessage(
        "Unsupported file type. Please upload a .txt or .log file.",
      );
      return;
    }

    if (file.size > 100 * 1024) {
      setErrorMessage(
        "File exceeds the 100KB prototype limit. Please upload a smaller file snippet.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setLogText(text);
      setFilename(file.name);
      setSelectedSample("");
      setErrorMessage("");
      setAnalysis(null);
      setCheckedActions({});
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read file.");
    };
    reader.readAsText(file);
  };

  // API Call to Backend
  const handleAnalyze = async () => {
    if (!logText.trim()) {
      setErrorMessage("Please enter log content or select a sample first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setLoadingStep("Reading log buffer...");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ log_text: logText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Analysis request failed.");
      }

      const data = await response.json();

      data.filename = filename || "Uploaded Log File";
      setAnalysis(data);
      setActiveTab("explanation");
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setErrorMessage(
        error.message ||
          "Failed to connect to the backend. Please verify that the FastAPI backend server is running on http://127.0.0.1:8000.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper colors for severity
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Critical":
        return {
          border: "border-rose-500/20 log-severity-critical",
          badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
        };
      case "High":
        return {
          border: "border-orange-500/20 log-severity-high",
          badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
        };
      case "Medium":
        return {
          border: "border-amber-500/20 log-severity-medium",
          badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case "Low":
      default:
        return {
          border: "border-emerald-500/20 log-severity-low",
          badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        };
    }
  };

  // Copy analysis report to clipboard
  const handleCopyAnalysis = () => {
    if (!analysis) return;
    const formatted = `
=== LOGLENS SECURITY DIAGNOSTIC REPORT ===
Log Name: ${analysis.filename}
Detected Log Type: ${analysis.log_type}
Severity: ${analysis.severity}
Summary: ${analysis.summary}

EXPLANATION:
${analysis.explanation}

POSSIBLE CAUSES:
${analysis.possible_causes.map((c, i) => `${i + 1}. ${c}`).join("\n")}

RECOMMENDED ACTIONS:
${analysis.recommended_actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}
==========================================
    `.trim();

    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // Download analysis report JSON
  const handleDownloadAnalysis = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loglens_report_${analysis.log_type.toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle checklist actions
  const toggleAction = (idx: number) => {
    setCheckedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const activeSev = analysis ? getSeverityStyles(analysis.severity) : null;

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Navigation Header */}
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors mr-1" />
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Eye className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white">
                Log<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Lens</span>
              </span>
            </div>
          </Link>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-3">
            {apiHealth ? (
              apiHealth.status === "offline" ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  CONNECTION OFFLINE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {apiHealth.mock_mode ? "LOCAL PLAYBACK" : "LIVE SECURITY ENGINE"}
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 px-2.5 py-0.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                CONNECTING...
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Log Selection & Input Workbench (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-indigo-400" />
                Configure telemetry
              </h2>
              <p className="text-[11px] text-zinc-500">
                Select a built-in scenario or load a custom log file.
              </p>
            </div>

            {/* Quick Sample Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Select Built-in Scenario
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_LOGS.map((sample) => {
                  let sampleIcon = <Terminal className="w-4 h-4" />;
                  if (sample.type === "Cisco") sampleIcon = <Shield className="w-4 h-4" />;
                  if (sample.type === "Windows") sampleIcon = <Server className="w-4 h-4" />;

                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedSample === sample.id
                          ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1 rounded ${selectedSample === sample.id ? "bg-indigo-500/10 text-indigo-400" : "bg-white/5 text-zinc-500"}`}>
                          {sampleIcon}
                        </div>
                        <span className="text-xs font-semibold tracking-tight">{sample.type}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500 truncate w-full font-mono">{sample.filename}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative flex items-center justify-between py-1">
              <hr className="w-full border-white/5" />
              <span className="absolute left-1/2 -translate-x-1/2 bg-[#0d101b] px-3 text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-500/5 text-indigo-300"
                  : "border-white/10 bg-white/[0.01] text-zinc-400 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".txt,.log"
                className="hidden"
              />
              <Upload className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
              <p className="text-xs font-semibold text-zinc-300">
                Drag & drop log file here
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Supports .txt and .log (max 100KB)
              </p>
            </div>

            {/* Uploaded File Info Details */}
            {filename && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-zinc-300">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate flex-1 font-mono text-[11px]">{filename}</span>
                <span className="text-zinc-500 text-[10px] font-mono shrink-0">
                  {Math.ceil(logText.length / 1024)} KB
                </span>
              </div>
            )}

            {/* Paste Area */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Or Paste Log Output
              </label>
              <textarea
                value={logText}
                onChange={(e) => {
                  setLogText(e.target.value);
                  setFilename("");
                  setSelectedSample("");
                  setErrorMessage("");
                  setAnalysis(null);
                  setCheckedActions({});
                }}
                placeholder="Paste raw syslog streams, SSH warnings, or security event logs here..."
                className="w-full h-32 p-3.5 text-xs font-mono bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all text-zinc-300 placeholder-zinc-600 resize-none code-scroll"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl text-xs leading-normal flex items-start gap-2.5">
                <AlertOctagon className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Run Analysis Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !logText.trim()}
              className={`w-full py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isLoading || !logText.trim()
                  ? "bg-white/5 border-white/5 text-zinc-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600 border-indigo-400/20 text-white hover:opacity-90 shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:scale-[1.01]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                  <span>Processing Log telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>Analyze with Gemini</span>
                </>
              )}
            </button>
          </div>

          {/* Raw Log Viewer Panel */}
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col border border-white/5">
            <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                RAW TELEMETRY BUFFER
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 font-sans">
                {logText ? `${logText.split("\n").length} lines` : "empty"}
              </span>
            </div>

            <div className="p-4 min-h-[200px] max-h-[300px] overflow-y-auto code-scroll font-mono text-xs text-zinc-400 bg-black/25 relative">
              {logText ? (
                <pre className="whitespace-pre-wrap break-all select-text pl-1 leading-relaxed">
                  {logText.split("\n").map((line, idx) => {
                    const isError = line.includes("Deny") || line.includes("Failed") || line.includes("Auditing") || line.includes("failure") || line.includes("Invalid");
                    const isSuccess = line.includes("Built") || line.includes("session opened") || line.includes("opened");
                    return (
                      <div key={idx} className={`table-row ${isError ? "text-rose-400/90 font-medium bg-rose-500/[0.02]" : isSuccess ? "text-emerald-400/80 bg-emerald-500/[0.02]" : ""}`}>
                        <span className="table-cell text-right text-zinc-700 select-none pr-4 w-6 font-sans">
                          {idx + 1}
                        </span>
                        <span className="table-cell">
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                  <Terminal className="w-8 h-8 mb-2 opacity-20 text-zinc-500" />
                  <span className="text-xs">
                    No logs loaded. Select a sample above or drop a file to populate.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: AI Analysis Workspace (7 cols) */}
        <section className="lg:col-span-7 h-full">
          
          {/* loading skeleton */}
          {isLoading && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 animate-pulse">
              <div className="flex justify-between items-center pb-5 border-b border-white/5">
                <div className="space-y-2.5 w-1/2">
                  <div className="h-5 w-3/4 rounded bg-white/5 shimmer" />
                  <div className="h-3 w-1/2 rounded bg-white/5 shimmer" />
                </div>
                <div className="h-7 w-24 rounded bg-white/5 shimmer" />
              </div>
              
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <div className="h-3 w-28 rounded bg-white/5 shimmer" />
                <div className="h-4 w-full rounded bg-white/5 shimmer" />
                <div className="h-4 w-5/6 rounded bg-white/5 shimmer" />
              </div>
              
              <div className="flex border-b border-white/5 gap-4">
                <div className="h-8 w-24 bg-white/5 shimmer rounded-t" />
                <div className="h-8 w-24 bg-white/5 shimmer rounded-t" />
                <div className="h-8 w-24 bg-white/5 shimmer rounded-t" />
              </div>
              
              <div className="space-y-3 py-2">
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-3/4 rounded bg-white/5 shimmer" />
              </div>
              
              <div className="flex items-center justify-center gap-2 pt-6 text-xs text-zinc-500 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{loadingStep}</span>
              </div>
            </div>
          )}

          {/* Results dashboard display */}
          {!isLoading && analysis && activeSev && (
            <div className={`glass-card rounded-2xl p-6 border ${activeSev.border} space-y-6 transition-all duration-300`}>
              
              {/* Header metadata details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                    {activeSev.icon}
                    Security Diagnostics Report
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    TARGET TELEMETRY: <span className="text-zinc-300 font-sans">{analysis.filename}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5 font-mono text-[10px] text-zinc-300">
                    Type: {analysis.log_type}
                  </span>

                  <span className={`px-2.5 py-1 rounded border font-mono text-[10px] font-semibold ${activeSev.badgeBg}`}>
                    Severity: {analysis.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Threat Summary Card */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Incident Threat Summary
                </div>
                <div className="text-xs font-semibold text-zinc-200 leading-relaxed">
                  {analysis.summary}
                </div>
              </div>

              {/* Tabs controls */}
              <div className="flex border-b border-white/5">
                <button
                  onClick={() => setActiveTab("explanation")}
                  className={`pb-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                    activeTab === "explanation"
                      ? "border-indigo-500 text-white font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Diagnostics
                </button>
                <button
                  onClick={() => setActiveTab("causes")}
                  className={`pb-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                    activeTab === "causes"
                      ? "border-indigo-500 text-white font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Possible Causes
                </button>
                <button
                  onClick={() => setActiveTab("actions")}
                  className={`pb-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                    activeTab === "actions"
                      ? "border-indigo-500 text-white font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Mitigation Playbook
                </button>
              </div>

              {/* Tabs content container */}
              <div className="min-h-[200px] py-1.5">
                
                {/* 1. Diagnostics Explanation */}
                {activeTab === "explanation" && (
                  <div className="space-y-4">
                    <div className="text-xs text-zinc-300 leading-relaxed space-y-3.5">
                      {analysis.explanation.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    {analysis.live_ai && (
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-sans border-t border-white/5 pt-4">
                        <Info className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span>
                          Diagnostic reports are generated dynamically by Gemini AI. Cross-reference guidelines before implementation.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Threat Causes */}
                {activeTab === "causes" && (
                  <ul className="space-y-3">
                    {analysis.possible_causes.map((cause, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-xs text-zinc-300 items-start"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* 3. Recommended Actions Checklist */}
                {activeTab === "actions" && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Action Checklist for SOC Operators
                    </div>
                    <ul className="space-y-2.5">
                      {analysis.recommended_actions.map((action, idx) => (
                        <li
                          key={idx}
                          onClick={() => toggleAction(idx)}
                          className={`flex gap-3 text-xs p-3.5 rounded-xl border transition-all cursor-pointer ${
                            checkedActions[idx]
                              ? "bg-emerald-950/10 border-emerald-500/15 text-emerald-400/70"
                              : "bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-white/10 text-zinc-300"
                          }`}
                        >
                          <div
                            className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                              checkedActions[idx]
                                ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                : "border-zinc-700 bg-black/40"
                            }`}
                          >
                            {checkedActions[idx] && (
                              <Check className="w-3 h-3 stroke-[3px]" />
                            )}
                          </div>
                          <span
                            className={`${
                              checkedActions[idx]
                                ? "line-through opacity-50"
                                : ""
                            } leading-normal`}
                          >
                            {action}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Actions toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-5 text-xs text-zinc-500">
                <span className="text-[10px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ANALYSIS COMPLETE
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyAnalysis}
                    className="py-2 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>COPY REPORT</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadAnalysis}
                    className="py-2 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>EXPORT JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty workspace status */}
          {!isLoading && !analysis && (
            <div className="glass-card rounded-2xl p-8 text-center min-h-[500px] flex flex-col items-center justify-center border border-white/5">
              <div className="p-4 rounded-full bg-white/[0.02] border border-white/5 mb-4 text-zinc-500">
                <Shield className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-zinc-300 font-bold tracking-tight text-sm">
                Awaiting Diagnostics
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
                Provide log content in the input workspace and select run. The Security Intelligence core will display threats here.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/20 py-4 px-6 text-[10px] text-zinc-600 text-center">
        LogLens Diagnostics Platform &copy; 2026. Made with Tailwind & FastAPI.
      </footer>
    </div>
  );
}
