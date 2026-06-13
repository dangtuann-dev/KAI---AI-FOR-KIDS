import { createServerClient, createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Detect if we should run in Mock Mode (when Supabase URL is placeholder or empty)
export function isMockMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('your-supabase-project') || url === '';
}

// Node fs import wrapped for Client Component compatibility
let fs: any;
let path: any;
if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
}

const MOCK_DB_FILE = 'mock_db.json';

// Get path to mock database file inside project workspace
function getMockDbPath() {
  if (typeof window !== 'undefined') return '';
  return path.join(process.cwd(), MOCK_DB_FILE);
}

// Initial structure for mock database
const initialMockDb = {
  profiles: [
    {
      id: 'mock-admin-uuid',
      email: 'tuan@kai.com',
      full_name: 'Tuân — Admin KAI',
      role: 'admin',
      avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tuan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-student-uuid',
      email: 'minh@kai.com',
      full_name: 'Bé Minh',
      role: 'student',
      avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=minh',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-parent-uuid',
      email: 'ba@kai.com',
      full_name: 'Bố Minh',
      role: 'parent',
      avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ba',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  student_profiles: [
    {
      id: 'mock-student-uuid',
      grade: 3,
      parent_id: 'mock-parent-uuid',
      total_sessions: 5,
      total_minutes: 45,
      streak_days: 3,
      last_active_at: new Date().toISOString()
    }
  ],
  parent_children: [
    {
      parent_id: 'mock-parent-uuid',
      student_id: 'mock-student-uuid'
    }
  ],
  chat_sessions: [
    {
      id: 'mock-session-uuid-1',
      student_id: 'mock-student-uuid',
      subject: 'math',
      grade: 3,
      started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      ended_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      duration_seconds: 1800,
      message_count: 8,
      voice_message_count: 5,
      ai_model_used: 'llama-3.1-8b-instant'
    },
    {
      id: 'mock-session-uuid-2',
      student_id: 'mock-student-uuid',
      subject: 'vietnamese',
      grade: 3,
      started_at: new Date(Date.now() - 3600000).toISOString(),
      ended_at: new Date(Date.now() - 3600000 + 1200000).toISOString(),
      duration_seconds: 1200,
      message_count: 6,
      voice_message_count: 4,
      ai_model_used: 'llama-3.1-8b-instant'
    }
  ],
  chat_messages: [
    {
      id: 'msg-1',
      session_id: 'mock-session-uuid-1',
      student_id: 'mock-student-uuid',
      role: 'user',
      content: 'Chào KAI, tớ muốn học Toán lớp 3!',
      is_voice: true,
      audio_url: null,
      tokens_used: 10,
      guardrail_flagged: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'msg-2',
      session_id: 'mock-session-uuid-1',
      student_id: 'mock-student-uuid',
      role: 'assistant',
      content: 'Chào Bé Minh! KAI rất vui được học Toán cùng bé. Hôm nay chúng mình sẽ học về các số trong phạm vi 10.000 nhé! Bé có sẵn sàng chưa? 🌟',
      is_voice: false,
      audio_url: null,
      tokens_used: 45,
      guardrail_flagged: false,
      created_at: new Date(Date.now() - 3600000 * 2 + 10000).toISOString()
    }
  ],
  feature_events: [
    {
      id: 'evt-1',
      user_id: 'mock-student-uuid',
      feature: 'session_start',
      metadata: { subject: 'math' },
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'evt-2',
      user_id: 'mock-student-uuid',
      feature: 'voice_input',
      metadata: {},
      created_at: new Date(Date.now() - 7100000).toISOString()
    }
  ],
  admin_settings: {
    app_name: 'KAI Learning',
    ai_model_default: 'llama-3.1-8b-instant',
    voice_enabled: true,
    max_session_minutes: 60
  },
  exercise_attempts: [],
  credentials: [
    { email: 'tuan@kai.com', password: 'tuan1234', id: 'mock-admin-uuid' },
    { email: 'minh@kai.com', password: 'minh1234', id: 'mock-student-uuid' },
    { email: 'ba@kai.com', password: 'ba1234', id: 'mock-parent-uuid' }
  ]
};

// Read database from file (Server-side helper)
function readMockDb() {
  if (typeof window !== 'undefined') {
    // If called in browser, return initialMockDb or retrieve from a mock global
    return (global as any).__mockDb || initialMockDb;
  }
  const dbPath = getMockDbPath();
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialMockDb, null, 2), 'utf-8');
    return initialMockDb;
  }
  try {
    const content = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading mock DB:', error);
    return initialMockDb;
  }
}

