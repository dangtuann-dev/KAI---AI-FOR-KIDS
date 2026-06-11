'use client';

import React from 'react';

export interface Subject {
  id: string;
  name: string;
  emoji: string;
  color: string;      // Tailind background color class
  textColor: string;  // Tailwind text color class
  borderColor: string;
}

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Toán', emoji: '🔢', color: 'bg-indigo-50 hover:bg-indigo-100', textColor: 'text-indigo-600', borderColor: 'border-indigo-400' },
  { id: 'vietnamese', name: 'Tiếng Việt', emoji: '📖', color: 'bg-rose-50 hover:bg-rose-100', textColor: 'text-rose-600', borderColor: 'border-rose-400' },
  { id: 'science', name: 'Khoa học', emoji: '🔬', color: 'bg-emerald-50 hover:bg-emerald-100', textColor: 'text-emerald-600', borderColor: 'border-emerald-400' },
  { id: 'english', name: 'Tiếng Anh', emoji: '🔤', color: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-600', borderColor: 'border-blue-400' },
  { id: 'ethics', name: 'Đạo đức', emoji: '🤝', color: 'bg-amber-50 hover:bg-amber-100', textColor: 'text-amber-600', borderColor: 'border-amber-400' },
  { id: 'history', name: 'Lịch sử', emoji: '🌍', color: 'bg-violet-50 hover:bg-violet-100', textColor: 'text-violet-600', borderColor: 'border-violet-400' },
];

interface SubjectSelectorProps {
  selectedId: string;
  onSelectSubject: (id: string) => void;
}

export default function SubjectSelector({ selectedId, onSelectSubject }: SubjectSelectorProps) {
  return (
    <div className="w-full overflow-x-auto py-3 px-4 flex gap-3 custom-scrollbar scroll-smooth">
      {SUBJECTS.map((subject) => {
        const isActive = subject.id === selectedId;
        return (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className={`subject-btn ${subject.color} ${subject.textColor} ${
              isActive 
                ? `subject-btn--active border-2 ${subject.borderColor} shadow-md scale-105 font-extrabold` 
                : 'border-2 border-transparent opacity-85 hover:opacity-100'
            }`}
            style={{ color: isActive ? undefined : 'inherit' }}
          >
            <span className="text-xl" role="img" aria-label={subject.name}>
              {subject.emoji}
            </span>
            <span className="font-display">{subject.name}</span>
          </button>
        );
      })}
    </div>
  );
}
