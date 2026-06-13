'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Loader2, Square, Volume2 } from 'lucide-react';

export type VoiceState = 'idle' | 'recording' | 'processing' | 'playing';

interface VoiceButtonProps {
  state: VoiceState;
  onChangeState: (state: VoiceState) => void;
  onTranscript: (text: string) => void;
  onResponse: (text: string) => Promise<void>;
  onError: (errorMsg: string) => void;
  size?: 'md' | 'lg';
}

export default function VoiceButton({
  state,
  onChangeState,
  onTranscript,
  onResponse,
  onError,
  size = 'md',
}: VoiceButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up recording state on unmount and pre-warm microphone permission cache
  useEffect(() => {
    async function preWarmMicrophone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn('Pre-warming microphone failed (permission not granted yet):', err);
      }
    }
    
    preWarmMicrophone();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Prevent starting if not idle
    if (state !== 'idle') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine MIME type supported by browser
      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/ogg' };
      }
      if (!MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: '' }; // Fallback to browser default
      }

      const recorder = new MediaRecorder(stream, options);
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = handleRecordingStop;
      
      recorder.start(100); // Record in 100ms slices
      mediaRecorderRef.current = recorder;
      onChangeState('recording');

      // Auto stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      onError('Bé cần cho phép KAI dùng microphone mới nói chuyện được nhé! 🎤');
      onChangeState('idle');
    }
  };

  const stopRecording = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Add 400ms grace period to capture trailing speech and prevent truncation
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, 400);
  };

  const handleRecordingStop = async () => {
    onChangeState('processing');
    
    // Stop all media tracks to release microphone lock
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const extension = mimeType.includes('ogg') ? 'ogg' : 'webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    
    if (blob.size < 1000) {
      // Audio is too short or empty
      onError('KAI chưa nghe thấy bé nói gì cả. Bé thử nói to hơn hoặc giữ mic lâu hơn nhé!');
      onChangeState('idle');
      return;
    }

    const formData = new FormData();
    formData.append('audio', blob, `recording.${extension}`);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription endpoint error');
      
      const { text } = await res.json();
      
      if (!text || text.trim() === '') {
        onError('KAI chưa nghe rõ lắm. Bé thử nói lại xem sao nhé! 🐻');
        onChangeState('idle');
        return;
      }

      onTranscript(text); // Display user's bubble
      await onResponse(text); // Fetch AI response + play TTS

    } catch (err) {
      console.error('Voice processing pipeline error:', err);
      onError('Có lỗi xảy ra khi truyền âm thanh. Bé thử lại nhé! 🐻');
      onChangeState('idle');
    }
  };

  // Render button content according to state
  const renderIcon = () => {
    switch (state) {
      case 'recording':
        return <Square className="w-8 h-8 text-white fill-white scale-110" />;
      case 'processing':
        return <Loader2 className="w-8 h-8 text-white animate-spin" />;
      case 'playing':
        return (
          <div className="wave-container">
            <div className="wave-bar" style={{ animationDuration: '0.6s' }}></div>
            <div className="wave-bar" style={{ animationDuration: '0.8s' }}></div>
            <div className="wave-bar" style={{ animationDuration: '0.5s' }}></div>
            <div className="wave-bar" style={{ animationDuration: '0.7s' }}></div>
            <div className="wave-bar" style={{ animationDuration: '0.9s' }}></div>
          </div>
        );
      case 'idle':
      default:
        return <Mic className="w-8 h-8 text-white" />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        // Handle pointer leaves button to prevent sticky recording
        onPointerLeave={stopRecording}
        className={`voice-btn voice-btn--${state} ${size === 'lg' ? 'w-[88px] h-[88px]' : 'w-[72px] h-[72px]'}`}
        style={size === 'lg' ? { width: '88px', height: '88px' } : undefined}
        aria-label="Nhấn giữ để nói với KAI"
      >
        {renderIcon()}
      </button>
      
      <span className="text-xs font-bold text-slate-400 mt-2">
        {state === 'idle' && 'Nhấn giữ để nói'}
        {state === 'recording' && 'Đang nghe bé nói...'}
        {state === 'processing' && 'KAI đang nghĩ...'}
        {state === 'playing' && 'KAI đang nói...'}
      </span>
    </div>
  );
}
