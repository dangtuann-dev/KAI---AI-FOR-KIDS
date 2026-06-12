'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import StatsCard from '@/components/admin/StatsCard';
import FeatureUsageChart from '@/components/admin/FeatureUsageChart';
import UserTable from '@/components/admin/UserTable';
import ActivityTimeline from '@/components/admin/ActivityTimeline';
import { RefreshCw, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load all admin data
  const loadAdminData = async () => {
    try {
      const supabase = createClient();
      
      // 1. Fetch Stats API
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Users API
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // 3. Fetch Recent Events directly
      const { data: events } = await supabase
        .from('feature_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentEvents(events || []);

    } catch (e) {
      console.error('Error loading admin dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const handleUpdateUser = async (updatedUser: { id: string; full_name: string; role: 'student' | 'parent' | 'admin'; grade?: number }) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error('Cập nhật thất bại');
      
      // Reload page data
      await loadAdminData();
    } catch (err) {
      alert('Không thể cập nhật thông tin người dùng.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-display font-semibold text-slate-500">Đang tải bảng điều khiển Admin...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-none">
      
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 font-display">Tổng quan Hệ thống</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Dữ liệu phân tích thời gian thực</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all active:scale-95 shadow-sm text-slate-600 disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 1. Statistics grids */}
      {stats && <StatsCard stats={stats.overview} />}

      {/* 2. Visualizations and Trends */}
      {stats && (
        <FeatureUsageChart
          subjectUsage={stats.subjectUsage}
          gradeUsage={stats.gradeUsage}
          guardrailTrend={stats.guardrailTrend}
        />
      )}

      {/* 3. Questions and Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-start">
        
        {/* Top popular student questions */}
        <div className="md:col-span-5 w-full">
          {stats && stats.topQuestions && stats.topQuestions.length > 0 && (
            <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col gap-3 w-full">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="font-extrabold text-slate-800 text-sm font-display">
                  Top 5 câu hỏi của Học sinh
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {stats.topQuestions.map((q: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                    <span className="truncate pr-4 flex-1">💬 &ldquo;{q.text}&rdquo;</span>
                    <span className="bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded-full text-[10px] shrink-0">
                      {q.count} lần hỏi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actionable audit events logging */}
        <div className="md:col-span-7 w-full">
          <ActivityTimeline events={recentEvents} />
        </div>

      </div>

      {/* 5. User accounts listing, updating and disabling */}
      <div className="w-full">
        <UserTable users={users} onUpdateUser={handleUpdateUser} />
      </div>
      
    </div>
  );
}

