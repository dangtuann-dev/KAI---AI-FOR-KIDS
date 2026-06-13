// components/character/KaiCharacter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCharacterState, CharacterState } from './useCharacterState';
import { useLipSync, useFakeLipSync } from './useLipSync';
import { MOUTH_SHAPES } from './mouthShapes';

interface Props {
  state: CharacterState;
  audioElement?: HTMLAudioElement | null; // Currently playing TTS audio element
}

export default function KaiCharacter({ state, audioElement }: Props) {
  const isSpeaking = state === 'speaking';
  const audio = useLipSync(audioElement, isSpeaking && !!audioElement);
  const fake = useFakeLipSync(isSpeaking && !audioElement);

  // Set mouth shape based on speaking and expression states
  let mouthShape: keyof typeof MOUTH_SHAPES = 'closed';
  if (state === 'happy' || state === 'encourage') {
    mouthShape = 'smile';
  } else if (isSpeaking) {
    mouthShape = audioElement ? audio.mouthShape : fake.mouthShape;
  }

  const { blinkState, earState } = useCharacterState(state);

  // Mouse tracking to make KAI's eyes follow the cursor
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
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
  }, []);

  // Render eyes (Duolingo-inspired ultra-cute style with cursor tracking)
  const renderEyes = () => {
    if (blinkState) {
      // Blinking: cute curved lines
      return (
        <>
          <path d="M 142 130 Q 155 138 168 130" stroke="#4A4A5A" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 232 130 Q 245 138 258 130" stroke="#4A4A5A" strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'happy' || state === 'encourage') {
      // Happy curves: ^ ^
      return (
        <>
          <path d="M 142 132 Q 155 116 168 132" stroke="#FDA4AF" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 232 132 Q 245 116 258 132" stroke="#FDA4AF" strokeWidth="7" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'thinking') {
      // Thinking: looking sideways
      return (
        <>
          {/* Left Eye */}
          <circle cx="155" cy="128" r="18" fill="#FFFFFF" />
          <circle cx={151 + mouseOffset.x} cy={128 + mouseOffset.y} r="9.5" fill="#222230" />
          <circle cx={148 + mouseOffset.x * 1.2} cy={125 + mouseOffset.y * 1.2} r="3.5" fill="#FFFFFF" />
          
          {/* Right Eye */}
          <circle cx="245" cy="128" r="18" fill="#FFFFFF" />
          <circle cx={241 + mouseOffset.x} cy={128 + mouseOffset.y} r="9.5" fill="#222230" />
          <circle cx={238 + mouseOffset.x * 1.2} cy={125 + mouseOffset.y * 1.2} r="3.5" fill="#FFFFFF" />
        </>
      );
    }

    if (state === 'listening') {
      // Wide attentive eyes looking slightly upwards / towards cursor
      return (
        <>
          {/* Left Eye */}
          <circle cx="155" cy="128" r="19" fill="#FFFFFF" />
          <circle cx={155 + mouseOffset.x} cy={124 + mouseOffset.y} r="10" fill="#222230" />
          <circle cx={153 + mouseOffset.x * 1.2} cy={121 + mouseOffset.y * 1.2} r="4" fill="#FFFFFF" />
          
          {/* Right Eye */}
          <circle cx="245" cy="128" r="19" fill="#FFFFFF" />
          <circle cx={245 + mouseOffset.x} cy={124 + mouseOffset.y} r="10" fill="#222230" />
          <circle cx={243 + mouseOffset.x * 1.2} cy={121 + mouseOffset.y * 1.2} r="4" fill="#FFFFFF" />
        </>
      );
    }

    // Default Idle: Big round glossy friendly eyes tracking cursor
    return (
      <>
        {/* Left Eye */}
        <circle cx="155" cy="128" r="18" fill="#FFFFFF" />
        <circle cx={155 + mouseOffset.x} cy={128 + mouseOffset.y} r="9.5" fill="#222230" />
        <circle cx={152 + mouseOffset.x * 1.2} cy={125 + mouseOffset.y * 1.2} r="3.5" fill="#FFFFFF" />
        <circle cx={158 + mouseOffset.x * 0.8} cy={131 + mouseOffset.y * 0.8} r="1.5" fill="#FFFFFF" />
        
        {/* Right Eye */}
        <circle cx="245" cy="128" r="18" fill="#FFFFFF" />
        <circle cx={245 + mouseOffset.x} cy={128 + mouseOffset.y} r="9.5" fill="#222230" />
        <circle cx={242 + mouseOffset.x * 1.2} cy={125 + mouseOffset.y * 1.2} r="3.5" fill="#FFFFFF" />
        <circle cx={248 + mouseOffset.x * 0.8} cy={131 + mouseOffset.y * 0.8} r="1.5" fill="#FFFFFF" />
      </>
    );
  };

  // Render eyebrows based on state
  const renderEyebrows = () => {
    if (state === 'happy' || state === 'encourage') {
      return (
        <>
          <path d="M 138 98 Q 155 92 170 100" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 230 100 Q 245 92 262 98" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'thinking') {
      return (
        <>
          <path d="M 140 106 Q 155 98 168 102" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 232 102 Q 245 98 258 106" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'listening') {
      return (
        <>
          <path d="M 140 96 Q 155 92 168 96" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 232 96 Q 245 92 258 96" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      );
    }

    // Default Idle
    return (
      <>
        <path d="M 140 102 Q 155 98 168 102" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 232 102 Q 245 98 258 102" stroke="#4A4A5A" strokeWidth="4" strokeLinecap="round" fill="none" />
      </>
    );
  };

  return (
    <div className={`kai-character kai-character--${state} flex justify-center items-center w-full h-full`}>
      <svg 
        viewBox="100 50 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[500px] md:max-w-[580px] lg:max-w-[620px] h-auto drop-shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
      >
        {/* === BODY & SHOULDERS === */}
        <g id="kai-body" className="kai-body origin-bottom transition-transform duration-300">
          <path d="M 100 240 Q 200 220 300 240 L 300 280 L 100 280 Z" fill="#252530" />
          
          {/* Cute Purple Bowtie */}
          <g id="kai-bowtie" className="transition-transform duration-300 origin-center">
            {/* Left loop */}
            <polygon points="176,215 192,223 176,231" fill="#8B5CF6" />
            {/* Right loop */}
            <polygon points="224,215 208,223 224,231" fill="#8B5CF6" />
            {/* Center knot */}
            <rect x="193" y="218" width="14" height="10" rx="3" fill="#6D28D9" />
          </g>
        </g>

        {/* === HEAD === */}
        <g id="kai-head" className="kai-head origin-center transition-transform duration-300">
          {/* Ears */}
          <g id="kai-ears" className={`kai-ears kai-ears--${earState}`}>
            {/* Left Ear */}
            <circle cx="130" cy="85" r="22" fill="#2D2D38" />
            <circle cx="130" cy="85" r="12" fill="#FDA4AF" />
            
            {/* Right Ear */}
            <circle cx="270" cy="85" r="22" fill="#2D2D38" />
            <circle cx="270" cy="85" r="12" fill="#FDA4AF" />
          </g>

          {/* Smooth Round Head (Duolingo Style) */}
          <rect x="120" y="75" width="160" height="150" rx="75" fill="#2D2D38" />

          {/* Eyebrows */}
          <g id="kai-eyebrows" className="transition-all duration-300">
            {renderEyebrows()}
          </g>

          {/* Dynamic Eyes */}
          <g id="kai-eyes" className="transition-all duration-300">
            {renderEyes()}
          </g>

          {/* Rosy Pink Cheeks Blush */}
          <circle cx="138" cy="158" r="8" fill="#FDA4AF" opacity="0.6" />
          <circle cx="262" cy="158" r="8" fill="#FDA4AF" opacity="0.6" />

          {/* Cream Snout */}
          <ellipse cx="200" cy="170" rx="26" ry="18" fill="#FFFDF9" />
          
          {/* Cute Nose */}
          <path d="M 192 158 C 192 154, 208 154, 208 158 C 208 163, 200 168, 200 168 C 200 168, 192 163, 192 158 Z" fill="#222230" />

          {/* Mouth — Lip sync target with translation scale */}
          <g id="kai-mouth" transform="translate(40, -10) scale(0.8)">
            <path 
              d={MOUTH_SHAPES[mouthShape]} 
              fill="#222230" 
              className="transition-all duration-75" 
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
