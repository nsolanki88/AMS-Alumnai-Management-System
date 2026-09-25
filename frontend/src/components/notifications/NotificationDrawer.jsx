import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function NotificationDrawer({ isOpen, onClose, onNotificationRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
              >
                Mark all read
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-600">No notifications yet</p>
                <p className="text-xs text-slate-400">We'll alert you when there are updates or requests.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && markAsRead(item.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    item.isRead
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-blue-50/60 border-blue-200 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.type === 'verification' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {item.type === 'mentorship' && <Calendar className="w-4 h-4 text-blue-500" />}
                      {item.type === 'doubt' && <Info className="w-4 h-4 text-amber-500" />}
                      {item.type === 'info' && <Info className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-800">{item.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
