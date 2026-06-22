// lib/gamification.ts

export const XP_REWARDS = {
  // Trong app
  exercise_correct_first_try: 30,   // Làm đúng ngay lần đầu
  exercise_correct_after_hint: 15,  // Đúng sau khi được gợi ý
  lesson_complete: 100,             // Hoàn thành 1 lesson
  streak_daily: 20,                 // Học ít nhất 10 phút trong ngày
  streak_bonus_3days: 50,           // Streak 3 ngày liên tiếp
  streak_bonus_7days: 150,          // Streak 7 ngày
  explain_reasoning: 25,            // Bé tự giải thích được (AI detect)

  // Ngoài đời thực (phụ huynh xác nhận)
  read_book_30min: 60,              // Đọc sách 30 phút
  help_parent: 40,                  // Giúp đỡ ba mẹ
  observe_nature: 35,              // Quan sát thiên nhiên + kể lại
  good_deed: 50,                   // Làm việc tốt
  personal_goal: 80,               // Hoàn thành mục tiêu cá nhân
  screen_free_day: 100,            // 1 ngày không dùng thiết bị giải trí
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000
];

export const EVOLUTION_THRESHOLDS = [
  0,    // Stage 1 (mặc định)
  300,  // Stage 2 (sau ~2 tuần học đều)
  800,  // Stage 3 (sau ~1 tháng)
  2000, // Stage 4 — hình thái cuối (sau ~3 tháng nghiêm túc)
];

export function getLevelForXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function getCharacterEvolutionStage(xp: number): number {
  return EVOLUTION_THRESHOLDS.reduce((stage, threshold, i) =>
    xp >= threshold ? i : stage, 0
  );
}

export const ACHIEVEMENT_BADGES = [
  // Học tập
  { id: 'trong_dong', name: 'Trống Đồng', condition: 'Hoàn thành 10 bài học', icon: '🥁', rarity: 'common' },
  { id: 'ao_dai', name: 'Áo Dài Tri Thức', condition: '7 ngày streak', icon: '🏮', rarity: 'uncommon' },
  { id: 'hoa_sen', name: 'Hoa Sen Vươn Lên', condition: 'Sai 3 lần, làm lại đúng', icon: '🪷', rarity: 'rare' },
  { id: 'rong_vang', name: 'Rồng Vàng Học Giỏi', condition: '100% đúng trong 5 bài liên tiếp', icon: '🐉', rarity: 'epic' },
  { id: 'sao_khue', name: 'Sao Khuê Sáng Tỏ', condition: 'Lên level 10', icon: '⭐', rarity: 'legendary' },
  // Tính cách
  { id: 'hieu_hoc', name: 'Hiếu Học', condition: '30 ngày có ít nhất 1 buổi học', icon: '📚', rarity: 'rare' },
  { id: 'nhan_ai', name: 'Nhân Ái', condition: 'Phụ huynh xác nhận 5 lần "giúp đỡ"', icon: '💝', rarity: 'uncommon' },
  { id: 'kien_tri', name: 'Kiên Trì', condition: 'Làm lại bài tập sau khi sai 5 lần', icon: '🦾', rarity: 'rare' },
  // Văn hóa
  { id: 'truyen_co', name: 'Người Kể Chuyện', condition: 'Nghe 5 câu chuyện cổ tích', icon: '📜', rarity: 'uncommon' },
  { id: 'di_san', name: 'Người Giữ Di Sản', condition: 'Hoàn thành 10 bài Lịch sử & Địa lý', icon: '🏛️', rarity: 'rare' },
];
