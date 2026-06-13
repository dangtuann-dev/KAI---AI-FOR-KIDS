// components/workspace/ChatLogDrawer.tsx
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ChatHistory from '../chat/ChatHistory';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  is_voice?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isTyping?: boolean;
}

export default function ChatLogDrawer({ open, onClose, messages, isTyping = false }: Props) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-4xl mx-auto bg-white rounded-t-[32px] border-t-2 border-purple-100 shadow-2xl z-50 flex flex-col h-[75dvh] transition-transform duration-300 ease-out transform ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header Drag Bar / Notch */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 shrink-0" />

        {/* Header Content */}
        <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="font-display text-lg font-black text-slate-800">
              Nhật ký bài học của Bé
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
            aria-label="Đóng lịch sử"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log Container */}
        <div className="flex-1 overflow-hidden bg-slate-50/50">
          <ChatHistory messages={messages} isTyping={isTyping} />
        </div>
      </div>
    </>
  );
}
