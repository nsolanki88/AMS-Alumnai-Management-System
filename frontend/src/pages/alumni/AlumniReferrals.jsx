import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Share2, Plus, ArrowRight, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';

export default function AlumniReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    referredName: '',
    referredEmail: '',
    graduationYear: 2022,
    branch: 'Computer Science & Engineering',
    company: '',
    jobRole: '',
    linkedinUrl: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/referrals');
      if (res.data?.success) {
        setReferrals(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMsg('');

    try {
      const res = await api.post('/referrals', formData);
      if (res.data?.success) {
        setMsg('Referral submitted successfully. Dispatched for Council verification.');
        fetchReferrals();
        setTimeout(() => {
          setShowModal(false);
          setMsg('');
          setFormData({
            referredName: '',
            referredEmail: '',
            graduationYear: 2022,
            branch: 'Computer Science & Engineering',
            company: '',
            jobRole: '',
            linkedinUrl: '',
            notes: ''
          });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit referral');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Alumni Peer Referral Network
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Refer fellow alumni to help the Council reconnect and verify graduates. Track the verification status and referral chains.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Refer an Alumnus
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading referral network...</div>
      ) : referrals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Share2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No referrals submitted yet</p>
          <p className="text-xs text-slate-400 mt-1">Submit your first referral to expand the verified network.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      Council Status: {item.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Submitted on {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{item.referredName}</h3>
                  <p className="text-xs text-slate-500">
                    {item.jobRole || 'Engineer'} {item.company ? `@ ${item.company}` : ''} • Class of {item.graduationYear} ({item.branch})
                  </p>
                  {item.notes && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Referral Chain Visualization: Alumni A -> Alumni B */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-blue-700">{item.referrer?.fullName || 'You'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-900">{item.referredName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Referral Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Refer an Alumni Peer</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg && (
              <div className="my-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
                {msg}
              </div>
            )}
            {error && (
              <div className="my-3 p-2.5 bg-red-50 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Referred Alumnus Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.referredName}
                  onChange={(e) => setFormData({ ...formData, referredName: e.target.value })}
                  placeholder="e.g. Aditya Deshmukh"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.referredEmail}
                  onChange={(e) => setFormData({ ...formData, referredEmail: e.target.value })}
                  placeholder="alumnus@example.com"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Grad Year</label>
                  <input
                    type="number"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value || 2022, 10) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <input
                    type="text"
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Goldman Sachs"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Role</label>
                  <input
                    type="text"
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    placeholder="e.g. Analyst Developer"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Public LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Endorsement / Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How do you know this alumnus? (e.g. capstone partner, batchmate)..."
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  {submitting ? 'Submitting...' : 'Submit Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
