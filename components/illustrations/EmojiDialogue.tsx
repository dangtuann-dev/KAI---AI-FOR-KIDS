'use client';

import React from 'react';

interface DialogueLine {
  speaker: 'kai' | 'student';
  text_en: string;
  text_vi: string;
}

interface Data {
  type: 'emoji_dialogue';
  lines: DialogueLine[];
  label?: string;
}

export function EmojiDialogue({ data }: { data: Data }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex flex-col gap-4 py-2">
        {data.lines.map((line, idx) => {
          const isKai = line.speaker === 'kai';
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3 w-full ${isKai ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* Avatar Bubble */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-slate-50 border-2 border-purple-100 shadow-sm shrink-0">
                {isKai ? '🐻' : '🧑'}
              </div>

              {/* Chat Bubble */}
              <div 
                className={`max-w-[75%] rounded-2xl p-4 shadow-sm border-2 ${
                  isKai 
                    ? 'bg-purple-50/50 border-purple-100/50 rounded-tl-none text-left' 
                    : 'bg-indigo-50/50 border-indigo-100/50 rounded-tr-none text-right'
                }`}
              >
                {/* English Text */}
                <p className="text-sm font-black text-slate-800 font-display leading-snug">
                  {line.text_en}
                </p>
                {/* Vietnamese translation */}
                <p className="text-[10px] font-bold text-slate-400 mt-1 italic leading-relaxed">
                  {line.text_vi}
                </p>
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
