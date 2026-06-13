// components/exercises/ExerciseFeedback.tsx
'use client';

import React, { useEffect } from 'react';

interface Props {
  isCorrect: boolean;
  onCharacterState: (state: 'happy' | 'encourage') => void;
  onDone: () => void;
}

export function ExerciseFeedback({ isCorrect, onCharacterState, onDone }: Props) {
  useEffect(() => {
    onCharacterState(isCorrect ? 'happy' : 'encourage');
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [isCorrect, onCharacterState, onDone]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md rounded-[28px] animate-in fade-in duration-200">
      <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 shadow-2xl max-w-[85%] text-center transform scale-100 transition-all duration-300 animate-in zoom-in-95 ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
          : 'bg-amber-50 border-amber-400 text-amber-800'
      }`}>
        <span className={`text-6xl mb-4 ${isCorrect ? 'animate-bounce' : 'animate-pulse'}`}>
          {isCorrect ? '🌟' : '💪'}
        </span>
        <h2 className="font-display font-black text-2xl tracking-wide mb-2">
          {isCorrect ? 'Tuyệt Cú Mèo!' : 'Cố Lên Nào!'}
        </h2>
        <p className="font-display font-bold text-sm leading-relaxed">
          {isCorrect ? 'Đúng rồi! Bé xuất sắc quá! 🎉' : 'Gần đúng rồi! Mình thử lại bài này nhé! 😊'}
        </p>
      </div>
    </div>
  );
}
