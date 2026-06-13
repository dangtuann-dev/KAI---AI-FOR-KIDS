'use client';

import React from 'react';
import { Volume2, Mic } from 'lucide-react';
import { speakText } from '@/lib/tts-client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  is_voice?: boolean;
}

interface ChatBubbleProps {
  message: ChatMessage;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

export default function ChatBubble({ message, onSpeakStart, onSpeakEnd }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  const handleSpeak = async () => {
    if (isUser) return;
    if (onSpeakStart) onSpeakStart();
    await speakText(message.content, undefined, onSpeakEnd);
  };

  return (
    <div
      className={`flex flex-col ${
        isUser ? 'items-end' : 'items-start'
      } w-full animate-fade-in`}
    >
      <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-slate-400 px-2">
        <span>{isUser ? 'Bé' : 'KAI'}</span>
        {isUser && message.is_voice && <Mic className="w-3.5 h-3.5 text-purple-400" />}
      </div>

      <div className="flex items-end gap-2 max-w-full">
        {/* Chat bubble body */}
        <div
          className={`chat-bubble ${
            isUser ? 'chat-bubble--user' : 'chat-bubble--ai'
          }`}
        >
          <p className="whitespace-pre-line leading-relaxed font-body">
            {message.content}
          </p>
        </div>

        {/* Read-aloud button for KAI's responses */}
        {!isUser && (
          <button
            onClick={handleSpeak}
            className="p-2 bg-white border-2 border-slate-100 hover:border-purple-200 rounded-full shadow-sm hover:shadow-md transition-all active:scale-90 text-purple-500 hover:text-purple-600 self-center flex-shrink-0"
            title="Đọc câu này"
            aria-label="Đọc câu này"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
