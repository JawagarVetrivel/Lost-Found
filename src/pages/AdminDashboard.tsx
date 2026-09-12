import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { ReportStats, User } from '../types';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers()
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
          <div className="p-3 rounded-lg mr-4 bg-indigo-50 text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-900">{users.length * 45}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
          <div className="p-3 rounded-lg mr-4 bg-red-50 text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Lost Reports</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalLost || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
          <div className="p-3 rounded-lg mr-4 bg-emerald-50 text-emerald-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Found Reports</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalFound || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
          <div className="p-3 rounded-lg mr-4 bg-blue-50 text-blue-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Resolved Items</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.resolved || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Student ID</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4">{user.studentId}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900 font-medium text-xs">Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
