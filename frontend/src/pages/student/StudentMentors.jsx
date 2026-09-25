import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, Briefcase, GraduationCap, Send, X, CheckCircle2 } from 'lucide-react';

export default function StudentMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Modal
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/mentorship/mentors');
        if (res.data?.success) {
          setMentors(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedMentor || !topic || !date) return;
    setSubmitting(true);
    setMsg('');

    try {
      const res = await api.post('/mentorship/invitations', {
        alumniId: selectedMentor.userId,
        topic,
        sessionType: 'mentorship',
        date,
        notes
      });
      if (res.data?.success) {
        setMsg('Mentorship request successfully dispatched!');
        setTimeout(() => {
          setSelectedMentor(null);
          setTopic('');
          setDate('');
          setNotes('');
          setMsg('');
        }, 2000);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Available Alumni Mentors</h1>
        <p className="text-xs text-slate-500 mt-1">
          Learn directly from senior engineers, data scientists, and researchers offering 1-on-1 mentorship.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading mentors...</div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No active mentors currently available</p>
          <p className="text-xs text-slate-400 mt-1">Check back soon as alumni update their mentorship profiles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {m.fullName.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {m.mentorshipAvailability}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{m.fullName}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  {m.currentRole} at {m.currentCompany}
                </p>
                {m.graduationYear && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    Class of {m.graduationYear} ({m.branch})
                  </p>
                )}

                {m.bio && (
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    "{m.bio}"
                  </p>
                )}

                {m.skills && m.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedMentor(m)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3 h-3" /> Request Mentorship Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Request Session with {selectedMentor.fullName}
              </h3>
              <button onClick={() => setSelectedMentor(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg && (
              <div className="my-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                {msg}
              </div>
            )}

            <form onSubmit={handleSendRequest} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Topic</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 1-on-1 Mock Interview & Resume Guidance"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Questions</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share what specific guidance you are seeking..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  {submitting ? 'Sending...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
