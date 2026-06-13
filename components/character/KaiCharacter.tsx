// components/character/KaiCharacter.tsx
'use client';

import React from 'react';
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

  // Render eyes (Duolingo-inspired ultra-cute style with catchlights)
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
      // Thinking: looking to the side/slanted
      return (
        <>
          {/* Left Eye */}
          <circle cx="155" cy="128" r="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="151" cy="128" r="9.5" fill="#222230" />
          <circle cx="148" cy="125" r="3.5" fill="#FFFFFF" />
          
          {/* Right Eye */}
          <circle cx="245" cy="128" r="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="241" cy="128" r="9.5" fill="#222230" />
          <circle cx="238" cy="125" r="3.5" fill="#FFFFFF" />
        </>
      );
    }

    if (state === 'listening') {
      // Wide attentive eyes looking slightly upwards
      return (
        <>
          {/* Left Eye */}
          <circle cx="155" cy="128" r="19" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="155" cy="124" r="10" fill="#222230" />
          <circle cx="153" cy="121" r="4" fill="#FFFFFF" />
          
          {/* Right Eye */}
          <circle cx="245" cy="128" r="19" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="245" cy="124" r="10" fill="#222230" />
          <circle cx="243" cy="121" r="4" fill="#FFFFFF" />
        </>
      );
    }

    // Default Idle: Big round glossy friendly eyes
    return (
      <>
        {/* Left Eye */}
        <circle cx="155" cy="128" r="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="155" cy="128" r="9.5" fill="#222230" />
        <circle cx="152" cy="125" r="3.5" fill="#FFFFFF" />
        <circle cx="158" cy="131" r="1.5" fill="#FFFFFF" />
        
        {/* Right Eye */}
        <circle cx="245" cy="128" r="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="245" cy="128" r="9.5" fill="#222230" />
        <circle cx="242" cy="125" r="3.5" fill="#FFFFFF" />
        <circle cx="248" cy="131" r="1.5" fill="#FFFFFF" />
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
        <defs>
          {/* Head gradient: smooth 3D dark charcoal */}
          <linearGradient id="bear-head-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#373746" />
            <stop offset="100%" stopColor="#1E1E28" />
          </linearGradient>

          {/* Body gradient: slightly darker */}
          <linearGradient id="bear-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A2A38" />
            <stop offset="100%" stopColor="#15151F" />
          </linearGradient>
          
          {/* Soft radial blush gradient */}
          <radialGradient id="blush-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
          </radialGradient>

          {/* Snout cream-colored gradient */}
          <linearGradient id="snout-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#F7EAD3" />
          </linearGradient>
        </defs>

        {/* === BODY & SHOULDERS === */}
        <g id="kai-body" className="kai-body origin-bottom transition-transform duration-300">
          <path d="M 100 240 Q 200 215 300 240 L 300 280 L 100 280 Z" fill="url(#bear-body-grad)" />
          
          {/* Cute Purple Bowtie */}
          <g id="kai-bowtie" className="transition-transform duration-300 origin-center">
            {/* Left loop */}
            <polygon points="175,214 192,224 175,234" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1" />
            {/* Right loop */}
            <polygon points="225,214 208,224 225,234" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1" />
            {/* Center knot */}
            <rect x="193" y="218" width="14" height="12" rx="4" fill="#6D28D9" />
          </g>
        </g>

        {/* === HEAD === */}
        <g id="kai-head" className="kai-head origin-center transition-transform duration-300">
          {/* Ears */}
          <g id="kai-ears" className={`kai-ears kai-ears--${earState}`}>
            {/* Left Ear */}
            <circle cx="130" cy="85" r="24" fill="#1E1E28" stroke="#15151F" strokeWidth="1" />
            <circle cx="130" cy="85" r="14" fill="#FDA4AF" opacity="0.85" />
            
            {/* Right Ear */}
            <circle cx="270" cy="85" r="24" fill="#242432" stroke="#15151F" strokeWidth="1" />
            <circle cx="270" cy="85" r="14" fill="#FDA4AF" opacity="0.85" />
          </g>

          {/* Smooth Round Head (Duolingo Style) */}
          <rect x="120" y="75" width="160" height="150" rx="75" fill="url(#bear-head-grad)" stroke="#1A1A24" strokeWidth="1" />

          {/* Soft Highlight on top of head */}
          <ellipse cx="200" cy="85" rx="50" ry="8" fill="#FFFFFF" opacity="0.12" />

          {/* Eyebrows */}
          <g id="kai-eyebrows" className="transition-all duration-300">
            {renderEyebrows()}
          </g>

          {/* Dynamic Eyes */}
          <g id="kai-eyes" className="transition-all duration-300">
            {renderEyes()}
          </g>

          {/* Rosy Pink Cheeks Blush */}
          <circle cx="138" cy="158" r="12" fill="url(#blush-grad)" />
          <circle cx="262" cy="158" r="12" fill="url(#blush-grad)" />

          {/* Cream Snout */}
          <ellipse cx="200" cy="170" rx="28" ry="20" fill="url(#snout-grad)" stroke="#E2D8C5" strokeWidth="1" />
          
          {/* Cute Nose */}
          <path d="M 192 158 C 192 154, 208 154, 208 158 C 208 163, 200 168, 200 168 C 200 168, 192 163, 192 158 Z" fill="#222230" />

          {/* Mouth — Lip sync target with translation scale */}
          <g id="kai-mouth">
            <path 
              d={MOUTH_SHAPES[mouthShape]} 
              fill="#222230" 
              transform="translate(0, -53) scale(0.65)" 
              className="transition-all duration-75 origin-center" 
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
