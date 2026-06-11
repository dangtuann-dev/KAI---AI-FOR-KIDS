'use client';

import React from 'react';
import { Calendar, Volume2, Mic, AlertCircle, Play, LogOut, Check } from 'lucide-react';

interface Event {
  id: string;
  user_id: string;
  feature: string;
  metadata: any;
  created_at: string;
}

interface ActivityTimelineProps {
  events: Event[];
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  // Format dates nicely
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Helper to map event names to labels and icons
  const getEventMeta = (feature: string) => {
    switch (feature) {
      case 'session_start':
        return {
          label: 'Bắt đầu phiên học',
          color: 'bg-emerald-500',
          icon: <Play className="w-3.5 h-3.5 text-white" />,
          desc: 'Học sinh vừa tạo một buổi học mới.'
        };
      case 'session_end':
        return {
          label: 'Kết thúc phiên học',
          color: 'bg-slate-500',
          icon: <LogOut className="w-3.5 h-3.5 text-white" />,
          desc: 'Phiên học đã kết thúc thành công.'
        };
      case 'voice_input':
        return {
          label: 'Giao tiếp bằng Giọng nói',
          color: 'bg-purple-500',
          icon: <Mic className="w-3.5 h-3.5 text-white" />,
          desc: 'Sử dụng chức năng ghi âm Whisper STT.'
        };
      case 'guardrail_triggered':
        return {
          label: 'Chặn từ nhạy cảm',
          color: 'bg-rose-500',
          icon: <AlertCircle className="w-3.5 h-3.5 text-white animate-pulse" />,
          desc: 'Guardrail phát hiện và chặn nội dung không phù hợp.'
        };
      case 'ai_response':
        return {
          label: 'Phản hồi từ AI (KAI)',
          color: 'bg-indigo-500',
          icon: <Volume2 className="w-3.5 h-3.5 text-white" />,
          desc: 'KAI đã trả lời bài học của học sinh.'
        };
      default:
        return {
          label: 'Sự kiện hệ thống',
          color: 'bg-blue-500',
          icon: <Check className="w-3.5 h-3.5 text-white" />,
          desc: feature
        };
    }
  };

  return (
    <div className="w-full bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-slate-800 text-base font-display">Dòng thời gian Hoạt động</h3>
        <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Mới nhất
        </span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-slate-400 font-bold text-xs">
          Chưa ghi nhận hoạt động nào hôm nay.
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 pl-4 ml-2.5 flex flex-col gap-5 py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {events.slice(0, 10).map((evt) => {
            const meta = getEventMeta(evt.feature);
            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node icon */}
                <span className={`absolute -left-[27px] top-0.5 flex items-center justify-center w-5.5 h-5.5 rounded-full ring-4 ring-white ${meta.color}`}>
                  {meta.icon}
                </span>

                {/* Content */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-xs font-display">
                      {meta.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold bg-slate-50 px-1.5 py-0.5 rounded-md">
                      {formatTime(evt.created_at)}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                    {meta.desc}
                  </span>

                  {/* Metadata display if available */}
                  {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                    <div className="mt-1 text-[8px] bg-slate-50 p-1.5 rounded-lg text-slate-400 break-all font-mono font-medium">
                      {JSON.stringify(evt.metadata)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
