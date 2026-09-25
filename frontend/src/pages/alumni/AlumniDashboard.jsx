import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Award, HelpCircle, Calendar, Share2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pendingInvites: 0, doubtsToAnswer: 0, referrals: 0 });
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [invRes, doubtRes, refRes] = await Promise.all([
          api.get('/mentorship/invitations'),
          api.get('/doubts?limit=5'),
          api.get('/referrals')
        ]);

        const allInv = invRes.data?.data || [];
        const pending = allInv.filter(i => i.status === 'pending');
        setInvitations(pending.slice(0, 3));

        setStats({
          pendingInvites: pending.length,
          doubtsToAnswer: doubtRes.data?.data?.doubts?.length || 0,
          referrals: refRes.data?.data?.length || 0
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-medium mb-3 backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified Alumnus • {user?.alumniProfile?.branch || 'Engineering'} (Class of {user?.alumniProfile?.graduationYear || '2022'})
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            {user?.alumniProfile?.currentRole} at {user?.alumniProfile?.currentCompany || 'Technology Enterprise'}. Your profile visibility is currently set to <span className="font-bold underline">{user?.alumniProfile?.visibility || 'PUBLIC'}</span>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/alumni/profile"
              className="px-4 py-2 bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Update Profile & Privacy
            </Link>
            <Link
              to="/alumni/referrals"
              className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
            >
              Refer a Peer Alumnus
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Session Requests</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.pendingInvites}</p>
            <Link to="/alumni/mentorship" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-block">
              Review invitations →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Open Student Doubts</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.doubtsToAnswer}</p>
            <Link to="/alumni/doubts" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-block">
              Answer questions →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Alumni Referrals Submitted</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.referrals}</p>
            <Link to="/alumni/referrals" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-block">
              View referral chain →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Incoming Workshop & Mentorship Requests
          </h2>
          <Link to="/alumni/mentorship" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
            Manage All
          </Link>
        </div>

        {invitations.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No pending invitations right now.</p>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {inv.sessionType}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{inv.topic}</h4>
                  <p className="text-[11px] text-slate-500">
                    Requested by {inv.requester?.fullName} ({inv.requester?.role}) for {new Date(inv.date).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to="/alumni/mentorship"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Respond
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
