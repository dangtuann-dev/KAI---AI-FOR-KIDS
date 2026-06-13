// components/exercises/MultipleChoiceExercise.tsx
'use client';

import React, { useState } from 'react';
import { MultipleChoiceExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function MultipleChoiceExercise({ data, onAnswer }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleOptionSelect = (idx: number) => {
    if (selectedIdx !== null) return; // Prevent double taps
    setSelectedIdx(idx);
    const isCorrect = idx === data.correctIndex;
    // Delay slightly so child can see their selection
    setTimeout(() => {
      onAnswer(idx, isCorrect);
    }, 500);
  };

  const optionColors = [
    'hover:border-blue-400 bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
    'hover:border-emerald-400 bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100',
    'hover:border-pink-400 bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100',
    'hover:border-amber-400 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
  ];

  return (
    <ExerciseCard emoji={data.emoji || '❓'} title="Câu hỏi chọn đáp án">
      <div className="flex flex-col gap-4">
        <p className="font-display font-black text-slate-800 text-base leading-relaxed text-center">
          {data.question}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {data.options.map((option, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                disabled={selectedIdx !== null}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full min-h-[64px] p-3 rounded-2xl border-2 font-display font-extrabold text-sm transition-all duration-200 text-center flex items-center justify-center transform active:scale-95 shadow-sm ${
                  isSelected
                    ? idx === data.correctIndex
                      ? 'bg-emerald-500 border-emerald-600 text-white scale-98 shadow-none'
                      : 'bg-rose-500 border-rose-600 text-white scale-98 shadow-none'
                    : optionColors[idx % 4]
                } disabled:opacity-90`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </ExerciseCard>
  );
}
