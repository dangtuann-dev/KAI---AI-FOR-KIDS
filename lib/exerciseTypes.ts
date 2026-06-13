// lib/exerciseTypes.ts

export interface MultipleChoiceExercise {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctIndex: number;
  emoji?: string;
}

export interface NumberInputExercise {
  type: 'number_input';
  question: string;
  correctAnswer: number;
  visualHint?: string;
}

export interface FillBlankExercise {
  type: 'fill_blank';
  sentence: string; // dùng "___" đánh dấu chỗ trống
  correctAnswer: string;
  wordBank?: string[];
}

export interface TrueFalseExercise {
  type: 'true_false';
  statement: string;
  correctAnswer: boolean;
}

export interface SequencingExercise {
  type: 'sequencing';
  instruction: string;
  items: string[];
  correctOrder: number[]; // index gốc theo thứ tự đúng
}

export interface CategorizeExercise {
  type: 'categorize';
  instruction: string;
  categories: [string, string]; // luôn 2 nhóm cho prototype
  items: { label: string; categoryIndex: 0 | 1; emoji?: string }[];
}

export interface MatchPairsExercise {
  type: 'match_pairs';
  instruction: string;
  pairs: { left: string; right: string }[];
}

export interface LabelDiagramExercise {
  type: 'label_diagram';
  instruction: string;
  diagramId: string; // phải khớp DIAGRAM_LIBRARY
  hotspots: { id: string; correctLabel: string }[];
  labelOptions: string[];
}

export type Exercise =
  | MultipleChoiceExercise
  | NumberInputExercise
  | FillBlankExercise
  | TrueFalseExercise
  | SequencingExercise
  | CategorizeExercise
  | MatchPairsExercise
  | LabelDiagramExercise;

export interface ExerciseResult {
  exercise: Exercise;
  studentAnswer: unknown;
  isCorrect: boolean;
  timeSpentMs: number;
}
