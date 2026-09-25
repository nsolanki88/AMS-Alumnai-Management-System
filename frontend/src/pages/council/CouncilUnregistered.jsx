import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { UserCheck, Sparkles, Search, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function CouncilUnregistered() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batch, setBatch] = useState('');
  const [discoveringId, setDiscoveringId] = useState(null);
  const [discoverySuccess, setDiscoverySuccess] = useState('');
  const navigate = useNavigate();

  const fetchUnregistered = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (batch) params.batch = batch;

      const res = await api.get('/alumni-records/unregistered', { params });
      if (res.data?.success) {
        setRecords(res.data.data.records);
        setTotal(res.data.data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnregistered();
  }, [batch]);

  const handleTriggerDiscovery = async (recordId, name) => {
    setDiscoveringId(recordId);
    setDiscoverySuccess('');

    try {
      const res = await api.post('/discovery/run', { recordId });
      if (res.data?.success) {
        setDiscoverySuccess(`AI Discovery completed for ${name}! Redirecting to Verification Dashboard...`);
        setTimeout(() => {
          navigate('/council/verification');
        }, 1800);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger discovery');
    } finally {
      setDiscoveringId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Unregistered Alumni Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical records without active university accounts. Trigger AI public profile discovery to find matching candidate profiles.
          </p>
        </div>
      </div>

      {discoverySuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {discoverySuccess}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, or company..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
        >
          <option value="">All Batches</option>
          <option value="2024">Class of 2024</option>
          <option value="2023">Class of 2023</option>
          <option value="2022">Class of 2022</option>
          <option value="2021">Class of 2021</option>
          <option value="2020">Class of 2020</option>
        </select>
        <button
          onClick={fetchUnregistered}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-xs">Loading unregistered alumni...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs">No unregistered alumni match the criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Alumnus Name</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Branch</th>
                  <th className="p-4">Recorded Org</th>
                  <th className="p-4">AI Matches</th>
                  <th className="p-4 text-right">Discovery Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.recordId} className="hover:bg-slate-50/70">
                    <td className="p-4 font-bold text-slate-900">{r.fullName}</td>
                    <td className="p-4 font-mono text-slate-600">{r.rollNumber}</td>
                    <td className="p-4 text-slate-600">{r.graduationYear}</td>
                    <td className="p-4 text-slate-600">{r.branch}</td>
                    <td className="p-4 text-slate-600">{r.company || '—'}</td>
                    <td className="p-4">
                      {r.potentialMatches?.length > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {r.potentialMatches.length} Candidate(s)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">None yet</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleTriggerDiscovery(r.recordId, r.fullName)}
                        disabled={discoveringId === r.recordId}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 ml-auto transition-all"
                      >
                        {discoveringId === r.recordId ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Discovering...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Run AI Discovery
                          </>
                        )}
                      </button>
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
