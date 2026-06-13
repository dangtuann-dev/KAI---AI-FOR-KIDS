'use client';

import React from 'react';
import { Calendar, Clock, Flame, BookOpen, BarChart3 } from 'lucide-react';

interface LearningReportProps {
  studentName: string;
  grade: number;
  stats: {
    todaySessions: number;
    totalMinutes: number;
    streakDays: number;
    topSubject: string;
  };
  weeklyHistory: { day: string; minutes: number }[];
  reportData?: {
    strengths: Array<{ topic: string; accuracy: number; total: number }>;
    needsImprovement: Array<{ topic: string; accuracy: number; total: number }>;
  };
}

export default function LearningReport({
  studentName,
  grade,
  stats,
  weeklyHistory,
  reportData,
}: LearningReportProps) {
  // Translate subject IDs
  const getSubjectLabel = (sub: string) => {
    const map: Record<string, string> = {
      math: 'Toán',
      vietnamese: 'Tiếng Việt',
      science: 'Khoa học',
      english: 'Tiếng Anh',
      ethics: 'Đạo đức',
      history: 'Lịch sử',
    };
    return map[sub.toLowerCase()] || sub || 'Tổng hợp';
  };

  // Find max minutes for chart scaling
  const maxMinutes = Math.max(...weeklyHistory.map((h) => h.minutes), 10);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Child Header Card */}
      <div className="p-5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl text-white shadow-lg">
        <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
          HỒ SƠ HỌC TẬP CỦA CON
        </div>
        <h2 className="text-2xl font-extrabold font-display">{studentName}</h2>
        <p className="text-sm opacity-90 font-medium">Học sinh Lớp {grade} • Đang kết nối tài khoản</p>
      </div>

      {/* Responsive Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-4">
        {/* Today Sessions */}
        <div className="p-4 bg-white border border-purple-100 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Hôm nay</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-800 font-display">
            {stats.todaySessions} Buổi
          </span>
          <span className="text-xs text-slate-400 mt-1">Học với KAI trong ngày</span>
        </div>

        {/* Total Duration */}
        <div className="p-4 bg-white border border-purple-100 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Clock className="w-5 h-5 text-pink-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Thời gian</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-800 font-display">
            {stats.totalMinutes} Phút
          </span>
          <span className="text-xs text-slate-400 mt-1">Tổng thời lượng học</span>
        </div>

        {/* Streak */}
        <div className="p-4 bg-white border border-purple-100 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-100" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Streak</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-800 font-display">
            {stats.streakDays} Ngày
          </span>
          <span className="text-xs text-slate-400 mt-1">Học tập liên tục</span>
        </div>

        {/* Favorite Subject */}
        <div className="p-4 bg-white border border-purple-100 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Môn nhiều nhất</span>
          </div>
          <span className="text-2xl font-extrabold text-slate-800 font-display truncate">
            {getSubjectLabel(stats.topSubject)}
          </span>
          <span className="text-xs text-slate-400 mt-1">Tập trung ôn luyện</span>
        </div>
      </div>

      {/* 7-Day History Chart (Pure CSS) */}
      <div className="p-5 bg-white border border-purple-100 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="font-extrabold text-slate-800 text-base font-display">
            Lịch sử học tập 7 ngày qua
          </h3>
        </div>

        {/* CSS Chart Bar Container */}
        <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-slate-100">
          {weeklyHistory.map((item, index) => {
            const pct = (item.minutes / maxMinutes) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1 group relative">
                {/* Tooltip bubble on hover */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap shadow-sm pointer-events-none z-10">
                  {item.minutes} phút
                </div>

                {/* Animated Bar */}
                <div
                  className="w-7 rounded-t-lg bg-gradient-to-t from-purple-500 to-indigo-500 transition-all duration-500 hover:from-pink-500 hover:to-purple-500"
                  style={{ height: `${pct || 4}%` }} // Minimum height to show the bar
                ></div>

                {/* Label (Day name) */}
                <span className="text-[10px] font-bold text-slate-400 mt-2">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses (Topic Analysis) */}
      {reportData && (reportData.strengths.length > 0 || reportData.needsImprovement.length > 0) && (
        <div className="flex flex-col gap-4">
          {/* Strengths Card */}
          {reportData.strengths.length > 0 && (
            <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="text-xl">🌟</span>
                <h3 className="font-extrabold text-xs font-display uppercase tracking-wider">
                  Điểm mạnh của con (Đúng &ge; 75%)
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {reportData.strengths.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-emerald-100/50 rounded-xl text-xs font-semibold text-slate-700">
                    <span className="truncate pr-4 flex-1">{item.topic}</span>
                    <span className="bg-emerald-100 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] shrink-0">
                      {item.accuracy}% đúng
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Needs Improvement Card */}
          {reportData.needsImprovement.length > 0 && (
            <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-3xl shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="text-xl">💪</span>
                <h3 className="font-extrabold text-xs font-display uppercase tracking-wider">
                  Chủ đề cần cố gắng thêm (Đúng &lt; 75%)
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {reportData.needsImprovement.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-amber-100/50 rounded-xl text-xs font-semibold text-slate-700">
                    <span className="truncate pr-4 flex-1">{item.topic}</span>
                    <span className="bg-amber-100 text-amber-750 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] shrink-0">
                      {item.accuracy}% đúng
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
