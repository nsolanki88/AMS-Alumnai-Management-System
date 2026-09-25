import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data?.success) {
        const { user, accessToken, refreshToken } = res.data.data;
        setUser(user);
        localStorage.setItem('ams_user', JSON.stringify(user));
        localStorage.setItem('ams_access_token', accessToken);
        localStorage.setItem('ams_refresh_token', refreshToken);

        // Redirect based on role
        if (user.role === 'COUNCIL') navigate('/council/dashboard');
        else if (user.role === 'ALUMNI') navigate('/alumni/dashboard');
        else if (user.role === 'FACULTY') navigate('/faculty/dashboard');
        else if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else navigate('/student/dashboard');
      } else {
        setError(res.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setInfo(res.data?.message || 'Fresh OTP dispatched');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center font-bold text-xl mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Email Verification</h2>
        <p className="text-xs text-slate-400 mt-1">Enter the 6-digit OTP sent to your email address</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full text-xs bg-slate-900/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-lg font-bold bg-slate-900/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Code...' : 'Verify & Enter Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend OTP Code
            </button>
            <Link to="/login" className="text-slate-400 hover:text-slate-200">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
