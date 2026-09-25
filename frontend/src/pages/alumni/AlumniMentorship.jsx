import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, Check, X, RefreshCw, Video } from 'lucide-react';

export default function AlumniMentorship() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reschedule Modal
  const [rescheduleInv, setRescheduleInv] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mentorship/invitations');
      if (res.data?.success) {
        setInvitations(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleStatusUpdate = async (id, status, extraData = {}) => {
    try {
      await api.patch(`/mentorship/invitations/${id}`, {
        status,
        ...extraData
      });
      fetchInvitations();
      setRescheduleInv(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Mentorship & Session Invitations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review and respond to guest lecture, workshop, and 1-on-1 mentorship requests from faculty and students.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading session invitations...</div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No session invitations found</p>
          <p className="text-xs text-slate-400 mt-1">Incoming invitations from faculty and students will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {inv.sessionType}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    inv.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                    inv.status === 'declined' ? 'bg-red-50 text-red-700' :
                    inv.status === 'rescheduled' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{inv.topic}</h3>
                <p className="text-xs text-slate-500">
                  Requested by <span className="font-semibold text-slate-700">{inv.requester?.fullName}</span> ({inv.requester?.role}) • Scheduled for {new Date(inv.date).toLocaleDateString()} {inv.time ? `at ${inv.time}` : ''}
                </p>
                {inv.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{inv.notes}"
                  </p>
                )}
                {inv.meetingLink && (
                  <p className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                    <Video className="w-3.5 h-3.5" /> Meeting Link: {inv.meetingLink}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {inv.status === 'pending' && (
                <div className="flex flex-wrap sm:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStatusUpdate(inv.id, 'accepted', { meetingLink: 'https://meet.google.com/ams-session' })}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => {
                      setRescheduleInv(inv);
                      setNewDate(inv.date ? new Date(inv.date).toISOString().split('T')[0] : '');
                      setNewTime(inv.time || '');
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(inv.id, 'declined')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Reschedule Session</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Proposed Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Proposed Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 03:00 PM - 04:30 PM"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Reason</label>
                <textarea
                  rows={2}
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Reason for reschedule..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleInv(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(rescheduleInv.id, 'rescheduled', {
                    date: newDate,
                    time: newTime,
                    notes: rescheduleNotes
                  })}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
