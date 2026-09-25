import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, Check, X, AlertTriangle, ExternalLink, Sparkles, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';

export default function CouncilVerification() {
  const [statusTab, setStatusTab] = useState('pending'); // pending, verified, rejected, uncertain
  const [matches, setMatches] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0, uncertain: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Reject Modal
  const [rejectingMatch, setRejectingMatch] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/verification/dashboard', {
        params: { status: statusTab }
      });
      if (res.data?.success) {
        setMatches(res.data.data.matches);
        setCounts(res.data.data.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [statusTab]);

  const handleVerify = async (matchId) => {
    setActionLoading(true);
    setFeedback('');
    try {
      const res = await api.patch(`/matches/${matchId}/verify`);
      if (res.data?.success) {
        setFeedback('Candidate verified! Linked to official record and batch community created/updated.');
        fetchMatches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUncertain = async (matchId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/matches/${matchId}/uncertain`);
      if (res.data?.success) {
        setFeedback('Candidate marked as uncertain for further council investigation.');
        fetchMatches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingMatch || !rejectionReason.trim()) return;
    setActionLoading(true);

    try {
      const res = await api.patch(`/matches/${rejectingMatch.id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      if (res.data?.success) {
        setRejectingMatch(null);
        setRejectionReason('');
        setFeedback('Match rejected and audit trail recorded.');
        fetchMatches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Council Verification Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Mandatory Human-in-the-Loop review. Verify, reject, or flag AI-discovered public profiles before linking them to official university alumni records.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200">
        {[
          { key: 'pending', label: 'Pending Review', count: counts.pending, color: 'text-amber-600' },
          { key: 'verified', label: 'Verified Alumni', count: counts.verified, color: 'text-emerald-600' },
          { key: 'uncertain', label: 'Uncertain Flagged', count: counts.uncertain, color: 'text-blue-600' },
          { key: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-red-600' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              statusTab === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-800 ${statusTab === tab.key ? 'bg-slate-800 text-white' : ''}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading verification candidates...</div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No records in "{statusTab}" queue</p>
          <p className="text-xs text-slate-400 mt-1">Select another tab or run AI discovery from the Unregistered registry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm">
                    {m.record?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{m.record?.fullName}</h3>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {m.record?.rollNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Class of {m.record?.graduationYear} • {m.record?.branch}
                    </p>
                  </div>
                </div>

                {/* Score & Platform */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${getScoreBadgeColor(m.confidenceScore)}`}>
                    AI Confidence: {m.confidenceScore}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    {m.platform}
                  </span>
                </div>
              </div>

              {/* Comparison Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Historical Official Record */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Official Registry Record</h4>
                  <p><span className="text-slate-400">Name:</span> {m.record?.fullName}</p>
                  <p><span className="text-slate-400">Graduation:</span> Class of {m.record?.graduationYear} ({m.record?.branch})</p>
                  <p><span className="text-slate-400">Recorded Company:</span> {m.record?.company || 'Unrecorded'}</p>
                  <p><span className="text-slate-400">Recorded Email:</span> {m.record?.contactEmail || 'Not available'}</p>
                </div>

                {/* Discovered Public Profile */}
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1.5">
                  <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Discovered Public Profile</h4>
                  <p><span className="text-slate-400">Candidate:</span> {m.name}</p>
                  <p><span className="text-slate-400">Source:</span> {m.platform}</p>
                  <p className="flex items-center gap-1 truncate">
                    <span className="text-slate-400">Profile URL:</span>
                    <a href={m.profileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold truncate">
                      {m.profileUrl} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </p>
                  {m.rejectionReason && (
                    <p className="text-red-600 font-semibold mt-1">Rejection Reason: {m.rejectionReason}</p>
                  )}
                </div>
              </div>

              {/* AI Reasoning Signals */}
              {m.reasons && m.reasons.length > 0 && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs">
                  <div className="flex items-center gap-1 text-slate-700 font-bold mb-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Transparent AI Matching Rationale:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600 pl-4 list-disc">
                    {m.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              {m.status === 'pending' && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => handleMarkUncertain(m.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Mark Uncertain
                  </button>
                  <button
                    onClick={() => setRejectingMatch(m)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Match
                  </button>
                  <button
                    onClick={() => handleVerify(m.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Verify Alumni Identity
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Reject Potential Match: {rejectingMatch.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify the reason for rejecting this discovered candidate. The rejection reason will be retained in the permanent audit trail.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Different person with identical name, graduated from another institute..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingMatch(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
