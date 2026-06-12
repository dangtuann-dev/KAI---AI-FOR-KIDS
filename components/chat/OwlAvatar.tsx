'use client';

import React from 'react';

type MascotState = 'idle' | 'listening' | 'speaking';

interface OwlAvatarProps {
  state: MascotState;
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function OwlAvatar({ state, text, size = 'md' }: OwlAvatarProps) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const widthHeight = sizeMap[size] || sizeMap.md;

  // Determine animation class based on state
  const getAnimationClass = () => {
    switch (state) {
      case 'listening':
        return 'animate-pulse scale-105';
      case 'speaking':
        return 'animate-speaking';
      case 'idle':
      default:
        return 'animate-bounce-slow';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 transition-all duration-300">
      <div className={`relative ${widthHeight} ${getAnimationClass()}`}>
        {/* Cute Graduation Cap */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-10 z-10 transition-transform duration-300">
          <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            {/* Cap Diamond */}
            <path d="M50 5L95 25L50 45L5 25L50 5Z" fill="#1E1E2C" />
            <path d="M50 5L95 25L50 45L5 25L50 5Z" stroke="#FFE082" strokeWidth="2" />
            {/* Cap Bottom */}
            <path d="M25 29V38C25 45 35 48 50 48C65 48 75 45 75 38V29" fill="#1E1E2C" />
            {/* Tassel */}
            <path d="M50 25L15 30V42" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
            <circle cx="15" cy="44" r="3" fill="#FFD166" />
          </svg>
        </div>

        {/* SVG Owl Body */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Shadow */}
          <ellipse cx="50" cy="92" rx="35" ry="6" fill="#DCD9FF" opacity="0.6" />

          {/* Ears */}
          <path d="M25 25L15 45H35L25 25Z" fill="#6C63FF" />
          <path d="M75 25L85 45H65L75 25Z" fill="#6C63FF" />
          <path d="M27 29L20 42H32L27 29Z" fill="#FF6B9D" />
          <path d="M73 29L80 42H68L73 29Z" fill="#FF6B9D" />

          {/* Wings */}
          {/* Left Wing */}
          <path 
            d="M15 50C10 50 5 60 10 75C12 80 20 75 22 70" 
            fill="#5A52E6" 
            className={`origin-right transition-transform duration-300 ${state === 'listening' ? 'rotate-12' : ''}`}
          />
          {/* Right Wing */}
          <path 
            d="M85 50C90 50 95 60 90 75C88 80 80 75 78 70" 
            fill="#5A52E6" 
            className={`origin-left transition-transform duration-300 ${state === 'listening' ? '-rotate-12' : ''}`}
          />

          {/* Feet */}
          <circle cx="40" cy="90" r="5" fill="#FFD166" />
          <circle cx="60" cy="90" r="5" fill="#FFD166" />

          {/* Main Body */}
          <circle cx="50" cy="60" r="32" fill="#6C63FF" />
          {/* Tummy */}
          <circle cx="50" cy="65" r="22" fill="#FFFFFF" />
          {/* Cute tummy feathers patterns */}
          <path d="M42 58C45 60 48 60 50 58M50 58C52 60 55 60 58 58" stroke="#DCD9FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 68C42 70 45 70 48 68M48 68C52 70 55 70 58 68" stroke="#DCD9FF" strokeWidth="2" strokeLinecap="round" />

          {/* Eyes Rings */}
          <circle cx="38" cy="48" r="13" fill="#FFEBF2" />
          <circle cx="62" cy="48" r="13" fill="#FFEBF2" />

          {/* Eyes (Pupils) */}
          <g className={state === 'speaking' ? 'animate-pulse' : ''}>
            {/* Left Pupil */}
            <circle cx="38" cy="48" r="7" fill="#1E1E2C" />
            <circle cx="36" cy="45" r="2.5" fill="#FFFFFF" /> {/* Eye highlight */}

            {/* Right Pupil */}
            <circle cx="62" cy="48" r="7" fill="#1E1E2C" />
            <circle cx="60" cy="45" r="2.5" fill="#FFFFFF" /> {/* Eye highlight */}
          </g>

          {/* Blushing Cheeks */}
          <circle cx="28" cy="58" r="3" fill="#FF6B9D" opacity="0.6" />
          <circle cx="72" cy="58" r="3" fill="#FF6B9D" opacity="0.6" />

          {/* Beak */}
          {state === 'speaking' ? (
            /* Animated Beak when speaking (opens and closes) */
            <path 
              d="M50 48L42 55L50 64L58 55Z" 
              fill="#FFD166" 
              stroke="#E2B13C" 
              strokeWidth="2"
              className="origin-center animate-bounce" 
            />
          ) : (
            /* Standard Beak */
            <path d="M50 48L43 55H57L50 48Z" fill="#FFD166" stroke="#E2B13C" strokeWidth="1" />
          )}
        </svg>
      </div>

      {/* Text bubble under mascot */}
      {text && (
        <div className="mt-3 bg-white border-4 border-[#ECEBFF] rounded-2xl px-5 py-2 text-center max-w-[85%] shadow-sm transform transition-all duration-300">
          <p className="text-sm font-bold text-slate-700 font-display">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
