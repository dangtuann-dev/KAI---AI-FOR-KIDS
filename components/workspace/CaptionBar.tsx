// components/workspace/CaptionBar.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  speaker: 'user' | 'kai';
  text: string;
  isActive: boolean; // true when this caption is active
  audioDuration?: number; // ms — to scale the typewriter speed to match the spoken words
}

export default function CaptionBar({ speaker, text, isActive, audioDuration }: Props) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayedText('');
      return;
    }

    // Determine speed of typewriter. Fallback to 35ms per character if no duration is supplied.
    const charDelay = audioDuration ? Math.min(60, Math.max(15, audioDuration / text.length)) : 35;
    let i = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, charDelay);

    return () => {
      clearInterval(interval);
    };
  }, [isActive, text, audioDuration]);

  if (!isActive || !text) return null;

  return (
    <div className={`caption-bar caption-bar--${speaker} flex items-start gap-3 w-full max-w-[90%] md:max-w-[80%] mx-auto px-5 py-4 rounded-2xl shadow-md border border-slate-100/50 bg-white transition-all`}>
      <span className="caption-icon text-2xl select-none shrink-0">
        {speaker === 'kai' ? '🐻' : '🧒'}
      </span>
      <p className="caption-text text-base md:text-lg font-bold text-slate-800 leading-relaxed font-body">
        {displayedText}
      </p>
    </div>
  );
}
