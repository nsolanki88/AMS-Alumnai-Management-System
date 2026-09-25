import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionType !== 'ALL') params.actionType = actionType;
      if (search) params.search = search;

      const res = await api.get('/admin/audit-log', { params });
      if (res.data?.success) {
        setLogs(res.data.data.logs);
        setTotal(res.data.data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionType]);

  const actionColors = {
    ALUMNI_IMPORT: 'bg-amber-100 text-amber-800',
    AI_DISCOVERY_STARTED: 'bg-blue-100 text-blue-800',
    MATCH_VERIFIED: 'bg-emerald-100 text-emerald-800',
    MATCH_REJECTED: 'bg-red-100 text-red-800',
    MATCH_MARKED_UNCERTAIN: 'bg-purple-100 text-purple-800',
    REFERRAL_VERIFIED: 'bg-indigo-100 text-indigo-800',
    POST_MODERATED: 'bg-rose-100 text-rose-800',
    ROLE_CHANGED: 'bg-orange-100 text-orange-800',
    USER_REGISTERED: 'bg-slate-100 text-slate-800',
    USER_LOGIN: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete, tamper-evident audit trail of institutional data imports, AI profile discoveries, Council verifications, and permission updates.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by user, action, or metadata..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
        >
          <option value="ALL">All Actions</option>
          <option value="ALUMNI_IMPORT">ALUMNI_IMPORT</option>
          <option value="AI_DISCOVERY_STARTED">AI_DISCOVERY_STARTED</option>
          <option value="MATCH_VERIFIED">MATCH_VERIFIED</option>
          <option value="MATCH_REJECTED">MATCH_REJECTED</option>
          <option value="MATCH_MARKED_UNCERTAIN">MATCH_MARKED_UNCERTAIN</option>
          <option value="REFERRAL_VERIFIED">REFERRAL_VERIFIED</option>
          <option value="POST_MODERATED">POST_MODERATED</option>
          <option value="ROLE_CHANGED">ROLE_CHANGED</option>
        </select>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
        >
          Filter
        </button>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-xs">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs">No audit records match the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Initiating User</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Metadata Payload</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.auditId} className="hover:bg-slate-50/70">
                    <td className="p-4 text-slate-500 font-sans text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        actionColors[log.actionType] || 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-sans text-xs">
                      {log.user ? `${log.user.fullName} (${log.user.role})` : 'System / Anonymous'}
                    </td>
                    <td className="p-4 text-slate-600 font-sans text-xs">
                      {log.entityType}
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs truncate font-mono text-[10px]">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
