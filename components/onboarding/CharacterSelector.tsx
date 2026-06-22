// components/onboarding/CharacterSelector.tsx
'use client';

import React, { useState } from 'react';
import { CHARACTER_ROSTER, KaiCharacter } from '@/lib/characters';
import KaiCharacterComponent from '../character/KaiCharacter';
import { Volume2, Sparkles, Wand2, Shield, Compass, BookOpen } from 'lucide-react';

interface Props {
  onSelect: (characterId: string, nickname: string) => void;
}

export function CharacterSelector({ onSelect }: Props) {
  const [step, setStep] = useState<'egg' | 'select' | 'nickname'>('egg');
  const [selectedChar, setSelectedChar] = useState<KaiCharacter | null>(null);
  const [nickname, setNickname] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const [voiceAudio, setVoiceAudio] = useState<HTMLAudioElement | null>(null);

  // Play Character preview voice
  const handlePlayVoice = async (e: React.MouseEvent, char: KaiCharacter) => {
    e.stopPropagation();
    if (isPlayingVoice) {
      if (voiceAudio) {
        voiceAudio.pause();
      }
      setIsPlayingVoice(null);
      return;
    }

    setIsPlayingVoice(char.id);
    const previewTexts: Record<string, string> = {
      giong: 'Chào bạn! Mình là Gióng Nhỏ. Hãy cùng nhau khám phá những kiến thức mới và vượt qua mọi thử thách khó khăn nhé!',
      thach_sanh: 'Chào bạn nhé! Mình là Sanh Bé. Mình sẽ luôn đồng hành thật trung thực và giúp đỡ bạn học tập tốt nhất!',
      son_tinh: 'Chào bé yêu! Tinh Núi đây. Mình cùng học kiên nhẫn và bền bỉ như những ngọn núi hùng vĩ nước Việt nhé!',
      an_tiem: 'Ồ chào bạn! Tiêm Nhỏ đây. Hôm nay chúng mình có câu hỏi nào thú vị không nhỉ? Hãy cùng suy nghĩ nhé!',
      ca_chep: 'Chào bạn! Chép Vàng đây. Hãy cùng mình chăm chỉ tiến bộ mỗi ngày để hóa rồng bay cao nhé!',
      kim_quy: 'Chào bé! Quy Thần thông thái đây. Rất vui được kể cho bé nghe những bài học trí tuệ hào hùng của ông cha ta!',
      lac_hong: 'Chào bạn thân mến! Hồng Bé đây. Hãy cùng học tập đoàn kết và yêu thương gia đình, quê hương nhé!',
      chu_dong_tu: 'Chào bạn! Đồng Tử đây. Không sao cả, gặp bài khó chúng mình cùng thử lại là sẽ làm được thôi!',
    };

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewTexts[char.id] || 'Xin chào bạn học!',
          characterId: char.id
        })
      });

      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setVoiceAudio(audio);
      audio.play();
      audio.onended = () => {
        setIsPlayingVoice(null);
      };
    } catch (err) {
      console.error(err);
      setIsPlayingVoice(null);
    }
  };

  const handleNextStep = () => {
    if (step === 'egg') {
      setStep('select');
    } else if (step === 'select' && selectedChar) {
      setNickname(selectedChar.nickname);
      setStep('nickname');
    } else if (step === 'nickname' && selectedChar && nickname.trim()) {
      if (voiceAudio) {
        voiceAudio.pause();
      }
      onSelect(selectedChar.id, nickname.trim());
    }
  };

  const getCoreValueIcon = (val: string) => {
    if (val.includes('Dũng cảm')) return <Shield className="w-4 h-4 text-rose-500" />;
    if (val.includes('Trung thực') || val.includes('Nhân ái')) return <Wand2 className="w-4 h-4 text-amber-500" />;
    if (val.includes('Sáng tạo') || val.includes('Hiếu học')) return <BookOpen className="w-4 h-4 text-purple-500" />;
    return <Compass className="w-4 h-4 text-teal-500" />;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border-4 border-purple-100 rounded-[32px] shadow-2xl w-full max-w-4xl min-h-[480px]">
      
      {/* 1. EGG STAGE */}
      {step === 'egg' && (
        <div className="flex flex-col items-center text-center gap-6 py-6 animate-fade-in">
          {/* Glowing folklore egg rendering */}
          <div className="relative w-44 h-56 flex items-center justify-center">
            {/* Ambient glows */}
            <div className="absolute inset-0 bg-purple-400/30 blur-3xl rounded-full animate-pulse scale-90" />
            <div className="absolute inset-0 bg-yellow-300/20 blur-2xl rounded-full animate-bounce scale-75" />

            {/* Glowing egg SVG */}
            <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-[0_10px_15px_rgba(147,51,234,0.3)] animate-pulse">
              <defs>
                <linearGradient id="eggGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="50%" stopColor="#FDA4AF" />
                  <stop offset="100%" stopColor="#FDE047" />
                </linearGradient>
              </defs>
              {/* Egg body */}
              <path 
                d="M 50 10 C 20 10, 5 70, 5 95 C 5 115, 25 125, 50 125 C 75 125, 95 115, 95 95 C 95 70, 80 10, 50 10 Z" 
                fill="url(#eggGrad)" 
                stroke="#FAF5FF" 
                strokeWidth="3"
              />
              {/* Mythical scale details on egg */}
              <path d="M 45 45 Q 50 50 55 45" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M 35 65 Q 42 70 50 65 Q 58 70 65 65" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M 25 85 Q 37 90 50 85 Q 63 90 75 85" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
              
              {/* Sparkling highlights */}
              <circle cx="25" cy="40" r="2.5" fill="#FFFFFF" />
              <circle cx="75" cy="70" r="3.5" fill="#FFFFFF" />
              <polygon points="50,25 53,30 58,30 54,34 56,39 50,36 44,39 46,34 42,30 47,30" fill="#FFFFFF" opacity="0.9" />
            </svg>
          </div>

          <div className="space-y-3 max-w-lg">
            <h2 className="text-2xl font-black text-slate-800 font-display tracking-tight">
              Quả trứng Cổ Tích Lấp Lánh! 🥚✨
            </h2>
            <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">
              "Ngày xửa ngày xưa, có 8 linh thú từ truyền thuyết Việt Nam đang tìm kiếm một người bạn dũng cảm, thông thái để cùng nhau lớn lên..."
            </p>
          </div>

          <button
            onClick={handleNextStep}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-display font-black text-sm shadow-lg hover:shadow-purple-200 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 group"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            Đánh thức quả trứng!
          </button>
        </div>
      )}

      {/* 2. CHARACTER SELECTION GRID */}
      {step === 'select' && (
        <div className="flex flex-col w-full h-full gap-5 animate-fade-in">
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800 font-display">Chọn Bạn Đồng Hành Của Bé</h2>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Bé thích nhân vật cổ tích Việt Nam nào dưới đây?</p>
          </div>

          {/* Grid of characters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-[350px] p-1.5 custom-scrollbar">
            {CHARACTER_ROSTER.map((char) => {
              const isSelected = selectedChar?.id === char.id;
              const isVoicePlaying = isPlayingVoice === char.id;

              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  style={{ borderColor: isSelected ? char.colorPalette.primary : undefined }}
                  className={`cursor-pointer border-3 rounded-2xl p-3 flex flex-col items-center justify-between text-center transition-all relative overflow-hidden group min-h-[190px] ${
                    isSelected 
                      ? 'bg-purple-50/50 shadow-md scale-102' 
                      : 'bg-slate-50 hover:bg-slate-100/50 border-slate-200'
                  }`}
                >
                  {/* Miniature Skinned Avatar stage */}
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative p-1 shadow-sm">
                    <KaiCharacterComponent state={isSelected ? 'happy' : 'idle'} characterId={char.id} />
                  </div>

                  {/* Info text */}
                  <div className="my-1.5 flex flex-col">
                    <span className="font-display font-black text-slate-800 text-xs">{char.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold mt-0.5">{char.origin}</span>
                  </div>

                  {/* Core Value highlight */}
                  <div className="flex items-center justify-center gap-1 bg-white border border-slate-100 rounded-lg px-1.5 py-0.5 mt-0.5 text-[8px] font-bold text-slate-500 w-full max-w-[120px] truncate">
                    {getCoreValueIcon(char.coreValue)}
                    <span>{char.coreValue}</span>
                  </div>

                  {/* Speaker voice preview button */}
                  <button
                    onClick={(e) => handlePlayVoice(e, char)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all border shadow-sm active:scale-90 ${
                      isVoicePlaying
                        ? 'bg-purple-600 text-white border-purple-700 animate-pulse'
                        : 'bg-white text-slate-400 border-slate-100 hover:text-purple-600'
                    }`}
                    title="Nghe thử giọng nói của bạn"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected character details card preview */}
          {selectedChar && (
            <div 
              style={{ backgroundColor: `${selectedChar.colorPalette.primary}10`, borderColor: selectedChar.colorPalette.primary }}
              className="p-3 border-2 rounded-2xl flex flex-col md:flex-row items-center gap-4 w-full animate-fade-in"
            >
              <div className="flex flex-col gap-0.5 md:flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <span className="font-display font-black text-slate-800 text-sm">{selectedChar.name}</span>
                  <span className="text-[9px] bg-white border px-1.5 py-0.5 rounded-md font-black text-slate-500 uppercase tracking-widest">
                    {selectedChar.origin}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">{selectedChar.personality}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[9px] bg-white px-2 py-0.5 border border-slate-150 rounded-md font-bold text-slate-600 flex items-center gap-1">
                    🌟 Kỹ năng: {selectedChar.specialAbility}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            disabled={!selectedChar}
            onClick={handleNextStep}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl font-display font-black text-sm shadow-md transition-all active:scale-[0.98]"
          >
            Chọn {selectedChar ? selectedChar.name : 'nhân vật'} & Tiếp tục
          </button>
        </div>
      )}

      {/* 3. NICKNAME STAGE */}
      {step === 'nickname' && selectedChar && (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md py-6 animate-fade-in">
          <div className="w-32 h-32 bg-slate-900 border-4 border-slate-800 rounded-[32px] overflow-hidden p-2 shadow-lg relative flex items-center justify-center">
            <KaiCharacterComponent state="happy" characterId={selectedChar.id} />
          </div>

          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-black text-slate-800 font-display">Đặt Tên Thân Mật Cho Bạn!</h2>
            <p className="text-xs font-bold text-slate-400">
              Bé muốn gọi {selectedChar.name} là gì khi chúng mình cùng học?
            </p>
          </div>

          <div className="w-full space-y-4">
            <input
              type="text"
              maxLength={15}
              placeholder={`Tên thân mật (Ví dụ: ${selectedChar.nickname})`}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-purple-100 hover:border-purple-200 focus:border-purple-400 rounded-2xl outline-none font-bold text-sm text-slate-700 text-center transition-colors shadow-inner"
            />

            <button
              disabled={!nickname.trim()}
              onClick={handleNextStep}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:bg-slate-200 text-white disabled:text-slate-450 rounded-xl font-display font-black text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Bắt đầu hành trình học tập!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
