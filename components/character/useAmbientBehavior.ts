// components/character/useAmbientBehavior.ts
'use client';

import { useEffect, useRef } from 'react';
import { CharacterState } from './useCharacterState';
import { VoiceState } from '../voice/VoiceButton';

interface AmbientBehaviorProps {
  voiceState: VoiceState;
  characterState: CharacterState;
  setCharacterState: (state: CharacterState) => void;
  messagesCount: number;
  textInput: string;
}

export function useAmbientBehavior({
  voiceState,
  characterState,
  setCharacterState,
  messagesCount,
  textInput,
}: AmbientBehaviorProps) {
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Reset idle timer
  const resetIdleTimer = () => {
    lastInteractionTimeRef.current = Date.now();
    // Wake up if sleeping, walking, or reading
    if (characterState === 'sleeping' || characterState === 'walking' || characterState === 'reading') {
      setCharacterState('idle');
    }
  };

  // Reset timer on active voice state
  useEffect(() => {
    if (voiceState !== 'idle') {
      resetIdleTimer();
    }
  }, [voiceState]);

  // Reset timer on new messages
  useEffect(() => {
    resetIdleTimer();
  }, [messagesCount]);

  // Reset timer on text typing
  useEffect(() => {
    if (textInput.trim().length > 0) {
      resetIdleTimer();
    }
  }, [textInput]);

  // Global mouse/touch/key listeners to reset idle timer when child interacts with the screen
  useEffect(() => {
    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [characterState]);

  // Check idle duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't change state if voiceState is active (recording, processing, playing)
      if (voiceState !== 'idle') {
        return;
      }

      // Don't override brief happy/encourage animations
      if (characterState === 'happy' || characterState === 'encourage') {
        return;
      }

      const elapsedSeconds = (Date.now() - lastInteractionTimeRef.current) / 1000;

      if (elapsedSeconds >= 300) {
        // > 5 minutes: sleeping
        if (characterState !== 'sleeping') {
          setCharacterState('sleeping');
        }
      } else if (elapsedSeconds >= 180) {
        // > 3 minutes: walking
        if (characterState !== 'walking') {
          setCharacterState('walking');
        }
      } else if (elapsedSeconds >= 30) {
        // > 30 seconds: reading
        if (characterState !== 'reading') {
          setCharacterState('reading');
        }
      } else {
        // Normal idle
        if (characterState !== 'idle') {
          setCharacterState('idle');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [voiceState, characterState, setCharacterState]);
}
