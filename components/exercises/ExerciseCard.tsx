// components/exercises/ExerciseCard.tsx
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  emoji?: string;
  title?: string;
}

export function ExerciseCard({ children, emoji = '📝', title = 'Bài tập nhỏ' }: Props) {
  return (
    <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[28px] border-4 border-purple-400/80 shadow-2xl p-5 md:p-6 text-slate-800 animate-in fade-in zoom-in-95 duration-300 flex flex-col gap-4 relative overflow-hidden select-none">
      {/* Decorative top wave/colored bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400" />
      
      {/* Header bar */}
      <div className="flex items-center gap-2 mt-1 border-b border-slate-100 pb-3">
        <span className="text-2xl animate-bounce shrink-0">{emoji}</span>
        <span className="font-display font-black text-sm text-purple-600 tracking-wider uppercase">
          {title}
        </span>
      </div>

      {/* Main exercise content */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        {children}
      </div>
    </div>
  );
}
