import { EdgeTTS } from 'edge-tts-universal';

/**
 * Giọng nam tiếng Việt duy nhất có sẵn trong Edge TTS — chất lượng neural,
 * tự nhiên. Đây là giọng nền cho KAI.
 */
export const KAI_VOICE = 'vi-VN-NamMinhNeural';

/**
 * Tinh chỉnh để tạo cảm giác "nhân vật hoạt hình" — thanh thoát, tươi trẻ:
 * - pitch +15Hz: nâng cao độ nhẹ → giọng trẻ trung, sáng hơn (vẫn là giọng nam)
 * - rate +8%: nói nhanh nhẹn hơn mặc định → năng động, vui nhộn
 * - volume +0%: giữ nguyên âm lượng
 */
export const CARTOON_VOICE_OPTIONS = {
  rate: '+3%',
  pitch: '+0Hz',
  volume: '+0%',
};

export interface TTSResult {
  audioBuffer: Buffer;
  contentType: string; // 'audio/mpeg'
  durationEstimateMs: number; // ước lượng để sync caption
}

/**
 * Chuyển văn bản thành audio bằng giọng KAI (hoạt hình, nam, thanh thoát).
 */
export async function synthesizeKaiVoice(text: string): Promise<TTSResult> {
  // Loại bỏ emoji trước khi đưa vào TTS — Edge TTS có thể đọc nhịu/lỗi với emoji
  const cleanText = stripEmojis(text);

  const tts = new EdgeTTS(cleanText, KAI_VOICE, CARTOON_VOICE_OPTIONS);
  const result = await tts.synthesize();

  const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

  // Ước lượng thời gian phát (ms) dựa trên word boundaries trả về
  const lastBoundary = result.subtitle?.[result.subtitle.length - 1];
  const durationEstimateMs = lastBoundary
    ? lastBoundary.offset + lastBoundary.duration
    : cleanText.length * 70; // fallback: ~70ms/ký tự

  return {
    audioBuffer,
    contentType: 'audio/mpeg',
    durationEstimateMs,
  };
}

function stripEmojis(text: string): string {
  return text
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    .trim();
}
