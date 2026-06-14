'use client';

import React from 'react';

interface Props {
  onContinue: () => void;
  onStop: () => void;
}

export function LessonCompleteActions({ onContinue, onStop }: Props) {
  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md border-2 border-purple-200 rounded-3xl p-8 text-center shadow-xl transform scale-100 transition-all duration-300 animate-fade-in flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl animate-bounce">🎉</span>
        <h3 className="font-display font-black text-slate-800 text-lg">
          Bé học rất tốt hôm nay!
        </h3>
        <p className="text-xs font-bold text-slate-500 max-w-[280px]">
          Bé đã hoàn thành xuất sắc tất cả các khái niệm của bài học này! Bé muốn làm gì tiếp theo nào?
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button 
          onClick={onContinue}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-display font-black text-sm tracking-wide shadow-lg hover:shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          🚀 Học tiếp bài mới
        </button>
        <button 
          onClick={onStop}
          className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 border-2 border-slate-100 hover:border-slate-200 text-slate-600 rounded-2xl font-display font-black text-sm tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          👋 Nghỉ ở đây, học tiếp lần sau
        </button>
      </div>
    </div>
  );
}
