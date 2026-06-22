// lib/exerciseValidator.ts
import { Exercise } from './exerciseTypes';

export function getCorrectAnswer(exercise: Exercise): unknown {
  switch (exercise.type) {
    case 'number_input':
      return exercise.correctAnswer;
    case 'multiple_choice':
      return exercise.correctIndex;
    case 'true_false':
      return exercise.correctAnswer;
    case 'fill_blank':
      return exercise.correctAnswer;
    case 'sequencing':
      return exercise.correctOrder;
    case 'categorize':
      return exercise.items.reduce((acc, item) => {
        acc[item.label] = item.categoryIndex;
        return acc;
      }, {} as Record<string, number>);
    case 'match_pairs':
      return exercise.pairs.reduce((acc, _, idx) => {
        acc[idx] = idx;
        return acc;
      }, {} as Record<number, number>);
    case 'label_diagram':
      return exercise.hotspots.reduce((acc, h) => {
        acc[h.id] = h.correctLabel;
        return acc;
      }, {} as Record<string, string>);
    default:
      return null;
  }
}

export function validateExerciseAnswer(
  exercise: Exercise,
  studentAnswer: unknown,
): { isCorrect: boolean; score: number; reason?: string } {

  switch (exercise.type) {
    case 'number_input': {
      const correct = Number(studentAnswer) === exercise.correctAnswer;
      return { isCorrect: correct, score: correct ? 100 : 0 };
    }

    case 'multiple_choice': {
      const correct = Number(studentAnswer) === exercise.correctIndex;
      return { isCorrect: correct, score: correct ? 100 : 0 };
    }

    case 'true_false': {
      const correct = Boolean(studentAnswer) === exercise.correctAnswer;
      return { isCorrect: correct, score: correct ? 100 : 0 };
    }

    case 'fill_blank': {
      // Compare lowercase and trimmed string
      const studentStr = String(studentAnswer).trim().toLowerCase();
      const correctStr = exercise.correctAnswer.trim().toLowerCase();
      const correct = studentStr === correctStr;
      return { isCorrect: correct, score: correct ? 100 : 0 };
    }

    case 'sequencing': {
      const studentOrder = studentAnswer as number[];
      const correct = JSON.stringify(studentOrder) === JSON.stringify(exercise.correctOrder);
      return { isCorrect: correct, score: correct ? 100 : 0 };
    }

    case 'categorize': {
      const studentMap = studentAnswer as Record<string, number>;
      const allCorrect = exercise.items.every(
        (item) => studentMap?.[item.label] === item.categoryIndex
      );
      return { isCorrect: allCorrect, score: allCorrect ? 100 : 0 };
    }

    case 'match_pairs': {
      const studentPairs = studentAnswer as Record<number, number>; // leftIdx → rightIdx
      const allCorrect = exercise.pairs.every((_, i) => studentPairs?.[i] === i);
      return { isCorrect: allCorrect, score: allCorrect ? 100 : 0 };
    }

    case 'label_diagram': {
      const studentLabels = studentAnswer as Record<string, string>; // hotspotId → label
      const allCorrect = exercise.hotspots.every(
        (h) => studentLabels?.[h.id] === h.correctLabel
      );
      return { isCorrect: allCorrect, score: allCorrect ? 100 : 0 };
    }

    default:
      return { isCorrect: false, score: 0, reason: 'Unknown exercise type' };
  }
}
