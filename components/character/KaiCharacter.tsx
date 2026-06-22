// components/character/KaiCharacter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCharacterState, CharacterState } from './useCharacterState';
import { useLipSync, useFakeLipSync } from './useLipSync';
import { MOUTH_SHAPES } from './mouthShapes';
import { CHARACTER_ROSTER } from '@/lib/characters';

interface Props {
  state: CharacterState;
  audioElement?: HTMLAudioElement | null; // Currently playing TTS audio element
  characterId?: string; // Active companion ID
}

export default function KaiCharacter({ state, audioElement, characterId = 'giong' }: Props) {
  const isSpeaking = state === 'speaking';
  const audio = useLipSync(audioElement, isSpeaking && !!audioElement);
  const fake = useFakeLipSync(isSpeaking && !audioElement);

  // Find active companion colors
  const activeChar = CHARACTER_ROSTER.find(c => c.id === characterId) || CHARACTER_ROSTER[0];
  const { primary, secondary, accent } = activeChar.colorPalette;

  // Set mouth shape based on speaking and expression states
  let mouthShape: keyof typeof MOUTH_SHAPES = 'closed';
  if (state === 'happy' || state === 'encourage' || state === 'celebrating' || state === 'dancing') {
    mouthShape = 'smile';
  } else if (state === 'sleeping') {
    mouthShape = 'closed';
  } else if (isSpeaking) {
    mouthShape = audioElement ? audio.mouthShape : fake.mouthShape;
  }

  const { blinkState, earState } = useCharacterState(state);

  // Mouse tracking to make KAI's eyes follow the cursor
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (state === 'sleeping') {
      setMouseOffset({ x: 0, y: 0 });
      return;
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      const el = document.querySelector('.kai-character');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const headX = rect.left + rect.width / 2;
      const headY = rect.top + rect.height / 3;
      
      const dx = e.clientX - headX;
      const dy = e.clientY - headY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist === 0) return;
      
      const maxOffset = 3.5;
      const limit = Math.min(maxOffset, dist / 40);
      const x = (dx / dist) * limit;
      const y = (dy / dist) * limit;
      
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  // Render eyes (Mascot style: vertical white ovals with colored irises based on companion accent)
  const renderEyes = () => {
    if (blinkState || state === 'sleeping') {
      // Blinking or sleeping: cute curved lines
      return (
        <>
          <path d="M 142 126 Q 155 134 168 126" stroke="#1A1A24" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 232 126 Q 245 134 258 126" stroke="#1A1A24" strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'happy' || state === 'encourage' || state === 'celebrating' || state === 'dancing') {
      // Happy curves: ^ ^
      return (
        <>
          <path d="M 142 128 Q 155 112 168 128" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 232 128 Q 245 112 258 128" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'thinking' || state === 'reading') {
      // Looking down or sideways
      const thinkingY = state === 'reading' ? 124 : 122;
      return (
        <>
          {/* Left Eye */}
          <ellipse cx="155" cy="122" rx="15" ry="21" fill="#FFFFFF" />
          <ellipse cx={151 + mouseOffset.x} cy={thinkingY + mouseOffset.y} rx="10" ry="15" fill={accent} />
          <ellipse cx={149 + mouseOffset.x * 1.1} cy={thinkingY + mouseOffset.y * 1.1} rx="6" ry="10" fill="#1A1A24" />
          <circle cx={147 + mouseOffset.x * 1.3} cy={thinkingY - 5 + mouseOffset.y * 1.3} r="3" fill="#FFFFFF" />
          
          {/* Right Eye */}
          <ellipse cx="245" cy="122" rx="15" ry="21" fill="#FFFFFF" />
          <ellipse cx={241 + mouseOffset.x} cy={thinkingY + mouseOffset.y} rx="10" ry="15" fill={accent} />
          <ellipse cx={239 + mouseOffset.x * 1.1} cy={thinkingY + mouseOffset.y * 1.1} rx="6" ry="10" fill="#1A1A24" />
          <circle cx={237 + mouseOffset.x * 1.3} cy={thinkingY - 5 + mouseOffset.y * 1.3} r="3" fill="#FFFFFF" />
        </>
      );
    }

    if (state === 'listening' || state === 'curious') {
      // Wide attentive eyes looking slightly upwards
      return (
        <>
          {/* Left Eye */}
          <ellipse cx="155" cy="122" rx="16" ry="22" fill="#FFFFFF" />
          <ellipse cx={155 + mouseOffset.x} cy={118 + mouseOffset.y} rx="11" ry="16" fill={accent} />
          <ellipse cx={155 + mouseOffset.x * 1.1} cy={118 + mouseOffset.y * 1.1} rx="7" ry="11" fill="#1A1A24" />
          <circle cx={153 + mouseOffset.x * 1.3} cy={112 + mouseOffset.y * 1.3} r="3.5" fill="#FFFFFF" />
          
          {/* Right Eye */}
          <ellipse cx="245" cy="122" rx="16" ry="22" fill="#FFFFFF" />
          <ellipse cx={245 + mouseOffset.x} cy={118 + mouseOffset.y} rx="11" ry="16" fill={accent} />
          <ellipse cx={245 + mouseOffset.x * 1.1} cy={118 + mouseOffset.y * 1.1} rx="7" ry="11" fill="#1A1A24" />
          <circle cx={243 + mouseOffset.x * 1.3} cy={112 + mouseOffset.y * 1.3} r="3.5" fill="#FFFFFF" />
        </>
      );
    }

    // Default Idle: Big round mascot eyes tracking cursor
    return (
      <>
        {/* Left Eye */}
        <ellipse cx="155" cy="122" rx="16" ry="22" fill="#FFFFFF" />
        <ellipse cx={155 + mouseOffset.x} cy={122 + mouseOffset.y} rx="11" ry="16" fill={accent} />
        <ellipse cx={155 + mouseOffset.x * 1.1} cy={122 + mouseOffset.y * 1.1} rx="7" ry="11" fill="#1A1A24" />
        <circle cx={152 + mouseOffset.x * 1.3} cy={116 + mouseOffset.y * 1.3} r="3.5" fill="#FFFFFF" />
        
        {/* Right Eye */}
        <ellipse cx="245" cy="122" rx="16" ry="22" fill="#FFFFFF" />
        <ellipse cx={245 + mouseOffset.x} cy={122 + mouseOffset.y} rx="11" ry="16" fill={accent} />
        <ellipse cx={245 + mouseOffset.x * 1.1} cy={122 + mouseOffset.y * 1.1} rx="7" ry="11" fill="#1A1A24" />
        <circle cx={242 + mouseOffset.x * 1.3} cy={116 + mouseOffset.y * 1.3} r="3.5" fill="#FFFFFF" />
      </>
    );
  };

  // Render eyebrows based on state
  const renderEyebrows = () => {
    if (state === 'happy' || state === 'encourage' || state === 'celebrating' || state === 'dancing') {
      return (
        <>
          <path d="M 136 94 Q 155 84 170 96" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 230 96 Q 245 84 264 94" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'thinking' || state === 'reading') {
      return (
        <>
          <path d="M 138 102 Q 155 92 168 96" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 232 96 Q 245 92 258 102" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'listening' || state === 'curious') {
      return (
        <>
          <path d="M 138 92 Q 155 86 168 92" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 232 92 Q 245 86 258 92" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    }

    // Default Idle
    return (
      <>
        <path d="M 138 98 Q 155 90 170 98" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 230 98 Q 245 90 262 98" stroke="#1A1A24" strokeWidth="5" strokeLinecap="round" fill="none" />
      </>
    );
  };

  // Determine state specific animation classes
  let animClass = '';
  if (state === 'sleeping') animClass = 'anim-breathe';
  else if (state === 'dancing') animClass = 'anim-dance';
  else if (state === 'celebrating') animClass = 'anim-celebrate';
  else if (state === 'walking') animClass = 'anim-walk';

  return (
    <div className={`kai-character kai-character--${state} flex justify-center items-center w-full h-full relative`}>
      
      {/* Floating ZZZs for sleep mode */}
      {state === 'sleeping' && (
        <div className="absolute inset-0 pointer-events-none select-none z-30">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <text x="75" y="35" className="text-purple-400 font-bold select-none text-[8px] fill-purple-400 font-display anim-zzz-1">Z</text>
            <text x="80" y="42" className="text-purple-400 font-bold select-none text-[12px] fill-purple-400 font-display anim-zzz-2">Z</text>
            <text x="85" y="50" className="text-purple-400 font-bold select-none text-[16px] fill-purple-400 font-display anim-zzz-3">Z</text>
          </svg>
        </div>
      )}

      <svg 
        viewBox="100 50 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        className={`h-full w-auto max-h-full max-w-full drop-shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${animClass}`}
      >
        <style>{`
          .anim-breathe {
            animation: breathe 3s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .anim-dance {
            animation: dance 0.6s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .anim-celebrate {
            animation: celebrate 0.8s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .anim-walk {
            animation: walk 1.5s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .anim-zzz-1 { animation: float-zzz 2s infinite 0s; opacity: 0; }
          .anim-zzz-2 { animation: float-zzz 2s infinite 0.6s; opacity: 0; }
          .anim-zzz-3 { animation: float-zzz 2s infinite 1.2s; opacity: 0; }
          
          @keyframes float-zzz {
            0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
            40% { opacity: 0.8; }
            100% { transform: translate(-25px, -45px) scale(1.1); opacity: 0; }
          }
          @keyframes breathe {
            0%, 100% { transform: scaleY(1) translateY(0); }
            50% { transform: scaleY(0.96) translateY(2px); }
          }
          @keyframes dance {
            0%, 100% { transform: rotate(-4deg) translateY(0); }
            50% { transform: rotate(4deg) translateY(-2px); }
          }
          @keyframes celebrate {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-12px) scale(1.04); }
          }
          @keyframes walk {
            0%, 100% { transform: translateX(-6px) rotate(-1deg); }
            50% { transform: translateX(6px) rotate(1deg); }
          }
        `}</style>

        {/* === BODY & SHOULDERS === */}
        <g id="kai-body" className="kai-body origin-bottom transition-transform duration-300">
          {/* Colored T-Shirt/Shoulders matching primary companion color */}
          <path d="M 100 240 Q 200 220 300 240 L 300 280 L 100 280 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          
          {/* Collar Shadow/Neck line */}
          <path d="M 175 224 Q 200 230 225 224" stroke={secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>

        {/* === HEAD === */}
        <g id="kai-head" className="kai-head origin-center transition-transform duration-300">
          {/* Ears */}
          <g id="kai-ears" className={`kai-ears kai-ears--${earState}`}>
            {/* Left Ear */}
            <circle cx="130" cy="85" r="26" fill={primary} />
            <circle cx="130" cy="85" r="16" fill={secondary} />
            
            {/* Right Ear */}
            <circle cx="270" cy="85" r="26" fill={primary} />
            <circle cx="270" cy="85" r="16" fill={secondary} />
          </g>

          {/* Smooth Round Head (Mascot fur matching primary color) */}
          <rect x="120" y="75" width="160" height="150" rx="75" fill={primary} />

          {/* Eyebrows */}
          <g id="kai-eyebrows" className="transition-all duration-300">
            {renderEyebrows()}
          </g>

          {/* Dynamic Eyes */}
          <g id="kai-eyes" className="transition-all duration-300">
            {renderEyes()}
          </g>

          {/* Big Puffy Snout matching secondary color */}
          <g id="kai-snout">
            <circle cx="176" cy="170" r="30" fill={secondary} />
            <circle cx="224" cy="170" r="30" fill={secondary} />
            <rect x="172" y="148" width="56" height="42" fill={secondary} />
            <circle cx="200" cy="186" r="18" fill={secondary} />
          </g>
          
          {/* Black Nose */}
          <ellipse cx="200" cy="146" rx="16" ry="10" fill="#1A1A24" />
          <ellipse cx="196" cy="142" rx="4" ry="2" fill="#FFFFFF" opacity="0.6" />

          {/* Mouth — Lip sync target with translation scale */}
          <g id="kai-mouth" transform="translate(40, -6) scale(0.8)">
            <path 
              d={MOUTH_SHAPES[mouthShape]} 
              fill="#1A1A24" 
              className="transition-all duration-75" 
            />
            {/* If mouth is open, display the cute pink tongue */}
            {mouthShape !== 'closed' && (
              <path 
                d="M 185 232 Q 200 248 215 232 Q 200 236 185 232" 
                fill="#FDA4AF" 
                className="transition-all duration-75"
              />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
