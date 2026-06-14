'use client';

import React from 'react';

interface Data {
  type: 'multiplication_table';
  factor?: number; // e.g. 6
  label?: string;
}

export function MultiplicationTable({ data }: { data: Data }) {
  const factor = data.factor || 6;
  const rows = Array.from({ length: 10 }).map((_, i) => i + 1);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
      {data.label && (
        <h4 className="font-display font-black text-slate-800 text-sm mb-4 text-center uppercase tracking-wide">
          🔢 {data.label}
        </h4>
      )}

      <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
        {rows.map((r) => {
          const product = factor * r;
          return (
            <div 
              key={r} 
              className="flex justify-between items-center bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm hover:border-purple-200 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-display font-black text-slate-500 text-xs">
                <span className="text-purple-650">{factor}</span>
                <span>×</span>
                <span className="text-indigo-600">{r}</span>
              </div>
              <div className="font-display font-black text-slate-800 text-sm">
                = <span className="text-rose-500">{product}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
