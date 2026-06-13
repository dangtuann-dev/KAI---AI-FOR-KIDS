'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Send, Keyboard, Mic, WifiOff, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import SubjectSelector, { getSubjectsForGrade } from '@/components/kid/SubjectSelector';
import GradeSelector from '@/components/kid/GradeSelector';
import ProgressBadge from '@/components/kid/ProgressBadge';
import ChatHistory from '@/components/chat/ChatHistory';
import OwlAvatar from '@/components/chat/OwlAvatar';
import VoiceButton, { VoiceState } from '@/components/voice/VoiceButton';
import { speakText } from '@/lib/tts-client';
import KaiCharacter from '@/components/character/KaiCharacter';
import CaptionBar from '@/components/workspace/CaptionBar';
import ChatLogDrawer from '@/components/workspace/ChatLogDrawer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  is_voice?: boolean;
}

export default function LearnPage() {
  const router = useRouter();
  
  // Auth state
  const [student, setStudent] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  
  // Workspace states
  const [selectedGrade, setSelectedGrade] = useState<number>(3);
  const [selectedSubject, setSelectedSubject] = useState<string>('math');
  const [sessionId, setSessionId] = useState<string>('');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [mascotText, setMascotText] = useState('Đang khởi động KAI...');
  
  // Character & Subtitle States
  const [characterState, setCharacterState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'encourage'>('idle');
  const [activeCaption, setActiveCaption] = useState<{ speaker: 'user' | 'kai'; text: string } | null>(null);
  const [chatLogOpen, setChatLogOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // UI helper states
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const currentAudioRef = useRef<HTMLAudioElement | SpeechSynthesisUtterance | null>(null);

  // Monitor screen size for responsive layouts
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Synchronize characterState with voiceState changes from VoiceButton
  useEffect(() => {
    switch (voiceState) {
      case 'recording':
        setCharacterState('listening');
        break;
      case 'processing':
        setCharacterState('thinking');
        break;
      case 'playing':
        setCharacterState('speaking');
        break;
      case 'idle':
        setCharacterState((prev) => {
          if (prev === 'happy' || prev === 'encourage') return prev;
          return 'idle';
        });
        break;
    }
  }, [voiceState]);

  // Trigger custom toast notification
  const showToast = (text: string, type: 'error' | 'warning' | 'success' = 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Monitor network connection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Đã kết nối Internet trở lại! 📶', 'success');
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Mất kết nối rồi! KAI đang chờ bé quay lại 🐻', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset selected subject if it's not valid for the selected grade (GDPT 2018 validation)
  useEffect(() => {
    const validSubjects = getSubjectsForGrade(selectedGrade);
    const isValid = validSubjects.some(s => s.id === selectedSubject);
    if (!isValid && validSubjects.length > 0) {
      setSelectedSubject(validSubjects[0].id);
    }
  }, [selectedGrade, selectedSubject]);

  // Check auth and fetch student profile
  useEffect(() => {
    async function loadStudent() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setStudent(user);

      // Fetch profile & student profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: stdProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setStudentProfile({
          ...profile,
          ...stdProfile
        });
        
        if (stdProfile?.grade) {
          setSelectedGrade(stdProfile.grade);
        }
      }
    }
    
    loadStudent();
  }, [router]);

  // Create new session whenever student, grade or subject changes
  useEffect(() => {
    if (!student) return;

    async function initSession() {
      setIsTyping(true);
      setMascotText('KAI đang chuẩn bị bài học...');
      
      const supabase = createClient();
      
      // End previous session if it exists (update duration/ended_at)
      if (sessionId) {
        try {
          await supabase
            .from('chat_sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', sessionId);
        } catch (e) {}
      }

      // Create new session
      try {
        const { data: newSession, error } = await supabase
          .from('chat_sessions')
          .insert({
            student_id: student.id,
            subject: selectedSubject,
            grade: selectedGrade,
            ai_model_used: 'llama-3.3-70b-versatile'
          })
          .select()
          .single();

        if (error) throw error;
        
        setSessionId(newSession.id);

        // Create initial greetings message based on subject
        const greetingTexts: Record<string, string> = {
          math: `Chào Bé ${studentProfile?.full_name || ''}! Hôm nay chúng mình sẽ cùng học Toán lớp ${selectedGrade} nhé. Bé đang gặp khó khăn ở bài toán nào thế? 🔢`,
          vietnamese: `KAI chào bé! Chúng mình cùng học Tiếng Việt lớp ${selectedGrade} nhé. Bé muốn tập đọc, tập viết hay làm văn cùng KAI? 📖`,
          science: `Chào bé yêu khoa học! Hôm nay KAI sẽ giải đáp cho bé các câu hỏi kỳ thú về tự nhiên lớp ${selectedGrade}. Bé tò mò về điều gì nào? 🔬`,
          english: `Hello friend! Cùng KAI luyện nói Tiếng Anh nhé. Bé muốn học từ vựng về chủ đề gì ngày hôm nay nào? 🔤`,
          ethics: `KAI chào bé ngoan! Hôm nay chúng mình cùng học Đạo đức lớp ${selectedGrade} và trò chuyện về những thói quen tốt nhé. 🤝`,
          history: `Chào bé! Hôm nay chúng mình sẽ du hành lịch sử và địa lý lớp ${selectedGrade} cùng KAI nhé. Bé muốn khám phá vùng đất nào? 🌍`,
        };

        const initialGreeting = greetingTexts[selectedSubject] || `Chào Bé! KAI sẵn sàng giúp bé ôn bài rồi. Hôm nay bé muốn hỏi gì KAI? 🌟`;

        // Save greeting to DB
        await supabase.from('chat_messages').insert({
          session_id: newSession.id,
          student_id: student.id,
          role: 'assistant',
          content: initialGreeting,
          is_voice: false
        });

        // Set messages list
        const initialMsg = {
          id: 'greeting',
          role: 'assistant' as const,
          content: initialGreeting,
          is_voice: false
        };
        
        setMessages([initialMsg]);
        setMascotText(`Học môn ${
          selectedSubject === 'math' ? 'Toán' : 
          selectedSubject === 'vietnamese' ? 'Tiếng Việt' : 
          selectedSubject === 'science' ? 'Khoa học' : 'học tập'
        } lớp ${selectedGrade} thôi!`);

        // Automatically read aloud the greeting
        playTTS(initialGreeting);
      } catch (err) {
        console.error('Session init error:', err);
        showToast('Không thể kết nối hệ thống học tập. Bé hãy nhấn thử lại nhé!');
      } finally {
        setIsTyping(false);
      }
    }

    initSession();
  }, [student, selectedSubject, selectedGrade]);

  // Helper to detect correct or incorrect answers for mascot state
  const detectEncouragement = (text: string): 'happy' | 'encourage' | null => {
    const lowercase = text.toLowerCase();
    const happyPatterns = ['đúng rồi', 'giỏi quá', 'xuất sắc', 'tuyệt vời', 'chính xác', 'tuyệt cú mèo'];
    const encouragePatterns = ['gần đúng', 'thử lại', 'cố lên', 'suy nghĩ thêm'];
    
    if (happyPatterns.some(p => lowercase.includes(p))) return 'happy';
    if (encouragePatterns.some(p => lowercase.includes(p))) return 'encourage';
    return null;
  };

  // Handle playing TTS text and syncing mascot speaking state
  const playTTS = async (text: string) => {
    setVoiceState('playing');
    setCharacterState('speaking');
    setActiveCaption({ speaker: 'kai', text });
    
    // Stop any current audio
    if (currentAudioRef.current) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (currentAudioRef.current instanceof HTMLAudioElement) {
        currentAudioRef.current.pause();
      }
    }

    try {
      const audioObj = await speakText(
        text,
        () => {
          setVoiceState('playing');
          setCharacterState('speaking');
        },
        () => {
          const encouragement = detectEncouragement(text);
          if (encouragement) {
            setCharacterState(encouragement);
            setTimeout(() => {
              setCharacterState('idle');
              setActiveCaption(null);
            }, 2000);
          } else {
            setCharacterState('idle');
            setActiveCaption(null);
          }
          setVoiceState('idle');
          setCurrentAudio(null);
        }
      );
      
      currentAudioRef.current = audioObj;
      if (audioObj instanceof HTMLAudioElement) {
        setCurrentAudio(audioObj);
      } else {
        setCurrentAudio(null);
      }
    } catch (e) {
      console.error(e);
      setVoiceState('idle');
      setCharacterState('idle');
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    
    // End session before logout
    if (sessionId) {
      try {
        await supabase
          .from('chat_sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', sessionId);
      } catch (e) {}
    }

    await supabase.auth.signOut();
    router.push('/login');
  };

  // Text message submission
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isTyping) return;

    const userText = textInput.trim();
    setTextInput('');

    // Add user bubble
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      is_voice: false,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setActiveCaption({ speaker: 'user', text: userText });
    await getAIResponse(userText, false);
  };

  // Triggered when Whisper STT completes
  const handleVoiceTranscript = (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-voice-${Date.now()}`,
      role: 'user',
      content: text,
      is_voice: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setActiveCaption({ speaker: 'user', text });
  };

  // Triggers Groq Completion API call
  const getAIResponse = async (text: string, isVoiceInput: boolean) => {
    setIsTyping(true);
    setVoiceState('processing');
    setCharacterState('thinking');
    
    try {
      const payload = {
        messages: [...messages, { role: 'user', content: text, is_voice: isVoiceInput }],
        sessionId,
        grade: selectedGrade,
        subject: selectedSubject,
        studentId: student.id,
        studentName: studentProfile?.full_name || 'bé',
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        showToast('KAI đang nghỉ một chút, bé đợi thử lại sau 1 phút nhé! 🐻');
        setVoiceState('idle');
        setCharacterState('idle');
        return;
      }

      if (!res.ok) throw new Error('Chat API returned error');

      const data = await res.json();
      
      // Add AI bubble
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        is_voice: false,
      };

      setMessages((prev) => [...prev, aiMsg]);
      
      // Read response aloud
      await playTTS(data.content);

    } catch (err) {
      console.error(err);
      showToast('KAI bị nghẹn giọng rồi. Bé gõ tin nhắn thử lại nhé! 🐻');
      setVoiceState('idle');
      setCharacterState('idle');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full h-dvh max-h-dvh bg-white overflow-hidden relative select-none">
      
      {/* Sidebar for Desktop only (lg and larger) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-80 border-r border-slate-100 bg-white p-6 gap-6 shrink-0 h-full relative overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-display font-black text-xl tracking-wider text-[#6C63FF]">KAI LEARNING</span>
        </div>

        <div className="text-center bg-slate-50 border border-slate-100 rounded-3xl p-4 flex flex-col items-center">
          <OwlAvatar
            size="lg"
            state={voiceState === 'playing' ? 'speaking' : voiceState === 'recording' ? 'listening' : 'idle'}
            text={mascotText}
          />
          <h3 className="font-display text-lg font-black text-slate-800 mt-2">
            Chào {studentProfile?.full_name || 'Bé'}! 👋
          </h3>
          
          <div className="mt-3 w-full">
            <GradeSelector
              selectedGrade={selectedGrade}
              onSelectGrade={setSelectedGrade}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">
            Chọn môn học
          </p>
          <div className="flex flex-col gap-2">
            {getSubjectsForGrade(selectedGrade).map((s) => {
              const isActive = s.id === selectedSubject;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`transition-all duration-300 transform active:scale-95 border-2 flex items-center gap-3 px-4 py-2.5 rounded-2xl ${
                    isActive 
                      ? `${s.color} ${s.textColor} ${s.borderColor} shadow-sm font-black` 
                      : 'border-transparent bg-slate-50/70 hover:bg-slate-50 text-slate-600 font-bold'
                  }`}
                >
                  <span className={`text-base flex items-center justify-center shrink-0 p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-white shadow-sm' : 'bg-slate-100/80 text-slate-500'
                  }`}>
                    {s.icon}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="font-display text-xs tracking-wide">{s.name}</span>
                    {s.tag && (
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md mt-0.5 ${
                        s.tag === 'Tự chọn' 
                          ? 'bg-slate-200/60 text-slate-500' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {s.tag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          <ProgressBadge
            streakDays={studentProfile?.streak_days || 0}
            totalSessions={studentProfile?.total_sessions || 0}
          />
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-extrabold text-xs rounded-2xl transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Thoát tài khoản</span>
          </button>
        </div>
      </aside>

      {/* Main workspace column */}
      <main className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#F8F7FF] to-[#EEF0FF] min-w-0 relative">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="h-14 px-4 bg-white border-b border-purple-100 flex items-center justify-between shrink-0 shadow-sm z-10 lg:hidden">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-slate-500 hover:text-purple-600 font-extrabold text-xs bg-slate-50 hover:bg-purple-50 px-3 py-1.5 rounded-full transition-all active:scale-95 border border-slate-100"
            title="Thoát tài khoản"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-display">Thoát</span>
          </button>

          <span className="text-xl font-extrabold text-purple-600 tracking-wider font-display flex items-center gap-1.5">
            <span>KAI AI</span>
            {isOffline && <WifiOff className="w-4 h-4 text-rose-500 animate-pulse" />}
          </span>

          <div className="flex items-center gap-2">
            <GradeSelector
              selectedGrade={selectedGrade}
              onSelectGrade={setSelectedGrade}
            />
            <button
              onClick={() => setChatLogOpen(true)}
              className="p-2 bg-purple-50 hover:bg-purple-100 text-[#6C63FF] rounded-full transition-all border border-purple-100/50 active:scale-95 text-lg"
              title="Nhật ký bài học"
            >
              📜
            </button>
          </div>
        </header>

        {/* Desktop Header (Hidden on Mobile) */}
        <header className="hidden lg:flex h-14 px-6 bg-white border-b border-slate-100 items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 font-display">
              {mascotText}
            </span>
          </div>

          <button
            onClick={() => setChatLogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#6C63FF] font-bold font-display text-sm rounded-2xl transition-all border border-purple-100/50 active:scale-95"
            title="Nhật ký bài học"
          >
            <span>Nhật ký bài học</span>
            <span>📜</span>
          </button>
        </header>

        {/* Mobile Horizontal Subject Bar (Hidden on Desktop) */}
        <div className="bg-white shrink-0 border-b border-purple-50 lg:hidden">
          <SubjectSelector
            selectedId={selectedSubject}
            onSelectSubject={setSelectedSubject}
            grade={selectedGrade}
          />
        </div>

        {/* Mobile Gamified Streak & Badge Banner (Hidden on Desktop) */}
        <div className="p-3 bg-slate-50/50 shrink-0 lg:hidden">
          <ProgressBadge
            streakDays={studentProfile?.streak_days || 0}
            totalSessions={studentProfile?.total_sessions || 0}
          />
        </div>

        {/* KAI Character & Subtitles Stage */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 min-h-0 relative w-full">
          
          {/* Video Call Frame Container */}
          <div className="flex-1 w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 rounded-[32px] border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 my-2">
            
            {/* Live Video Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 text-white z-20 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black tracking-wider uppercase font-display">TRỰC TUYẾN</span>
            </div>

            {/* Video Call Shutter Frame Decoration (Top Right) */}
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-600/50" />
            {/* Video Call Shutter Frame Decoration (Bottom Left) */}
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-600/50" />
            {/* Video Call Shutter Frame Decoration (Bottom Right) */}
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-600/50" />

            {/* Mascot Stage */}
            <div className="flex-1 flex items-center justify-center min-h-0 w-full relative z-10">
              <KaiCharacter state={characterState} audioElement={currentAudio} />
            </div>

            {/* Subject/Topic water-mark on bottom corner of video feed */}
            <div className="absolute bottom-4 left-6 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-xl text-slate-300 text-[10px] font-bold uppercase tracking-widest z-15 border border-slate-700/30">
              {getSubjectsForGrade(selectedGrade).find(s => s.id === selectedSubject)?.name || 'KAI'} Feed
            </div>
          </div>

          {/* Subtitle Caption Stage */}
          <div className="w-full max-w-[720px] min-h-[96px] flex items-center justify-center py-2 shrink-0">
            {activeCaption && (
              <CaptionBar
                speaker={activeCaption.speaker}
                text={activeCaption.text}
                isActive={true}
                audioDuration={currentAudio?.duration ? currentAudio.duration * 1000 : undefined}
              />
            )}
          </div>
        </div>

        {/* Custom alert toast */}
        {toastMsg && (
          <div className="absolute top-44 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50 animate-bounce">
            <div className={`p-4 border-2 rounded-2xl text-xs font-bold text-center shadow-lg ${
              toastMsg.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' :
              toastMsg.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
              'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              {toastMsg.text}
            </div>
          </div>
        )}

        {/* Bottom Input Area */}
        <footer className="bg-white border-t border-purple-100 p-4 shrink-0 shadow-md flex justify-center w-full">
          <div className="w-full max-w-[720px] flex items-center justify-between gap-3">
            {/* Toggle input method button */}
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`p-3 border-2 rounded-full transition-all active:scale-90 ${
                showTextInput 
                  ? 'bg-purple-100 border-purple-200 text-purple-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-purple-600'
              }`}
              title={showTextInput ? 'Nói chuyện bằng giọng nói' : 'Nhập tin nhắn bằng chữ'}
            >
              {showTextInput ? <Mic className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
            </button>

            {showTextInput ? (
              /* Text input interface */
              <form onSubmit={handleSendText} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Hỏi KAI bài tập của bé..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border-2 border-purple-50 hover:border-purple-100 focus:border-purple-300 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isTyping}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all active:scale-95 shadow-md disabled:bg-slate-200 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              /* Voice-first holding interface */
              <div className="flex-1 flex justify-center">
                <VoiceButton
                  state={voiceState}
                  onChangeState={setVoiceState}
                  onTranscript={handleVoiceTranscript}
                  onResponse={(txt) => getAIResponse(txt, true)}
                  onError={(err) => showToast(err, 'error')}
                  size={isDesktop ? 'lg' : 'md'}
                />
              </div>
            )}
          </div>
        </footer>
      </main>

      {/* Drawer for full chat log history */}
      <ChatLogDrawer
        open={chatLogOpen}
        onClose={() => setChatLogOpen(false)}
        messages={messages}
        isTyping={isTyping}
      />
    </div>
  );
}
