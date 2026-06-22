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

    let xpEarned = 0;
    let newLevel = 1;
    let newStage = 0;
    let newXp = 0;
    let leveledUp = false;

    if (is_correct) {
      // Check if there was any previous failed attempt in this session for the same topic
      const { data: prevAttempts } = await supabase
        .from('exercise_attempts')
        .select('id')
        .eq('session_id', session_id)
        .eq('topic', topic)
        .eq('is_correct', false);

      const hasFailedPrev = prevAttempts && prevAttempts.length > 0;
      xpEarned = hasFailedPrev ? 15 : 30;

      // Fetch student profile to update XP
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('character_xp, character_level, character_evolution_stage')
        .eq('id', student_id)
        .single();

      if (profile) {
        const currentXp = profile.character_xp || 0;
        const currentLevel = profile.character_level || 1;
        newXp = currentXp + xpEarned;

        const { getLevelForXp, getCharacterEvolutionStage } = require('@/lib/gamification');
        newLevel = getLevelForXp(newXp);
        newStage = getCharacterEvolutionStage(newXp);
        leveledUp = newLevel > currentLevel;

        await supabase
          .from('student_profiles')
          .update({
            character_xp: newXp,
            character_level: newLevel,
            character_evolution_stage: newStage,
            last_active_at: new Date().toISOString()
          })
          .eq('id', student_id);

        // Audit log XP transaction
        await supabase
          .from('xp_transactions')
          .insert({
            student_id,
            amount: xpEarned,
            reason: xpEarned === 30 ? 'exercise_correct_first_try' : 'exercise_correct_after_hint',
            metadata: { session_id, topic, exercise_type }
          });
      }
    }

    return NextResponse.json({ 
      success: true, 
      data, 
      xpEarned, 
      xpTotal: newXp, 
      level: newLevel, 
      evolutionStage: newStage,
      leveledUp 
    });
  } catch (error: any) {
    console.error('Exercise attempt logger error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
