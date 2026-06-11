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
