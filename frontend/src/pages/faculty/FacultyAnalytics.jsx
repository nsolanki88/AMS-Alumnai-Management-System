import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, Download, Users, Award, BookOpen, FileText } from 'lucide-react';

export default function FacultyAnalytics() {
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
    return <div className="text-center py-20 text-slate-400 text-xs">Loading department analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Department Alumni Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department Scope: <span className="font-semibold text-purple-700">{data?.department}</span>
          </p>
        </div>
        <button
          onClick={handleExportPdf}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Department Report (PDF)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Verified Alumni</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.verifiedAlumniCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Active Mentors</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.mentorCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Workshop-Ready Alumni</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.workshopReadyCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Q&A Response Rate</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.responseRate || 0}%</p>
        </div>
      </div>

      {/* Batch Distribution Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          Verified Alumni Distribution Across Graduating Batches
        </h2>

        {data?.batchBreakdown && data.batchBreakdown.length > 0 ? (
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
                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-10 text-center">No batch distribution data yet.</p>
        )}
      </div>
    </div>
  );
}
