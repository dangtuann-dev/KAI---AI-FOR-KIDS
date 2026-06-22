// app/api/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { synthesizeKaiVoice } from '@/lib/tts';

// QUAN TRỌNG: edge-tts-universal dùng WebSocket — phải chạy Node.js runtime,
// KHÔNG dùng Edge Runtime của Vercel
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceCode, characterId } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Thiếu nội dung text' }, { status: 400 });
    }

    let resolvedVoice = voiceCode;
    if (!resolvedVoice && characterId) {
      const { CHARACTER_ROSTER } = require('@/lib/characters');
      const char = CHARACTER_ROSTER.find((c: any) => c.id === characterId);
      if (char) {
        resolvedVoice = char.voiceCode;
      }
    }

    const { audioBuffer, contentType, durationEstimateMs } = await synthesizeKaiVoice(text, resolvedVoice);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Duration-Estimate-Ms': String(durationEstimateMs),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    // Trả lỗi để client fallback sang Web Speech API
    return NextResponse.json({ error: 'TTS failed', useBrowserTTS: true }, { status: 500 });
  }
}
