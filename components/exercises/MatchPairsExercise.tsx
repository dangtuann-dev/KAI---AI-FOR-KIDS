// components/exercises/MatchPairsExercise.tsx
'use client';

import React, { useState } from 'react';
import { MatchPairsExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function MatchPairsExercise({ data, onAnswer }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({}); // leftIdx -> rightIdx
  const [submitted, setSubmitted] = useState(false);
  const [shuffledRight] = useState(() => 
    data.pairs
      .map((p, idx) => ({ right: p.right, originalIdx: idx }))
      .sort(() => Math.random() - 0.5)
  );

  const handleLeftTap = (idx: number) => {
    if (submitted) return;
    // If it's already matched, allow unmatching by tapping it again
    if (matched[idx] !== undefined) {
      const newMatched = { ...matched };
      delete newMatched[idx];
      setMatched(newMatched);
      setSelectedLeft(null);
    } else {
      setSelectedLeft(idx);
    }
  };

  const handleRightTap = (originalIdx: number) => {
    if (submitted || selectedLeft === null) return;

    // Check if this right item is already matched
    const alreadyMatchedLeftIdx = Object.entries(matched).find(
      ([_, r]) => r === originalIdx
    )?.[0];

    const newMatched = { ...matched };
    if (alreadyMatchedLeftIdx !== undefined) {
      delete newMatched[Number(alreadyMatchedLeftIdx)];
    }

    newMatched[selectedLeft] = originalIdx;
    setMatched(newMatched);
    setSelectedLeft(null);

    // If all pairs are matched, evaluate immediately or wait for submit?
    // Let's let them complete it and tap the check button.
  };

  const handleSubmit = () => {
    if (Object.keys(matched).length !== data.pairs.length || submitted) return;

    const allCorrect = Object.entries(matched).every(
      ([l, r]) => Number(l) === r
    );

    setSubmitted(true);
    setTimeout(() => {
      onAnswer(matched, allCorrect);
    }, 500);
  };

  return (
    <ExerciseCard emoji="🔗" title="Nối cặp hình và chữ">
      <div className="flex flex-col gap-3">
        <p className="font-display font-black text-slate-800 text-sm leading-relaxed text-center">
          {data.instruction}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Left Column (Words) */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase pl-1 select-none">Cột bên trái</p>
            {data.pairs.map((pair, idx) => {
              const isSelected = selectedLeft === idx;
              const isMatched = matched[idx] !== undefined;
              const rightIdx = matched[idx];
              
              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => handleLeftTap(idx)}
                  className={`w-full min-h-[48px] px-3 py-2 border-2 rounded-2xl font-display font-extrabold text-xs transition-all transform active:scale-[0.97] text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600 border-purple-700 text-white scale-102'
                      : isMatched
                      ? submitted
                        ? idx === rightIdx
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-purple-50 border-purple-300 text-purple-700'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="truncate">{pair.left}</span>
                  {isMatched && (
                    <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-md font-bold">
                      {submitted ? (idx === rightIdx ? '✓' : '✗') : `Đã nối`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column (Values/Emojis) */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase pl-1 select-none">Cột bên phải</p>
            {shuffledRight.map((item, idx) => {
              const matchedLeftIdx = Object.entries(matched).find(
                ([_, r]) => r === item.originalIdx
              )?.[0];
              const isMatched = matchedLeftIdx !== undefined;

              return (
                <button
                  key={idx}
                  disabled={submitted || selectedLeft === null}
                  onClick={() => handleRightTap(item.originalIdx)}
                  className={`w-full min-h-[48px] px-3 py-2 border-2 rounded-2xl font-display font-extrabold text-xs transition-all transform active:scale-[0.97] text-left flex items-center justify-between ${
                    isMatched
                      ? submitted
                        ? Number(matchedLeftIdx) === item.originalIdx
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-purple-50 border-purple-300 text-purple-700'
                      : selectedLeft !== null
                      ? 'bg-white hover:bg-slate-50 border-purple-100 hover:border-purple-300 text-slate-700'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="truncate">{item.right}</span>
                  {isMatched && (
                    <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md font-bold truncate max-w-[50px]">
                      {data.pairs[Number(matchedLeftIdx)].left}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        <button
          disabled={Object.keys(matched).length !== data.pairs.length || submitted}
          onClick={handleSubmit}
          className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-display font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
        >
          ✓ Kiểm tra liên kết
        </button>
      </div>
    </ExerciseCard>
  );
}
