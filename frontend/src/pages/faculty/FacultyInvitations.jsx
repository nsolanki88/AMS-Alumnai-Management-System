import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, Clock, User, X, CheckCircle2 } from 'lucide-react';

export default function FacultyInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Invite Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    alumniId: '',
    topic: '',
    sessionType: 'guest_lecture', // guest_lecture, workshop, technical_talk, curriculum_feedback
    date: '',
    time: '11:00 AM - 12:30 PM',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, alRes] = await Promise.all([
        api.get('/mentorship/invitations'),
        api.get('/directory')
      ]);

      if (invRes.data?.success) setInvitations(invRes.data.data);
      if (alRes.data?.success) setAlumniList(alRes.data.data.alumni);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.alumniId || !formData.topic || !formData.date) return;
    setSubmitting(true);
    setMsg('');

    try {
      const res = await api.post('/mentorship/invitations', formData);
      if (res.data?.success) {
        setMsg('Session invitation successfully sent to alumnus!');
        fetchData();
        setTimeout(() => {
          setShowModal(false);
          setMsg('');
          setFormData({
            alumniId: '',
            topic: '',
            sessionType: 'guest_lecture',
            date: '',
            time: '11:00 AM - 12:30 PM',
            notes: ''
          });
        }, 2000);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to dispatch invitation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Guest Lectures & Workshop Invitations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Invite distinguished alumni for guest lectures, technical keynotes, lab workshops, or curriculum review panels.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Send Session Invitation
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading invitation records...</div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No session invitations dispatched yet</p>
          <p className="text-xs text-slate-400 mt-1">Send an invitation to invite alumni back to speak with students.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    {inv.sessionType?.replace('_', ' ')}
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
                  Invited Alumnus: <span className="font-semibold text-slate-700">{inv.alumnus?.fullName}</span> • Scheduled for {new Date(inv.date).toLocaleDateString()} {inv.time ? `(${inv.time})` : ''}
                </p>
                {inv.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{inv.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invitation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Invite Alumnus for Academic Session</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg && (
              <div className="my-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Alumnus</label>
                <select
                  required
                  value={formData.alumniId}
                  onChange={(e) => setFormData({ ...formData, alumniId: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="">-- Choose verified alumnus --</option>
                  {alumniList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.alumniProfile?.currentCompany ? `${a.alumniProfile.currentRole} at ${a.alumniProfile.currentCompany}` : `Class of ${a.alumniProfile?.graduationYear}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="guest_lecture">Guest Lecture</option>
                  <option value="workshop">Hands-on Technical Workshop</option>
                  <option value="technical_talk">Industry Colloquium / Tech Talk</option>
                  <option value="curriculum_feedback">Curriculum Review Panel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Agenda</label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Distributed Consensus in Cloud Systems"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invitation Letter / Remarks</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dear Alumnus, the faculty cordially invites you to share your experience with 3rd year students..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
                >
                  {submitting ? 'Sending...' : 'Send Formal Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
