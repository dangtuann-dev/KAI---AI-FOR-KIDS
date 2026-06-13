// components/exercises/ExerciseRenderer.tsx
'use client';

import React, { useRef } from 'react';
import { Exercise, ExerciseResult } from '@/lib/exerciseTypes';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { NumberInputExercise } from './NumberInputExercise';
import { FillBlankExercise } from './FillBlankExercise';
import { TrueFalseExercise } from './TrueFalseExercise';
import { SequencingExercise } from './SequencingExercise';
import { CategorizeExercise } from './CategorizeExercise';
import { MatchPairsExercise } from './MatchPairsExercise';
import { LabelDiagramExercise } from './LabelDiagramExercise';

interface Props {
  exercise: Exercise;
  onComplete: (result: ExerciseResult) => void;
}

export function ExerciseRenderer({ exercise, onComplete }: Props) {
  const startTime = useRef(Date.now());

  const handleAnswer = (studentAnswer: unknown, isCorrect: boolean) => {
    onComplete({
      exercise,
      studentAnswer,
      isCorrect,
      timeSpentMs: Date.now() - startTime.current,
    });
  };

  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoiceExercise data={exercise} onAnswer={handleAnswer} />;
    case 'number_input':
      return <NumberInputExercise data={exercise} onAnswer={handleAnswer} />;
    case 'fill_blank':
      return <FillBlankExercise data={exercise} onAnswer={handleAnswer} />;
    case 'true_false':
      return <TrueFalseExercise data={exercise} onAnswer={handleAnswer} />;
    case 'sequencing':
      return <SequencingExercise data={exercise} onAnswer={handleAnswer} />;
    case 'categorize':
      return <CategorizeExercise data={exercise} onAnswer={handleAnswer} />;
    case 'match_pairs':
      return <MatchPairsExercise data={exercise} onAnswer={handleAnswer} />;
    case 'label_diagram':
      return <LabelDiagramExercise data={exercise} onAnswer={handleAnswer} />;
    default:
      return null;
  }
}
