'use client';

import React from 'react';

interface SentencePart {
  text: string;
  role: 'subject' | 'predicate' | 'object' | 'adverbial' | string;
  label: string;
}

interface Data {
  type: 'sentence_breakdown';
  sentence: string;
  parts: SentencePart[];
  label?: string;
}

const ROLE_COLORS: Record<string, { bg: string, border: string, text: string, roleLabel: string }> = {
  subject: {
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-700',
    roleLabel: 'Chủ ngữ'
  },
  predicate: {
    bg: 'bg-blue-50/70',
    border: 'border-blue-200',
    text: 'text-blue-700',
    roleLabel: 'Vị ngữ'
  },
  object: {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    roleLabel: 'Tân ngữ'
  },
  adverbial: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-amber-700',
    roleLabel: 'Trạng ngữ'
  }
};

export function SentenceBreakdown({ data }: { data: Data }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
      {/* Full Sentence Rendered Nicely */}
      <div className="text-center mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 select-none">
          Câu mẫu
        </span>
        <p className="text-lg font-black text-slate-800 font-display px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl inline-block shadow-inner">
          "{data.sentence}"
        </p>
      </div>

      {/* Breakdown parts */}
      <div className="flex flex-col gap-4">
        {data.parts.map((part, idx) => {
          const colorConfig = ROLE_COLORS[part.role] || {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            text: 'text-slate-700',
            roleLabel: part.role
          };

          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3 p-4 border-2 rounded-2xl transition-all duration-300 ${colorConfig.bg} ${colorConfig.border}`}
            >
              {/* Role Tag */}
              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide shrink-0 border ${colorConfig.text} border-current bg-white shadow-sm`}>
                {colorConfig.roleLabel}
              </span>

              {/* Text & Label */}
              <div className="flex-1 flex flex-col text-left">
                <span className="text-sm font-black text-slate-800 font-display">
                  {part.text}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5 leading-relaxed">
                  {part.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {data.label && (
        <p className="mt-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider select-none">
          {data.label}
        </p>
      )}
    </div>
  );
}
