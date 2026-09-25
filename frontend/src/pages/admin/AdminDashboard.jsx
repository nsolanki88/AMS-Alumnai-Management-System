import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Shield, Users, FileText, BarChart3, Settings, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/analytics/summary');
        if (res.data?.success) setData(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-medium mb-3 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5" /> Institutional Administration & Security
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Master Governance Console
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 mt-2 leading-relaxed">
            Manage users, assign RBAC permissions, review security audit trails, and inspect institutional engagement metrics.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-white text-rose-900 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Manage Users & Roles
            </Link>
            <Link
              to="/admin/audit-logs"
              className="px-4 py-2 bg-rose-600/60 hover:bg-rose-600 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
            >
              Inspect Audit Trails
            </Link>
          </div>
        </div>
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Historical Records</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.totalRecords || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Verified Alumni</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{data?.verifiedMatchesCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Unregistered Registry</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{data?.unregisteredCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Active Mentors</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{data?.mentorCount || 0}</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">User & Role Management</h3>
            <p className="text-xs text-slate-500 mt-1">
              Assign or revoke roles across Student, Alumni, Faculty, Council, and Admin. Toggle account locks.
            </p>
          </div>
          <span className="text-xs text-rose-600 font-bold mt-4 flex items-center gap-1">
            Access User Panel →
          </span>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Audit Logs</h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect immutable audit records for imports, AI discoveries, verifications, rejections, and logins.
            </p>
          </div>
          <span className="text-xs text-slate-700 font-bold mt-4 flex items-center gap-1">
            Review Audit Trail →
          </span>
        </Link>

        <Link
          to="/admin/settings"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">System Configuration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure AI discovery confidence thresholds, scoring weights, and security parameters.
            </p>
          </div>
          <span className="text-xs text-blue-600 font-bold mt-4 flex items-center gap-1">
            Open Settings →
          </span>
        </Link>
      </div>
    </div>
  );
}
