'use client';

import React, { useState } from 'react';
import { Search, Filter, Edit2, Check, X, ShieldAlert, GraduationCap } from 'lucide-react';

interface StudentInfo {
  grade: number;
  total_sessions: number;
  total_minutes: number;
  streak_days: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'parent' | 'admin';
  avatar_url: string;
  created_at: string;
  studentInfo?: StudentInfo | null;
}

interface UserTableProps {
  users: User[];
  onUpdateUser: (updatedUser: { id: string; full_name: string; role: 'student' | 'parent' | 'admin'; grade?: number }) => Promise<void>;
}

export default function UserTable({ users, onUpdateUser }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  
  // Inline editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'parent' | 'admin'>('student');
  const [editGrade, setEditGrade] = useState<number>(3);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.full_name || '');
    setEditRole(user.role);
    setEditGrade(user.studentInfo?.grade || 3);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    try {
      await onUpdateUser({
        id,
        full_name: editName,
        role: editRole,
        grade: editRole === 'student' ? editGrade : undefined,
      });
      setEditingUserId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    const matchesGrade =
      gradeFilter === 'all' ||
      (u.role === 'student' && String(u.studentInfo?.grade) === gradeFilter);

    return matchesSearch && matchesRole && matchesGrade;
  });

  return (
    <div className="flex flex-col gap-4 w-full bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-slate-800 text-base font-display">Danh sách Người dùng</h3>
        <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
          {filteredUsers.length} thành viên
        </span>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-purple-50 hover:border-purple-100 focus:border-purple-300 rounded-2xl outline-none font-medium text-sm transition-colors text-slate-700"
          />
        </div>

        {/* Filters Select row */}
        <div className="flex gap-2.5">
          <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-50 bg-slate-50/50 rounded-2xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent outline-none font-bold text-xs text-slate-600 w-full"
            >
              <option value="all">Tất cả Vai Trò</option>
              <option value="student">Học sinh 🎒</option>
              <option value="parent">Phụ huynh 👨‍👩‍👧</option>
              <option value="admin">Quản trị ⚙️</option>
            </select>
          </div>

          <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-50 bg-slate-50/50 rounded-2xl">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-transparent outline-none font-bold text-xs text-slate-600 w-full"
            >
              <option value="all">Tất cả Lớp</option>
              <option value="1">Lớp 1</option>
              <option value="2">Lớp 2</option>
              <option value="3">Lớp 3</option>
              <option value="4">Lớp 4</option>
              <option value="5">Lớp 5</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table / List on Mobile */}
      <div className="lg:hidden mt-2">
        <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              
              return (
                <div
                  key={user.id}
                  className={`p-3.5 border-2 rounded-2xl transition-all ${
                    isEditing 
                      ? 'border-purple-300 bg-purple-50/10' 
                      : 'border-slate-50 bg-slate-50/30 hover:border-purple-100 hover:bg-purple-50/5'
                  }`}
                >
                  {isEditing ? (
                    /* Edit Form View */
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Họ và tên</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 border-2 border-purple-100 rounded-xl outline-none font-bold text-xs text-slate-700"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Vai trò</label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 border-2 border-purple-100 rounded-xl outline-none font-bold text-xs text-slate-600 bg-white"
                          >
                            <option value="student">Học sinh</option>
                            <option value="parent">Phụ huynh</option>
                            <option value="admin">Quản trị</option>
                          </select>
                        </div>

                        {editRole === 'student' && (
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Khối lớp</label>
                            <select
                              value={editGrade}
                              onChange={(e) => setEditGrade(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 border-2 border-purple-100 rounded-xl outline-none font-bold text-xs text-slate-600 bg-white"
                            >
                              <option value={1}>Lớp 1</option>
                              <option value={2}>Lớp 2</option>
                              <option value={3}>Lớp 3</option>
                              <option value={4}>Lớp 4</option>
                              <option value={5}>Lớp 5</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end mt-1">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Hủy
                        </button>
                        <button
                          onClick={() => saveEdit(user.id)}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all"
                        >
                          {isSaving ? '...' : <Check className="w-3.5 h-3.5" />} Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display View */
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full border border-purple-100 bg-purple-50 shrink-0"
                        />
                        
                        <div>
                          <div className="font-extrabold text-slate-800 font-display text-sm">
                            {user.full_name || 'Chưa đặt tên'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium break-all">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              user.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                              user.role === 'parent' ? 'bg-pink-100 text-pink-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'parent' ? 'Phụ huynh' : `Học sinh (Lớp ${user.studentInfo?.grade || 3})`}
                            </span>
                            
                            {user.role === 'student' && user.studentInfo && (
                              <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                                🔥 {user.studentInfo.streak_days}d
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-center">
                        <button
                          onClick={() => startEdit(user)}
                          className="p-1.5 hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-lg transition-colors active:scale-90"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User Table on Desktop */}
      <div className="hidden lg:block mt-2 overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold text-xs">
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 pl-2">Thành viên</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Vai trò</th>
                <th className="pb-3">Khối lớp</th>
                <th className="pb-3">Ngày tham gia</th>
                <th className="pb-3 text-right pr-4">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => {
                const isEditing = editingUserId === user.id;
                
                if (isEditing) {
                  return (
                    <tr key={user.id} className="bg-purple-50/10">
                      <td className="py-3 pl-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2.5 py-1.5 border-2 border-purple-100 rounded-xl outline-none font-bold text-xs text-slate-700 w-full max-w-[180px]"
                        />
                      </td>
                      <td className="py-3 text-xs text-slate-400 font-medium">{user.email}</td>
                      <td className="py-3">
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as any)}
                          className="px-2.5 py-1.5 border-2 border-purple-100 rounded-xl outline-none font-bold text-xs text-slate-600 bg-white"
                        >
                          <option value="student">Học sinh</option>
                          <option value="parent">Phụ huynh</option>
                          <option value="admin">Quản trị</option>
                        </select>
                      </td>
                      <td className="py-3">
                        {editRole === 'student' ? (
                          <select
                            value={editGrade}
                            onChange={(e) => setEditGrade(Number(e.target.value))}
                            className="px-2.5 py-1.5 border-2 border-purple-100 rounded-xl outline-none font-bold text-xs text-slate-600 bg-white"
                          >
                            <option value={1}>Lớp 1</option>
                            <option value={2}>Lớp 2</option>
                            <option value={3}>Lớp 3</option>
                            <option value={4}>Lớp 4</option>
                            <option value={5}>Lớp 5</option>
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-slate-500 font-medium">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 text-right pr-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all active:scale-95"
                            title="Hủy"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => saveEdit(user.id)}
                            disabled={isSaving}
                            className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all active:scale-95"
                            title="Lưu"
                          >
                            {isSaving ? '...' : <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2 flex items-center gap-3">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full border border-purple-100 bg-purple-50 shrink-0"
                      />
                      <span className="font-extrabold text-slate-800 font-display text-sm">
                        {user.full_name || 'Chưa đặt tên'}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-500 font-medium">{user.email}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                        user.role === 'parent' ? 'bg-pink-100 text-pink-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                      </span>
                    </td>
                    <td className="py-3 text-xs font-bold text-slate-600">
                      {user.role === 'student' ? `Lớp ${user.studentInfo?.grade || 3}` : '—'}
                    </td>
                    <td className="py-3 text-xs text-slate-500 font-medium">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 text-right pr-4">
                      <button
                        onClick={() => startEdit(user)}
                        className="p-1.5 hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-lg transition-colors active:scale-90"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