// Write database to file (Server-side helper)
function writeMockDb(db: any) {
  if (typeof window !== 'undefined') {
    (global as any).__mockDb = db;
    return;
  }
  const dbPath = getMockDbPath();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing mock DB:', error);
  }
}

// Query builder mock class
class MockQueryBuilder {
  table: string;
  filters: any[] = [];
  sortCol: string | null = null;
  sortAscending = true;
  limitNum: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: any) {
    return this;
  }

  insert(data: any) {
    const db = readMockDb();
    const records = Array.isArray(data) ? data : [data];
    const newRecords = records.map(r => ({
      id: r.id || `mock-uuid-${Math.random().toString(36).substring(2, 11)}`,
      created_at: new Date().toISOString(),
      ...r
    }));

    if (!db[this.table]) {
      db[this.table] = [];
    }

    db[this.table].push(...newRecords);
    writeMockDb(db);

    return Promise.resolve({
      data: Array.isArray(data) ? newRecords : newRecords[0],
      error: null,
      count: newRecords.length
    });
  }

  update(data: any) {
    const db = readMockDb();
    const list = db[this.table] || [];

    let updatedCount = 0;
    const updatedList = list.map((item: any) => {
      // Check if item matches all filters
      const matches = this.filters.every(f => {
        if (f.type === 'eq') return item[f.col] === f.val;
        if (f.type === 'neq') return item[f.col] !== f.val;
        return true;
      });

      if (matches) {
        updatedCount++;
        return { ...item, ...data, updated_at: new Date().toISOString() };
      }
      return item;
    });

    db[this.table] = updatedList;
    writeMockDb(db);

    return Promise.resolve({
      data: updatedList.filter((item: any) => {
        return this.filters.every(f => {
          if (f.type === 'eq') return item[f.col] === f.val;
          return true;
        });
      }),
      error: null,
      count: updatedCount
    });
  }

  eq(col: string, val: any) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  neq(col: string, val: any) {
    this.filters.push({ type: 'neq', col, val });
    return this;
  }

  gte(col: string, val: any) {
    this.filters.push({ type: 'gte', col, val });
    return this;
  }

  order(col: string, options?: any) {
    this.sortCol = col;
    this.sortAscending = options?.ascending !== false;
    return this;
  }

  limit(n: number) {
    this.limitNum = n;
    return this;
  }

  single() {
    return this.then((res: any) => {
      return {
        data: res.data ? res.data[0] || null : null,
        error: res.data && res.data.length > 0 ? null : { message: 'Row not found' }
      };
    });
  }

  // Thenable implementation to support direct `await supabase.from(...)`
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const db = readMockDb();
    let list = db[this.table] || [];

    // Apply filters
    list = list.filter((item: any) => {
      return this.filters.every(f => {
        if (f.type === 'eq') return item[f.col] === f.val;
        if (f.type === 'neq') return item[f.col] !== f.val;
        if (f.type === 'gte') return new Date(item[f.col]) >= new Date(f.val);
        return true;
      });
    });

    // Apply sorting
    if (this.sortCol) {
      list.sort((a: any, b: any) => {
        const valA = a[this.sortCol!];
        const valB = b[this.sortCol!];
        if (valA < valB) return this.sortAscending ? -1 : 1;
        if (valA > valB) return this.sortAscending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitNum !== null) {
      list = list.slice(0, this.limitNum);
    }

    return Promise.resolve({
      data: JSON.parse(JSON.stringify(list)), // Clone to prevent mutation
      error: null,
      count: list.length
    }).then(onfulfilled, onrejected);
  }
}

// Mock auth client
class MockAuth {
  async getUser() {
    if (typeof window !== 'undefined') {
      // In browser, read from session cookie using document.cookie
      const session = this.getCookie('kai-mock-session');
      if (session) {
        try {
          const user = JSON.parse(decodeURIComponent(session));
          return { data: { user }, error: null };
        } catch {}
      }
      return { data: { user: null }, error: null };
    } else {
      // On server, read from next/headers
      try {
        const { cookies } = require('next/headers');
        const cookieStore = cookies();
        const session = cookieStore.get('kai-mock-session')?.value;
        if (session) {
          const user = JSON.parse(decodeURIComponent(session));
          return { data: { user }, error: null };
        }
      } catch {}
      return { data: { user: null }, error: null };
    }
  }

