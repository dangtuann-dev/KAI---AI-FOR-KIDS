// components/exercises/SequencingExercise.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SequencingExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function SequencingExercise({ data, onAnswer }: Props) {
  // Store items with their original index to track correctness
  const [shuffled, setShuffled] = useState<{ text: string; originalIdx: number }[]>([]);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Shuffle items on mount
  useEffect(() => {
    const list = data.items.map((text, originalIdx) => ({ text, originalIdx }));
    // Simple deterministic shuffle on start
    setShuffled([...list].sort(() => Math.random() - 0.5));
  }, [data]);

  const handleSelect = (originalIdx: number) => {
    if (submitted) return;
    if (selectedIdxs.includes(originalIdx)) return;
    setSelectedIdxs((prev) => [...prev, originalIdx]);
  };

  const handleDeselect = (originalIdx: number) => {
    if (submitted) return;
    setSelectedIdxs((prev) => prev.filter((idx) => idx !== originalIdx));
  };

  const handleSubmit = () => {
    if (selectedIdxs.length !== data.items.length || submitted) return;

    // Check if selected matches correctOrder
    const isCorrect = selectedIdxs.every((val, idx) => val === data.correctOrder[idx]);

    setSubmitted(true);
    setTimeout(() => {
      onAnswer(selectedIdxs, isCorrect);
    }, 500);
  };

  const remaining = shuffled.filter((item) => !selectedIdxs.includes(item.originalIdx));

  return (
    <ExerciseCard emoji="🧩" title="Sắp xếp thứ tự">
      <div className="flex flex-col gap-3">
        <p className="font-display font-black text-slate-800 text-sm leading-relaxed text-center">
          {data.instruction}
        </p>

        {/* Shuffled Bank */}
        <div className="flex flex-col gap-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl min-h-[80px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase pl-1 select-none">Các bước xáo trộn</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {remaining.map((item) => (
              <button
                key={item.originalIdx}
                disabled={submitted}
                onClick={() => handleSelect(item.originalIdx)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
              >
                {item.text}
              </button>
            ))}
            {remaining.length === 0 && (
              <span className="text-[10px] text-slate-400 font-bold select-none py-1">Đã chọn hết các bước!</span>
            )}
          </div>
        </div>

        {/* Selected Sequence */}
        <div className="flex flex-col gap-2 p-2.5 bg-purple-50/50 border border-purple-100/50 rounded-2xl min-h-[120px]">
          <p className="text-[10px] font-bold text-purple-400 uppercase pl-1 select-none">Thứ tự của bé</p>
          <div className="flex flex-col gap-2">
            {selectedIdxs.map((originalIdx, stepIdx) => {
              const item = shuffled.find((s) => s.originalIdx === originalIdx);
              if (!item) return null;
              
              return (
                <div
                  key={originalIdx}
                  onClick={() => handleDeselect(originalIdx)}
                  className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-xl text-xs font-bold shadow-sm cursor-pointer select-none transition-all hover:border-rose-300 group ${
                    submitted
                      ? originalIdx === data.correctOrder[stepIdx]
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                        : 'border-rose-500 bg-rose-50/50 text-rose-800'
                      : 'border-purple-200 text-slate-700'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-purple-600 text-white rounded-full text-[10px] font-black shrink-0">
                    {stepIdx + 1}
                  </span>
                  <span className="flex-1">{item.text}</span>
                  {!submitted && (
                    <span className="text-[10px] text-slate-300 group-hover:text-rose-500 transition-colors">
                      Xóa
                    </span>
                  )}
                </div>
              );
            })}
            {selectedIdxs.length === 0 && (
              <div className="text-center text-xs text-slate-400 font-semibold py-6 select-none">
                Chạm vào các bước ở trên để sắp xếp
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          disabled={selectedIdxs.length !== data.items.length || submitted}
          onClick={handleSubmit}
          className="w-full py-2.5 mt-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-display font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
        >
          ✓ Kiểm tra kết quả
        </button>
      </div>
    </ExerciseCard>
  );
}
