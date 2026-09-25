import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Briefcase, Award, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AlumniProfile() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    currentCompany: '',
    currentRole: '',
    cityCountry: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    visibility: 'PUBLIC', // PUBLIC, BATCH_ONLY, PRIVATE
    skills: '',
    experienceYears: 0,
    isMentor: true,
    workshopReady: true,
    workshopTopics: '',
    mentorshipAvailability: 'available'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data?.success) {
          const u = res.data.data;
          const p = u.alumniProfile || {};
          const m = u.mentorshipProfile || {};

          setFormData({
            fullName: u.fullName || '',
            phoneNumber: u.phoneNumber || '',
            currentCompany: p.currentCompany || '',
            currentRole: p.currentRole || '',
            cityCountry: p.cityCountry || '',
            bio: p.bio || '',
            linkedinUrl: p.linkedinUrl || '',
            githubUrl: p.githubUrl || '',
            visibility: p.visibility || 'PUBLIC',
            skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
            experienceYears: p.experienceYears || 0,
            isMentor: p.isMentor ?? true,
            workshopReady: p.workshopReady ?? true,
            workshopTopics: Array.isArray(m.workshopTopics) ? m.workshopTopics.join(', ') : '',
            mentorshipAvailability: m.mentorshipAvailability || 'available'
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    const skillsArray = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const workshopTopicsArray = formData.workshopTopics
      ? formData.workshopTopics.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      // 1. Update basic and alumni profile
      const res = await api.put('/profile', {
        ...formData,
        skills: skillsArray
      });

      // 2. Update mentorship profile
      await api.post('/mentorship/profile', {
        bio: formData.bio,
        currentCompany: formData.currentCompany,
        currentRole: formData.currentRole,
        yearsOfExperience: formData.experienceYears,
        skills: skillsArray,
        workshopTopics: workshopTopicsArray,
        mentorshipAvailability: formData.mentorshipAvailability,
        isActive: formData.isMentor
      });

      if (res.data?.success) {
        setMsg('Profile & visibility settings successfully updated!');
        await refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs">Loading profile settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Professional Profile & Privacy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your professional details, skills, and control visibility across students, batch groups, and faculty.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {msg}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Privacy & Visibility Settings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Profile Visibility Tier</h2>
              <p className="text-[11px] text-slate-400">Strictly governs who can search and view your alumni details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              formData.visibility === 'PUBLIC'
                ? 'bg-blue-50/60 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">PUBLIC</span>
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    checked={formData.visibility === 'PUBLIC'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Visible to verified students, alumni, and faculty in directory searches.
                </p>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              formData.visibility === 'BATCH_ONLY'
                ? 'bg-blue-50/60 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">BATCH ONLY</span>
                  <input
                    type="radio"
                    name="visibility"
                    value="BATCH_ONLY"
                    checked={formData.visibility === 'BATCH_ONLY'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Visible exclusively to graduates from your graduation year and Council.
                </p>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              formData.visibility === 'PRIVATE'
                ? 'bg-blue-50/60 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">PRIVATE</span>
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    checked={formData.visibility === 'PRIVATE'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Hidden from student and public directories; visible only to institutional administration.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Professional Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Current Employment & Profile Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+91-9876543210"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Organization / Employer</label>
              <input
                type="text"
                value={formData.currentCompany}
                onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                placeholder="e.g. Google, Microsoft, Startup"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Designation / Role</label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location (City, Country)</label>
              <input
                type="text"
                value={formData.cityCountry}
                onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                placeholder="e.g. Bengaluru, India"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Industry Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value || 0, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Skills & Technical Expertise (Comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. React, Node.js, System Design, AWS, Kubernetes"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share a short summary of your background, engineering interests, and collegiate memories..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Public LinkedIn Profile URL</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Public GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* Mentorship & Workshop Readiness Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Mentorship & Workshop Participation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                id="isMentorCheck"
                checked={formData.isMentor}
                onChange={(e) => setFormData({ ...formData, isMentor: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isMentorCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Offer 1-on-1 Student Mentorship
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                id="workshopReadyCheck"
                checked={formData.workshopReady}
                onChange={(e) => setFormData({ ...formData, workshopReady: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="workshopReadyCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Available to Conduct Workshops / Talks
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mentorship Availability Status</label>
              <select
                value={formData.mentorshipAvailability}
                onChange={(e) => setFormData({ ...formData, mentorshipAvailability: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              >
                <option value="available">Available (Open for requests)</option>
                <option value="limited">Limited (Occasional sessions)</option>
                <option value="unavailable">Unavailable (Temporarily paused)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Workshop Topics (Comma-separated)</label>
              <input
                type="text"
                value={formData.workshopTopics}
                onChange={(e) => setFormData({ ...formData, workshopTopics: e.target.value })}
                placeholder="e.g. Scalable Microservices, Intro to PyTorch"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
