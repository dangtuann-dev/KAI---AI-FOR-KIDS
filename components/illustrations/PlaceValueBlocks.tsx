'use client';

import React from 'react';

interface Data {
  type: 'place_value_blocks';
  value: number;
  label?: string;
}

export function PlaceValueBlocks({ data }: { data: Data }) {
  const numStr = String(data.value).padStart(3, '0');
  const hundreds = parseInt(numStr[numStr.length - 3] || '0', 10);
  const tens = parseInt(numStr[numStr.length - 2] || '0', 10);
  const ones = parseInt(numStr[numStr.length - 1] || '0', 10);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg text-center transform hover:scale-[1.02] transition-transform duration-300">
      <div className="grid grid-cols-3 gap-4 py-4 min-h-[180px]">
        {/* Hàng Trăm */}
        <div className="flex flex-col items-center justify-end bg-rose-50/50 rounded-2xl p-3 border-2 border-rose-100 shadow-inner">
          <div className="flex flex-col gap-1 w-full items-center justify-end flex-1 mb-3">
            {hundreds > 0 ? (
              Array.from({ length: hundreds }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-12 h-8 bg-rose-500 border-2 border-rose-600 rounded-md shadow flex items-center justify-center text-[10px] font-black text-white select-none animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  100
                </div>
              ))
            ) : (
              <span className="text-slate-300 text-xs italic">Trống</span>
            )}
          </div>
          <span className="text-xs font-black text-rose-600 font-display">Hàng Trăm</span>
          <span className="text-lg font-black text-rose-700">{hundreds}</span>
        </div>

        {/* Hàng Chục */}
        <div className="flex flex-col items-center justify-end bg-blue-50/50 rounded-2xl p-3 border-2 border-blue-100 shadow-inner">
          <div className="flex flex-col gap-1 w-full items-center justify-end flex-1 mb-3">
            {tens > 0 ? (
              Array.from({ length: tens }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 bg-blue-500 border-2 border-blue-600 rounded-md shadow flex items-center justify-center text-[10px] font-black text-white select-none animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  10
                </div>
              ))
            ) : (
              <span className="text-slate-300 text-xs italic">Trống</span>
            )}
          </div>
          <span className="text-xs font-black text-blue-600 font-display">Hàng Chục</span>
          <span className="text-lg font-black text-blue-700">{tens}</span>
        </div>

        {/* Hàng Đơn vị */}
        <div className="flex flex-col items-center justify-end bg-amber-50/50 rounded-2xl p-3 border-2 border-amber-100 shadow-inner">
          <div className="flex flex-col gap-1 w-full items-center justify-end flex-1 mb-3">
            {ones > 0 ? (
              Array.from({ length: ones }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-5 h-5 bg-amber-450 border-2 border-amber-500 rounded shadow flex items-center justify-center text-[8px] font-black text-white select-none animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  1
                </div>
              ))
            ) : (
              <span className="text-slate-300 text-xs italic">Trống</span>
            )}
          </div>
          <span className="text-xs font-black text-amber-600 font-display">Hàng Đơn vị</span>
          <span className="text-lg font-black text-amber-700">{ones}</span>
        </div>
      </div>

      {data.label && (
        <p className="mt-4 text-sm font-black text-slate-600 font-display uppercase tracking-wide">
          {data.label} (Số: <span className="text-purple-650 text-base">{data.value}</span>)
        </p>
      )}
    </div>
  );
}
