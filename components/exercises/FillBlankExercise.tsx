// components/exercises/FillBlankExercise.tsx
'use client';

import React, { useState } from 'react';
import { FillBlankExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function FillBlankExercise({ data, onAnswer }: Props) {
  const [selectedWord, setSelectedWord] = useState('');
  const [typedWord, setTypedWord] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (wordToSubmit: string) => {
    if (!wordToSubmit.trim() || submitted) return;
    
    const cleanStudent = wordToSubmit.trim().toLowerCase();
    const cleanCorrect = data.correctAnswer.trim().toLowerCase();
    const isCorrect = cleanStudent === cleanCorrect;
    
    setSubmitted(true);
    setTimeout(() => {
      onAnswer(wordToSubmit, isCorrect);
    }, 500);
  };

  // Render the sentence with the blank highlighted
  const renderSentence = (wordToShow: string) => {
    const parts = data.sentence.split('___');
    return (
      <p className="font-display font-bold text-slate-800 text-base leading-relaxed text-center mb-4">
        {parts[0]}
        <span className={`inline-block mx-1.5 px-3 py-0.5 min-w-[70px] text-center border-b-4 font-black rounded-lg transition-all ${
          submitted
            ? wordToShow.trim().toLowerCase() === data.correctAnswer.trim().toLowerCase()
              ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
              : 'bg-rose-100 border-rose-500 text-rose-800'
            : 'bg-purple-50 border-purple-400 text-purple-700'
        }`}>
          {wordToShow || '...'}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <ExerciseCard emoji="✏️" title="Điền từ vào chỗ trống">
      <div className="flex flex-col gap-3">
        {renderSentence(data.wordBank ? selectedWord : typedWord)}

        {data.wordBank ? (
          /* Option Chips if wordBank is available */
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {data.wordBank.map((word, idx) => {
              const isSelected = selectedWord === word;
              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => {
                    setSelectedWord(word);
                    handleSubmit(word);
                  }}
                  className={`px-4 py-2 border-2 rounded-full font-display font-extrabold text-sm transition-all transform active:scale-95 shadow-sm ${
                    isSelected
                      ? 'bg-purple-600 border-purple-700 text-white'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  } disabled:opacity-80`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        ) : (
          /* Text input if wordBank is not available */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(typedWord);
            }}
            className="flex flex-col gap-3 mt-2"
          >
            <input
              type="text"
              disabled={submitted}
              placeholder="Nhập từ còn thiếu..."
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-purple-300 rounded-xl outline-none font-bold text-sm text-slate-700 transition-colors"
            />
            <button
              type="submit"
              disabled={submitted || !typedWord.trim()}
              className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-display font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
            >
              Nộp câu trả lời
            </button>
          </form>
        )}
      </div>
    </ExerciseCard>
  );
}
