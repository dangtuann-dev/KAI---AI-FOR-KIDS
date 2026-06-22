'use client';

import React, { useState } from 'react';
import { Calendar, MessageCircle, Mic, ArrowLeft, BookOpen, Clock } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  is_voice?: boolean;
  created_at: string;
}

interface ChatSession {
  id: string;
  subject: string;
  grade: number;
  started_at: string;
  message_count: number;
  voice_message_count: number;
  messages?: Message[];
}

interface ChatHistoryViewerProps {
  sessions: ChatSession[];
  onFetchSessionMessages: (sessionId: string) => Promise<Message[]>;
}

export default function ChatHistoryViewer({
  sessions,
  onFetchSessionMessages,
}: ChatHistoryViewerProps) {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Translate subject IDs
  const getSubjectLabel = (sub: string) => {
    const map: Record<string, { label: string; emoji: string; color: string }> = {
      math: { label: 'Toán', emoji: '🔢', color: 'bg-indigo-100 text-indigo-700' },
      vietnamese: { label: 'Tiếng Việt', emoji: '📖', color: 'bg-rose-100 text-rose-700' },
      science: { label: 'Khoa học', emoji: '🔬', color: 'bg-emerald-100 text-emerald-700' },
      english: { label: 'Tiếng Anh', emoji: '🔤', color: 'bg-blue-100 text-blue-700' },
      ethics: { label: 'Đạo đức', emoji: '🤝', color: 'bg-amber-100 text-amber-700' },
      history: { label: 'Lịch sử', emoji: '🌍', color: 'bg-purple-100 text-purple-700' },
    };
    return map[sub.toLowerCase()] || { label: 'Tổng hợp', emoji: '💡', color: 'bg-slate-100 text-slate-700' };
  };

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSession(session);
    setLoadingMessages(true);
    try {
      const msgs = await onFetchSessionMessages(session.id);
      setSessionMessages(msgs);
    } catch (e) {
      console.error(e);
      setSessionMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedSession) {
    return (
      <div className="flex flex-col h-full bg-slate-50 rounded-3xl overflow-hidden border border-purple-100 shadow-sm animate-fade-in">
        {/* Session Detail Header */}
        <div className="p-4 bg-white border-b border-purple-100 flex items-center gap-3">
          <button
            onClick={() => setSelectedSession(null)}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 active:scale-95 transition-all"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-700 font-display">
                Môn {getSubjectLabel(selectedSession.subject).label} — Lớp {selectedSession.grade}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getSubjectLabel(selectedSession.subject).color}`}>
                {getSubjectLabel(selectedSession.subject).emoji}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {formatDate(selectedSession.started_at)}
            </span>
          </div>
        </div>

        {/* Message logs inside the session */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar max-h-[400px]">
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold font-display">Đang tải lịch sử...</span>
            </div>
          ) : sessionMessages.filter((msg) => !msg.content?.startsWith('[')).length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              Không có tin nhắn nào trong phiên học này.
            </div>
          ) : (
            sessionMessages
              .filter((msg) => !msg.content?.startsWith('['))
              .map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[90%] ${isUser ? 'self-end' : 'self-start'}`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                      {isUser ? 'Con' : 'KAI'} {isUser && msg.is_voice && '🎤'}
                    </span>
                    
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-purple-500 text-white rounded-br-none'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    
                    <span className="text-[8px] text-slate-300 mt-0.5 px-1">
                      {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 px-1">
        <MessageCircle className="w-5 h-5 text-purple-600" />
        <h3 className="font-extrabold text-slate-800 text-base font-display">
          Lịch sử trò chuyện của con
        </h3>
      </div>

      {sessions.length === 0 ? (
        <div className="p-8 bg-white border border-purple-100 rounded-3xl text-center text-slate-400 font-bold text-xs">
          Chưa có phiên học nào được ghi nhận.
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
          {sessions.map((session) => {
            const subject = getSubjectLabel(session.subject);
            return (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className="w-full text-left p-4 bg-white hover:bg-purple-50/40 border border-purple-50 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={subject.label}>
                    {subject.emoji}
                  </span>
                  <div>
                    <div className="font-bold text-slate-800 font-display text-sm">
                      Học môn {subject.label} — Lớp {session.grade}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(session.started_at).split(' ')[0]}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(session.started_at).split(' ')[1]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {session.message_count} tin
                  </span>
                  {session.voice_message_count > 0 && (
                    <span className="text-[9px] text-purple-500 font-bold flex items-center gap-0.5">
                      <Mic className="w-2.5 h-2.5" />
                      {session.voice_message_count} nói
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
