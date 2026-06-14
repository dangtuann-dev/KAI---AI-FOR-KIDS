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
  
  // Custom response logic for lesson auto-start and progress
  if (msg.includes('tự động bắt đầu bài học') || msg.includes('bài học mới') || msg.includes('hệ thống — tự động bắt đầu bài học') || msg.includes('hệ thống — tiếp tục bài học')) {
    if (subject === 'math') {
      return `Chào bé! Hôm nay chúng mình học Bài 1: Ôn tập các số đến 1000 nhé! Bé có 3 hộp bút, mỗi hộp có 100 cái bút — bé có bao nhiêu cái bút tất cả? 🤔\n<illustration>{"type":"place_value_blocks","value":300,"label":"Số 300 gồm 3 trăm"}</illustration>\n<exercise>{"type":"number_input","question":"3 hộp × 100 = ?","correctAnswer":300,"visualHint":"3 × 100 = ?"}</exercise>`;
    } else if (subject === 'english') {
      return `Hello! Hôm nay chúng mình học bài Chào hỏi - Hello & Goodbye nhé. Hãy tập nói theo KAI nào! 👋\n<illustration>{"type":"emoji_dialogue","lines":[{"speaker":"kai","text_en":"Hello!","text_vi":"Xin chào!"},{"speaker":"student","text_en":"Hi! How are you?","text_vi":"Chào! Bạn khỏe không?"}]}</illustration>\n<exercise>{"type":"multiple_choice","question":"Khi gặp ai đó, câu chào nào phổ biến nhất?","options":["Goodbye","Hello","Thank you","Please"],"correctIndex":1,"emoji":"👋"}</exercise>`;
    }
  }

  if (msg.includes('kết quả bài tập') && msg.includes('đúng')) {
    if (subject === 'math') {
      if (message.includes('place_value_blocks') || message.includes('number_input')) {
        return `Đúng rồi! Bé giỏi quá! 🌟 Giờ mình học cách SO SÁNH 2 số nha — số nào 'to' hơn? ✨\n<illustration>{"type":"number_comparison","valueA":156,"valueB":203,"labelA":"Số thứ nhất","labelB":"Số thứ hai"}</illustration>\n<exercise>{"type":"number_input","question":"Số nào lớn hơn: 156 hay 203?","correctAnswer":203,"visualHint":"So sánh hàng trăm trước nhé!"}</exercise>`;
      } else {
        return `Tuyệt vời! Bé đã hoàn thành xuất sắc bài học hôm nay rồi! 🎉 Bé đã nắm vững kiến thức ôn tập các số đến 1000 rồi đấy.\n<lesson_complete>{"lessonId":"math-g3-l01"}</lesson_complete>`;
      }
    } else if (subject === 'english') {
      if (message.includes('multiple_choice') || message.includes('emoji_dialogue')) {
        return `Great job! Bé phát âm rất chuẩn đấy. Giờ mình học cách hỏi thăm sức khỏe nha! ✨\n<illustration>{"type":"emoji_dialogue","lines":[{"speaker":"kai","text_en":"How are you?","text_vi":"Bạn khỏe không?"},{"speaker":"student","text_en":"I am fine, thank you!","text_vi":"Mình khỏe, cảm ơn bạn!"}]}</illustration>\n<exercise>{"type":"multiple_choice","question":"Để trả lời cho câu hỏi 'How are you?', bé dùng câu nào?","options":["Hello","I am fine, thank you","Goodbye","Bye"],"correctIndex":1,"emoji":"💖"}</exercise>`;
      } else {
        return `Excellent! Bé đã hoàn thành xuất sắc bài học chào hỏi hôm nay rồi! 🎉\n<lesson_complete>{"lessonId":"eng-g3-l01"}</lesson_complete>`;
      }
    }
  }

  if (msg.includes('kết quả bài tập') && msg.includes('sai')) {
    return `Gần đúng rồi! Bé đừng buồn nha. Thử làm lại câu này dễ hơn nhé! 🌟\n<exercise>{"type":"true_false","statement":"Số 234 có chữ số hàng trăm là 2 đúng hay sai?","correctAnswer":true}</exercise>`;
  }

  // Custom response logic for practice mode triggers
  if (msg.includes('bài tập 1') || msg.includes('multiple_choice') || msg.includes('trắc nghiệm')) {
    return `KAI có bài tập trắc nghiệm thú vị cho bé đây! 🌟\n<exercise>\n{"type":"multiple_choice","question":"Hình nào có 3 cạnh và 3 góc hả bé?","options":["Hình vuông","Hình tròn","Hình tam giác","Hình chữ nhật"],"correctIndex":2,"emoji":"📐"}\n</exercise>`;
  }
  if (msg.includes('bài tập 2') || msg.includes('number_input') || msg.includes('điền số') || msg.includes('cộng trừ')) {
    return `Thử tài tính toán điền số cùng KAI nhé! 🔢\n<exercise>\n{"type":"number_input","question":"Có 7 quả táo thêm 5 quả táo nữa thì bằng bao nhiêu quả táo?","correctAnswer":12,"visualHint":"🍎🍎🍎🍎🍎🍎🍎 + 🍎🍎🍎🍎🍎"}\n</exercise>`;
  }
  if (msg.includes('bài tập 3') || msg.includes('fill_blank') || msg.includes('điền từ') || msg.includes('chỗ trống')) {
    return `Con điền từ còn thiếu vào chỗ trống nha! ✏️\n<exercise>\n{"type":"fill_blank","sentence":"Con mèo đang ___ trên chiếc ghế ấm áp.","correctAnswer":"ngồi","wordBank":["ngồi","chạy","bay","bơi"]}\n</exercise>`;
  }
  if (msg.includes('bài tập 4') || msg.includes('true_false') || msg.includes('đúng sai')) {
    return `Nhận định này đúng hay sai nhỉ? Bé đoán xem! 🤔\n<exercise>\n{"type":"true_false","statement":"Cây xanh cần có ánh sáng Mặt Trời để sống và phát triển đúng không bé?","correctAnswer":true}\n</exercise>`;
  }
  if (msg.includes('bài tập 5') || msg.includes('sequencing') || msg.includes('sắp xếp')) {
    return `Sắp xếp các bước sau theo đúng thứ tự nhé! 🧩\n<exercise>\n{"type":"sequencing","instruction":"Sắp xếp các bước rửa tay đúng thứ tự nhé!","items":["Lau khô tay bằng khăn sạch","Làm ướt tay bằng nước","Xoa xà phòng tạo bọt","Xả sạch xà phòng với nước"],"correctOrder":[1,2,3,0]}\n</exercise>`;
  }
  if (msg.includes('bài tập 6') || msg.includes('categorize') || msg.includes('phân loại')) {
    return `Bé phân loại các vật này vào đúng nhóm nhé! 📁\n<exercise>\n{"type":"categorize","instruction":"Bé hãy phân loại các vật này vào 2 nhóm Sống và Không sống nhé!","categories":["Sống","Không sống"],"items":[{"label":"Cây bàng","categoryIndex":0,"emoji":"🌳"},{"label":"Con chó","categoryIndex":0,"emoji":"🐶"},{"label":"Hòn đá","categoryIndex":1,"emoji":"🪨"},{"label":"Cái bàn","categoryIndex":1,"emoji":"🧱"}]}\n</exercise>`;
  }
  if (msg.includes('bài tập 7') || msg.includes('match_pairs') || msg.includes('ghép cặp') || msg.includes('nối cặp')) {
    return `Bé nối từ tiếng Anh với hình đúng nhé! 🔗\n<exercise>\n{"type":"match_pairs","instruction":"Nối từ tiếng Anh ở cột trái với hình tương ứng ở cột phải!","pairs":[{"left":"Apple","right":"🍎"},{"left":"Dog","right":"🐶"},{"left":"Cat","right":"🐱"}]}\n</exercise>`;
  }
  if (msg.includes('bài tập 8') || msg.includes('label_diagram') || msg.includes('sơ đồ') || msg.includes('nhãn sơ đồ')) {
    return `Bé gắn tên cho các bộ phận của cây nhé! 🔬\n<exercise>\n{"type":"label_diagram","instruction":"Bé gắn tên đúng cho từng bộ phận của cây nhé!","diagramId":"plant_parts","hotspots":[{"id":"root","correctLabel":"Rễ"},{"id":"stem","correctLabel":"Thân"},{"id":"leaf","correctLabel":"Lá"},{"id":"flower","correctLabel":"Hoa"},{"id":"fruit","correctLabel":"Quả"}],"labelOptions":["Rễ","Thân","Lá","Hoa","Quả"]}\n</exercise>`;
  }

  // Trigger random exercise if student says general prompt for practice
  if (msg.includes('bài tập') || msg.includes('luyện tập') || msg.includes('ôn bài') || msg.includes('ôn tập') || msg.includes('làm bài')) {
    const randomType = Math.floor(Math.random() * 8) + 1;
    return getMockChatResponse(`bài tập ${randomType}`, subject, grade, studentName);
  }

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
