import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, Shield, Menu } from 'lucide-react';
import NotificationDrawer from '../notifications/NotificationDrawer';
import api from '../../services/api';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success) {
        setUnreadCount(res.data.data.count);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const roleColors = {
    STUDENT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ALUMNI: 'bg-blue-100 text-blue-800 border-blue-300',
    FACULTY: 'bg-purple-100 text-purple-800 border-purple-300',
    COUNCIL: 'bg-amber-100 text-amber-800 border-amber-300',
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-300'
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              A+
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">AMS+</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2 font-medium">Alumni & AI Engagement</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Role Badge */}
          {user?.role && (
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleColors[user.role] || 'bg-slate-100 text-slate-800'}`}>
              {user.role}
            </span>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNotificationRead={fetchUnreadCount}
      />
    </>
  );
}
