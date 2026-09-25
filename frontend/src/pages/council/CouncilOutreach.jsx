import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PhoneCall, Mail, MessageSquare, AlertTriangle, Plus, Clock, X, CheckCircle2 } from 'lucide-react';

export default function CouncilOutreach() {
  const [logs, setLogs] = useState([]);
  const [overdueRecords, setOverdueRecords] = useState([]);
  const [filter, setFilter] = useState('all'); // all, overdue
  const [loading, setLoading] = useState(true);

  // New Log Modal
  const [showModal, setShowModal] = useState(false);
  const [recordsList, setRecordsList] = useState([]);
  const [formData, setFormData] = useState({
    recordId: '',
    channel: 'email', // email, phone, message
    status: 'contacted', // contacted, no_response, responded, opted_out
    notes: '',
    followUpDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchOutreach = async () => {
    setLoading(true);
    try {
      if (filter === 'overdue') {
        const res = await api.get('/outreach', { params: { filter: 'overdue' } });
        if (res.data?.success) setOverdueRecords(res.data.data.records);
      } else {
        const res = await api.get('/outreach');
        if (res.data?.success) setLogs(res.data.data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await api.get('/alumni-records/unregistered');
      if (res.data?.success) setRecordsList(res.data.data.records);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOutreach();
  }, [filter]);

  const handleOpenModal = (prefillRecordId = '') => {
    fetchRecords();
    setFormData(prev => ({ ...prev, recordId: prefillRecordId }));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recordId) return;
    setSubmitting(true);
    setMsg('');

    try {
      const res = await api.post('/outreach', formData);
      if (res.data?.success) {
        setMsg('Outreach communication logged successfully');
        fetchOutreach();
        setTimeout(() => {
          setShowModal(false);
          setMsg('');
          setFormData({
            recordId: '',
            channel: 'email',
            status: 'contacted',
            notes: '',
            followUpDate: ''
          });
        }, 1800);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log outreach');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Outreach Management & Follow-up
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log outreach communication history across email, phone, and messaging channels. System automatically flags records uncontacted/unverified for &gt; 90 days.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Outreach Activity
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Recent Communications
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'overdue'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Flagged for Follow-up (&gt; 90 Days)
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading outreach data...</div>
      ) : filter === 'overdue' ? (
        /* Overdue Records */
        overdueRecords.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold text-sm">All unregistered records are up to date!</p>
            <p className="text-xs text-slate-400 mt-1">No alumni have exceeded the 90-day uncontacted window.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdueRecords.map((r) => (
              <div key={r.recordId} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Follow-up Required (&gt;90 Days)
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">{r.fullName}</h3>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Class of {r.graduationYear} ({r.branch}) • Roll No: {r.rollNumber} • Org: {r.company || 'Unlisted'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenModal(r.recordId)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Log Contact
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Recent Logs List */
        logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <PhoneCall className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold text-sm">No outreach history recorded</p>
            <p className="text-xs text-slate-400 mt-1">Log contact attempts with alumni candidates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((l) => (
              <div key={l.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {l.channel}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      l.status === 'responded' ? 'bg-emerald-50 text-emerald-700' :
                      l.status === 'opted_out' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {l.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{l.record?.fullName}</h3>
                  <p className="text-xs text-slate-600 mt-1">{l.notes}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                  Logged by {l.logger?.fullName || 'Council'}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Log Outreach Communication</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg && (
              <div className="my-3 p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg font-medium border border-emerald-200">
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Alumnus Record</label>
                <select
                  required
                  value={formData.recordId}
                  onChange={(e) => setFormData({ ...formData, recordId: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="">-- Choose alumnus record --</option>
                  {recordsList.map((r) => (
                    <option key={r.recordId} value={r.recordId}>
                      {r.fullName} ({r.rollNumber} • Class of {r.graduationYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="message">SMS / Messaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Response Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="contacted">Contacted</option>
                    <option value="no_response">No Response</option>
                    <option value="responded">Responded</option>
                    <option value="opted_out">Opted Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Communication Summary / Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes from call or email conversation..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
                >
                  {submitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
