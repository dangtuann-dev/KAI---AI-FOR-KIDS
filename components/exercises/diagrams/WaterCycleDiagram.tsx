// components/exercises/diagrams/WaterCycleDiagram.tsx
'use client';

import React from 'react';

interface Props {
  selectedHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  assignedLabels: Record<string, string>;
}

export function WaterCycleDiagram({ selectedHotspot, onSelectHotspot, assignedLabels }: Props) {
  const hotspots = [
    { id: 'evaporation', label: 'Bốc hơi', x: 160, y: 135 },
    { id: 'condensation', label: 'Ngưng tụ', x: 130, y: 55 },
    { id: 'precipitation', label: 'Mưa', x: 50, y: 85 },
    { id: 'runoff', label: 'Dòng chảy', x: 75, y: 155 },
  ];

  return (
    <div className="relative w-full max-w-[280px] aspect-square bg-slate-900/40 rounded-2xl p-2 border border-slate-700/30 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Sky gradient background */}
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="190" height="190" rx="20" fill="url(#skyGrad)" />

        {/* Mountain */}
        <path d="M 5 200 L 40 120 L 80 150 L 110 100 L 150 180 L 150 200 Z" fill="#64748b" opacity="0.8" />
        {/* Snow caps */}
        <path d="M 40 120 L 32 135 L 48 135 Z" fill="#ffffff" />
        <path d="M 110 100 L 102 115 L 118 115 Z" fill="#ffffff" />

        {/* Ocean/Water body at bottom right */}
        <path d="M 130 200 C 140 170 170 170 200 180 L 200 200 Z" fill="#0284c7" />
        <path d="M 110 200 L 135 185 Q 160 175 200 180" stroke="#025a91" strokeWidth="2" fill="none" />

        {/* Sun */}
        <circle cx="100" cy="30" r="12" fill="#f59e0b" />
        <path d="M 100 12 L 100 15 M 100 45 L 100 48 M 82 30 L 85 30 M 115 30 L 118 30" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

        {/* Clouds */}
        {/* Left Cloud (Precipitation) */}
        <g opacity="0.95" fill="#94a3b8">
          <ellipse cx="45" cy="55" rx="15" ry="10" />
          <ellipse cx="60" cy="55" rx="12" ry="8" />
          <ellipse cx="35" cy="60" rx="10" ry="7" />
          <rect x="35" y="50" width="25" height="15" />
        </g>
        {/* Rain lines */}
        <path d="M 35 75 L 30 90 M 45 75 L 40 90 M 55 75 L 50 90 M 65 75 L 60 90" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

        {/* Right Cloud (Condensation) */}
        <g opacity="0.9" fill="#f8fafc">
          <ellipse cx="145" cy="45" rx="15" ry="10" />
          <ellipse cx="160" cy="45" rx="12" ry="8" />
          <ellipse cx="135" cy="50" rx="10" ry="7" />
          <rect x="135" y="40" width="25" height="15" />
        </g>

        {/* Evaporation Arrow */}
        <path d="M 175 170 Q 185 145 170 120" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="4 2" />
        <path d="M 167 125 L 170 120 L 175 124" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Runoff Arrow */}
        <path d="M 90 125 Q 75 140 85 165" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 80 160 L 85 165 L 88 158" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" fill="none" />

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
