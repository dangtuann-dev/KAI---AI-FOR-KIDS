'use client';

import React, { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  is_voice?: boolean;
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

export default function ChatHistory({
  messages,
  isTyping = false,
  onSpeakStart,
  onSpeakEnd,
}: ChatHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const displayMessages = messages.filter((msg) => !msg.content?.startsWith('['));

  return (
    <div
      ref={containerRef}
      className="chat-container custom-scrollbar"
    >
      {displayMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
          <p className="font-display font-semibold text-lg text-slate-500 mb-1">
            Chào mừng bé đến với KAI! 🐻
          </p>
          <p className="text-sm">
            Nhấn giữ nút mic lớn màu tím ở dưới rồi nói chuyện với KAI hoặc gõ tin nhắn vào ô nhé!
          </p>
        </div>
      ) : (
        displayMessages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onSpeakStart={onSpeakStart}
            onSpeakEnd={onSpeakEnd}
          />
        ))
      )}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex flex-col items-start w-full animate-pulse">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-slate-400 px-2">
            <span>KAI</span>
          </div>
          <div className="chat-bubble chat-bubble--ai">
            <div className="typing-dots">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
