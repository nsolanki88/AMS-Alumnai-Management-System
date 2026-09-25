import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Award, Briefcase, GraduationCap, CheckCircle2, X, Send } from 'lucide-react';

export default function FacultyDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');

  // Endorse Modal
  const [endorseTarget, setEndorseTarget] = useState(null);
  const [skillName, setSkillName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;

      const res = await api.get('/directory', { params });
      if (res.data?.success) {
        setAlumni(res.data.data.alumni);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [skill]);

  const handleEndorse = async (e) => {
    e.preventDefault();
    if (!endorseTarget || !skillName) return;
    setSubmitting(true);
    setMsg('');

    try {
      const res = await api.post('/faculty/endorse', {
        alumniId: endorseTarget.id,
        skillName,
        comment
      });
      if (res.data?.success) {
        setMsg(`Successfully endorsed ${endorseTarget.fullName} for ${skillName}!`);
        fetchAlumni();
        setTimeout(() => {
          setEndorseTarget(null);
          setSkillName('');
          setComment('');
          setMsg('');
        }, 2000);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to endorse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Alumni Expertise & Endorsement Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search alumni by technical expertise and officially endorse their skills on behalf of the university faculty.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by alumnus name, current company, or role..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Filter by skill (e.g. System Design, Python)..."
          className="text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 sm:w-64"
        />
        <button
          onClick={fetchAlumni}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
        >
          Filter
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading alumni records...</div>
      ) : alumni.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No alumni match the search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alumni.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {a.fullName.charAt(0)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Class of {a.alumniProfile?.graduationYear}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2.5">{a.fullName}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  {a.alumniProfile?.currentRole} at {a.alumniProfile?.currentCompany}
                </p>

                {a.alumniProfile?.skills && a.alumniProfile.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {a.alumniProfile.skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {a.endorsements && a.endorsements.length > 0 && (
                  <div className="mt-3 p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-[10px] text-purple-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-purple-600" /> Faculty Endorsements:
                    </p>
                    {a.endorsements.map((e, idx) => (
                      <p key={idx} className="text-slate-600 pl-4">
                        • <span className="font-semibold text-purple-900">{e.skill}</span>: "{e.comment || 'Verified excellence'}"
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setEndorseTarget(a)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Award className="w-3.5 h-3.5" /> Endorse Expertise
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Endorsement Modal */}
      {endorseTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Faculty Endorsement: {endorseTarget.fullName}
              </h3>
              <button onClick={() => setEndorseTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg && (
              <div className="my-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                {msg}
              </div>
            )}

            <form onSubmit={handleEndorse} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skill or Domain to Endorse</label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. System Design, Machine Learning, Cloud Architecture"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Commendation / Comment</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Demonstrated exceptional mastery during undergraduate coursework and industry capstone..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEndorseTarget(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  {submitting ? 'Recording...' : 'Officially Endorse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
