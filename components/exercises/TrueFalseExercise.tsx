// components/exercises/TrueFalseExercise.tsx
'use client';

import React, { useState } from 'react';
import { TrueFalseExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function TrueFalseExercise({ data, onAnswer }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (val: boolean) => {
    if (selected !== null) return;
    setSelected(val);
    const isCorrect = val === data.correctAnswer;
    setTimeout(() => {
      onAnswer(val, isCorrect);
    }, 500);
  };

  return (
    <ExerciseCard emoji="🤔" title="Đúng hay sai nhỉ?">
      <div className="flex flex-col gap-4">
        <p className="font-display font-black text-slate-800 text-base leading-relaxed text-center">
          {data.statement}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* True Button */}
          <button
            disabled={selected !== null}
            onClick={() => handleSelect(true)}
            className={`h-24 rounded-3xl border-3 flex flex-col items-center justify-center font-display font-black text-lg transition-all transform active:scale-95 shadow-md ${
              selected === true
                ? data.correctAnswer === true
                  ? 'bg-emerald-500 border-emerald-600 text-white scale-98 shadow-none'
                  : 'bg-rose-500 border-rose-600 text-white scale-98 shadow-none'
                : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="text-3xl mb-1">✅</span>
            <span>ĐÚNG</span>
          </button>

          {/* False Button */}
          <button
            disabled={selected !== null}
            onClick={() => handleSelect(false)}
            className={`h-24 rounded-3xl border-3 flex flex-col items-center justify-center font-display font-black text-lg transition-all transform active:scale-95 shadow-md ${
              selected === false
                ? data.correctAnswer === false
                  ? 'bg-emerald-500 border-emerald-600 text-white scale-98 shadow-none'
                  : 'bg-rose-500 border-rose-600 text-white scale-98 shadow-none'
                : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700'
            }`}
          >
            <span className="text-3xl mb-1">❌</span>
            <span>SAI</span>
          </button>
        </div>
      </div>
    </ExerciseCard>
  );
}
