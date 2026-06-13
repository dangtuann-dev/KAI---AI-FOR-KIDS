import { Exercise } from './exerciseTypes';

const HARD_BLOCK_KEYWORDS = [
  'giết', 'đánh nhau', 'dao', 'súng', 'máu', 'chết người',
  'khỏa thân', 'sex', 'ma túy', 'rượu bia',
  'ignore previous', 'forget instructions', 'bỏ qua lệnh',
  'pretend you are', 'giả vờ là', 'jailbreak', 'system prompt',
  'địa chỉ nhà', 'số điện thoại ba mẹ',
];

const SOFT_FLAG_KEYWORDS = [
  'youtube', 'tiktok', 'game online', 'bạn trai', 'bạn gái', 'yêu nhau',
];

export type GuardrailResult =
  | { safe: false; type: 'hard_block' }
  | { safe: false; type: 'soft_flag'; addContext: string }
  | { safe: true };

export function checkInput(message: string): GuardrailResult {
  const lower = message.toLowerCase();
  if (HARD_BLOCK_KEYWORDS.some((kw) => lower.includes(kw))) {
    return { safe: false, type: 'hard_block' };
  }
  if (SOFT_FLAG_KEYWORDS.some((kw) => lower.includes(kw))) {
    return { safe: false, type: 'soft_flag', addContext: 'redirect_to_study' };
  }
  return { safe: true };
}

export const HARD_BLOCK_RESPONSE =
  'Ồ KAI không biết câu đó rồi! 😅 Bé hỏi KAI về bài học đi nhé, KAI sẽ giúp bé học giỏi hơn! 🌟';

export const SOFT_FLAG_RESPONSE_SUFFIX =
  '\n\n(Nhắc nhỏ: KAI chỉ nói chuyện về học tập thôi nhé! 😊 Bé có muốn ôn bài không?)';

export function validateExercise(exercise: Exercise, grade: number, subject: string): boolean {
  if (!exercise) return false;
  
  // 1. Kiểm tra type hợp lệ
  const validTypes = [
    'multiple_choice',
    'number_input',
    'fill_blank',
    'true_false',
    'sequencing',
    'categorize',
    'match_pairs',
    'label_diagram'
  ];
  if (!validTypes.includes(exercise.type)) return false;

  // 2. Kiểm tra label_diagram chỉ dùng diagramId có sẵn
  if (exercise.type === 'label_diagram') {
    const validDiagramIds = ['plant_parts', 'water_cycle', 'digestive_system'];
    if (!validDiagramIds.includes(exercise.diagramId)) return false;
  }

  // 3. Kiểm tra number_input — độ lớn số phù hợp với lớp
  if (exercise.type === 'number_input' && subject === 'math') {
    const gradeInt = Number(grade);
    const maxValue = ({ 1: 100, 2: 100, 3: 1000, 4: 10000, 5: 100000 } as Record<number, number>)[gradeInt] ?? 100;
    if (Math.abs(exercise.correctAnswer) > maxValue) return false;
  }

  return true;
}

