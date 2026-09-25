import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, Award, BookOpen, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const department = user?.department || 'Computer Science & Engineering';

  const [stats, setStats] = useState({
    alumniCount: 0,
    mentors: 0,
    workshopReady: 0,
    myEndorsements: 0
  });
  const [recentAlumni, setRecentAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeptData = async () => {
      try {
        const [alumniRes, endorseRes] = await Promise.all([
          api.get('/faculty/department-alumni'),
          api.get('/faculty/endorsements')
        ]);

        const deptAlumni = alumniRes.data?.data?.alumni || [];
        setRecentAlumni(deptAlumni.slice(0, 4));

        setStats({
          alumniCount: deptAlumni.length,
          mentors: deptAlumni.filter(a => a.isMentor).length,
          workshopReady: deptAlumni.filter(a => a.workshopReady).length,
          myEndorsements: endorseRes.data?.data?.length || 0
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDeptData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-medium mb-3 backdrop-blur-sm">
            <BookOpen className="w-3.5 h-3.5" /> Department of {department}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Professor {user?.fullName?.split(' ')[1] || user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
            Collaborate with departmental alumni to invite guest speakers, organize curriculum reviews, and officially endorse outstanding graduates.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/faculty/directory"
              className="px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Search Alumni Expertise & Endorse
            </Link>
            <Link
              to="/faculty/invitations"
              className="px-4 py-2 bg-purple-600/60 hover:bg-purple-600 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
            >
              Request Guest Lecture / Talk
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Department Alumni</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.alumniCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Active Mentors</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.mentors}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Workshop-Ready Alumni</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.workshopReady}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Faculty Endorsements</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.myEndorsements}</p>
        </div>
      </div>

      {/* Department Alumni List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Recent Department Graduates
          </h2>
          <Link to="/faculty/directory" className="text-xs text-purple-600 hover:text-purple-800 font-semibold">
            View All
          </Link>
        </div>

        {recentAlumni.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No alumni found for this department yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentAlumni.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{a.fullName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {a.role} at {a.company || 'Tech Enterprise'} • Class of {a.batch}
                  </p>
                </div>
                <Link
                  to="/faculty/directory"
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold px-2.5 py-1 bg-white rounded-lg border border-purple-200 shadow-xs"
                >
                  Endorse / Invite
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
