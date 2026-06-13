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
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Web Audio API refs for silence detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const volumeCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a ref of isVoiceModeActive to prevent stale closure issues in callbacks
  const isVoiceModeActiveRef = useRef(false);
  useEffect(() => {
    isVoiceModeActiveRef.current = isVoiceModeActive;
  }, [isVoiceModeActive]);

  // Clean up all audio contexts and recording streams on unmount
  useEffect(() => {
    return () => {
      cleanupStreamAndAudio();
    };
  }, []);

  // Auto-resume listening when KAI finishes speaking
  useEffect(() => {
    if (isVoiceModeActive && state === 'idle') {
      const delayStart = setTimeout(() => {
        if (isVoiceModeActiveRef.current) {
          startRecordingCycle();
        }
      }, 300);
      return () => clearTimeout(delayStart);
    }
  }, [state, isVoiceModeActive]);

  const cleanupStreamAndAudio = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (volumeCheckIntervalRef.current) {
      clearInterval(volumeCheckIntervalRef.current);
      volumeCheckIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
  };

  const startRecordingCycle = async () => {
    cleanupStreamAndAudio();

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
      
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      onChangeState('recording');

      // Setup Web Audio API for Silence/Speech Detection
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let lastSpeechTime = Date.now();
      let hasSpoken = false;
      const silenceThreshold = 7; // Average frequency amplitude above this means speaking
      const silenceDuration = 1800; // 1.8 seconds of silence to ensure user finished speaking

      const checkVolume = () => {
        if (!recorder || recorder.state !== 'recording') return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / bufferLength;
        
        const now = Date.now();
        if (averageVolume > silenceThreshold) {
          hasSpoken = true;
          lastSpeechTime = now;
        }
        
        // If the user spoke, and now there has been silence for 1.8 seconds, trigger auto-stop!
        if (hasSpoken && (now - lastSpeechTime > silenceDuration)) {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      };

      // Check volume level every 100ms
      volumeCheckIntervalRef.current = setInterval(checkVolume, 100);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      onError('Bé cần cho phép KAI dùng microphone mới nói chuyện được nhé! 🎤');
      setIsVoiceModeActive(false);
      onChangeState('idle');
    }
  };

  const handleRecordingStop = async () => {
    // If voice mode was turned off during recording, discard the clip
    if (!isVoiceModeActiveRef.current) {
      cleanupStreamAndAudio();
      onChangeState('idle');
      return;
    }

    onChangeState('processing');
    cleanupStreamAndAudio();

    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const extension = mimeType.includes('ogg') ? 'ogg' : 'webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    
    if (blob.size < 1200) {
      // Audio is too short
      onError('KAI nghe không rõ, bé hãy nói lại nhé! 🐻');
      // Auto-restart listening if mode is still active
      if (isVoiceModeActiveRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (isVoiceModeActiveRef.current) startRecordingCycle();
        }, 2000);
      } else {
        onChangeState('idle');
      }
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
        onError('KAI nghe không rõ, bé hãy nói lại nhé! 🐻');
        if (isVoiceModeActiveRef.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (isVoiceModeActiveRef.current) startRecordingCycle();
          }, 2000);
        } else {
          onChangeState('idle');
        }
        return;
      }

      onTranscript(text);
      await onResponse(text); // Fetch AI response (this changes state to processing/playing)

    } catch (err) {
      console.error('Voice processing pipeline error:', err);
      onError('KAI nghe không rõ, bé hãy nói lại nhé! 🐻');
      if (isVoiceModeActiveRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (isVoiceModeActiveRef.current) startRecordingCycle();
        }, 2000);
      } else {
        onChangeState('idle');
      }
    }
  };

  const handleToggleVoiceMode = () => {
    if (isVoiceModeActive) {
      setIsVoiceModeActive(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      } else {
        cleanupStreamAndAudio();
        onChangeState('idle');
      }
    } else {
      setIsVoiceModeActive(true);
    }
  };

  // Render button content according to state
  const renderIcon = () => {
    if (!isVoiceModeActive) {
      return <Mic className="w-8 h-8 text-white" />;
    }

    switch (state) {
      case 'recording':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full bg-rose-500/30 animate-ping" />
            <Mic className="w-8 h-8 text-white animate-pulse" />
          </div>
        );
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

  const buttonClass = isVoiceModeActive
    ? state === 'recording'
      ? 'bg-rose-500 hover:bg-rose-600 scale-105 shadow-rose-200'
      : state === 'processing'
      ? 'bg-amber-500'
      : state === 'playing'
      ? 'bg-emerald-500'
      : 'bg-purple-500'
    : 'bg-[#6C63FF] hover:bg-[#5b52ee]';

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleToggleVoiceMode}
        className={`voice-btn flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 transform active:scale-90 hover:scale-[1.03] ${buttonClass} ${
          size === 'lg' ? 'w-[84px] h-[84px]' : 'w-[72px] h-[72px]'
        }`}
        aria-label="Bấm để nói chuyện với KAI"
      >
        {renderIcon()}
      </button>
      
      <span className="text-xs font-black text-slate-400 mt-2 transition-all duration-300">
        {!isVoiceModeActive && 'Bấm để bắt đầu nói'}
        {isVoiceModeActive && state === 'recording' && 'Đang nghe bé nói...'}
        {isVoiceModeActive && state === 'processing' && 'KAI đang nghĩ...'}
        {isVoiceModeActive && state === 'playing' && 'KAI đang trả lời...'}
        {isVoiceModeActive && state === 'idle' && 'Chuẩn bị nghe bé...'}
      </span>
    </div>
  );
}
