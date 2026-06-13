import { NextRequest, NextResponse } from 'next/server';
import { hasGroqKey, getMockTranscription } from '@/lib/groq';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    if (hasGroqKey()) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        const filename = audioFile.name || 'audio.webm';
        const contentType = audioFile.type || 'audio/webm';
        const file = await Groq.toFile(buffer, filename, { type: contentType });

        const transcription = await groq.audio.transcriptions.create({
          file: file,
          model: 'whisper-large-v3-turbo',
          language: 'vi', // Vietnamese
          response_format: 'text',
          prompt: 'KAI ơi, toán học, tiếng việt, một cộng một bằng mấy, chào bạn gấu KAI, giúp em giải bài này, chữ này viết sao, học tập, khoa học',
        });

        return NextResponse.json({ text: transcription });
      } catch (err) {
        console.error('Groq transcribe error, falling back to mock:', err);
        // Fallback to mock text if API fails
        const mockText = getMockTranscription();
        return NextResponse.json({ text: mockText });
      }
    } else {
      // Mock mode: simulate Whisper API response delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockText = getMockTranscription();
      return NextResponse.json({ text: mockText });
    }
  } catch (error) {
    console.error('Transcribe error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
