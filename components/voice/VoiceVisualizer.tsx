'use client';

import React from 'react';

interface VoiceVisualizerProps {
  isPlaying: boolean;
}

export default function VoiceVisualizer({ isPlaying }: VoiceVisualizerProps) {
  if (!isPlaying) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 p-4 bg-white border-2 border-[#ECEBFF] rounded-2xl shadow-sm animate-fade-in w-full max-w-[200px] mx-auto">
      <div className="text-xs font-bold text-slate-400 mr-2">Đang phát âm thanh:</div>
      <div className="flex items-center gap-1 h-6">
        <div className="w-1 bg-[#6C63FF] rounded-full animate-bounce" style={{ height: '70%', animationDelay: '0.1s', animationDuration: '0.8s' }}></div>
        <div className="w-1 bg-[#FF6B9D] rounded-full animate-bounce" style={{ height: '100%', animationDelay: '0.3s', animationDuration: '1s' }}></div>
        <div className="w-1 bg-[#FFD166] rounded-full animate-bounce" style={{ height: '50%', animationDelay: '0.5s', animationDuration: '0.6s' }}></div>
        <div className="w-1 bg-[#06D6A0] rounded-full animate-bounce" style={{ height: '85%', animationDelay: '0.2s', animationDuration: '0.9s' }}></div>
        <div className="w-1 bg-[#6C63FF] rounded-full animate-bounce" style={{ height: '40%', animationDelay: '0.4s', animationDuration: '0.7s' }}></div>
      </div>
    </div>
  );
}
