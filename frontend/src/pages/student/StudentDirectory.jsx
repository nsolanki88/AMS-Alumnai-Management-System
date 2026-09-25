import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, Briefcase, GraduationCap, Award, MapPin, Send, CheckCircle2, X } from 'lucide-react';

export default function StudentDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [batch, setBatch] = useState('');
  const [branch, setBranch] = useState('');
  const [company, setCompany] = useState('');
  const [skill, setSkill] = useState('');

  // Mentorship Request Modal
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [inviteTopic, setInviteTopic] = useState('');
  const [inviteDate, setInviteDate] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (batch) params.batch = batch;
      if (branch) params.branch = branch;
      if (company) params.company = company;
      if (skill) params.skill = skill;

      const res = await api.get('/directory', { params });
      if (res.data?.success) {
        setAlumni(res.data.data.alumni);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [batch, branch, company, skill]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDirectory();
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedAlumnus || !inviteTopic || !inviteDate) return;
    setSubmitting(true);
    setInviteMsg('');

    try {
      const res = await api.post('/mentorship/invitations', {
        alumniId: selectedAlumnus.id,
        topic: inviteTopic,
        sessionType: 'mentorship',
        date: inviteDate,
        notes: inviteNotes
      });
      if (res.data?.success) {
        setInviteMsg('Mentorship request successfully dispatched to the alumnus!');
        setTimeout(() => {
          setSelectedAlumnus(null);
          setInviteTopic('');
          setInviteDate('');
          setInviteNotes('');
          setInviteMsg('');
        }, 2000);
      }
    } catch (err) {
      setInviteMsg(err.response?.data?.message || 'Failed to send mentorship invitation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verified Alumni Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore and connect with verified university alumni across industries and batches. Privacy guardrails protect private contact details.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alumni by name, current company, role, or skill..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700"
          >
            <option value="">All Batches</option>
            <option value="2024">Class of 2024</option>
            <option value="2023">Class of 2023</option>
            <option value="2022">Class of 2022</option>
            <option value="2021">Class of 2021</option>
            <option value="2020">Class of 2020</option>
          </select>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700"
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Information Technology">IT</option>
          </select>

          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700"
          >
            <option value="">All Companies</option>
            <option value="Google">Google</option>
            <option value="Meta">Meta</option>
            <option value="Amazon">Amazon</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Tesla">Tesla</option>
          </select>

          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Filter by skill..."
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          />
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading verified alumni directory...</div>
      ) : alumni.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600 font-medium text-sm">No verified alumni match the selected filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try broadening your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alumni.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {item.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{item.fullName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {item.alumniProfile?.currentRole || 'Professional'} {item.alumniProfile?.currentCompany ? `@ ${item.alumniProfile.currentCompany}` : ''}
                    </p>
                  </div>
                  {item.alumniProfile?.isMentor && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                      Mentor
                    </span>
                  )}
                </div>

                {/* Batch & Branch */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Class of {item.alumniProfile?.graduationYear} • {item.alumniProfile?.branch}</span>
                  </div>
                  {item.alumniProfile?.cityCountry && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.alumniProfile.cityCountry}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {item.alumniProfile?.skills && item.alumniProfile.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.alumniProfile.skills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                    {item.alumniProfile.skills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{item.alumniProfile.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Endorsements */}
                {item.endorsements && item.endorsements.length > 0 && (
                  <div className="mt-3 p-2 bg-purple-50/60 rounded-lg border border-purple-100 text-[10px] text-purple-700 flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-purple-500" />
                    <span>Faculty endorsed: {item.endorsements.map(e => e.skill).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Alumnus
                </span>
                <button
                  onClick={() => setSelectedAlumnus(item)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Connect / Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mentorship Request Modal */}
      {selectedAlumnus && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Request Mentorship: {selectedAlumnus.fullName}
              </h3>
              <button onClick={() => setSelectedAlumnus(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteMsg && (
              <div className="my-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                {inviteMsg}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Topic / Objective</label>
                <input
                  type="text"
                  required
                  value={inviteTopic}
                  onChange={(e) => setInviteTopic(e.target.value)}
                  placeholder="e.g. Mock Technical Interview & Resume Guidance"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={inviteDate}
                  onChange={(e) => setInviteDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Note / Questions</label>
                <textarea
                  rows={3}
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  placeholder="Introduce yourself and explain what you'd love to learn..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAlumnus(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  {submitting ? 'Sending Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
