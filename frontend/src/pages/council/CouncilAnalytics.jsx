import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { BarChart3, Download, Users, Award, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

export default function CouncilAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
    fetchAnalytics();
  }, []);

  const handleExportPdf = () => {
    window.open(`${api.defaults.baseURL}/analytics/export-pdf`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs">Loading master analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Alumni Analytics & Engagement Funnel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master overview across all batches, discovery verification funnels, and mentorship engagement rates.
          </p>
        </div>
        <button
          onClick={handleExportPdf}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Download Official PDF Report
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Records</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.totalRecords || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Unregistered</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{data?.unregisteredCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">AI Matches Verified</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{data?.verifiedMatchesCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Doubt Response Rate</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{data?.responseRate || 0}%</p>
        </div>
      </div>

      {/* Discovery Funnel Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-600" />
          AI Discovery & Verification Funnel
        </h2>

        {data?.discoveryFunnel && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.discoveryFunnel} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  formatter={(val) => [`${val} Records`, 'Volume']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#d97706" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Batch Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Batch-Wise Verified Alumni Distribution
        </h2>

        {data?.batchBreakdown && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.batchBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="graduationYear" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} Alumni`, 'Count']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
