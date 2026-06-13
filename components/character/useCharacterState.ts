// components/character/useCharacterState.ts
'use client';
import { useState, useEffect } from 'react';

export type CharacterState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'encourage';

export function useCharacterState(state: CharacterState) {
  const [blinkState, setBlinkState] = useState(false);
  const [earState, setEarState] = useState<'normal' | 'perked'>('normal');
  const [armState, setArmState] = useState<'idle' | 'thinking' | 'speaking' | 'happy'>('idle');
  const [eyeState, setEyeState] = useState<'normal' | 'wide' | 'happy' | 'thinking'>('normal');

  // Random blink behavior - only when idle/listening (no blinking during speaking for a cleaner look)
  useEffect(() => {
    if (state === 'speaking') {
      setBlinkState(false);
      return;
    }
    
    let activeTimeout: NodeJS.Timeout;
    
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000; // 2-6 seconds
      activeTimeout = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => setBlinkState(false), 150);
        scheduleBlink();
      }, delay);
    };
    
    scheduleBlink();
    
    return () => {
      clearTimeout(activeTimeout);
    };
  }, [state]);

  // Map high-level state -> specific part states
  useEffect(() => {
    switch (state) {
      case 'listening':
        setEarState('perked');
        setEyeState('wide');
        setArmState('idle');
        break;
      case 'thinking':
        setEarState('normal');
        setEyeState('thinking');
        setArmState('thinking');
        break;
      case 'speaking':
        setEarState('normal');
        setEyeState('normal');
        setArmState('speaking');
        break;
      case 'happy':
        setEarState('perked');
        setEyeState('happy');
        setArmState('happy');
        break;
      case 'encourage':
        setEarState('normal');
        setEyeState('happy');
        setArmState('idle');
        break;
      case 'idle':
      default:
        setEarState('normal');
        setEyeState('normal');
        setArmState('idle');
    }
  }, [state]);

  return { blinkState, earState, armState, eyeState };
}
