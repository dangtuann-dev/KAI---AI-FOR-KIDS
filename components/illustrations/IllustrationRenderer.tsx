'use client';

import React from 'react';
import { GroupingVisual } from './GroupingVisual';
import { PlaceValueBlocks } from './PlaceValueBlocks';
import { NumberComparison } from './NumberComparison';
import { NumberLine } from './NumberLine';
import { EmojiDialogue } from './EmojiDialogue';
import { ComparisonTable } from './ComparisonTable';
import { DiagramStatic } from './DiagramStatic';
import { SentenceBreakdown } from './SentenceBreakdown';
import { MultiplicationTable } from './MultiplicationTable';
import { Illustration } from '@/lib/exerciseParser';

interface IllustrationRendererProps {
  data: Illustration;
}

export function IllustrationRenderer({ data }: IllustrationRendererProps) {
  if (!data) return null;

  switch (data.type) {
    case 'grouping_visual':
      return <GroupingVisual data={data as any} />;
    case 'place_value_blocks':
      return <PlaceValueBlocks data={data as any} />;
    case 'number_comparison':
      return <NumberComparison data={data as any} />;
    case 'number_line':
      return <NumberLine data={data as any} />;
    case 'emoji_dialogue':
      return <EmojiDialogue data={data as any} />;
    case 'comparison_table':
      return <ComparisonTable data={data as any} />;
    case 'diagram_static':
      return <DiagramStatic data={data as any} />;
    case 'sentence_breakdown':
      return <SentenceBreakdown data={data as any} />;
    case 'multiplication_table':
      return <MultiplicationTable data={data as any} />;
    default:
      console.warn('Unknown illustration type:', data.type);
      return null;
  }
}
