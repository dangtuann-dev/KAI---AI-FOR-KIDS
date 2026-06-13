// components/exercises/diagrams/PlantPartsDiagram.tsx
'use client';

import React from 'react';

interface Props {
  selectedHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  assignedLabels: Record<string, string>;
}

export function PlantPartsDiagram({ selectedHotspot, onSelectHotspot, assignedLabels }: Props) {
  // Hotspots definitions with coordinates for rendering circles and badges
  const hotspots = [
    { id: 'flower', label: 'Hoa', x: 100, y: 35 },
    { id: 'leaf', label: 'Lá', x: 50, y: 95 },
    { id: 'fruit', label: 'Quả', x: 150, y: 115 },
    { id: 'stem', label: 'Thân', x: 100, y: 130 },
    { id: 'root', label: 'Rễ', x: 100, y: 185 },
  ];

  return (
    <div className="relative w-full max-w-[280px] aspect-square bg-slate-900/40 rounded-2xl p-2 border border-slate-700/30 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Background / Soil */}
        <path d="M 10 160 Q 100 155 190 160 L 190 200 L 10 200 Z" fill="#451A03" opacity="0.3" />
        
        {/* Roots */}
        <path d="M 100 160 Q 90 175 85 190" stroke="#78350F" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 100 160 Q 110 178 115 195" stroke="#78350F" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 100 160 Q 100 180 98 198" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 92 170 Q 80 175 75 180" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 108 172 Q 120 177 125 182" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Stem */}
        <rect x="96" y="55" width="8" height="105" rx="3" fill="#15803D" />

        {/* Leaves */}
        {/* Leaf Left */}
        <path d="M 96 100 C 60 90 50 110 96 115 Z" fill="#22C55E" />
        <path d="M 96 100 Q 75 102 55 105" stroke="#166534" strokeWidth="1" fill="none" />
        {/* Leaf Right */}
        <path d="M 104 80 C 140 70 150 90 104 95 Z" fill="#22C55E" />
        <path d="M 104 80 Q 125 82 145 85" stroke="#166534" strokeWidth="1" fill="none" />

        {/* Fruit */}
        <circle cx="138" cy="115" r="10" fill="#EF4444" />
        <circle cx="135" cy="112" r="3" fill="#FFFFFF" opacity="0.6" />
        <path d="M 138 105 Q 140 100 136 96" stroke="#166534" strokeWidth="2" fill="none" />

        {/* Flower */}
        {/* Petals */}
        <circle cx="100" cy="35" r="16" fill="#F43F5E" />
        <circle cx="84" cy="35" r="10" fill="#F43F5E" />
        <circle cx="116" cy="35" r="10" fill="#F43F5E" />
        <circle cx="100" cy="19" r="10" fill="#F43F5E" />
        <circle cx="100" cy="51" r="10" fill="#F43F5E" />
        {/* Center */}
        <circle cx="100" cy="35" r="8" fill="#FBBF24" />

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
