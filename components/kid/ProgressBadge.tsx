'use client';

import React from 'react';
import { Flame, Award, Sparkles, Heart, Calculator, BookOpen } from 'lucide-react';

interface ProgressBadgeProps {
  streakDays: number;
  totalSessions?: number;
}

export default function ProgressBadge({ streakDays, totalSessions = 0 }: ProgressBadgeProps) {
  // Define badges based on criteria
  const badgesList = [
    { id: 'streak_3', name: 'Chăm Chỉ', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />, active: streakDays >= 3, desc: 'Học liên tiếp 3 ngày' },
    { id: 'sessions_1', name: 'Người Bạn Mới', icon: <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-300" />, active: totalSessions >= 1, desc: 'Có phiên học đầu tiên' },
    { id: 'sessions_5', name: 'Vua Toán Học', icon: <Calculator className="w-3.5 h-3.5 text-indigo-500" />, active: totalSessions >= 5, desc: 'Học 5 phiên học' },
    { id: 'genius', name: 'Học Giả', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-500" />, active: totalSessions >= 8, desc: 'Học nhiều môn học' }
  ];

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-2 border-purple-100 rounded-2xl shadow-sm w-full">
      {/* Streak Count */}
      <div className="flex items-center gap-1.5" title="Chuỗi học tập liên tiếp của bé">
        <div className="relative">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </div>
        <span className="text-sm font-extrabold text-amber-600 font-display">
          {streakDays} Ngày
        </span>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-1">
        <Award className="w-4 h-4 text-purple-400 mr-0.5" />
        <div className="flex gap-1.5">
          {badgesList.map((badge) => (
            <div
              key={badge.id}
              className={`relative flex items-center justify-center w-7 h-7 rounded-full border ${
                badge.active 
                  ? 'bg-purple-50 border-purple-200 cursor-help scale-100' 
                  : 'bg-slate-100 border-slate-200 grayscale opacity-40 cursor-not-allowed scale-90'
              } transition-all duration-300`}
              title={badge.active ? `${badge.name}: ${badge.desc}` : `Chưa đạt: ${badge.desc}`}
            >
              <span className="flex items-center justify-center shrink-0">
                {badge.icon}
              </span>
              {badge.active && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

