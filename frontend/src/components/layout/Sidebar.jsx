import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  Award,
  Calendar,
  MessageSquare,
  Upload,
  UserCheck,
  CheckCircle,
  PhoneCall,
  Share2,
  BarChart3,
  ShieldCheck,
  FileText,
  Settings,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const navItemsByRole = {
    STUDENT: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Alumni Directory', path: '/student/directory', icon: Users },
      { name: 'Doubts & Q&A', path: '/student/doubts', icon: HelpCircle },
      { name: 'Mentors', path: '/student/mentors', icon: Award },
      { name: 'Workshops & Events', path: '/student/workshops', icon: Calendar },
      { name: 'Batch Community', path: '/student/community', icon: MessageSquare }
    ],
    ALUMNI: [
      { name: 'Dashboard', path: '/alumni/dashboard', icon: LayoutDashboard },
      { name: 'My Profile & Visibility', path: '/alumni/profile', icon: UserCheck },
      { name: 'Student Doubts', path: '/alumni/doubts', icon: HelpCircle },
      { name: 'Mentorship & Invites', path: '/alumni/mentorship', icon: Award },
      { name: 'Session Calendar', path: '/alumni/calendar', icon: Calendar },
      { name: 'Referral Network', path: '/alumni/referrals', icon: Share2 },
      { name: 'Batch Community', path: '/alumni/community', icon: MessageSquare }
    ],
    FACULTY: [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'Alumni & Expertise', path: '/faculty/directory', icon: Users },
      { name: 'Session Invitations', path: '/faculty/invitations', icon: Calendar },
      { name: 'Department Analytics', path: '/faculty/analytics', icon: BarChart3 }
    ],
    COUNCIL: [
      { name: 'Dashboard', path: '/council/dashboard', icon: LayoutDashboard },
      { name: 'Bulk Data Import', path: '/council/upload', icon: Upload },
      { name: 'Unregistered Alumni', path: '/council/unregistered', icon: UserCheck },
      { name: 'AI Verification', path: '/council/verification', icon: ShieldCheck },
      { name: 'Outreach Tracking', path: '/council/outreach', icon: PhoneCall },
      { name: 'Referrals Review', path: '/council/referrals', icon: Share2 },
      { name: 'Batch Communities', path: '/council/batch-groups', icon: MessageSquare },
      { name: 'Master Analytics', path: '/council/analytics', icon: BarChart3 }
    ],
    ADMIN: [
      { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
      { name: 'Master Analytics', path: '/admin/analytics', icon: BarChart3 },
      { name: 'AI Verification Hub', path: '/council/verification', icon: ShieldCheck },
      { name: 'Bulk Data Import', path: '/council/upload', icon: Upload },
      { name: 'System Settings', path: '/admin/settings', icon: Settings }
    ]
  };

  const navItems = navItemsByRole[role] || navItemsByRole.STUDENT;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Portal Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {role.substring(0, 1)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">{role} PORTAL</h2>
            <p className="text-[10px] text-slate-400">AMS+ Institutional Hub</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="text-[11px]">
              <p className="text-white font-semibold">AI Assistant Ready</p>
              <p className="text-slate-400 text-[10px]">Use the widget for instant queries</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
