'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import LearningReport from '@/components/parent/LearningReport';
import ChatHistoryViewer from '@/components/parent/ChatHistoryViewer';
import { UserPlus, UserMinus, Sparkles } from 'lucide-react';

export default function ParentDashboard() {
  const [parent, setParent] = useState<any>(null);
  
  // Children list and selection
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<any>(null);
  
  // Child statistics
  const [childStats, setChildStats] = useState<any>({
    todaySessions: 0,
    totalMinutes: 0,
    streakDays: 0,
    topSubject: 'math',
  });
  
  const [weeklyHistory, setWeeklyHistory] = useState<{ day: string; minutes: number }[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);

  // Child linking form
  const [linkEmail, setLinkEmail] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    async function loadParentData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setParent(user);

      await fetchChildren(user.id);
    }
    
    loadParentData();
  }, []);

  // Fetch children list
  const fetchChildren = async (parentId: string) => {
    const supabase = createClient();
    
    // Get profiles of connected children
    const { data: relations } = await supabase
      .from('parent_children')
      .select('student_id')
      .eq('parent_id', parentId);

    if (relations && relations.length > 0) {
      const childIds = relations.map((r: any) => r.student_id);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', childIds);

      const { data: studentProfiles } = await supabase
        .from('student_profiles')
        .select('*')
        .in('id', childIds);

      const combinedChildren = (profiles || []).map((p: any) => {
        const sp = (studentProfiles || []).find((s: any) => s.id === p.id);
        return { ...p, ...sp };
      });

      setChildren(combinedChildren);
      
      if (combinedChildren.length > 0) {
        // Automatically select the first child
        setSelectedChildId(combinedChildren[0].id);
      }
    } else {
      setChildren([]);
      setSelectedChildId('');
    }
  };

  // Whenever selected child changes, load their statistics
  useEffect(() => {
    if (!selectedChildId) {
      setSelectedChild(null);
      return;
    }

    const child = children.find(c => c.id === selectedChildId);
    setSelectedChild(child);

    async function loadChildStats() {
      const supabase = createClient();
      
      // Fetch child sessions
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('student_id', selectedChildId)
        .order('started_at', { ascending: false });

      const childSessions = sessions || [];
      setChatSessions(childSessions);

      // 1. Calculate today's sessions
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaySessionsCount = childSessions.filter(
        (s: any) => new Date(s.started_at) >= todayStart
      ).length;

      // 2. Favorite subject calculation
      const subjectsCount: Record<string, number> = {};
      childSessions.forEach((s: any) => {
        if (s.subject) {
          subjectsCount[s.subject] = (subjectsCount[s.subject] || 0) + 1;
        }
      });
      let favoriteSubject = 'math';
      let maxCount = 0;
      Object.entries(subjectsCount).forEach(([sub, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteSubject = sub;
        }
      });

      setChildStats({
        todaySessions: todaySessionsCount,
        totalMinutes: child?.total_minutes || 0,
        streakDays: child?.streak_days || 0,
        topSubject: favoriteSubject,
      });

      // 3. 7-Day History Chart Series calculation
      const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
          dateStr: d.toISOString().split('T')[0],
          dayName: daysOfWeek[d.getDay()],
          minutes: 0,
        };
      }).reverse();

      // Accumulate minutes per day
      childSessions.forEach((s: any) => {
        const sessionDate = new Date(s.started_at).toISOString().split('T')[0];
        const match = last7Days.find(d => d.dateStr === sessionDate);
        if (match) {
          match.minutes += Math.round((s.duration_seconds || 0) / 60);
        }
      });

      setWeeklyHistory(
        last7Days.map(d => ({
          day: d.dayName,
          minutes: d.minutes,
        }))
      );
    }

    loadChildStats();
  }, [selectedChildId, children]);

  // Handle adding child account
  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');
    
    if (!linkEmail.trim()) return;

    setLinking(true);
    try {
      const supabase = createClient();
      
      // Query profiles to find user
      const { data: studentProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', linkEmail.trim().toLowerCase())
        .eq('role', 'student')
        .single();

      if (error || !studentProfile) {
        setLinkError('Không tìm thấy tài khoản học sinh nào với email này!');
        setLinking(false);
        return;
      }

      // Check if already linked
      const alreadyLinked = children.some(c => c.id === studentProfile.id);
      if (alreadyLinked) {
        setLinkError('Tài khoản học sinh này đã được liên kết từ trước!');
        setLinking(false);
        return;
      }

      // Perform linkage
      await supabase
        .from('parent_children')
        .insert({
          parent_id: parent.id,
          student_id: studentProfile.id
        });

      // Update parent_id reference in student_profiles
      await supabase
        .from('student_profiles')
        .update({ parent_id: parent.id })
        .eq('id', studentProfile.id);

      setLinkSuccess(`Đã liên kết thành công với Bé ${studentProfile.full_name}! 🎉`);
      setLinkEmail('');
      
      // Reload children list
      await fetchChildren(parent.id);
    } catch (err) {
      console.error(err);
      setLinkError('Lỗi hệ thống khi liên kết. Vui lòng thử lại!');
    } finally {
      setLinking(false);
    }
  };

  // Handle removing child account link
  const handleUnlinkChild = async (childId: string) => {
    if (!confirm('Bố mẹ có chắc chắn muốn hủy liên kết với tài khoản của con không?')) return;
    
    try {
      const supabase = createClient();
      await supabase
        .from('parent_children')
        .delete()
        .eq('parent_id', parent.id)
        .eq('student_id', childId);

      await supabase
        .from('student_profiles')
        .update({ parent_id: null })
        .eq('id', childId);

      // Reload children list
      await fetchChildren(parent.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchMessages = async (sessId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessId)
      .order('created_at', { ascending: true });
    return data || [];
  };

  return (
    <div className="w-full flex flex-col md:grid md:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Link Widget & Learning Report */}
      <div className="w-full flex flex-col gap-6 md:col-span-5 lg:col-span-5">
        
        {/* Child account link management widget */}
        <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 text-sm font-display mb-3">
            👨‍👩‍👧 Kết nối Tài khoản của Con
          </h3>

          {/* Child selector dropdown if parent has children */}
          {children.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-400">Chọn con xem báo cáo:</label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-700 cursor-pointer"
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      Bé {c.full_name} (Lớp {c.grade})
                    </option>
                  ))}
                </select>
              </div>

              {selectedChild && (
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                  <span className="font-semibold text-slate-500">
                    Email con: <b className="text-slate-700">{selectedChild.email}</b>
                  </span>
                  <button
                    onClick={() => handleUnlinkChild(selectedChild.id)}
                    className="text-rose-500 hover:text-rose-700 font-extrabold flex items-center gap-0.5 active:scale-95 transition-transform"
                  >
                    <UserMinus className="w-3.5 h-3.5" /> Hủy kết nối
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-rose-50/20 border-2 border-dashed border-rose-100 rounded-2xl text-center text-xs text-slate-400 font-bold mb-4">
              ⚠️ Bố mẹ chưa liên kết với tài khoản học sinh nào! Hãy nhập email đăng ký của con ở dưới để kết nối nhé.
            </div>
          )}

          {/* Linking Form */}
          <form onSubmit={handleLinkChild} className="mt-4 border-t border-slate-100 pt-4 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              LIÊN KẾT THÊM TÀI KHOẢN CỦA CON
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email đăng ký của con..."
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-rose-300 rounded-xl outline-none text-xs font-bold text-slate-700 transition-colors"
              />
              <button
                type="submit"
                disabled={linking || !linkEmail}
                className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1 shrink-0 disabled:bg-slate-200"
              >
                {linking ? '...' : <UserPlus className="w-3.5 h-3.5" />} Kết nối
              </button>
            </div>
            {linkError && <span className="text-[10px] text-rose-500 font-bold mt-1">⚠️ {linkError}</span>}
            {linkSuccess && <span className="text-[10px] text-emerald-500 font-bold mt-1">✨ {linkSuccess}</span>}
          </form>
        </div>

        {selectedChildId && (
          /* 1. Learning analytics report */
          <LearningReport
            studentName={selectedChild?.full_name || 'Học sinh'}
            grade={selectedChild?.grade || 3}
            stats={childStats}
            weeklyHistory={weeklyHistory}
          />
        )}
      </div>

      {/* Right Column: Chat History Viewer or Empty State */}
      <div className="w-full md:col-span-7 lg:col-span-7 flex flex-col gap-6">
        {selectedChildId ? (
          /* 2. Detailed chat histories viewing */
          <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <ChatHistoryViewer
              sessions={chatSessions}
              onFetchSessionMessages={handleFetchMessages}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-center text-slate-400 py-16 gap-3">
            <Sparkles className="w-8 h-8 text-rose-300" />
            <div>
              <p className="font-display font-semibold text-sm text-slate-600 mb-1">
                Chưa có dữ liệu học tập!
              </p>
              <p className="text-[11px] max-w-[240px]">
                Vui lòng kết nối với tài khoản học sinh ở khung phía trên để bắt đầu theo dõi tiến độ của con.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

