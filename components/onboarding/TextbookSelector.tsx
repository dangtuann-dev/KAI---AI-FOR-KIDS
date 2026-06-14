'use client';

import React from 'react';

const TEXTBOOK_OPTIONS = [
  { id: 'ket_noi_tri_thuc', label: 'Kết nối tri thức', emoji: '📘', color: 'border-[#4A90D9] text-[#4A90D9] hover:bg-[#4A90D9]/10' },
  { id: 'chan_troi_sang_tao', label: 'Chân trời sáng tạo', emoji: '📗', color: 'border-[#06D6A0] text-[#06D6A0] hover:bg-[#06D6A0]/10' },
  { id: 'canh_dieu', label: 'Cánh Diều', emoji: '📙', color: 'border-[#FF9F43] text-[#FF9F43] hover:bg-[#FF9F43]/10' },
  { id: 'unknown', label: 'Bé không biết, để ba mẹ chọn sau', emoji: '🤔', color: 'border-[#9CA3AF] text-[#9CA3AF] hover:bg-[#9CA3AF]/10' },
] as const;

interface TextbookSelectorProps {
  onSelect: (id: 'ket_noi_tri_thuc' | 'chan_troi_sang_tao' | 'canh_dieu' | 'unknown') => void;
}

export function TextbookSelector({ onSelect }: TextbookSelectorProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 border-2 border-purple-100 shadow-xl text-center">
      <p className="text-lg font-black text-slate-800 mb-6 font-display">
        Ở lớp, cô giáo dạy bé theo sách nào? 📚
      </p>
      <div className="grid grid-cols-2 gap-4">
        {TEXTBOOK_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 bg-white transition-all transform active:scale-95 duration-200 font-extrabold text-sm text-center ${opt.color}`}
            onClick={() => onSelect(opt.id as any)}
          >
            <span className="text-4xl">{opt.emoji}</span>
            <span className="font-display tracking-wide">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
