// components/character/useLipSync.ts
'use client';
import { useState, useEffect, useRef } from 'react';
import { MouthShape } from './mouthShapes';

export function useLipSync(audioElement: HTMLAudioElement | null | undefined, isActive: boolean) {
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!audioElement || !isActive) {
      setMouthShape('closed');
      return;
    }

    // Initialize AudioContext (only once, to avoid "already connected" errors)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    // Resume context if suspended (common browser security constraint)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.7; // smooth transitions
    }

    if (!sourceRef.current) {
      try {
        sourceRef.current = ctx.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      } catch (e) {
        // Source already connected (e.g. during HMR or re-renders) - ignore
        console.warn('Audio source already connected or failed to connect:', e);
      }
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 80; // ms - ~12fps is ideal for smooth lip-sync without lagging

    const tick = (timestamp: number) => {
      if (!analyserRef.current) return;
      
      if (timestamp - lastUpdate > UPDATE_INTERVAL) {
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume (using voice range frequency bins)
        const voiceRange = dataArray.slice(0, 32);
        const avg = voiceRange.reduce((a, b) => a + b, 0) / voiceRange.length;

        // Map average volume (0-255) to mouth shape
        let shape: MouthShape = 'closed';
        if (avg > 60) shape = 'wide';
        else if (avg > 35) shape = 'medium';
        else if (avg > 12) shape = 'small';
        else shape = 'closed';

        setMouthShape(shape);
        lastUpdate = timestamp;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [audioElement, isActive]);

  return { mouthShape };
}

// Fallback for Web Speech API when no audio file is available
export function useFakeLipSync(isSpeaking: boolean) {
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');

  useEffect(() => {
    if (!isSpeaking) {
      setMouthShape('closed');
      return;
    }
    const shapes: MouthShape[] = ['small', 'medium', 'wide', 'medium', 'small'];
    let i = 0;
    const interval = setInterval(() => {
      setMouthShape(shapes[i % shapes.length]);
      i++;
    }, 120); // 120ms per frame - natural speaking cadence

    return () => clearInterval(interval);
  }, [isSpeaking]);

  return { mouthShape };
}
