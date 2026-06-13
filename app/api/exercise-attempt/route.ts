// app/api/exercise-attempt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, session_id, subject, grade, exercise_type, topic, is_correct, time_spent_ms } = body;

    if (!student_id || !session_id || !subject || !grade || !exercise_type || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(true); // admin/service client if needed, or default

    const { data, error } = await supabase.from('exercise_attempts').insert({
      student_id,
      session_id,
      subject,
      grade: Number(grade),
      exercise_type,
      topic,
      is_correct: Boolean(is_correct),
      time_spent_ms: Number(time_spent_ms),
    }).select();

    if (error) {
      console.error('DB error writing exercise attempt:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Exercise attempt logger error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
