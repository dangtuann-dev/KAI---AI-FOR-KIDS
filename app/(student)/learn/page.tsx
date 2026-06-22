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
import { speakText, stopAllSpeech } from '@/lib/tts-client';
import KaiCharacter from '@/components/character/KaiCharacter';
import { CharacterState } from '@/components/character/useCharacterState';
import { useAmbientBehavior } from '@/components/character/useAmbientBehavior';
import CaptionBar from '@/components/workspace/CaptionBar';
import ChatLogDrawer from '@/components/workspace/ChatLogDrawer';
import { Exercise, ExerciseResult } from '@/lib/exerciseTypes';
import { ExerciseRenderer } from '@/components/exercises/ExerciseRenderer';
import { ExerciseFeedback } from '@/components/exercises/ExerciseFeedback';

// Onboarding & Lesson Mode Imports
import { TextbookSelector } from '@/components/onboarding/TextbookSelector';
import { CharacterSelector } from '@/components/onboarding/CharacterSelector';
import { IllustrationRenderer } from '@/components/illustrations/IllustrationRenderer';
import { LessonCompleteActions } from '@/components/workspace/LessonCompleteActions';
import { LESSON_PLANS, getNextLesson, getLessonByOrder, Lesson } from '@/lib/lessonPlans';
import { Illustration } from '@/lib/exerciseParser';

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
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [activeCaption, setActiveCaption] = useState<{ speaker: 'user' | 'kai'; text: string } | null>(null);
  const [chatLogOpen, setChatLogOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // UI helper states
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Practice Mode States
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackIsCorrect, setFeedbackIsCorrect] = useState(false);
  const [lastResult, setLastResult] = useState<ExerciseResult | null>(null);
  
  // Illustration and Lesson Complete states
  const [activeIllustration, setActiveIllustration] = useState<Illustration | null>(null);
  const [activeLessonComplete, setActiveLessonComplete] = useState<any>(null);

  // Onboarding States
  const [onboardingStage, setOnboardingStage] = useState<'character' | 'textbook'>('character');
  const [onboardingCharacterId, setOnboardingCharacterId] = useState('giong');
  const [onboardingNickname, setOnboardingNickname] = useState('Gióng');

  // Register life-like idle behaviors hook
  useAmbientBehavior({
    voiceState,
    characterState,
    setCharacterState,
    messagesCount: messages.length,
    textInput,
  });
  
  const currentAudioRef = useRef<HTMLAudioElement | SpeechSynthesisUtterance | null>(null);
  const isMountedRef = useRef(true);
  const sessionIdRef = useRef('');

  // Handle component mounting/unmounting and general audio cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAllSpeech();
    };
  }, []);

  // Sync session ID ref to access current session state in async callbacks
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

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
        // If voiceState becomes idle, stop any active audio/speech synthesis
        stopAllSpeech();
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
    if (!student || studentProfile?.onboarding_completed === false) return;

    let active = true;

    // Immediately stop ongoing audio, clean up speech playback and reset states
    stopAllSpeech();
    setActiveCaption(null);
    setCharacterState('idle');
    setVoiceState('idle');
    setActiveIllustration(null);
    setActiveExercise(null);
    setActiveLessonComplete(null);

    async function initSession() {
      setIsTyping(true);
      setMascotText('KAI đang chuẩn bị bài học...');
      
      const supabase = createClient();
      
      // End previous session if it exists (update duration/ended_at)
      if (sessionIdRef.current) {
        try {
          await supabase
            .from('chat_sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', sessionIdRef.current);
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
        
        // Guard against race conditions if subject/grade changed in the meantime
        if (!active) return;

        setSessionId(newSession.id);

        // Check if we have lesson plans for this subject & grade
        const lessons = LESSON_PLANS[selectedSubject]?.[selectedGrade] || [];
        const hasLessonPlans = lessons.length > 0;

        let currentLesson = null;
        let currentConceptIndex = 0;
        let isNewLesson = false;
        let completedLessonIds: string[] = [];

        if (hasLessonPlans) {
          // Query progress from database
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('student_id', student.id)
            .eq('subject', selectedSubject)
            .single();

          if (progressData) {
            completedLessonIds = progressData.completed_lesson_ids || [];
            if (progressData.current_lesson_id) {
              currentLesson = lessons.find(l => l.id === progressData.current_lesson_id) || null;
              currentConceptIndex = progressData.current_concept_index ?? 0;
            }

            // If current lesson is null or already completed, get the next one
            if (!currentLesson || completedLessonIds.includes(currentLesson.id)) {
              currentLesson = getNextLesson(selectedSubject, selectedGrade, completedLessonIds);
              currentConceptIndex = 0;
              isNewLesson = true;

              if (currentLesson) {
                await supabase
                  .from('lesson_progress')
                  .update({
                    current_lesson_id: currentLesson.id,
                    current_concept_index: 0,
                    last_session_at: new Date().toISOString()
                  })
                  .eq('id', progressData.id);
              }
            }
          } else {
            // First time learning this subject: start Lesson 1
            currentLesson = getLessonByOrder(selectedSubject, selectedGrade, 1);
            currentConceptIndex = 0;
            isNewLesson = true;

            if (currentLesson) {
              await supabase
                .from('lesson_progress')
                .insert({
                  student_id: student.id,
                  subject: selectedSubject,
                  grade: selectedGrade,
                  current_lesson_id: currentLesson.id,
                  current_concept_index: 0,
                  completed_lesson_ids: []
                });
            }
          }
        }

        if (currentLesson) {
          const concept = currentLesson.concepts[currentConceptIndex];
          const textbookName = studentProfile?.textbook_set || 'unknown';
          const textbookHint = (currentLesson.textbookHints as any)?.[textbookName] || currentLesson.title;

          const systemTrigger = `[HỆ THỐNG — TỰ ĐỘNG BẮT ĐẦU BÀI HỌC]
Bé vừa mở môn ${selectedSubject === 'math' ? 'Toán' : 'Tiếng Anh'}, lớp ${selectedGrade}. Đây là bài học ${isNewLesson ? 'MỚI' : 'đang học dở'}.
Bài học: "${currentLesson.title}" (Trong SGK của bé gọi là: "${textbookHint}")
Khái niệm cần dạy ngay bây giờ: "${concept.title}"
Gợi ý cách dạy: ${concept.teachingHint}

Hãy CHỦ ĐỘNG chào bé và bắt đầu giảng khái niệm này theo PHONG CÁCH GIẢNG DẠY (xem LESSON_TEACHING_PROMPT). Nhớ chèn minh họa và 1 bài tập thực hành ngay sau khi giải thích — KHÔNG chờ bé yêu cầu.`;

          // Save trigger message to DB
          await supabase.from('chat_messages').insert({
            session_id: newSession.id,
            student_id: student.id,
            role: 'user',
            content: systemTrigger,
            is_system_context: true
          });

          if (!active) return;

          const userMsg = {
            id: `sys-${Date.now()}`,
            role: 'user' as const,
            content: systemTrigger,
            is_voice: false
          };

          setMessages([userMsg]);
          setMascotText(currentLesson.title);

          // Call API
          const payload = {
            messages: [userMsg],
            sessionId: newSession.id,
            grade: selectedGrade,
            subject: selectedSubject,
            studentId: student.id,
            studentName: studentProfile?.full_name || 'bé',
            textbookSet: studentProfile?.textbook_set
          };

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error('API failed');
          const data = await res.json();

          if (!active) return;

          const aiMsg = {
            id: `ai-${Date.now()}`,
            role: 'assistant' as const,
            content: data.content,
            is_voice: false
          };

          setMessages((prev) => [...prev, aiMsg]);

          await playTTS(data.content, () => {
            if (data.illustration) {
              setActiveIllustration(data.illustration);
            }
            if (data.exercise) {
              setActiveExercise(data.exercise);
            }
            if (data.lessonComplete) {
              setActiveLessonComplete(data.lessonComplete);
              handleLessonCompleteDBUpdate(data.lessonComplete.lessonId);
            }
          });

        } else {
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

          if (!active) return;

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
        }
      } catch (err) {
        console.error('Session init error:', err);
        if (active) {
          showToast('Không thể kết nối hệ thống học tập. Bé hãy nhấn thử lại nhé!');
        }
      } finally {
        if (active) {
          setIsTyping(false);
        }
      }
    }

    initSession();

    return () => {
      active = false;
      stopAllSpeech();
    };
  }, [student, selectedSubject, selectedGrade, studentProfile?.onboarding_completed]);

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
  const playTTS = async (text: string, onComplete?: () => void) => {
    // Stop any current audio immediately
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
          setActiveCaption({ speaker: 'kai', text });
        },
        () => {
          const encouragement = detectEncouragement(text);
          if (encouragement) {
            setCharacterState(encouragement);
            setTimeout(() => {
              setCharacterState('idle');
              setActiveCaption(null);
              if (onComplete) onComplete();
            }, 2000);
          } else {
            setCharacterState('idle');
            setActiveCaption(null);
            if (onComplete) onComplete();
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
      setActiveCaption(null);
      if (onComplete) onComplete();
    }
  };

  const handleSelectCharacter = (characterId: string, charNickname: string) => {
    setOnboardingCharacterId(characterId);
    setOnboardingNickname(charNickname);
    setOnboardingStage('textbook');
    
    // Play transition greeting
    const transText = `Thật tuyệt vời! Mình sẽ là bạn đồng hành cùng bé với tên gọi là ${charNickname}. Tiếp theo, bé cho mình biết ở lớp cô giáo dạy bé theo bộ sách nào nhé! 📚`;
    playTTS(transText);
  };

  // Handle textbook selection during onboarding
  const handleSelectTextbook = async (textbookId: 'ket_noi_tri_thuc' | 'chan_troi_sang_tao' | 'canh_dieu' | 'unknown') => {
    if (!student) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('student_profiles')
      .update({
        textbook_set: textbookId,
        onboarding_completed: true,
        character_id: onboardingCharacterId,
        character_nickname: onboardingNickname,
        character_color_variant: 'primary',
        character_xp: 0,
        character_level: 1,
        character_evolution_stage: 0
      })
      .eq('id', student.id);

    if (error) {
      showToast('Có lỗi xảy ra, bé hãy thử lại nhé!', 'error');
      return;
    }

    setStudentProfile((prev: any) => ({
      ...prev,
      textbook_set: textbookId,
      onboarding_completed: true,
      character_id: onboardingCharacterId,
      character_nickname: onboardingNickname,
      character_color_variant: 'primary',
      character_xp: 0,
      character_level: 1,
      character_evolution_stage: 0
    }));

    // Play a happy greeting
    setCharacterState('happy');
    const textbookNameLabel = 
      textbookId === 'ket_noi_tri_thuc' ? 'Kết nối tri thức với cuộc sống' :
      textbookId === 'chan_troi_sang_tao' ? 'Chân trời sáng tạo' :
      textbookId === 'canh_dieu' ? 'Cánh Diều' : 'chung';

    const greetingText = `Tuyệt vời! Vậy ${onboardingNickname} sẽ dạy bé theo sách ${textbookNameLabel} nhé! 🎉 Mình bắt đầu bài học đầu tiên luôn nha!`;
    await playTTS(greetingText);
  };

  // Play onboarding greeting once when it loads
  useEffect(() => {
    if (studentProfile && studentProfile.onboarding_completed === false) {
      const onboardText = "Ngày xửa ngày xưa, có 8 linh thú từ truyền thuyết Việt Nam đang tìm kiếm một người bạn học dũng cảm để cùng lớn lên đó bé ơi! Bé hãy đánh thức quả trứng để xem ai nhé! ✨";
      playTTS(onboardText);
    }
  }, [studentProfile?.id, studentProfile?.onboarding_completed]);

  const handleLessonCompleteDBUpdate = async (lessonId: string) => {
    const supabase = createClient();
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', student.id)
      .eq('subject', selectedSubject)
      .single();

    if (progressData) {
      const completedList = progressData.completed_lesson_ids || [];
      if (!completedList.includes(lessonId)) {
        completedList.push(lessonId);
      }

      await supabase
        .from('lesson_progress')
        .update({
          completed_lesson_ids: completedList,
          current_lesson_id: null,
          current_concept_index: 0,
          last_session_at: new Date().toISOString()
        })
        .eq('id', progressData.id);
    }
  };

  const handleContinueNewLesson = async () => {
    setActiveLessonComplete(null);
    setActiveIllustration(null);
    setActiveExercise(null);

    // Get next lesson
    const lessons = LESSON_PLANS[selectedSubject]?.[selectedGrade] || [];
    const supabase = createClient();
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', student.id)
      .eq('subject', selectedSubject)
      .single();

    if (progressData) {
      const completedList = progressData.completed_lesson_ids || [];
      const nextL = getNextLesson(selectedSubject, selectedGrade, completedList);

      if (nextL) {
        // Update lesson_progress to new lesson
        await supabase
          .from('lesson_progress')
          .update({
            current_lesson_id: nextL.id,
            current_concept_index: 0,
            last_session_at: new Date().toISOString()
          })
          .eq('id', progressData.id);

        // Send system message to trigger new lesson!
        const textbookName = studentProfile?.textbook_set || 'unknown';
        const textbookHint = (nextL.textbookHints as any)?.[textbookName] || nextL.title;
        const concept = nextL.concepts[0];

        const systemTrigger = `[HỆ THỐNG — TỰ ĐỘNG BẮT ĐẦU BÀI HỌC]
Bé vừa mở môn ${selectedSubject === 'math' ? 'Toán' : 'Tiếng Anh'}, lớp ${selectedGrade}. Đây là bài học MỚI.
Bài học: "${nextL.title}" (Trong SGK của bé gọi là: "${textbookHint}")
Khái niệm cần dạy ngay bây giờ: "${concept.title}"
Gợi ý cách dạy: ${concept.teachingHint}

Hãy CHỦ ĐỘNG chào bé và bắt đầu giảng khái niệm này theo PHONG CÁCH GIẢNG DẠY (xem LESSON_TEACHING_PROMPT). Nhớ chèn minh họa và 1 bài tập thực hành ngay sau khi giải thích — KHÔNG chờ bé yêu cầu.`;

        const userMsg = {
          id: `sys-${Date.now()}`,
          role: 'user' as const,
          content: systemTrigger
        };
        setMessages((prev) => [...prev, userMsg]);
        await getAIResponse(systemTrigger, false);
      } else {
        // No more lessons available
        showToast('Bé đã hoàn thành tất cả bài học của môn này rồi! 🎉', 'success');
        const endText = `Ồ! Bé đã học hết các bài học ${selectedSubject === 'math' ? 'Toán' : 'Tiếng Anh'} của lớp ${selectedGrade} cùng KAI rồi đó! Bé giỏi quá, KAI rất tự hào về bé! 💖`;
        await playTTS(endText);
      }
    }
  };

  const handleStopLearning = async () => {
    setActiveLessonComplete(null);
    setActiveIllustration(null);
    setActiveExercise(null);

    const goodbyeText = 'Hôm nay bé học giỏi lắm! Nghỉ ngơi thôi nào, hẹn gặp lại bé vào buổi học tiếp theo nhé! Bye bye! 👋';
    await playTTS(goodbyeText);
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
    const querySessionId = sessionIdRef.current;
    if (!querySessionId) return;

    setIsTyping(true);
    setVoiceState('processing');
    setCharacterState('thinking');
    
    try {
      const payload = {
        messages: [...messages, { role: 'user', content: text, is_voice: isVoiceInput }],
        sessionId: querySessionId,
        grade: selectedGrade,
        subject: selectedSubject,
        studentId: student.id,
        studentName: studentProfile?.full_name || 'bé',
        textbookSet: studentProfile?.textbook_set
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        if (isMountedRef.current && sessionIdRef.current === querySessionId) {
          showToast('KAI đang nghỉ một chút, bé đợi thử lại sau 1 phút nhé! 🐻');
          setVoiceState('idle');
          setCharacterState('idle');
        }
        return;
      }

      if (!res.ok) throw new Error('Chat API returned error');

      const data = await res.json();
      
      // Guard against race conditions if subject changed or component unmounted during fetch
      if (!isMountedRef.current || sessionIdRef.current !== querySessionId) {
        return;
      }

      // Add AI bubble
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        is_voice: false,
      };

      setMessages((prev) => [...prev, aiMsg]);
      
      // Reset active illustrations/exercises/complete before starting play
      setActiveIllustration(null);
      setActiveLessonComplete(null);

      // Read response aloud, then show components
      await playTTS(data.content, () => {
        if (data.illustration) {
          setActiveIllustration(data.illustration);
        }
        if (data.exercise) {
          setActiveExercise(data.exercise);
        }
        if (data.lessonComplete) {
          setActiveLessonComplete(data.lessonComplete);
          handleLessonCompleteDBUpdate(data.lessonComplete.lessonId);
        }
      });

    } catch (err) {
      console.error(err);
      if (isMountedRef.current && sessionIdRef.current === querySessionId) {
        showToast('KAI bị nghẹn giọng rồi. Bé gõ tin nhắn thử lại nhé! 🐻');
        setVoiceState('idle');
        setCharacterState('idle');
      }
    } finally {
      if (isMountedRef.current && sessionIdRef.current === querySessionId) {
        setIsTyping(false);
      }
    }
  };

  const handleExerciseComplete = async (result: ExerciseResult) => {
    setFeedbackIsCorrect(result.isCorrect);
    setShowFeedback(true);
    setLastResult(result);

    try {
      const res = await fetch('/api/exercise-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.id,
          session_id: sessionId,
          subject: selectedSubject,
          grade: selectedGrade,
          exercise_type: result.exercise.type,
          topic: (result.exercise as any).question || (result.exercise as any).instruction || (result.exercise as any).statement || 'Bài tập thực hành',
          is_correct: result.isCorrect,
          time_spent_ms: result.timeSpentMs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.xpEarned > 0) {
          showToast(`+${data.xpEarned} XP! Bé làm rất tốt! 🎉`, 'success');
          
          setStudentProfile((prev: any) => {
            if (!prev) return null;
            return {
              ...prev,
              character_xp: data.xpTotal,
              character_level: data.level,
              character_evolution_stage: data.evolutionStage,
            };
          });

          if (data.leveledUp) {
            showToast(`LÊN CẤP! Bé đạt Cấp ${data.level}! 🏆`, 'success');
            setCharacterState('celebrating');
            setTimeout(() => {
              setCharacterState('idle');
            }, 3500);
          }
        }
      }
    } catch (dbErr) {
      console.error('Failed to log exercise attempt:', dbErr);
    }
  };

  const handleFeedbackDone = async () => {
    setShowFeedback(false);
    setActiveExercise(null);
    setCharacterState('idle');

    if (!lastResult) return;

    // Increment concept index if there's a lesson and user answered correctly
    const lessons = LESSON_PLANS[selectedSubject]?.[selectedGrade] || [];
    const hasLessonPlans = lessons.length > 0;

    if (hasLessonPlans && lastResult.isCorrect) {
      const supabase = createClient();
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', student.id)
        .eq('subject', selectedSubject)
        .single();

      if (progressData && progressData.current_lesson_id) {
        const currentLesson = lessons.find(l => l.id === progressData.current_lesson_id);
        if (currentLesson) {
          const nextIndex = (progressData.current_concept_index || 0) + 1;
          if (nextIndex < currentLesson.concepts.length) {
            await supabase
              .from('lesson_progress')
              .update({
                current_concept_index: nextIndex,
                last_session_at: new Date().toISOString()
              })
              .eq('id', progressData.id);
          } else {
            await supabase
              .from('lesson_progress')
              .update({
                last_session_at: new Date().toISOString()
              })
              .eq('id', progressData.id);
          }
        }
      }
    }

    const resultText = lastResult.isCorrect 
      ? `[KẾT QUẢ BÀI TẬP — không hiển thị cho bé] Bé đã trả lời ĐÚNG bài tập loại ${lastResult.exercise.type}. KAI hãy khen ngợi bé thật nồng nhiệt và chuyển sang bài học tiếp theo!` 
      : `[KẾT QUẢ BÀI TẬP — không hiển thị cho bé] Bé đã trả lời SAI bài tập loại ${lastResult.exercise.type}. KAI hãy nhẹ nhàng động viên, giải thích ngắn gọn đáp án đúng, sau đó hỏi xem bé có muốn làm một bài tập tương ứng khác không.`;

    const systemMsg: ChatMessage = {
      id: `system-context-${Date.now()}`,
      role: 'user',
      content: resultText,
    };

    setMessages((prev) => [...prev, systemMsg]);
    await getAIResponse(resultText, false);
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
            xp={studentProfile?.character_xp || 0}
            level={studentProfile?.character_level || 1}
            evolutionStage={studentProfile?.character_evolution_stage || 0}
            characterId={studentProfile?.character_id || 'giong'}
            characterNickname={studentProfile?.character_nickname || studentProfile?.full_name || 'Bé'}
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
            xp={studentProfile?.character_xp || 0}
            level={studentProfile?.character_level || 1}
            evolutionStage={studentProfile?.character_evolution_stage || 0}
            characterId={studentProfile?.character_id || 'giong'}
            characterNickname={studentProfile?.character_nickname || studentProfile?.full_name || 'Bé'}
          />
        </div>

        {/* KAI Character & Subtitles Stage */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 min-h-0 relative w-full">
          
          {studentProfile && studentProfile.onboarding_completed === false ? (
            onboardingStage === 'character' ? (
              <div className="w-full max-w-2xl animate-fade-in my-auto">
                <CharacterSelector onSelect={handleSelectCharacter} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-4xl py-6 min-h-0 relative">
                {/* Mascot Video Call frame but centered */}
                <div className="w-full max-w-sm aspect-square bg-gradient-to-b from-slate-900 to-slate-950 rounded-[32px] border-4 border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center justify-center p-4 shrink-0">
                  <div className="flex-1 flex items-center justify-center min-h-0 w-full relative z-10 scale-90">
                    <KaiCharacter state={characterState} audioElement={currentAudio} characterId={onboardingCharacterId} />
                  </div>
                </div>

                {/* Subtitle Caption */}
                <div className="w-full max-w-[720px] min-h-[48px] flex items-center justify-center py-2 shrink-0">
                  <CaptionBar
                    speaker="kai"
                    text={activeCaption?.text || `Chào bé! Mình là ${onboardingNickname} đây! Trước khi bắt đầu, bé cho mình biết ở lớp cô giáo dạy bé theo sách nào nhé? 📚`}
                    isActive={true}
                  />
                </div>

                {/* Textbook Selector */}
                <div className="w-full max-w-md animate-fade-in">
                  <TextbookSelector onSelect={handleSelectTextbook} />
                </div>
              </div>
            )
          ) : activeLessonComplete || activeExercise || activeIllustration ? (
            /* Split layout on desktop, floating bubble layout on mobile */
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 w-full max-w-5xl my-2 min-h-0">
              
              {/* Mascot View (normal on desktop, floating bubble on mobile) */}
              <div className={`${
                isDesktop
                  ? 'w-full max-w-sm aspect-square bg-gradient-to-b from-slate-900 to-slate-950 rounded-[32px] border-4 border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center justify-center p-4 shrink-0'
                  : 'absolute top-18 right-4 w-28 h-28 rounded-full border-4 border-purple-400 bg-slate-950 overflow-hidden shadow-2xl z-40 transform scale-100 transition-all duration-300'
              }`}>
                {isDesktop && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/75 backdrop-blur-md px-2 py-1 rounded-full border border-slate-700/50 text-white z-20 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black tracking-wider uppercase font-display">TRỰC TUYẾN</span>
                  </div>
                )}
                <div className="flex-1 flex items-center justify-center min-h-0 w-full relative z-10 scale-90">
                  <KaiCharacter state={characterState} audioElement={currentAudio} characterId={studentProfile?.character_id} />
                </div>
              </div>

              {/* Side Panel: Lesson complete / Illustration / Exercise */}
              <div className="flex-1 w-full max-w-md flex flex-col gap-4 items-center justify-center z-30 min-h-0 relative overflow-y-auto custom-scrollbar">
                {activeLessonComplete ? (
                  <div className="w-full animate-fade-in">
                    <LessonCompleteActions 
                      onContinue={handleContinueNewLesson} 
                      onStop={handleStopLearning} 
                    />
                  </div>
                ) : (
                  <>
                    {activeIllustration && (
                      <div className="w-full animate-fade-in">
                        <IllustrationRenderer data={activeIllustration} />
                      </div>
                    )}
                    {activeExercise && (
                      <div className="w-full">
                        <ExerciseRenderer
                          exercise={activeExercise}
                          onComplete={handleExerciseComplete}
                        />
                        
                        {/* Feedback overlay */}
                        {showFeedback && (
                          <ExerciseFeedback
                            isCorrect={feedbackIsCorrect}
                            onCharacterState={setCharacterState}
                            onDone={handleFeedbackDone}
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Video Call Frame Container */
            <div className="flex-1 w-full max-w-4xl max-h-[50vh] lg:max-h-[60vh] bg-gradient-to-b from-slate-900 to-slate-950 rounded-[32px] border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 my-2">
              
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
                <KaiCharacter state={characterState} audioElement={currentAudio} characterId={studentProfile?.character_id} />
              </div>

              {/* Subject/Topic water-mark on bottom corner of video feed */}
              <div className="absolute bottom-4 left-6 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-xl text-slate-300 text-[10px] font-bold uppercase tracking-widest z-15 border border-slate-700/30">
                {getSubjectsForGrade(selectedGrade).find(s => s.id === selectedSubject)?.name || 'KAI'} Feed
              </div>
            </div>
          )}

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
        messages={messages.filter(m => !m.content.startsWith('[KẾT QUẢ BÀI TẬP'))}
        isTyping={isTyping}
      />
    </div>
  );
}
