'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, VolumeX, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  onPlayStateChange?: (playing: boolean) => void;
  onEnded?: () => void;
}

export default function AudioPlayer({ src, onPlayStateChange, onEnded }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
    
    const audio = audioRef.current;
    
    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlayStateChange) onPlayStateChange(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
      if (onEnded) onEnded();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src, onPlayStateChange, onEnded]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error('Audio play failed:', err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 border border-purple-100 rounded-full shadow-sm">
      <button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-all active:scale-95"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
      </button>
      
      <div className="text-xs font-bold text-slate-500">Giọng nói KAI</div>

      <button 
        onClick={toggleMute}
        className="text-slate-400 hover:text-purple-500 ml-auto transition-colors"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
