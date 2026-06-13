// components/exercises/diagrams/DigestiveSystemDiagram.tsx
'use client';

import React from 'react';

interface Props {
  selectedHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  assignedLabels: Record<string, string>;
}

export function DigestiveSystemDiagram({ selectedHotspot, onSelectHotspot, assignedLabels }: Props) {
  const hotspots = [
    { id: 'mouth', label: 'Miệng', x: 100, y: 35 },
    { id: 'stomach', label: 'Dạ dày', x: 85, y: 100 },
    { id: 'intestines', label: 'Ruột', x: 105, y: 145 },
  ];

  return (
    <div className="relative w-full max-w-[280px] aspect-square bg-slate-900/40 rounded-2xl p-2 border border-slate-700/30 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Simple Body Outline */}
        <path d="M 100 20 C 120 20 125 45 125 60 C 125 75 140 85 145 105 C 150 125 145 190 145 200 L 55 200 C 55 190 50 125 55 105 C 60 85 75 75 75 60 C 75 45 80 20 100 20 Z" fill="#e2e8f0" opacity="0.15" stroke="#94a3b8" strokeWidth="2" />

        {/* Head profile details */}
        <path d="M 100 25 C 105 25 112 28 112 35 C 112 40 107 43 103 43 C 103 47 101 49 98 49" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.3" />

        {/* Mouth/Oral Cavity */}
        <path d="M 97 32 Q 104 33 102 38 Z" fill="#fda4af" />
        
        {/* Esophagus (Tiêu hóa quản) */}
        <path d="M 100 38 L 100 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* Stomach (Dạ dày) */}
        {/* Reddish curved J shape */}
        <path d="M 100 85 Q 75 80 70 100 C 65 120 95 125 105 110 Q 100 95 100 85 Z" fill="#ef4444" opacity="0.85" stroke="#b91c1c" strokeWidth="1" />

        {/* Intestines (Ruột) */}
        {/* Coiled shape */}
        <g opacity="0.8">
          {/* Large intestine outline */}
          <path d="M 80 125 L 120 125 L 120 160 L 80 160 Z" fill="none" stroke="#ea580c" strokeWidth="8" strokeLinejoin="round" />
          {/* Small intestine scribble */}
          <path d="M 85 133 Q 100 130 115 133 Q 110 142 95 140 Q 100 150 115 148" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Hotspots Overlay */}
        {hotspots.map((hs, idx) => {
          const isSelected = selectedHotspot === hs.id;
          const label = assignedLabels[hs.id];
          
          return (
            <g
              key={hs.id}
              className="cursor-pointer select-none group"
              onClick={() => onSelectHotspot(hs.id)}
            >
              {/* Highlight Ring */}
              <circle
                cx={hs.x}
                cy={hs.y}
                r={isSelected ? 16 : 12}
                className={`transition-all duration-300 fill-none stroke-2 ${
                  isSelected 
                    ? 'stroke-yellow-400 animate-ping' 
                    : 'stroke-white/30 group-hover:stroke-white/60'
                }`}
              />

              {/* Base Circle */}
              <circle
                cx={hs.x}
                cy={hs.y}
                r={10}
                className={`transition-all duration-300 ${
                  isSelected
                    ? 'fill-yellow-400 stroke-yellow-500'
                    : label
                    ? 'fill-emerald-500 stroke-emerald-600'
                    : 'fill-purple-600 stroke-purple-500'
                } stroke-2`}
              />

              {/* Number or Checkmark */}
              <text
                x={hs.x}
                y={hs.y + 3}
                textAnchor="middle"
                className="font-bold text-[9px] fill-white select-none"
              >
                {label ? '✓' : idx + 1}
              </text>

              {/* Floating Badge for assigned label */}
              {label && (
                <g transform={`translate(${hs.x}, ${hs.y - 18})`}>
                  {/* Badge background */}
                  <rect
                    x={-24}
                    y={-7}
                    width={48}
                    height={12}
                    rx={4}
                    className="fill-emerald-600 stroke-emerald-400 stroke-[0.5]"
                  />
                  {/* Badge text */}
                  <text
                    x={0}
                    y={1.5}
                    textAnchor="middle"
                    className="font-bold text-[7px] fill-white select-none"
                  >
                    {label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
