import Link from "next/link";
import { Eye, Sparkles, ArrowRight, Shield, CheckCircle2, FileText, Server } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 flex-row">
                Log<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Lens</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-medium text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              SYSTEM ACTIVE: MOCK/LIVE CORE
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Security Diagnostics</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Bring clarity to <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">raw enterprise logs.</span>
          </h1>

          <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Translate cryptic syslogs, SSH auth failures, and Windows Event logs into human-readable summaries, structured root-cause analyses, and instant playbooks with Gemini AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] transition-all hover:scale-[1.02] duration-200"
            >
              Launch Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#learn-more"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 font-medium px-8 py-4 rounded-xl transition-all"
            >
              How It Works
            </Link>
          </div>

          {/* Supported log files list */}
          <div className="pt-8 border-t border-white/5 max-w-md mx-auto lg:mx-0">
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Supported Environments
            </span>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-zinc-300 font-mono">Cisco ASA</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-zinc-300 font-mono">Linux auth.log</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-zinc-300 font-mono">Windows Event (4625)</span>
            </div>
          </div>
        </div>

        {/* Live Mockup UI / Interactive Visual */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none">
          <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl shadow-2xl space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header style decoration */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white/10" />
                <span className="w-3 h-3 rounded-full bg-white/10" />
                <span className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                Diagnostic Output Preview
              </span>
            </div>

            {/* Side-by-side Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left pane: Cryptic Log */}
              <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-3">
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>auth.log</span>
                </div>
                <div className="font-mono text-[11px] text-zinc-400 space-y-2 leading-relaxed">
                  <p className="opacity-40">Jun 26 00:45:12 sshd[28451]: Invalid user admin from 198.51.100.12</p>
                  <p className="text-red-400/80 bg-red-500/5 p-1 rounded border border-red-500/10 font-medium">Jun 26 00:45:14 sshd[28451]: Failed password for invalid user admin from 198.51.100.12</p>
                  <p className="opacity-40">Jun 26 00:45:18 sshd[28453]: Invalid user admin from 198.51.100.12</p>
                </div>
              </div>

              {/* Right pane: Analysis Output */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                      Diagnostics
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold">
                      HIGH RISK
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    SSH Brute-Force Scan
                  </h4>
                  <p className="text-[11px] text-zinc-300 leading-normal">
                    IP <code className="text-indigo-300">198.51.100.12</code> attempted dictionary credentials. Recommendation: block IP.
                  </p>
                </div>
                
                {/* Micro checklist preview */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Append Fail2ban rule</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Audit SSH keys</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="learn-more" className="relative z-10 max-w-7xl w-full mx-auto px-6 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Smart Engine Classification</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instantly matches incoming text to Windows Security logs, Cisco IOS/ASA dumps, and Linux system logs using structural heuristic signatures.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Gemini Threat Intelligence</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unpacks system failure messages, hexadecimal status tags, and cryptic firewall codes to detail what actually happened in simple English.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Actionable Mitigation Playbooks</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates developer checklists detailing exactly how to secure servers, isolate affected hosts, and write appropriate firewall rules.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/20 py-8 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; 2026 LogLens Log Diagnostic Platform. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="text-zinc-400">Secure Client Environment</span>
            <span>|</span>
            <span className="text-zinc-400">Gemini Core 2.5/3.5 Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
