import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Users, Award, BookOpen, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-blue-500/20">
              A+
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">AMS+</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-medium">Alumni & Engagement</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AMS+ Enterprise v2.0 — Powered by Intelligent Human-in-the-Loop AI
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-6">
            Institutional Alumni Management & <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Engagement
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Reconnecting historical graduates, discovering public professional profiles with transparent AI confidence scoring, and driving student mentorship, workshops, and career doubt resolution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              Access Portal Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="px-6 py-3.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            >
              Explore Architecture
            </a>
          </div>
        </div>
      </section>

      {/* 5 Portals Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Unified 5-Role Institutional Ecosystem</h2>
          <p className="text-slate-400 text-sm">
            Role-Based Access Control enforcing strict privacy, verification guardrails, and tailored portals for every stakeholder.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Student */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-4 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Student Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Browse verified directory without leaking private contact info, ask career & academic doubts with AI skill matching, and connect with mentors.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Career & Interview Doubts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Request Mentorship</li>
            </ul>
          </div>

          {/* Alumni */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-4 border border-blue-500/20">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Alumni Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Manage professional profile visibility (public / batch-only / private), participate in batch communities, answer student doubts, and refer peers.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Privacy & Visibility Controls</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Peer Referral Chains</li>
            </ul>
          </div>

          {/* Faculty */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold mb-4 border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Faculty Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Department-wise analytics, search alumni expertise, request guest lectures, technical talks, and officially endorse alumni skills.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Guest Lecture Invitations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Expertise Endorsements</li>
            </ul>
          </div>

          {/* Council */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-4 border border-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Council Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Bulk CSV import with column mapping & deduplication, trigger AI profile discovery, and execute mandatory human verification.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> AI Profile Discovery Pipeline</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Human-in-the-Loop Verification</li>
            </ul>
          </div>

          {/* Admin */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/50 transition-all group sm:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold mb-4 border border-rose-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Admin Governance & Master Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Comprehensive platform oversight: user role modifications, account lock/unlock, full audit trail inspection, and official PDF analytics reporting.
            </p>
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Audit Logs</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Discovery Funnel Analytics</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> PDF Report Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-xs text-slate-500">
        AMS+ Alumni Management & AI Engagement System — Developed for University Excellence.
      </footer>
    </div>
  );
}
