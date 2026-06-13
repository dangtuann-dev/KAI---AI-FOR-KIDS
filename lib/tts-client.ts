/**
 * Text-to-Speech client-side helper
 * Handles playing speech responses from Edge TTS API or falling back to Web Speech API
 */

export function playFallbackBrowserTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<SpeechSynthesisUtterance | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      resolve(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const cleanText = stripEmojisAndMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;   // nhanh nhẹn hơn mặc định, đồng bộ "cartoon feel"
    utterance.pitch = 1.2;   // cao hơn mặc định — gần với cartoon voice

    // Ưu tiên chọn giọng nam tiếng Việt nếu trình duyệt có sẵn
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang === 'vi-VN' && /nam|male/i.test(v.name))
      || voices.find(v => v.lang === 'vi-VN');
      
    if (viVoice) {
      utterance.voice = viVoice;
    }

    if (onStart) utterance.onstart = onStart;
    
    utterance.onend = () => {
      if (onEnd) onEnd();
      resolve(utterance);
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
      resolve(utterance);
    };

    window.speechSynthesis.speak(utterance);
  });
}

export async function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<HTMLAudioElement | SpeechSynthesisUtterance | null> {
  const cleanText = stripEmojisAndMarkdown(text);

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });

    if (!res.ok) throw new Error('Edge TTS request failed');

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);

    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
    };

    if (onStart) {
      audio.onplay = onStart;
    }

    await audio.play();
    return audio;
  } catch (err) {
    console.warn('Edge TTS lỗi, fallback sang Web Speech API:', err);
    return playFallbackBrowserTTS(text, onStart, onEnd);
  }
}

function stripEmojisAndMarkdown(text: string): string {
  return text
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '') // strip emojis
    .replace(/[*_~`]/g, '') // strip simple markdown characters
    .trim();
}
