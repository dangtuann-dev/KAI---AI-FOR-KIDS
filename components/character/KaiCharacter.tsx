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

  const { blinkState, earState, armState, eyeState } = useCharacterState(state);

  return (
    <div className={`kai-character kai-character--${state} flex justify-center items-center`}>
      <svg 
        viewBox="0 0 400 400" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[320px] md:max-w-[360px] h-auto drop-shadow-xl"
      >
        {/* === BODY === */}
        <g id="kai-body" className="kai-body origin-bottom transition-transform duration-300">
          {/* Main body shape (Bear belly / shoulders) */}
          <ellipse cx="200" cy="320" rx="110" ry="70" fill="#2D2A26" />
          
          {/* Light-colored belly patch */}
          <ellipse cx="200" cy="315" rx="70" ry="45" fill="#F5E6D3" />
          
          {/* Brand Purple Hoodie Collar/Scarf */}
          <path d="M110 280 Q200 310 290 280 L290 260 Q200 285 110 260 Z" fill="#6C63FF" />
          {/* Scarf knot / detail */}
          <path d="M185 272 L215 272 L200 295 Z" fill="#5046e5" />
        </g>

        {/* === ARMS === */}
        <g id="kai-arms" className={`kai-arms kai-arms--${armState}`}>
          {/* Left Arm/Paw */}
          <ellipse 
            id="kai-arm-left" 
            cx="100" 
            cy="300" 
            rx="28" 
            ry="40" 
            fill="#2D2A26" 
            className="origin-top transition-transform duration-300"
          />
          {/* Right Arm/Paw */}
          <ellipse 
            id="kai-arm-right" 
            cx="300" 
            cy="300" 
            rx="28" 
            ry="40" 
            fill="#2D2A26" 
            className="origin-top transition-transform duration-300"
          />
        </g>

        {/* === HEAD === */}
        <g id="kai-head" className="kai-head origin-center transition-transform duration-300">
          {/* Base Head Circle */}
          <circle cx="200" cy="180" r="120" fill="#2D2A26" />

          {/* Ears */}
          <g id="kai-ears" className={`kai-ears kai-ears--${earState}`}>
            {/* Left Ear */}
            <circle id="ear-left" cx="110" cy="80" r="38" fill="#2D2A26" />
            <circle id="ear-left-inner" cx="110" cy="85" r="20" fill="#F5E6D3" />
            
            {/* Right Ear */}
            <circle id="ear-right" cx="290" cy="80" r="38" fill="#2D2A26" />
            <circle id="ear-right-inner" cx="290" cy="85" r="20" fill="#F5E6D3" />
          </g>

          {/* Face patch (Cream) */}
          <ellipse cx="200" cy="200" rx="85" ry="75" fill="#F5E6D3" />

          {/* Eyes */}
          <g id="kai-eyes" className={`kai-eyes kai-eyes--${eyeState} ${blinkState ? 'kai-eyes--blink' : ''} transition-all duration-300`}>
            {/* Left Eye */}
            <circle id="eye-left" cx="165" cy="180" r="16" fill="#2D2A26" className="transition-all duration-300" />
            {!blinkState && <circle id="eye-left-highlight" cx="170" cy="174" r="5" fill="#FFFFFF" />}
            
            {/* Right Eye */}
            <circle id="eye-right" cx="235" cy="180" r="16" fill="#2D2A26" className="transition-all duration-300" />
            {!blinkState && <circle id="eye-right-highlight" cx="240" cy="174" r="5" fill="#FFFFFF" />}
          </g>

          {/* Nose */}
          <ellipse cx="200" cy="210" rx="14" ry="10" fill="#2D2A26" />

          {/* Mouth — Lip sync target */}
          <g id="kai-mouth">
            <path d={MOUTH_SHAPES[mouthShape]} fill="#1A1815" className="transition-all duration-75" />
          </g>
        </g>
      </svg>
    </div>
  );
}
