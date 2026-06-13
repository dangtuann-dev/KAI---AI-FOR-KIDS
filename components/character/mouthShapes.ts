// components/character/mouthShapes.ts

// All paths are designed to fit within a 400x400 viewBox, centered around ~(200, 230)
export const MOUTH_SHAPES = {
  // Closed mouth - idle, silent
  closed: 'M 180 230 Q 200 235 220 230 Q 200 238 180 230 Z',

  // Slightly open - low volume (consonants like "m", "b", "p")
  small: 'M 178 228 Q 200 245 222 228 Q 200 238 178 228 Z',

  // Medium open - medium volume (vowels)
  medium: 'M 175 225 Q 200 255 225 225 Q 200 240 175 225 Z',

  // Wide open - high volume (vowels like "a", "o")
  wide: 'M 170 220 Q 200 265 230 220 Q 200 245 170 220 Z',

  // Smile (idle happy / happy state)
  smile: 'M 175 225 Q 200 245 225 225 Q 200 225 175 225 Z',
} as const;

export type MouthShape = keyof typeof MOUTH_SHAPES;
