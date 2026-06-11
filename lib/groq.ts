import Groq from 'groq-sdk';

// Check if Groq API key is valid (not empty and not the default placeholder)
export function hasGroqKey(): boolean {
  const key = process.env.GROQ_API_KEY;
  return !!key && key !== '' && !key.includes('your-groq-api-key');
}

// Initialize Groq client
export const groq = new Groq({
  apiKey: hasGroqKey() ? process.env.GROQ_API_KEY : 'mock-key-not-needed',
});

// A library of friendly kid-appropriate mock responses for different subjects
const MOCK_RESPONSES: Record<string, string[]> = {
  math: [
    "Ồ hay quá! Môn Toán rất thú vị đấy. Bé thử cùng KAI giải câu đố này nhé! Nếu có 3 quả táo, ba cho thêm 2 quả nữa, bé có tất cả mấy quả? 🍎",
    "Tuyệt vời! Bé đang học Toán lớp mấy thế? Hãy hỏi KAI một bài toán khó để chúng mình cùng giải nào! 🔢",
    "Gần đúng rồi! Bé hãy thử đếm lại thật chậm nhé. KAI tin bé sẽ làm được mà! 🌟",
    "Câu hỏi hình học này rất hay! Bé có biết hình tròn khác hình vuông ở điểm nào không? Thử nghĩ xem nhé! 📐"
  ],
  vietnamese: [
    "Học Tiếng Việt thật vui! Bé có muốn cùng KAI tập ghép vần hay tập làm văn không? 📖",
    "Bé giỏi lắm! Từ này chúng mình viết chính tả thế nào nhỉ? Bé thử đánh vần cho KAI nghe nào! ✏️",
    "Câu thơ bé vừa đọc rất hay! Bé có hiểu ý nghĩa của từ đó không? Để KAI giải thích nhé! 🌟"
  ],
  science: [
    "Thế giới tự nhiên có bao nhiêu điều kỳ diệu! Bé có biết tại sao lá cây lại có màu xanh không? 🍃",
    "Đúng rồi! Khoa học giúp chúng ta hiểu hơn về vạn vật quanh mình. Bé muốn tìm hiểu về trái đất hay các vì sao? 🌍🚀",
    "Ồ! Nước khi đóng băng sẽ thành đá đấy bé ạ. Thật kỳ diệu phải không nào? ❄️"
  ],
  english: [
    "Hello! Học Tiếng Anh cùng KAI nhé. Bé có biết 'con ong' trong tiếng Anh là gì không? 🐝",
    "Good job! Bé phát âm rất chuẩn đấy. Let's practice more! 🌟",
    "Chúng mình cùng học các từ chỉ màu sắc nhé. Màu đỏ là 'Red', màu xanh là 'Blue'. Bé thích màu nào? 🎨"
  ],
  ethics: [
    "Bé ngoan lắm! Kính trọng ông bà cha mẹ là việc chúng mình nên làm mỗi ngày đấy. 💖",
    "Giúp đỡ bạn bè khi gặp khó khăn là một hành động rất đẹp. Bé hôm nay đã giúp ai chưa? 🤝",
    "Khi có lỗi, chúng mình dũng cảm nhận lỗi và sửa sai nhé. Bé rất đáng khen! 🌟"
  ],
  general: [
    "KAI nghe rõ rồi! Bé ngoan quá. Hôm nay đi học có gì vui kể KAI nghe với nào! 😊",
    "Ồ, câu hỏi đó thú vị thật! Nhưng KAI chỉ biết chuyện học thôi. Bé hỏi KAI về bài tập Toán hoặc Tiếng Việt đi! 📚",
    "Bé giỏi quá! Hãy cùng KAI tiếp tục khám phá bài học ngày hôm nay nhé! 🚀"
  ]
};

// Generates a mock chat response based on user input, subject, and grade
export function getMockChatResponse(message: string, subject: string, grade: number, studentName = 'bé'): string {
  const msg = message.toLowerCase();
  
  // Custom response logic for math calculations
  if (subject === 'math') {
    if (msg.includes('cộng') || msg.includes('+') || msg.includes('bằng mấy') || msg.includes('bằng bao nhiêu')) {
      return `Ồ, bài toán tính cộng này hay quá! Lớp ${grade} chúng mình sẽ làm như sau: bé thử lấy các ngón tay ra đếm hoặc vẽ ra nháp xem sao nhé. Cố lên, bé sắp tìm ra đáp án rồi! 🌟`;
    }
  }

  if (msg.includes('chào') || msg.includes('hello') || msg.includes('hi')) {
    return `KAI chào ${studentName}! 👋 Hôm nay chúng mình sẽ cùng học môn ${
      subject === 'math' ? 'Toán' : 
      subject === 'vietnamese' ? 'Tiếng Việt' : 
      subject === 'science' ? 'Khoa học' : 
      subject === 'english' ? 'Tiếng Anh' : 
      subject === 'ethics' ? 'Đạo đức' : 'học tập'
    } nhé. Bé muốn hỏi KAI điều gì nào? 🌟`;
  }

  // Fallback to random responses by subject
  const list = MOCK_RESPONSES[subject] || MOCK_RESPONSES.general;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

// Generates mock voice transcription based on audio state
export function getMockTranscription(): string {
  const mockPrompts = [
    "KAI ơi, hai cộng ba bằng mấy thế?",
    "Hôm nay em học môn Toán lớp 3.",
    "Lá cây tại sao lại có màu xanh hả KAI?",
    "KAI giải thích cho em từ này viết thế nào ạ?",
    "Hello KAI, how are you today?",
    "KAI ơi, giúp em làm bài tập làm văn với!"
  ];
  const index = Math.floor(Math.random() * mockPrompts.length);
  return mockPrompts[index];
}
