'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Send, Keyboard, Mic, WifiOff, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import SubjectSelector, { SUBJECTS } from '@/components/kid/SubjectSelector';
import GradeSelector from '@/components/kid/GradeSelector';
import ProgressBadge from '@/components/kid/ProgressBadge';
import ChatHistory from '@/components/chat/ChatHistory';
import OwlAvatar from '@/components/chat/OwlAvatar';
import VoiceButton, { VoiceState } from '@/components/voice/VoiceButton';
import { speakText } from '@/lib/tts';

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
      showToast('Mất kết nối rồi! KAI đang chờ bé quay lại 🦉', 'warning');
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

  // Handle playing TTS text and syncing mascot speaking state
  const playTTS = async (text: string) => {
    setVoiceState('playing');
    
    // Stop any current audio
    if (currentAudioRef.current) {
      if ('cancel' in window.speechSynthesis) {
        window.speechSynthesis.cancel();
      } else if ('pause' in currentAudioRef.current) {
        (currentAudioRef.current as HTMLAudioElement).pause();
      }
    }

    try {
      const audioObj = await speakText(
        text,
        () => setVoiceState('playing'),
        () => setVoiceState('idle')
      );
      currentAudioRef.current = audioObj;
    } catch (e) {
      console.error(e);
      setVoiceState('idle');
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
  };

  // Triggers Groq Completion API call
  const getAIResponse = async (text: string, isVoiceInput: boolean) => {
    setIsTyping(true);
    setVoiceState('processing');
    
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
        showToast('KAI đang nghỉ một chút, bé đợi thử lại sau 1 phút nhé! 🦉');
        setVoiceState('idle');
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
      showToast('KAI bị nghẹn giọng rồi. Bé gõ tin nhắn thử lại nhé! 🦉');
      setVoiceState('idle');
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
            {SUBJECTS.map((s) => {
              const isActive = s.id === selectedSubject;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all font-bold font-display text-sm active:scale-95 ${
                    isActive
                      ? `${s.color} border-current shadow-md ${s.textColor}`
                      : 'border-transparent bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-lg flex items-center justify-center shrink-0">
                    {s.icon}
                  </span>
                  <span>{s.name}</span>
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

      {/* Main chat column */}
      <main className="flex-1 flex flex-col h-full bg-slate-50/50 min-w-0">
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

          <GradeSelector
            selectedGrade={selectedGrade}
            onSelectGrade={setSelectedGrade}
          />
        </header>

        {/* Mobile Horizontal Subject Bar (Hidden on Desktop) */}
        <div className="bg-white shrink-0 border-b border-purple-50 lg:hidden">
          <SubjectSelector
            selectedId={selectedSubject}
            onSelectSubject={setSelectedSubject}
          />
        </div>

        {/* Mobile Gamified Streak & Badge Banner (Hidden on Desktop) */}
        <div className="p-3 bg-slate-50/50 shrink-0 lg:hidden">
          <ProgressBadge
            streakDays={studentProfile?.streak_days || 0}
            totalSessions={studentProfile?.total_sessions || 0}
          />
        </div>

        {/* Mobile Hero Mascot Section (Hidden on Desktop) */}
        <div className="bg-white border-b border-purple-50 shrink-0 py-1.5 flex justify-center shadow-inner lg:hidden">
          <OwlAvatar
            state={voiceState === 'playing' ? 'speaking' : voiceState === 'recording' ? 'listening' : 'idle'}
            text={mascotText}
          />
        </div>

        {/* Chat Messages - centered with max-width on desktop */}
        <div className="flex-1 overflow-hidden relative w-full flex justify-center">
          <div className="w-full max-w-[720px] h-full">
            <ChatHistory
              messages={messages}
              isTyping={isTyping}
              onSpeakStart={() => setVoiceState('playing')}
              onSpeakEnd={() => setVoiceState('idle')}
            />
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
    </div>
  );
}
