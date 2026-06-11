'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';

interface GradeSelectorProps {
  selectedGrade: number;
  onSelectGrade: (grade: number) => void;
}

export default function GradeSelector({ selectedGrade, onSelectGrade }: GradeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const grades = [
    { value: 1, label: 'Lớp 1 🎒', desc: 'Học vần & cộng trừ cơ bản' },
    { value: 2, label: 'Lớp 2 📚', desc: 'Bảng cửu chương & tả đồ vật' },
    { value: 3, label: 'Lớp 3 ✏️', desc: 'Phép nhân chia & đọc hiểu' },
    { value: 4, label: 'Lớp 4 📐', desc: 'Phân số & kể chuyện sáng tạo' },
    { value: 5, label: 'Lớp 5 🎓', desc: 'Hình học & chuẩn bị cấp 2' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-extrabold text-sm rounded-full transition-all active:scale-95 border-2 border-purple-200"
      >
        <GraduationCap className="w-4 h-4" />
        <span className="font-display">Lớp {selectedGrade}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border-4 border-[#ECEBFF] rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in origin-top-right">
          <div className="p-2.5 bg-purple-50 border-b-2 border-[#ECEBFF] text-xs font-extrabold text-purple-500 font-display">
            CHỌN LỚP HỌC CỦA BÉ
          </div>
          <div className="py-1">
            {grades.map((g) => (
              <button
                key={g.value}
                onClick={() => {
                  onSelectGrade(g.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-purple-50 flex flex-col transition-colors ${
                  selectedGrade === g.value ? 'bg-purple-100/50 text-purple-700 font-bold' : 'text-slate-600'
                }`}
              >
                <span className="font-display text-sm font-extrabold">{g.label}</span>
                <span className="text-[10px] text-slate-400 font-medium">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
