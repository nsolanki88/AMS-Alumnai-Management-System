import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Video, Clock, User, CheckCircle2 } from 'lucide-react';

export default function StudentWorkshops() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await api.get('/mentorship/calendar');
        if (res.data?.success) {
          setSessions(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Workshops & Guest Lectures</h1>
        <p className="text-xs text-slate-500 mt-1">
          Accepted alumni technical talks, industry workshops, and hands-on laboratory sessions.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading workshop calendar...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No scheduled sessions at this time</p>
          <p className="text-xs text-slate-400 mt-1">New accepted alumni sessions will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {item.sessionType}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.date).toLocaleDateString()} {item.time ? `• ${item.time}` : ''}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{item.topic}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <User className="w-3 h-3 text-slate-400" />
                  Speaker: <span className="font-semibold">{item.alumnus?.fullName}</span>
                  {item.alumnus?.alumniProfile?.currentCompany && ` (${item.alumnus.alumniProfile.currentCompany})`}
                </p>

                {item.notes && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Session Confirmed
                </span>
                {item.meetingLink ? (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Video className="w-3.5 h-3.5" /> Join Meeting
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Link provided upon start</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
