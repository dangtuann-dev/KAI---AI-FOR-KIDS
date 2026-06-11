'use client';

import React from 'react';
import { Users, UserCheck, MessageSquare, Mic } from 'lucide-react';

interface StatsCardProps {
  stats: {
    totalStudents: number;
    totalParents: number;
    todaySessions: number;
    voiceRate: number;
  };
}

export default function StatsCard({ stats }: StatsCardProps) {
  const cards = [
    {
      title: 'Học sinh',
      value: stats.totalStudents,
      subtitle: 'Đang hoạt động trên KAI',
      icon: <Users className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50 border-purple-100',
    },
    {
      title: 'Phụ huynh',
      value: stats.totalParents,
      subtitle: 'Tài khoản giám sát',
      icon: <UserCheck className="w-6 h-6 text-pink-500" />,
      bg: 'bg-pink-50 border-pink-100',
    },
    {
      title: 'Phiên hôm nay',
      value: stats.todaySessions,
      subtitle: 'Số buổi học trong ngày',
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Voice Rate',
      value: `${stats.voiceRate}%`,
      subtitle: 'Tỷ lệ nói tiếng Việt',
      icon: <Mic className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl border bg-white flex flex-col shadow-sm ${c.bg}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {c.title}
            </span>
            <div className="p-1.5 bg-white rounded-lg shadow-sm">{c.icon}</div>
          </div>
          <span className="text-2xl font-extrabold text-slate-800 font-display">
            {c.value}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">
            {c.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
