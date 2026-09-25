import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, Upload, UserCheck, PhoneCall, AlertTriangle, ArrowRight, BarChart3, CheckCircle2 } from 'lucide-react';

export default function CouncilDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCouncilMetrics = async () => {
      try {
        const res = await api.get('/analytics/summary');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCouncilMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-medium mb-3 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> Alumni Affairs Council Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verification & Outreach Command Center
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed">
            Execute the complete alumni pipeline: import historical registries, inspect duplicate roll numbers, trigger AI public discovery, and conduct mandatory human-in-the-loop verification.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/council/verification"
              className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Review AI Matches ({data?.pendingMatchesCount || 0} Pending)
            </Link>
            <Link
              to="/council/upload"
              className="px-4 py-2 bg-amber-600/60 hover:bg-amber-600 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
            >
              Bulk Import Alumni Data
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Historical Records</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.totalRecords || 0}</p>
          <Link to="/council/upload" className="text-[11px] text-amber-600 hover:text-amber-800 font-semibold mt-1 inline-block">
            Import CSV data →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Unregistered Alumni</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.unregisteredCount || 0}</p>
          <Link to="/council/unregistered" className="text-[11px] text-amber-600 hover:text-amber-800 font-semibold mt-1 inline-block">
            Trigger AI discovery →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Pending AI Verification</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{data?.pendingMatchesCount || 0}</p>
          <Link to="/council/verification" className="text-[11px] text-amber-600 hover:text-amber-800 font-semibold mt-1 inline-block">
            Verify matches →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Verified by Council</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{data?.verifiedMatchesCount || 0}</p>
          <Link to="/council/analytics" className="text-[11px] text-amber-600 hover:text-amber-800 font-semibold mt-1 inline-block">
            Inspect funnel →
          </Link>
        </div>
      </div>

      {/* Discovery & Verification Funnel Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-600" />
          End-to-End Alumni Pipeline Progress
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">Imported Records</h4>
            <p className="text-lg font-black text-slate-900 mt-1">{data?.totalRecords || 0}</p>
          </div>
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Step 2</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">Unregistered</h4>
            <p className="text-lg font-black text-amber-700 mt-1">{data?.unregisteredCount || 0}</p>
          </div>
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Step 3</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">AI Discovered</h4>
            <p className="text-lg font-black text-blue-700 mt-1">{data?.totalMatchesFound || 0}</p>
          </div>
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Step 4</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">Council Verified</h4>
            <p className="text-lg font-black text-emerald-700 mt-1">{data?.verifiedMatchesCount || 0}</p>
          </div>
          <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Step 5</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">Engaged Alumni</h4>
            <p className="text-lg font-black text-purple-700 mt-1">{data?.engagedAlumniCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
