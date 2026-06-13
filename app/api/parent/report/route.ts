// app/api/parent/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return NextResponse.json({ error: 'Missing student_id parameter' }, { status: 400 });
    }

    const supabase = createClient(true);

    const { data: attempts, error } = await supabase
      .from('exercise_attempts')
      .select('topic, is_correct')
      .eq('student_id', studentId);

    if (error) {
      console.error('DB error fetching report attempts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({ strengths: [], needsImprovement: [] });
    }

    // Group and calculate accuracy per topic
    const topicStats: Record<string, { correct: number; total: number }> = {};
    attempts.forEach((att: any) => {
      const topic = att.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;
      if (att.is_correct) {
        topicStats[topic].correct += 1;
      }
    });

    const strengths: { topic: string; accuracy: number; total: number }[] = [];
    const needsImprovement: { topic: string; accuracy: number; total: number }[] = [];

    Object.entries(topicStats).forEach(([topic, stats]) => {
      const accuracy = Math.round((stats.correct / stats.total) * 100);
      const item = { topic, accuracy, total: stats.total };
      if (accuracy >= 75) {
        strengths.push(item);
      } else {
        needsImprovement.push(item);
      }
    });

    // Sort strengths by highest accuracy first, needsImprovement by lowest first
    strengths.sort((a, b) => b.accuracy - a.accuracy);
    needsImprovement.sort((a, b) => a.accuracy - b.accuracy);

    return NextResponse.json({ strengths, needsImprovement });
  } catch (error: any) {
    console.error('Parent report API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
