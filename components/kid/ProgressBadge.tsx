// components/kid/ProgressBadge.tsx
'use client';

import React from 'react';
import { Flame, Award, Sparkles, Star } from 'lucide-react';
import { LEVEL_THRESHOLDS, ACHIEVEMENT_BADGES } from '@/lib/gamification';
import { CHARACTER_ROSTER } from '@/lib/characters';

interface ProgressBadgeProps {
  streakDays: number;
  totalSessions?: number;
  xp?: number;
  level?: number;
  evolutionStage?: number;
  characterId?: string;
  characterNickname?: string;
}

export default function ProgressBadge({
  streakDays,
  totalSessions = 0,
  xp = 0,
  level = 1,
  evolutionStage = 0,
  characterId = 'giong',
  characterNickname = 'Gióng'
}: ProgressBadgeProps) {
  
  // Find current character config
  const char = CHARACTER_ROSTER.find(c => c.id === characterId) || CHARACTER_ROSTER[0];
  const evolutionName = char.evolutionStages[evolutionStage] || char.evolutionStages[0];

  // Calculate XP progress bar metrics
  const currentLevelIdx = Math.max(1, Math.min(level, LEVEL_THRESHOLDS.length)) - 1;
  const prevThreshold = LEVEL_THRESHOLDS[currentLevelIdx] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevelIdx + 1] || prevThreshold + 100;
  
  const xpInCurrentLevel = Math.max(0, xp - prevThreshold);
  const xpNeededForNextLevel = nextThreshold - prevThreshold;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  // Determine active badges based on progress metrics
  const activeBadges = ACHIEVEMENT_BADGES.map(badge => {
    let isActive = false;
    if (badge.id === 'trong_dong') isActive = totalSessions >= 1; // Unlocked early
    else if (badge.id === 'ao_dai') isActive = streakDays >= 7;
    else if (badge.id === 'hoa_sen') isActive = streakDays >= 3;
    else if (badge.id === 'rong_vang') isActive = level >= 5;
    else if (badge.id === 'sao_khue') isActive = level >= 10;
    else if (badge.id === 'hieu_hoc') isActive = totalSessions >= 3;
    else if (badge.id === 'nhan_ai') isActive = level >= 2;
    else if (badge.id === 'kien_tri') isActive = totalSessions >= 2;
    else if (badge.id === 'truyen_co') isActive = level >= 3;
    else if (badge.id === 'di_san') isActive = level >= 4;

    return { ...badge, active: isActive };
  });

  return (
    <div className="flex flex-col gap-2.5 p-4 bg-white border-2 border-purple-100 rounded-3xl shadow-md w-full transition-all hover:shadow-lg">
      
      {/* Top Row: Character nickname, level, streak */}
      <div className="flex items-center justify-between w-full">
        {/* Companion & Evolution name */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: char.colorPalette.primary }} />
            <span className="font-display font-black text-slate-800 text-sm tracking-wide">
              {characterNickname}
            </span>
          </div>
          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest pl-3">
            {evolutionName}
          </span>
        </div>

        {/* Level and Streak display */}
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div className="flex items-center gap-1 bg-purple-50 border border-purple-100 px-2 py-1 rounded-xl">
            <Star className="w-3.5 h-3.5 text-purple-600 fill-purple-300" />
            <span className="text-xs font-black text-purple-700 font-display">
              Cấp {level}
            </span>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl" title="Chuỗi ngày học liên tục">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-xs font-black text-amber-600 font-display">
              {streakDays} Ngày
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: XP Progress bar */}
      <div className="flex flex-col w-full gap-1">
        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
          <span>Tiến trình XP</span>
          <span>{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-[2px]">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ 
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${char.colorPalette.primary} 0%, ${char.colorPalette.secondary} 100%)`
            }}
          >
            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Row: Folklore Badges showcase */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-0.5 w-full">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-purple-400" /> Huy Hiệu Việt
        </span>
        <div className="flex gap-1">
          {activeBadges.slice(0, 5).map((badge) => (
            <div
              key={badge.id}
              className={`relative flex items-center justify-center w-7 h-7 rounded-xl border transition-all duration-300 ${
                badge.active 
                  ? 'bg-purple-50/60 border-purple-200 cursor-help scale-100 hover:scale-110 shadow-sm' 
                  : 'bg-slate-50 border-slate-100 grayscale opacity-30 cursor-not-allowed scale-90'
              }`}
              title={badge.active ? `${badge.name}: ${badge.condition}` : `Chưa mở khóa: ${badge.condition}`}
            >
              <span className="text-sm select-none">{badge.icon}</span>
              {badge.active && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