  async signUp({ email, password, options }: any) {
    const db = readMockDb();
    
    // Check if user already exists
    if (db.credentials.some((c: any) => c.email === email)) {
      return { data: { user: null }, error: { message: 'Email đã tồn tại!' } };
    }

    const userId = `mock-user-${Math.random().toString(36).substring(2, 11)}`;
    const newCred = { email, password, id: userId };
    const newProfile = {
      id: userId,
      email,
      full_name: options?.data?.full_name || email.split('@')[0],
      role: options?.data?.role || 'student',
      avatar_url: options?.data?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.credentials.push(newCred);
    db.profiles.push(newProfile);

    // If student, create student profile
    if (newProfile.role === 'student') {
      db.student_profiles.push({
        id: userId,
        grade: options?.data?.grade || 3,
        parent_id: null,
        total_sessions: 0,
        total_minutes: 0,
        streak_days: 0,
        last_active_at: new Date().toISOString()
      });
    }

    writeMockDb(db);

    return { data: { user: newProfile }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    const db = readMockDb();
    const cred = db.credentials.find((c: any) => c.email === email && c.password === password);
    if (!cred) {
      return { data: { user: null, session: null }, error: { message: 'Email hoặc mật khẩu không chính xác!' } };
    }

    const profile = db.profiles.find((p: any) => p.id === cred.id);
    const session = {
      access_token: 'mock-access-token',
      user: profile
    };

    // Store in cookie
    const cookieValue = encodeURIComponent(JSON.stringify(profile));
    if (typeof window !== 'undefined') {
      document.cookie = `kai-mock-session=${cookieValue}; path=/; max-age=604800`;
    } else {
      try {
        const { cookies } = require('next/headers');
        cookies().set('kai-mock-session', cookieValue, { path: '/', maxAge: 604800 });
      } catch {}
    }

    return { data: { user: profile, session }, error: null };
  }

  async signOut() {
    if (typeof window !== 'undefined') {
      document.cookie = 'kai-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } else {
      try {
        const { cookies } = require('next/headers');
        cookies().delete('kai-mock-session');
      } catch {}
    }
    return { error: null };
  }

  async updateUser({ password }: any) {
    const { data: { user } } = await this.getUser();
    if (!user) return { error: { message: 'Chưa đăng nhập!' } };

    const db = readMockDb();
    const cred = db.credentials.find((c: any) => c.id === user.id);
    if (cred && password) {
      cred.password = password;
      writeMockDb(db);
    }
    return { data: { user }, error: null };
  }

  admin = {
    createUser: async ({ email, password, email_confirm, user_metadata }: any) => {
      const db = readMockDb();
      if (db.credentials.some((c: any) => c.email === email)) {
        return { data: { user: null }, error: { message: 'Email đã tồn tại!' } };
      }

      const userId = `mock-admin-created-${Math.random().toString(36).substring(2, 11)}`;
      db.credentials.push({ email, password, id: userId });
      db.profiles.push({
        id: userId,
        email,
        full_name: user_metadata?.full_name || email.split('@')[0],
        role: user_metadata?.role || 'student',
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (user_metadata?.role === 'student') {
        db.student_profiles.push({
          id: userId,
          grade: user_metadata?.grade || 3,
          parent_id: null,
          total_sessions: 0,
          total_minutes: 0,
          streak_days: 0,
          last_active_at: new Date().toISOString()
        });
      }

      writeMockDb(db);
      return { data: { user: { id: userId, email } }, error: null };
    }
  };

  private getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
    return null;
  }
}

// Mock Supabase Client implementation
class MockSupabaseClientClass {
  auth = new MockAuth();

  from(table: string) {
    return new MockQueryBuilder(table);
  }

  // Fallback storage mock
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => {
        return { data: { path: `${bucket}/${path}` }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://mock-storage.supabase.co/${bucket}/${path}` } };
      }
    })
  };
}

// Export createClient helper
export function createClient(useServiceRole = false) {
  if (isMockMode()) {
    return new MockSupabaseClientClass() as any;
  }

  if (useServiceRole) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false },
        global: {
          fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' as any }),
        },
      }
    );
  }

  if (typeof window !== 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  try {
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
  } catch (e) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}
