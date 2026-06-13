// components/chat/OwlAvatar.tsx
'use client';

import React from 'react';
import KaiCharacter from '../character/KaiCharacter';

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

  // Map MascotState to CharacterState
  const getCharacterState = (): 'idle' | 'listening' | 'speaking' => {
    switch (state) {
      case 'listening':
        return 'listening';
      case 'speaking':
        return 'speaking';
      case 'idle':
      default:
        return 'idle';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 transition-all duration-300">
      <div className={`relative ${widthHeight}`}>
        <KaiCharacter state={getCharacterState()} />
      </div>

      {/* Text bubble under mascot */}
      {text && (
        <div className="mt-3 bg-white border-4 border-[#ECEBFF] rounded-2xl px-5 py-2 text-center max-w-[85%] shadow-sm">
          <p className="text-sm font-bold text-slate-700 font-display">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
