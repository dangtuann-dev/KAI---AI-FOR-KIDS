// lib/lessonPlans.ts

export interface LessonConcept {
  id: string;
  title: string; // Ý chính cần dạy
  teachingHint: string; // Gợi ý cách giải thích + ví dụ gần gũi
  illustrationType?: string; // loại minh họa nên dùng
}

export interface Lesson {
  id: string;
  subject: string;
  grade: number;
  order: number; // thứ tự trong lộ trình
  title: string; // Tên bài học hiển thị cho bé
  concepts: LessonConcept[];
  // Tên gọi theo từng bộ SGK — giúp KAI nói đúng "ngôn ngữ" của bé
  textbookHints?: Partial<Record<'ket_noi_tri_thuc' | 'chan_troi_sang_tao' | 'canh_dieu', string>>;
}

export const LESSON_PLANS: Record<string, Record<number, Lesson[]>> = {
  math: {
    3: [
      {
        id: 'math-g3-l01',
        subject: 'math',
        grade: 3,
        order: 1,
        title: 'Ôn tập các số đến 1000',
        concepts: [
          {
            id: 'c1',
            title: 'Đọc, viết số có 3 chữ số',
            teachingHint: 'Dùng ví dụ tiền Việt Nam (tờ 100k, 10k, 1k) để minh họa hàng trăm/chục/đơn vị. So sánh với việc xếp 3 hộp bút: hộp to=trăm, hộp vừa=chục, hộp nhỏ=đơn vị.',
            illustrationType: 'place_value_blocks',
          },
          {
            id: 'c2',
            title: 'So sánh hai số có 3 chữ số',
            teachingHint: 'So sánh như cân nặng: số nào "nặng" hơn (chữ số hàng trăm lớn hơn) thì lớn hơn. Dùng emoji 🐘 (nặng) vs 🐭 (nhẹ) để minh họa.',
            illustrationType: 'number_comparison',
          },
        ],
        textbookHints: {
          ket_noi_tri_thuc: 'Bài 1: Ôn tập các số đến 1000',
          chan_troi_sang_tao: 'Chủ đề 1: Em làm được những gì sau lớp 2?',
          canh_dieu: 'Bài 1: Ôn tập về số và phép tính trong phạm vi 1000',
        },
      },
      {
        id: 'math-g3-l02',
        subject: 'math',
        grade: 3,
        order: 2,
        title: 'Bảng nhân 6',
        concepts: [
          {
            id: 'c1',
            title: 'Ý nghĩa phép nhân (cộng nhiều số bằng nhau)',
            teachingHint: 'Ví dụ: Mỗi bạn có 6 cái kẹo, 3 bạn có tất cả bao nhiêu? → 6+6+6 = 6×3. Dùng emoji 🍬 lặp lại theo nhóm để bé nhìn thấy "nhóm".',
            illustrationType: 'grouping_visual',
          },
          {
            id: 'c2',
            title: 'Học bảng nhân 6 (6×1 đến 6×10)',
            teachingHint: 'Dạy theo nhịp, liên hệ: 6×2=12 giống "2 chiếc xe 6 bánh"... Khuyến khích bé đọc to cùng KAI (voice).',
            illustrationType: 'multiplication_table',
          },
        ],
        textbookHints: {
          ket_noi_tri_thuc: 'Bài 12: Bảng nhân 6',
          chan_troi_sang_tao: 'Bài: Phép nhân trong bảng nhân 6',
          canh_dieu: 'Bài 12: Bảng nhân 6',
        },
      },
    ],
  },

  english: {
    3: [
      {
        id: 'eng-g3-l01',
        subject: 'english',
        grade: 3,
        order: 1,
        title: 'Chào hỏi — Hello & Goodbye',
        concepts: [
          {
            id: 'c1',
            title: 'Hello / Hi / Goodbye / Bye',
            teachingHint: 'Liên hệ với cách chào "Xin chào" / "Tạm biệt" bé đã biết tiếng Việt. Dùng nhân vật KAI tự chào trước làm mẫu, sau đó mời bé chào lại bằng giọng nói.',
            illustrationType: 'emoji_dialogue',
          },
          {
            id: 'c2',
            title: 'How are you? / I am fine, thank you',
            teachingHint: 'Tạo hội thoại ngắn 2 câu, để bé tập nói theo qua voice — đây là môn được lợi nhất từ tính năng voice-first.',
            illustrationType: 'emoji_dialogue',
          },
        ],
        textbookHints: {},
      },
    ],
  },
};

export function getNextLesson(subject: string, grade: number, completedLessonIds: string[]): Lesson | null {
  const lessons = LESSON_PLANS[subject]?.[grade] ?? [];
  return lessons.find(l => !completedLessonIds.includes(l.id)) ?? null;
}

export function getLessonByOrder(subject: string, grade: number, order: number): Lesson | null {
  const lessons = LESSON_PLANS[subject]?.[grade] ?? [];
  return lessons.find(l => l.order === order) ?? null;
}
