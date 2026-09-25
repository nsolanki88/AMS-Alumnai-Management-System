import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Lock, Mail, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'STUDENT':
        navigate('/student/dashboard');
        break;
      case 'ALUMNI':
        navigate('/alumni/dashboard');
        break;
      case 'FACULTY':
        navigate('/faculty/dashboard');
        break;
      case 'COUNCIL':
        navigate('/council/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/student/dashboard');
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-600/30">
            A+
          </div>
          <span className="text-2xl font-black text-white">AMS+</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to Institutional Portal</h2>
        <p className="text-xs text-slate-400 mt-1">Authenticate with your university credentials or choose a demo persona below</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <LogIn className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Personas */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Demo Personas (Password: Password123!)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('student@example.com')}
                className="p-2 text-center rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-emerald-300 font-semibold transition-all hover:border-emerald-500/50"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('alumni@example.com')}
                className="p-2 text-center rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-blue-300 font-semibold transition-all hover:border-blue-500/50"
              >
                Alumni
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('faculty@example.com')}
                className="p-2 text-center rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-purple-300 font-semibold transition-all hover:border-purple-500/50"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('council@example.com')}
                className="p-2 text-center rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-amber-300 font-semibold transition-all hover:border-amber-500/50"
              >
                Council
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@example.com')}
                className="p-2 text-center rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-rose-300 font-semibold transition-all hover:border-rose-500/50 col-span-2 sm:col-span-2"
              >
                System Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
