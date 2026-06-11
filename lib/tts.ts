/**
 * Text-to-Speech client-side helper
 * Handles playing speech responses from FPT AI or falling back to Web Speech API
 */
export async function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<HTMLAudioElement | SpeechSynthesisUtterance | null> {
  // Strip emojis and simple markdown from text to improve pronunciation
  const cleanText = text
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '') // strip emojis
    .replace(/[*_~`]/g, '') // strip simple markdown characters
    .trim();

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });
    const data = await res.json();
    
    if (data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      if (onStart) audio.onplay = onStart;
      if (onEnd) audio.onended = onEnd;
      await audio.play();
      return audio;
    }
  } catch (error) {
    console.error('API TTS error, falling back to browser Web Speech API:', error);
  }

  // Fallback: Web Speech API (Browser TTS)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Find Vietnamese voice (lang="vi-VN")
    let voices = window.speechSynthesis.getVoices();
    let viVoice = voices.find(v => v.lang.toLowerCase().includes('vi'));
    
    if (!viVoice) {
      // Chrome/Safari voices are sometimes loaded asynchronously
      await new Promise<void>((resolve) => {
        const tempHandler = () => {
          voices = window.speechSynthesis.getVoices();
          viVoice = voices.find(v => v.lang.toLowerCase().includes('vi'));
          window.speechSynthesis.onvoiceschanged = null;
          resolve();
        };
        window.speechSynthesis.onvoiceschanged = tempHandler;
        // Timeout in case it never fires
        setTimeout(resolve, 500);
      });
    }

    if (viVoice) {
      utterance.voice = viVoice;
    }
    
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // Slightly slower and clearer speech for children
    utterance.pitch = 1.1; // Slightly higher pitch for friendly owl mascot tone
    
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    
    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  
  // If speech is not supported, just trigger end immediately
  if (onEnd) onEnd();
  return null;
}
