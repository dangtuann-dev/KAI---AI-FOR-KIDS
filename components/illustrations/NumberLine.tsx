'use client';

import React from 'react';

interface Data {
  type: 'number_line';
  min: number;
  max: number;
  highlight: number[];
  label?: string;
}

export function NumberLine({ data }: { data: Data }) {
  const { min = 0, max = 10, highlight = [] } = data;
  const range = max - min;
  
  // Generate tick points
  const ticks = [];
  // For small ranges, show all integers. For larger ones, step.
  const step = range <= 15 ? 1 : Math.ceil(range / 10);
  for (let val = min; val <= max; val += step) {
    ticks.push(val);
  }
  // Ensure max is in the ticks if not already
  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max);
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg text-center transform hover:scale-[1.02] transition-transform duration-300">
      <div className="relative py-8 px-4 flex flex-col justify-center items-center">
        {/* Horizontal Line */}
        <div className="absolute left-6 right-6 h-1 bg-purple-400 rounded-full" />

        {/* Ticks & Values */}
        <div className="relative w-full flex justify-between items-center h-8">
          {ticks.map((tickVal) => {
            const percentage = ((tickVal - min) / range) * 100;
            const isHighlighted = highlight.includes(tickVal);

            return (
              <div 
                key={tickVal}
                className="absolute flex flex-col items-center justify-center"
                style={{ left: `calc(${percentage}% * 0.88 + 6%)`, transform: 'translateX(-50%)' }}
              >
                {/* Tick mark */}
                <div className={`w-1 h-3 rounded-full ${isHighlighted ? 'bg-rose-500 h-4 w-1.5' : 'bg-purple-400'}`} />
                {/* Tick Label */}
                <span className={`text-[10px] mt-1 font-display font-black ${isHighlighted ? 'text-rose-600 text-xs' : 'text-slate-400'}`}>
                  {tickVal}
                </span>

                {/* Highlight Circle Above Line */}
                {isHighlighted && (
                  <div className="absolute -top-7 flex flex-col items-center animate-bounce">
                    <span className="text-rose-500 text-lg">📍</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {data.label && (
        <p className="mt-4 text-xs font-black text-slate-500 font-display uppercase tracking-wide">
          {data.label}
        </p>
      )}
    </div>
  );
}
