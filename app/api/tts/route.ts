import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let text = '';
  try {
    const body = await request.json();
    text = body.text || '';

    // Option 1: FPT AI TTS (production — high quality Vietnamese voice)
    if (process.env.FPT_AI_API_KEY && process.env.FPT_AI_API_KEY !== '') {
      const response = await fetch('https://api.fpt.ai/hmi/tts/v5', {
        method: 'POST',
        headers: {
          'api-key': process.env.FPT_AI_API_KEY,
          'voice': 'leminh', // Northern Vietnamese young male voice, friendly and cartoon-like for kids
          'speed': '0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ audioUrl: data.async });
      }
    }

    // Option 2: Fallback — client will use browser's Web Speech API
    return NextResponse.json({ useBrowserTTS: true, text });
  } catch (error) {
    return NextResponse.json({ useBrowserTTS: true, text });
  }
}
