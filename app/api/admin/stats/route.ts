import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(true); // service role client

    // Fetch all database records for calculation
    const [profilesRes, sessionsRes, messagesRes, eventsRes, attemptsRes] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('chat_sessions').select('started_at, message_count, voice_message_count, subject, grade'),
      supabase.from('chat_messages').select('role, is_voice, content, guardrail_flagged, created_at'),
      supabase.from('feature_events').select('feature, created_at, metadata'),
      supabase.from('exercise_attempts').select('exercise_type, is_correct'),
    ]);

    const profiles = profilesRes.data || [];
    const sessions = sessionsRes.data || [];
    const messages = messagesRes.data || [];
    const events = eventsRes.data || [];
    const attempts = attemptsRes?.data || [];

    const totalStudents = profiles.filter((p: any) => p.role === 'student').length;
    const totalParents = profiles.filter((p: any) => p.role === 'parent').length;
    const totalSessions = sessions.length;
    const totalMessages = messages.length;

    // Today's sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessionsCount = sessions.filter((s: any) => new Date(s.started_at) >= todayStart).length;

    // Voice rate: percentage of user messages that are voice
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const totalUserMessages = userMessages.length;
    const voiceUserMessages = userMessages.filter((m: any) => m.is_voice).length;
    const voiceRate = totalUserMessages > 0 ? Math.round((voiceUserMessages / totalUserMessages) * 100) : 0;

    // Feature usage stats
    const featureCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      featureCounts[e.feature] = (featureCounts[e.feature] || 0) + 1;
    });

    // Guardrail events trend (last 7 days)
    const guardrailEventsTrend: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(dateStr => {
      guardrailEventsTrend[dateStr] = 0;
    });

    messages
      .filter((m: any) => m.guardrail_flagged)
      .forEach((m: any) => {
        const dateStr = new Date(m.created_at).toISOString().split('T')[0];
        if (dateStr in guardrailEventsTrend) {
          guardrailEventsTrend[dateStr]++;
        }
      });

    const guardrailChartData = Object.entries(guardrailEventsTrend).map(([date, count]) => ({
      date,
      count,
    }));

    // Sessions by subject
    const subjectCounts: Record<string, number> = {
      math: 0,
      vietnamese: 0,
      science: 0,
      ethics: 0,
      english: 0,
      history: 0,
    };
    sessions.forEach((s: any) => {
      if (s.subject && s.subject in subjectCounts) {
        subjectCounts[s.subject]++;
      }
    });

    // Grade distribution
    const gradeCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    sessions.forEach((s: any) => {
      if (s.grade && s.grade >= 1 && s.grade <= 5) {
        gradeCounts[String(s.grade)]++;
      }
    });

    // Top 5 questions
    const questionFrequencies: Record<string, number> = {};
    messages
      .filter((m: any) => m.role === 'user' && !m.guardrail_flagged)
      .forEach((m: any) => {
        const cleanContent = m.content.trim();
        if (cleanContent.length > 3) {
          questionFrequencies[cleanContent] = (questionFrequencies[cleanContent] || 0) + 1;
        }
      });

    const topQuestions = Object.entries(questionFrequencies)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Exercise attempts analysis
    const exerciseTypeStats: Record<string, { correct: number; total: number }> = {};
    attempts.forEach((att: any) => {
      const type = att.exercise_type;
      if (!type) return;
      if (!exerciseTypeStats[type]) {
        exerciseTypeStats[type] = { correct: 0, total: 0 };
      }
      exerciseTypeStats[type].total += 1;
      if (att.is_correct) {
        exerciseTypeStats[type].correct += 1;
      }
    });

    const exerciseStats = Object.entries(exerciseTypeStats).map(([type, stats]) => ({
      type,
      count: stats.total,
      correctRate: Math.round((stats.correct / stats.total) * 100),
    }));

    return NextResponse.json({
      overview: {
        totalSessions,
        totalMessages,
        totalStudents,
        totalParents,
        todaySessions: todaySessionsCount,
        voiceRate,
      },
      featureUsage: featureCounts,
      subjectUsage: subjectCounts,
      gradeUsage: gradeCounts,
      guardrailTrend: guardrailChartData,
      topQuestions,
      exerciseStats,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
