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

  const { blinkState, earState, armState } = useCharacterState(state);

  // Render eyes based on blink and KAI state
  const renderEyes = () => {
    if (blinkState) {
      // Blinking: horizontal flat lines
      return (
        <>
          <line x1="156" y1="137" x2="174" y2="137" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <line x1="226" y1="137" x2="244" y2="137" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    }

    if (state === 'happy' || state === 'encourage') {
      // Happy curves: ^ ^
      return (
        <>
          <path d="M 156 142 Q 165 128 174 142" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 226 142 Q 235 128 244 142" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      );
    }

    if (state === 'thinking') {
      // Thinking: curious flat lines
      return (
        <>
          <line x1="156" y1="134" x2="174" y2="134" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <line x1="226" y1="134" x2="244" y2="134" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    }

    if (state === 'listening') {
      // Attentive: wide vertical/square eyes
      return (
        <>
          <rect x="158" y="128" width="12" height="15" rx="3" fill="#FFFFFF" />
          <rect x="230" y="128" width="12" height="15" rx="3" fill="#FFFFFF" />
        </>
      );
    }

    // Default idle: slanted blocky eyes
    return (
      <>
        <line x1="158" y1="132" x2="172" y2="142" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <line x1="242" y1="132" x2="228" y2="142" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      </>
    );
  };

  return (
    <div className={`kai-character kai-character--${state} flex justify-center items-center`}>
      <svg 
        viewBox="0 0 400 400" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[320px] md:max-w-[360px] h-auto drop-shadow-xl"
      >
        {/* White circular framing card container */}
        <circle cx="200" cy="200" r="165" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="6" />

        {/* Drop shadow under the bear */}
        <ellipse cx="200" cy="345" rx="80" ry="10" fill="#E2E8F0" opacity="0.8" />

        {/* === LEGS === */}
        <g id="kai-legs">
          {/* Left Leg */}
          <rect x="155" y="305" width="34" height="40" rx="4" fill="#141417" />
          <rect x="155" y="340" width="34" height="5" rx="1.5" fill="#2E2E32" />
          
          {/* Right Leg */}
          <rect x="211" y="305" width="34" height="40" rx="4" fill="#28282B" />
          <rect x="211" y="340" width="34" height="5" rx="1.5" fill="#3E3E44" />
        </g>

        {/* === BODY === */}
        <g id="kai-body" className="kai-body origin-bottom transition-transform duration-300">
          {/* Base body rect */}
          <rect x="130" y="205" width="140" height="105" rx="8" fill="#1C1C1E" />
          
          {/* Voxel 3D Crease facets */}
          <polygon points="130,205 200,205 200,310 130,310" fill="#141417" />
          <polygon points="200,205 270,205 270,310 200,310" fill="#28282B" />
          
          {/* Diagonal crease shadows/highlights */}
          <polygon points="130,310 200,250 200,310" fill="#101012" />
          <polygon points="270,310 200,250 200,310" fill="#323236" />
        </g>

        {/* === ARMS === */}
        <g id="kai-arms" className={`kai-arms kai-arms--${armState}`}>
          {/* Left Arm */}
          <g id="kai-arm-left" className="origin-top transition-transform duration-300">
            <rect x="90" y="205" width="32" height="80" rx="6" fill="#141417" />
            <rect x="90" y="205" width="10" height="80" rx="4" fill="#0C0C0F" />
          </g>
          
          {/* Right Arm */}
          <g id="kai-arm-right" className="origin-top transition-transform duration-300">
            <rect x="278" y="205" width="32" height="80" rx="6" fill="#2A2A2E" />
            <rect x="298" y="205" width="12" height="80" rx="4" fill="#38383D" />
          </g>
        </g>

        {/* === HEAD === */}
        <g id="kai-head" className="kai-head origin-center transition-transform duration-300">
          {/* Ears */}
          <g id="kai-ears" className={`kai-ears kai-ears--${earState}`}>
            {/* Left Ear */}
            <rect id="ear-left" x="122" y="72" width="34" height="34" rx="6" fill="#141417" />
            <rect x="131" y="81" width="16" height="16" rx="3" fill="#F87171" opacity="0.6" />
            
            {/* Right Ear */}
            <rect id="ear-right" x="244" y="72" width="34" height="34" rx="6" fill="#28282B" />
            <rect x="253" y="81" width="16" height="16" rx="3" fill="#F87171" opacity="0.6" />
          </g>

          {/* Base Head Square */}
          <rect x="140" y="90" width="120" height="120" rx="16" fill="#1C1C1F" />
          
          {/* 3D Face Shading */}
          <path d="M 140 106 A 16 16 0 0 1 156 90 L 200 90 L 200 210 L 156 210 A 16 16 0 0 1 140 194 Z" fill="#121215" opacity="0.4" />
          <path d="M 200 90 L 244 90 A 16 16 0 0 1 260 106 L 260 194 A 16 16 0 0 1 244 210 L 200 210 Z" fill="#323236" opacity="0.15" />

          {/* Dynamic Voxel Eyes */}
          <g id="kai-eyes" className="transition-all duration-300">
            {renderEyes()}
          </g>

          {/* White Snout */}
          <rect x="180" y="150" width="40" height="30" rx="12" fill="#FFFFFF" />
          
          {/* Nose */}
          <rect x="194" y="154" width="12" height="8" rx="4" fill="#1C1C1F" />

          {/* Mouth — Lip sync target with translation scale */}
          <g id="kai-mouth">
            <path 
              d={MOUTH_SHAPES[mouthShape]} 
              fill="#1C1C1F" 
              transform="translate(0, -53) scale(0.65)" 
              className="transition-all duration-75 origin-center" 
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
