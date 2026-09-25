import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Shield, Lock, Unlock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/users', { params });
      if (res.data?.success) {
        setUsers(res.data.data.users);
        setTotal(res.data.data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        setMsg(res.data.message);
        fetchUsers();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleLock = async (userId, currentlyLocked) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/lock`, { lock: !currentlyLocked });
      if (res.data?.success) {
        setMsg(res.data.message);
        fetchUsers();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle account lock');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          User & Role Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system users across all 5 roles, assign or revoke permissions, and manually lock or unlock accounts.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {msg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name or email..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="ALUMNI">Alumni</option>
          <option value="FACULTY">Faculty</option>
          <option value="COUNCIL">Council</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
        >
          Filter
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-xs">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs">No users match criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Verified</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{u.fullName}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-800"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="ALUMNI">ALUMNI</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="COUNCIL">COUNCIL</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.isLocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1 w-max">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleLock(u.id, u.isLocked)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto ${
                          u.isLocked
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {u.isLocked ? 'Unlock' : 'Lock Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
