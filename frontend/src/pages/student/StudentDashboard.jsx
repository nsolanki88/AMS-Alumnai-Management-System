import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, HelpCircle, Calendar, Award, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ mentors: 0, workshops: 0, doubts: 0 });
  const [recentDoubts, setRecentDoubts] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [doubtsRes, calendarRes, mentorsRes] = await Promise.all([
          api.get('/doubts?limit=4'),
          api.get('/mentorship/calendar'),
          api.get('/mentorship/mentors')
        ]);

        if (doubtsRes.data?.success) {
          setRecentDoubts(doubtsRes.data.data.doubts);
        }
        if (calendarRes.data?.success) {
          setUpcomingSessions(calendarRes.data.data.slice(0, 3));
        }
        setStats({
          mentors: mentorsRes.data?.data?.length || 0,
          workshops: calendarRes.data?.data?.length || 0,
          doubts: doubtsRes.data?.data?.total || 0
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-medium mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Student Academic & Career Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            Connect directly with verified alumni from top global technology firms, ask interview and career questions with AI routing, and attend hands-on workshops.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/student/doubts"
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Ask a Doubt
            </Link>
            <Link
              to="/student/directory"
              className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
            >
              Browse Alumni Directory
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Verified Alumni Mentors</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.mentors}</p>
            <Link to="/student/mentors" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-block">
              View available mentors →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Doubts Resolved</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.doubts}</p>
            <Link to="/student/doubts" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-block">
              Explore Q&A board →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Scheduled Workshops</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.workshops}</p>
            <Link to="/student/workshops" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-block">
              Open session calendar →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Doubts & Upcoming Workshops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Doubts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Career & Technical Doubts
            </h2>
            <Link to="/student/doubts" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentDoubts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No doubts posted yet. Be the first to ask!</p>
            ) : (
              recentDoubts.map(d => (
                <Link
                  key={d.id}
                  to={`/student/doubts?doubtId=${d.id}`}
                  className="block p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-800 line-clamp-1">{d.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                      d.status === 'answered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span>{d.category}</span>
                    <span>•</span>
                    <span>{d.answerCount || 0} answers</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Workshops */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Upcoming Alumni Sessions
            </h2>
            <Link to="/student/workshops" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No accepted workshop sessions right now.</p>
            ) : (
              upcomingSessions.map(s => (
                <div key={s.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded">
                      {s.sessionType}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {new Date(s.date).toLocaleDateString()} {s.time ? `• ${s.time}` : ''}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{s.topic}</h4>
                  <p className="text-[11px] text-slate-600">Speaker: {s.alumnus?.fullName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
