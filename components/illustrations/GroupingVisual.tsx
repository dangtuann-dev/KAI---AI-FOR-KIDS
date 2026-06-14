'use client';

import React from 'react';

interface Data {
  type: 'grouping_visual';
  groups: number;
  itemsPerGroup: number;
  emoji: string;
  label: string;
}

export function GroupingVisual({ data }: { data: Data }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg text-center transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex flex-wrap gap-4 justify-center items-center py-4">
        {Array.from({ length: data.groups }).map((_, g) => (
          <div 
            key={g} 
            className="flex flex-wrap gap-1.5 p-3 border-4 border-dashed border-purple-300 rounded-2xl bg-purple-50/50 shadow-inner min-w-[64px] justify-center items-center"
          >
            {Array.from({ length: data.itemsPerGroup }).map((_, i) => (
              <span key={i} className="text-3xl filter drop-shadow-sm select-none">
                {data.emoji}
              </span>
            ))}
          </div>
        ))}
      </div>
      {data.label && (
        <p className="mt-4 text-sm font-black text-slate-600 font-display uppercase tracking-wide">
          {data.label}
        </p>
      )}
    </div>
  );
}
