// lib/exerciseParser.ts
import { Exercise } from './exerciseTypes';

export interface Illustration {
  type: string;
  [key: string]: unknown;
}

export function parseAIResponse(rawText: string): {
  caption: string;
  illustration: Illustration | null;
  exercise: Exercise | null;
  lessonComplete: { lessonId: string } | null;
} {
  if (!rawText) return { caption: '', illustration: null, exercise: null, lessonComplete: null };

  let text = rawText;
  let illustration: Illustration | null = null;
  let exercise: Exercise | null = null;
  let lessonComplete: { lessonId: string } | null = null;

  // Extract <illustration>
  const illuMatch = text.match(/<illustration>([\s\S]*?)<\/illustration>/);
  if (illuMatch) {
    try {
      illustration = JSON.parse(illuMatch[1].trim());
      text = text.replace(illuMatch[0], '').trim();
    } catch (e) {
      console.warn('Illustration JSON parse failed:', e);
      text = text.replace(illuMatch[0], '').trim();
    }
  }

  // Extract <exercise>
  const exMatch = text.match(/<exercise>([\s\S]*?)<\/exercise>/);
  if (exMatch) {
    try {
      exercise = JSON.parse(exMatch[1].trim());
      text = text.replace(exMatch[0], '').trim();
    } catch (e) {
      console.warn('Exercise JSON parse failed:', e);
      text = text.replace(exMatch[0], '').trim();
    }
  }

  // Extract <lesson_complete>
  const completeMatch = text.match(/<lesson_complete>([\s\S]*?)<\/lesson_complete>/);
  if (completeMatch) {
    try {
      lessonComplete = JSON.parse(completeMatch[1].trim());
      text = text.replace(completeMatch[0], '').trim();
    } catch (e) {
      console.warn('LessonComplete JSON parse failed:', e);
      text = text.replace(completeMatch[0], '').trim();
    }
  }

  return { caption: text.trim(), illustration, exercise, lessonComplete };
}
