import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export default function AdminSettings() {
  const [weights, setWeights] = useState({
    name: 35,
    college: 20,
    year: 15,
    branch: 10,
    company: 10,
    role: 5,
    location: 5
  });

  const [security, setSecurity] = useState({
    maxAttempts: 5,
    lockMinutes: 15,
    jwtExpiryHours: 8,
    refreshTokenDays: 30
  });

  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('System configuration and algorithm weights saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Configuration & AI Model Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure transparent heuristic scoring weights for AI profile discovery and adjust security lockout policies.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Confidence Weights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Profile Discovery Weighted Signals</h2>
              <p className="text-[11px] text-slate-400">Total must sum to 100%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Name Similarity Weight (%)</label>
              <input
                type="number"
                value={weights.name}
                onChange={(e) => setWeights({ ...weights, name: parseInt(e.target.value || 0, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alma Mater Match Weight (%)</label>
              <input
                type="number"
                value={weights.college}
                onChange={(e) => setWeights({ ...weights, college: parseInt(e.target.value || 0, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Batch Match (%)</label>
              <input
                type="number"
                value={weights.year}
                onChange={(e) => setWeights({ ...weights, year: parseInt(e.target.value || 0, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch / Degree Match (%)</label>
              <input
                type="number"
                value={weights.branch}
                onChange={(e) => setWeights({ ...weights, branch: parseInt(e.target.value || 0, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employer / Company (%)</label>
              <input
                type="number"
                value={weights.company}
                onChange={(e) => setWeights({ ...weights, company: parseInt(e.target.value || 0, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role Designation (%)</label>
              <input
                type="number"
                value={weights.role}
                onChange={(e) => setWeights({ ...weights, role: parseInt(e.target.value || 0, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Security & Lockout Policy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Security & Authentication Policies</h2>
              <p className="text-[11px] text-slate-400">Brute-force lockout and session duration rules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Failed Login Attempts</label>
              <input
                type="number"
                value={security.maxAttempts}
                onChange={(e) => setSecurity({ ...security, maxAttempts: parseInt(e.target.value || 5, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
              <span className="text-[10px] text-slate-400">Strictly locked after 5 consecutive failures</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lock Duration (Minutes)</label>
              <input
                type="number"
                value={security.lockMinutes}
                onChange={(e) => setSecurity({ ...security, lockMinutes: parseInt(e.target.value || 15, 10) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">JWT Access Expiry (Hours)</label>
              <input
                type="number"
                value={security.jwtExpiryHours}
                readOnly
                className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">SRS v2 standard: 8 hours</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Refresh Token Expiry (Days)</label>
              <input
                type="number"
                value={security.refreshTokenDays}
                readOnly
                className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">SRS v2 standard: 30 days</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
