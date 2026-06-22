// components/parent/RealWorldTasks.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { XP_REWARDS, getLevelForXp, getCharacterEvolutionStage } from '@/lib/gamification';
import { CheckCircle2, Plus, Sparkles, BookOpen, Heart, Landmark, HelpCircle, Eye, MonitorOff, Award } from 'lucide-react';

interface Task {
  id: string;
  student_id: string;
  title: string;
  xp_reward: number;
  status: 'pending' | 'completed';
  created_at: string;
  verified_at?: string | null;
}

interface Props {
  studentId: string;
  studentName: string;
  onXpUpdated?: () => void;
}

const TASK_TEMPLATES = [
  { title: 'Đọc sách giấy 30 phút', xp: XP_REWARDS.read_book_30min, icon: <BookOpen className="w-4 h-4 text-purple-500" /> },
  { title: 'Giúp đỡ ba mẹ việc nhà', xp: XP_REWARDS.help_parent, icon: <Heart className="w-4 h-4 text-rose-500" /> },
  { title: 'Quan sát thiên nhiên & kể lại', xp: XP_REWARDS.observe_nature, icon: <Eye className="w-4 h-4 text-emerald-500" /> },
  { title: 'Làm một việc tốt ngẫu nhiên', xp: XP_REWARDS.good_deed, icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
  { title: 'Hoàn thành mục tiêu học tập ở trường', xp: XP_REWARDS.personal_goal, icon: <Award className="w-4 h-4 text-blue-500" /> },
  { title: '1 ngày không dùng điện thoại/tivi giải trí', xp: XP_REWARDS.screen_free_day, icon: <MonitorOff className="w-4 h-4 text-indigo-500" /> },
];

export default function RealWorldTasks({ studentId, studentName, onXpUpdated }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customXp, setCustomXp] = useState(40);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch student's real-world tasks
  const fetchTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('parent_tasks')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (data) {
      setTasks(data);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [studentId]);

  const showSuccessMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Add a task from template or custom form
  const handleAddTask = async (title: string, xpReward: number) => {
    if (!title.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const newTask = {
      student_id: studentId,
      title: title.trim(),
      xp_reward: xpReward,
      status: 'pending',
      verified_at: null,
    };

    const { error } = await supabase.from('parent_tasks').insert(newTask);

    if (!error) {
      showSuccessMessage(`Đã giao nhiệm vụ: "${title}" (+${xpReward} XP) 🎯`);
      setCustomTitle('');
      setShowAddForm(false);
      fetchTasks();
    }
    setLoading(false);
  };

  // Verify/Complete task and add XP to child profile
  const handleVerifyTask = async (task: Task) => {
    setLoading(true);
    const supabase = createClient();

    // 1. Mark task as completed
    const { error: taskErr } = await supabase
      .from('parent_tasks')
      .update({
        status: 'completed',
        verified_at: new Date().toISOString(),
      })
      .eq('id', task.id);

    if (taskErr) {
      setLoading(false);
      return;
    }

    // 2. Fetch current student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (profile) {
      const currentXp = profile.character_xp || 0;
      const newXp = currentXp + task.xp_reward;
      const newLevel = getLevelForXp(newXp);
      const newEvolution = getCharacterEvolutionStage(newXp);

      // 3. Update student profile with new XP details
      await supabase
        .from('student_profiles')
        .update({
          character_xp: newXp,
          character_level: newLevel,
          character_evolution_stage: newEvolution,
        })
        .eq('id', studentId);
      
      showSuccessMessage(`Xác nhận thành công! Con nhận được +${task.xp_reward} XP! 🎉`);
      fetchTasks();
      if (onXpUpdated) onXpUpdated();
    }
    setLoading(false);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-50">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm font-display flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-purple-600" />
            Nhiệm vụ ngoài đời thực
          </h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Giao việc cho Bé {studentName} và thưởng XP</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 rounded-xl font-display font-black text-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Giao nhiệm vụ
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-bold text-center animate-bounce">
          {actionSuccess}
        </div>
      )}

      {/* Task Creation Drawer/Dropdown Form */}
      {showAddForm && (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 animate-fade-in">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn mẫu hoặc tự nhập:</p>
          
          {/* Templates Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TASK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleAddTask(tmpl.title, tmpl.xp)}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-slate-100/50 border border-slate-150 rounded-xl text-left flex flex-col justify-between transition-all active:scale-[0.97] min-h-[75px]"
              >
                <span className="p-1 bg-slate-50 rounded-lg shrink-0 w-fit">{tmpl.icon}</span>
                <span className="font-bold text-[10px] text-slate-700 line-clamp-2 mt-1 leading-snug">{tmpl.title}</span>
                <span className="font-extrabold text-[9px] text-purple-600 mt-0.5">+{tmpl.xp} XP</span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-200/60 pt-3 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-slate-400">Nhiệm vụ tự soạn:</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: Giúp bà tưới cây cảnh..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-purple-300 rounded-xl outline-none text-xs font-bold text-slate-700"
              />
              <select
                value={customXp}
                onChange={(e) => setCustomXp(Number(e.target.value))}
                className="w-20 py-2 px-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-700"
              >
                <option value={30}>+30 XP</option>
                <option value={50}>+50 XP</option>
                <option value={80}>+80 XP</option>
                <option value={100}>+100 XP</option>
                <option value={150}>+150 XP</option>
              </select>
              <button
                onClick={() => handleAddTask(customTitle, customXp)}
                disabled={loading || !customTitle.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs"
              >
                Giao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-1 px-2 font-display font-black text-xs border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Đang chờ làm ({pendingTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-1 px-2 font-display font-black text-xs border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Đã hoàn thành ({completedTasks.length})
        </button>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-0.5">
        {activeTab === 'pending' ? (
          pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-amber-50/20 border border-amber-100/50 hover:bg-amber-50/40 rounded-2xl flex items-center justify-between transition-colors animate-fade-in gap-3"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 text-xs">{task.title}</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">
                    Giao ngày: {new Date(task.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-xs text-purple-600 shrink-0">+{task.xp_reward} XP</span>
                  <button
                    onClick={() => handleVerifyTask(task)}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-display font-black text-[10px] transition-all active:scale-95 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Xác nhận
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 font-bold">
              Không có nhiệm vụ nào đang chờ thực hiện.
            </div>
          )
        ) : (
          completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between opacity-80 gap-3"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-500 text-xs line-through">{task.title}</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">
                    Hoàn thành: {task.verified_at ? new Date(task.verified_at).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>+{task.xp_reward} XP</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 font-bold">
              Chưa có nhiệm vụ nào được hoàn thành.
            </div>
          )
        )}
      </div>
    </div>
  );
}
