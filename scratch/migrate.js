process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env variables manually from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('Error: POSTGRES_URL or POSTGRES_URL_NON_POOLING not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  console.log('Connecting to database...');
  await client.connect();
  console.log('Connected.');

  const query = `
    -- Add columns to student_profiles
    ALTER TABLE public.student_profiles
      ADD COLUMN IF NOT EXISTS textbook_set TEXT;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'student_profiles' AND constraint_name = 'student_profiles_textbook_set_check'
      ) THEN
        ALTER TABLE public.student_profiles 
          ADD CONSTRAINT student_profiles_textbook_set_check 
          CHECK (textbook_set IN ('ket_noi_tri_thuc', 'chan_troi_sang_tao', 'canh_dieu', 'unknown'));
      END IF;
    END $$;

    ALTER TABLE public.student_profiles
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

    -- Create lesson_progress table
    CREATE TABLE IF NOT EXISTS public.lesson_progress (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER NOT NULL,
      current_lesson_id TEXT,
      current_concept_index INTEGER DEFAULT 0,
      completed_lesson_ids TEXT[] DEFAULT '{}',
      last_session_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT student_subject_unique UNIQUE(student_id, subject)
    );

    -- Enable Row Level Security (RLS)
    ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'lesson_progress' AND policyname = 'Student manages own progress'
      ) THEN
        CREATE POLICY "Student manages own progress" ON public.lesson_progress
          FOR ALL USING (student_id = auth.uid());
      END IF;
    END $$;
  `;

  try {
    console.log('Executing migration script...');
    await client.query(query);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
  }
}

main();
