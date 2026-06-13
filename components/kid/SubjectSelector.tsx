import React from 'react';
import { Calculator, BookOpen, FlaskConical, Languages, Heart, Globe } from 'lucide-react';

export interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;      // Tailwind background color class
  textColor: string;  // Tailwind text color class
  borderColor: string;
  tag?: string;       // Optional badge like 'Tự chọn', 'Bắt buộc'
}

export function getSubjectsForGrade(grade: number): Subject[] {
  const list: Subject[] = [
    { 
      id: 'math', 
      name: 'Toán', 
      icon: <Calculator className="w-5 h-5" />, 
      color: 'bg-indigo-50 hover:bg-indigo-100', 
      textColor: 'text-indigo-600', 
      borderColor: 'border-indigo-300' 
    },
    { 
      id: 'vietnamese', 
      name: 'Tiếng Việt', 
      icon: <BookOpen className="w-5 h-5" />, 
      color: 'bg-rose-50 hover:bg-rose-100', 
      textColor: 'text-rose-600', 
      borderColor: 'border-rose-300' 
    },
    { 
      id: 'science', 
      name: grade >= 4 ? 'Khoa học' : 'Tự nhiên & Xã hội', 
      icon: <FlaskConical className="w-5 h-5" />, 
      color: 'bg-emerald-50 hover:bg-emerald-100', 
      textColor: 'text-emerald-600', 
      borderColor: 'border-emerald-300' 
    },
    { 
      id: 'english', 
      name: 'Tiếng Anh', 
      icon: <Languages className="w-5 h-5" />, 
      color: 'bg-blue-50 hover:bg-blue-100', 
      textColor: 'text-blue-600', 
      borderColor: 'border-blue-300',
      tag: grade <= 2 ? 'Tự chọn' : 'Bắt buộc'
    },
    { 
      id: 'ethics', 
      name: 'Đạo đức', 
      icon: <Heart className="w-5 h-5" />, 
      color: 'bg-amber-50 hover:bg-amber-100', 
      textColor: 'text-amber-600', 
      borderColor: 'border-amber-300' 
    }
  ];

  if (grade >= 4) {
    list.push({ 
      id: 'history', 
      name: 'Lịch sử & Địa lý', 
      icon: <Globe className="w-5 h-5" />, 
      color: 'bg-violet-50 hover:bg-violet-100', 
      textColor: 'text-violet-600', 
      borderColor: 'border-violet-300' 
    });
  }

  return list;
}

interface SubjectSelectorProps {
  selectedId: string;
  onSelectSubject: (id: string) => void;
  grade: number;
}

export default function SubjectSelector({ selectedId, onSelectSubject, grade }: SubjectSelectorProps) {
  const subjects = getSubjectsForGrade(grade);

  return (
    <div className="w-full overflow-x-auto py-3 px-4 flex gap-3.5 custom-scrollbar scroll-smooth">
      {subjects.map((subject) => {
        const isActive = subject.id === selectedId;
        return (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className={`transition-all duration-300 transform active:scale-95 border-2 flex items-center gap-3 px-5 py-2.5 rounded-2xl shrink-0 ${
              isActive 
                ? `${subject.color} ${subject.textColor} ${subject.borderColor} shadow-sm scale-[1.02] font-black` 
                : 'border-transparent bg-slate-50/70 hover:bg-slate-50 text-slate-600 font-bold'
            }`}
          >
            <span className={`text-lg flex items-center justify-center shrink-0 p-1.5 rounded-xl transition-all ${
              isActive ? 'bg-white shadow-sm scale-110' : 'bg-slate-100/80 text-slate-500'
            }`}>
              {subject.icon}
            </span>
            <div className="flex flex-col items-start">
              <span className="font-display text-sm tracking-wide">{subject.name}</span>
              {subject.tag && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-0.5 ${
                  subject.tag === 'Tự chọn' 
                    ? 'bg-slate-200/60 text-slate-500' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {subject.tag}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
