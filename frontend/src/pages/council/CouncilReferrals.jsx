import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Share2, Check, X, ArrowRight, ExternalLink } from 'lucide-react';

export default function CouncilReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/referrals');
      if (res.data?.success) {
        setReferrals(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleVerifyReferral = async (id, status) => {
    setActingId(id);
    try {
      await api.patch(`/referrals/${id}/verify`, { status });
      fetchReferrals();
    } catch (e) {
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Alumni Referral Verification Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review alumni referrals submitted by verified graduates. Approving a referral creates an official alumni record and notifies the referring peer.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading referrals...</div>
      ) : referrals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Share2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No referrals in queue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.status === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'rejected' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Referred on {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{item.referredName}</h3>
                <p className="text-xs text-slate-600">
                  Email: <span className="font-mono text-slate-800">{item.referredEmail}</span> • Class of {item.graduationYear} ({item.branch})
                </p>
                <p className="text-xs text-slate-500">
                  {item.jobRole} at {item.company || 'Enterprise'}
                </p>

                {/* Chain Visualization */}
                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-blue-700">Referrer: {item.referrer?.fullName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{item.referredName}</span>
                </div>
              </div>

              {item.status === 'pending' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleVerifyReferral(item.id, 'verified')}
                    disabled={actingId === item.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Verify Referral
                  </button>
                  <button
                    onClick={() => handleVerifyReferral(item.id, 'rejected')}
                    disabled={actingId === item.id}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
