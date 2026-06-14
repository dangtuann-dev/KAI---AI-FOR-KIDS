'use client';

import React from 'react';

interface Data {
  type: 'number_comparison';
  valueA: number;
  valueB: number;
  labelA?: string;
  labelB?: string;
  label?: string;
}

export function NumberComparison({ data }: { data: Data }) {
  const maxVal = Math.max(data.valueA, data.valueB, 1);
  const percentA = Math.max((data.valueA / maxVal) * 100, 5);
  const percentB = Math.max((data.valueB / maxVal) * 100, 5);

  let sign = '=';
  let colorSign = 'text-slate-500';
  if (data.valueA > data.valueB) {
    sign = '>';
    colorSign = 'text-emerald-500';
  } else if (data.valueA < data.valueB) {
    sign = '<';
    colorSign = 'text-rose-500';
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg text-center transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex flex-col gap-6 py-4">
        {/* Value A */}
        <div className="flex flex-col items-start gap-1 w-full">
          <div className="flex justify-between w-full font-display font-black text-xs text-slate-500">
            <span>{data.labelA || 'Số thứ nhất'}</span>
            <span className="text-purple-600 text-sm font-extrabold">{data.valueA}</span>
          </div>
          <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${percentA}%` }}
            />
          </div>
        </div>

        {/* Comparison Sign in Middle */}
        <div className="flex justify-center items-center">
          <div className={`text-4xl font-black ${colorSign} bg-slate-50 border border-slate-100 shadow-inner rounded-full w-14 h-14 flex items-center justify-center font-display`}>
            {sign}
          </div>
        </div>

        {/* Value B */}
        <div className="flex flex-col items-start gap-1 w-full">
          <div className="flex justify-between w-full font-display font-black text-xs text-slate-500">
            <span>{data.labelB || 'Số thứ hai'}</span>
            <span className="text-purple-600 text-sm font-extrabold">{data.valueB}</span>
          </div>
          <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${percentB}%` }}
            />
          </div>
        </div>
      </div>

      {data.label && (
        <p className="mt-4 text-xs font-black text-slate-400 font-display uppercase tracking-wide">
          {data.label}
        </p>
      )}
    </div>
  );
}
