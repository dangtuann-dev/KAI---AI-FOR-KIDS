// components/exercises/CategorizeExercise.tsx
'use client';

import React, { useState } from 'react';
import { CategorizeExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function CategorizeExercise({ data, onAnswer }: Props) {
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  // Maps item index to category index (0 or 1)
  const [placements, setPlacements] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleItemTap = (idx: number) => {
    if (submitted) return;
    
    // If it's already placed, tap it to remove from category and put back in pool
    if (placements[idx] !== undefined) {
      const newPlacements = { ...placements };
      delete newPlacements[idx];
      setPlacements(newPlacements);
      setSelectedItemIdx(null);
    } else {
      // Otherwise, select it to place
      setSelectedItemIdx(idx);
    }
  };

  const handleCategoryTap = (catIdx: number) => {
    if (submitted || selectedItemIdx === null) return;

    setPlacements((prev) => ({
      ...prev,
      [selectedItemIdx]: catIdx,
    }));
    setSelectedItemIdx(null);
  };

  const handleSubmit = () => {
    if (Object.keys(placements).length !== data.items.length || submitted) return;

    // Check if every item is in the correct category
    const isCorrect = data.items.every((item, idx) => placements[idx] === item.categoryIndex);

    setSubmitted(true);
    setTimeout(() => {
      onAnswer(placements, isCorrect);
    }, 500);
  };

  // Unplaced items pool
  const unplacedItems = data.items
    .map((item, idx) => ({ ...item, originalIdx: idx }))
    .filter((item) => placements[item.originalIdx] === undefined);

  return (
    <ExerciseCard emoji="📁" title="Phân loại nhóm">
      <div className="flex flex-col gap-3">
        <p className="font-display font-black text-slate-800 text-sm leading-relaxed text-center">
          {data.instruction}
        </p>

        {/* Item Pool */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl min-h-[70px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase pl-1 select-none mb-1.5">
            Vật phẩm cần xếp nhóm
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {unplacedItems.map((item) => {
              const isSelected = selectedItemIdx === item.originalIdx;
              return (
                <button
                  key={item.originalIdx}
                  disabled={submitted}
                  onClick={() => handleItemTap(item.originalIdx)}
                  className={`px-3 py-1.5 border-2 rounded-xl text-xs font-bold transition-all transform active:scale-95 shadow-sm flex items-center gap-1 ${
                    isSelected
                      ? 'bg-purple-600 border-purple-700 text-white scale-102'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {item.emoji && <span>{item.emoji}</span>}
                  <span>{item.label}</span>
                </button>
              );
            })}
            {unplacedItems.length === 0 && (
              <span className="text-[10px] text-slate-400 font-bold select-none py-1">
                Đã xếp hết các vật phẩm!
              </span>
            )}
          </div>
        </div>

        {/* Categories Grid (2 Columns) */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          {data.categories.map((catName, catIdx) => {
            const hasSelection = selectedItemIdx !== null;
            // Get items placed in this category
            const itemsInCat = data.items
              .map((item, idx) => ({ ...item, originalIdx: idx }))
              .filter((item) => placements[item.originalIdx] === catIdx);

            return (
              <div
                key={catIdx}
                onClick={() => handleCategoryTap(catIdx)}
                className={`p-3 border-2 rounded-2xl min-h-[140px] flex flex-col transition-all cursor-pointer ${
                  hasSelection
                    ? 'border-dashed border-purple-400 bg-purple-50/35 hover:bg-purple-50/70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <h4 className="font-display font-black text-xs text-purple-600 text-center mb-2 border-b border-slate-100 pb-1 select-none">
                  Nhóm: {catName}
                </h4>

                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-24 custom-scrollbar">
                  {itemsInCat.map((item) => (
                    <div
                      key={item.originalIdx}
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid triggering category click
                        handleItemTap(item.originalIdx);
                      }}
                      className={`px-2 py-1 border rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-all ${
                        submitted
                          ? item.categoryIndex === catIdx
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-slate-50 border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      {item.emoji && <span className="text-xs">{item.emoji}</span>}
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                  {itemsInCat.length === 0 && (
                    <div className="text-center text-[10px] text-slate-350 font-semibold py-8 select-none">
                      {hasSelection ? 'Chạm để thả vào đây' : 'Trống'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          disabled={Object.keys(placements).length !== data.items.length || submitted}
          onClick={handleSubmit}
          className="w-full py-2.5 mt-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-display font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
        >
          ✓ Phân loại xong
        </button>
      </div>
    </ExerciseCard>
  );
}
