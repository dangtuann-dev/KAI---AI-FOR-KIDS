import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { buildContextualPrompt } from '@/lib/prompts';
import { checkInput, HARD_BLOCK_RESPONSE, validateExercise } from '@/lib/guardrails';
import { hasGroqKey, getMockChatResponse } from '@/lib/groq';
import Groq from 'groq-sdk';
import { parseAIResponse } from '@/lib/exerciseParser';


export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, grade, subject, studentId, studentName, textbookSet } =
      await request.json();

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Guardrail check
    const check = checkInput(lastUserMessage);
    if (!check.safe && check.type === 'hard_block') {
      // Log guardrail event
      await logFeatureEvent(studentId, 'guardrail_triggered', { 
        message: lastUserMessage.substring(0, 50),
        subject,
        grade
      });
      
      const supabase = createClient();
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        student_id: studentId,
        role: 'assistant',
        content: HARD_BLOCK_RESPONSE,
        guardrail_flagged: true,
      });

      return NextResponse.json({ content: HARD_BLOCK_RESPONSE, flagged: true });
    }

    let content = '';
    let tokensUsed = 0;

    const supabase = createClient();
    
    // Fetch student profile to get character details
    const { data: stdProfile } = await supabase
      .from('student_profiles')
      .select('character_id, character_nickname')
      .eq('id', studentId)
      .single();

    const characterId = stdProfile?.character_id || 'giong';
    const characterNickname = stdProfile?.character_nickname || 'Gióng';

    const { CHARACTER_ROSTER } = require('@/lib/characters');
    const char = CHARACTER_ROSTER.find((c: any) => c.id === characterId) || CHARACTER_ROSTER[0];
    const activeCharacter = {
      ...char,
      nickname: characterNickname || char.nickname
    };

    const systemPrompt = buildContextualPrompt(grade, subject, studentName, textbookSet, activeCharacter);

    if (hasGroqKey()) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const cleanedMessages = messages.slice(-10).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        }));

        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...cleanedMessages,
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        content = completion.choices[0].message.content || '';
        tokensUsed = completion.usage?.total_tokens || 0;
      } catch (err) {
        console.error('Groq API error, falling back to mock response:', err);
        content = getMockChatResponse(lastUserMessage, subject, grade, studentName);
        tokensUsed = 50; // estimate
      }
    } else {
      // Mock mode
      content = getMockChatResponse(lastUserMessage, subject, grade, studentName);
      tokensUsed = 40; // estimate
    }

    // Log user message to DB first (if it wasn't logged on frontend)
    
    // Check if the user message exists already in DB, otherwise insert it
    const { data: existingMsg } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('session_id', sessionId)
      .eq('content', lastUserMessage)
      .eq('role', 'user')
      .limit(1);

    if (!existingMsg || existingMsg.length === 0) {
      const isSystemContext = lastUserMessage.startsWith('[');
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        student_id: studentId,
        role: 'user',
        content: lastUserMessage,
        is_voice: messages[messages.length - 1]?.is_voice || false,
        tokens_used: 10, // estimate
        is_system_context: isSystemContext,
      });
    }

    // Log AI response to DB
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      student_id: studentId,
      role: 'assistant',
      content,
      tokens_used: tokensUsed,
    });

    // Parse and validate exercise if present
    const { caption, exercise, illustration, lessonComplete } = parseAIResponse(content);
    let finalExercise = null;
    if (exercise && validateExercise(exercise, grade, subject)) {
      finalExercise = exercise;
    }

    // Update session stats
    const { data: sessionData } = await supabase
      .from('chat_sessions')
      .select('message_count, voice_message_count')
      .eq('id', sessionId)
      .single();

    if (sessionData) {
      const isVoice = messages[messages.length - 1]?.is_voice || false;
      await supabase
        .from('chat_sessions')
        .update({
          message_count: (sessionData.message_count || 0) + 2,
          voice_message_count: isVoice 
            ? (sessionData.voice_message_count || 0) + 1 
            : (sessionData.voice_message_count || 0),
          duration_seconds: 60 * ((sessionData.message_count || 0) + 2) // estimate 1 min per exchange
        })
        .eq('id', sessionId);
    }

    // Log feature event
    await logFeatureEvent(studentId, 'ai_response', { subject, grade, tokens: tokensUsed });

    return NextResponse.json({ 
      content: caption, 
      exercise: finalExercise, 
      illustration, 
      lessonComplete, 
      flagged: false 
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

async function logFeatureEvent(userId: string, feature: string, metadata = {}) {
  try {
    const supabase = createClient();
    await supabase.from('feature_events').insert({ 
      user_id: userId, 
      feature, 
      metadata 
    });
  } catch (e) {
    console.error('Error logging feature event:', e);
  }
}
