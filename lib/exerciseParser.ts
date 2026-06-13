// lib/exerciseParser.ts
import { Exercise } from './exerciseTypes';

export function parseAIResponse(rawText: string): { caption: string; exercise: Exercise | null } {
  if (!rawText) return { caption: '', exercise: null };

  const match = rawText.match(/<exercise>([\s\S]*?)<\/exercise>/);
  if (!match) return { caption: rawText.trim(), exercise: null };

  const caption = rawText.replace(match[0], '').trim();

  try {
    const exercise = JSON.parse(match[1].trim()) as Exercise;
    if (!exercise.type) throw new Error('Missing type');
    return { caption, exercise };
  } catch (e) {
    console.warn('Exercise JSON parse failed, hiển thị caption only:', e);
    // Return caption text without the exercise tag
    const cleanCaption = rawText.replace(/<exercise>[\s\S]*?<\/exercise>/, '').trim();
    return { caption: cleanCaption, exercise: null };
  }
}
