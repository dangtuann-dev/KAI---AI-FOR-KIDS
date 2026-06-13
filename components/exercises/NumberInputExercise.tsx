// components/exercises/NumberInputExercise.tsx
'use client';

import React, { useState } from 'react';
import { NumberInputExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function NumberInputExercise({ data, onAnswer }: Props) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleDigit = (d: string) => {
    if (submitted || value.length >= 6) return;
    setValue((prev) => prev + d);
  };

  const handleClear = () => {
    if (submitted) return;
    setValue('');
  };

  const handleSubmit = () => {
    if (!value || submitted) return;
    const isCorrect = Number(value) === data.correctAnswer;
    setSubmitted(true);
    setTimeout(() => {
      onAnswer(Number(value), isCorrect);
    }, 500);
  };

  return (
    <ExerciseCard emoji="🔢" title="Thử tài điền số">
      <div className="flex flex-col gap-3">
        <p className="font-display font-black text-slate-800 text-lg leading-relaxed text-center">
          {data.question}
        </p>

        {data.visualHint && (
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-2.5 text-center text-base tracking-widest select-none animate-pulse">
            {data.visualHint}
          </div>
        )}

        <div className={`text-3xl font-display font-black text-center py-2.5 bg-slate-50 border-2 rounded-2xl min-h-[56px] flex items-center justify-center transition-all ${
          submitted
            ? Number(value) === data.correctAnswer
              ? 'bg-emerald-500 border-emerald-600 text-white'
              : 'bg-rose-500 border-rose-600 text-white'
            : 'border-purple-200 text-purple-600'
        }`}>
          {value || '?'}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              disabled={submitted}
              onClick={() => handleDigit(d)}
              className="h-12 md:h-14 font-display font-black text-lg text-slate-700 bg-white border border-slate-200 hover:border-purple-300 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {d}
            </button>
          ))}
          <button
            disabled={submitted || !value}
            onClick={handleClear}
            className="h-12 md:h-14 font-display font-black text-xs text-rose-600 bg-rose-50 border border-rose-100 hover:border-rose-300 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            Xóa
          </button>
          <button
            disabled={submitted}
            onClick={() => handleDigit('0')}
            className="h-12 md:h-14 font-display font-black text-lg text-slate-700 bg-white border border-slate-200 hover:border-purple-300 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            disabled={submitted || !value}
            onClick={handleSubmit}
            className="h-12 md:h-14 font-display font-black text-lg text-white bg-emerald-500 border border-emerald-600 hover:bg-emerald-600 rounded-xl transition-all shadow-md active:scale-95 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400"
          >
            ✓
          </button>
        </div>
      </div>
    </ExerciseCard>
  );
}
