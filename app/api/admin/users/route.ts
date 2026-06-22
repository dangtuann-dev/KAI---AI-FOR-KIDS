import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(true); // service role

    // Get profiles
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profError) throw profError;

    // Get student profiles
    const { data: studentProfiles } = await supabase
      .from('student_profiles')
      .select('*');

    // Combine them
    const combinedUsers = profiles.map((p: any) => {
      const sp = studentProfiles?.find((s: any) => s.id === p.id) || null;
      return {
        ...p,
        studentInfo: sp,
      };
    });

    return NextResponse.json({ users: combinedUsers });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(true); // service role
    const body = await request.json();
    const { id, full_name, role, grade } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID người dùng' }, { status: 400 });
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (profileError) throw profileError;

    // If student and grade is provided, update student_profile
    if (role === 'student' && grade !== undefined) {
      // Check if student profile exists
      const { data: existingSp } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', id)
        .single();

      if (existingSp) {
        await supabase
          .from('student_profiles')
          .update({ grade })
          .eq('id', id);
      } else {
        await supabase
          .from('student_profiles')
          .insert({ id, grade });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
