// lib/curriculumTopics.ts

export const CURRICULUM_TOPICS: Record<string, Record<number, string[]>> = {

  math: {
    1: [
      'Đếm và so sánh số trong phạm vi 10, 20, 100',
      'Cộng trừ không nhớ trong phạm vi 10, 20, 100',
      'Nhận biết hình vuông, hình tròn, hình tam giác, hình chữ nhật',
      'Đo độ dài bằng đơn vị cm',
    ],
    2: [
      'Cộng trừ có nhớ trong phạm vi 100',
      'Bảng nhân 2, 5 và bảng chia 2, 5',
      'Nhận biết khối hộp, khối trụ, khối cầu',
      'Đo lường: kg, lít, xem giờ đúng',
    ],
    3: [
      'Bảng nhân chia từ 2 đến 9',
      'Nhân chia số có hai, ba chữ số với số có một chữ số',
      'Làm quen với phân số (1/2, 1/3, 1/4...)',
      'Chu vi hình chữ nhật, hình vuông',
      'Đo lường: km, g, ml, xem giờ chính xác đến phút',
    ],
    4: [
      'Phân số: so sánh, cộng trừ phân số cùng mẫu số',
      'Số thập phân: đọc, viết, so sánh',
      'Diện tích hình bình hành, hình thoi',
      'Tỉ lệ bản đồ đơn giản',
    ],
    5: [
      'Số thập phân: cộng trừ nhân chia',
      'Tỉ số phần trăm',
      'Diện tích, thể tích hình hộp chữ nhật, hình lập phương',
      'Toán chuyển động (vận tốc, thời gian, quãng đường) cơ bản',
    ],
  },

  vietnamese: {
    1: ['Đánh vần, ghép âm - vần', 'Đọc các từ, câu đơn giản', 'Tập viết chữ cái và số'],
    2: ['Chính tả từ có vần khó', 'Đọc hiểu đoạn văn ngắn', 'Đặt câu theo mẫu'],
    3: ['Chính tả, phân biệt l/n, tr/ch, s/x', 'Đọc hiểu đoạn văn, trả lời câu hỏi', 'Từ chỉ sự vật, hoạt động, đặc điểm'],
    4: ['Từ đơn, từ ghép, từ láy', 'Danh từ, động từ, tính từ', 'Đọc hiểu và tóm tắt đoạn văn'],
    5: ['Từ đồng nghĩa, từ trái nghĩa', 'Câu đơn, câu ghép', 'Đọc hiểu văn bản, viết đoạn văn ngắn'],
  },

  english: {
    // Ngoại ngữ 1 bắt buộc từ lớp 3 theo GDPT 2018
    3: ['Chào hỏi cơ bản (Hello, Goodbye)', 'Số đếm 1-20', 'Màu sắc (colors)', 'Đồ vật trong lớp học', 'Các thành viên gia đình'],
    4: ['Sở thích (likes/dislikes)', 'Thời tiết và các mùa', 'Tên các môn học', 'Động vật và nơi sống', 'Thì hiện tại đơn cơ bản'],
    5: ['Nghề nghiệp (jobs)', 'Thời gian trong ngày', 'Địa điểm và phương hướng', 'Câu hỏi What/Where/When/Who', 'Du lịch và phương tiện giao thông'],
  },

  science: {
    // Lớp 1-3: Tự nhiên và Xã hội | Lớp 4-5: Khoa học
    1: ['Các bộ phận cơ thể và giác quan', 'Gia đình và ngôi nhà', 'An toàn khi ở nhà và đến trường'],
    2: ['Thực vật và động vật quen thuộc', 'Giữ vệ sinh cá nhân', 'An toàn giao thông cơ bản'],
    3: ['Chức năng các bộ phận của thực vật (rễ, thân, lá, hoa, quả)', 'Động vật: nơi sống và thức ăn', 'Con người: dinh dưỡng và sức khỏe', 'Cộng đồng địa phương'],
    4: ['Nước, không khí: tính chất và vai trò', 'Ánh sáng và âm thanh', 'Thực vật: quá trình trao đổi chất', 'Động vật: quá trình trao đổi chất'],
    5: ['Năng lượng: nhiệt, điện, ánh sáng', 'Sự sinh sản của thực vật và động vật', 'Con người: các giai đoạn phát triển', 'Trái Đất và bầu trời (ngày/đêm, mùa)'],
  },

  history_geo: {
    // Lịch sử và Địa lí — chỉ Lớp 4-5
    4: ['Bản đồ Việt Nam và các vùng miền', 'Thiên nhiên và con người miền Bắc'],
    5: ['Các giai đoạn lịch sử Việt Nam (tổng quan)', 'Danh nhân và di tích lịch sử nổi bật', 'Thiên nhiên và con người miền Nam, miền Trung'],
  },

  ethics: {
    1: ['Yêu thương gia đình', 'Lễ phép với người lớn', 'Trung thực'],
    2: ['Tự giác làm việc của mình', 'Quan tâm, chia sẻ với bạn bè', 'Giữ lời hứa'],
    3: ['Tôn trọng người khác', 'Tích cực hoàn thành nhiệm vụ', 'Khám phá bản thân'],
    4: ['Yêu lao động', 'Quý trọng thời gian', 'Bảo vệ cái đúng, cái tốt'],
    5: ['Có trách nhiệm với bản thân', 'Tôn trọng sự khác biệt', 'Bảo vệ môi trường'],
  },

  informatics: {
    // Tin học — bắt buộc từ Lớp 3
    3: ['Làm quen với máy tính', 'Sắp xếp các bước thực hiện một việc đơn giản (thuật toán)'],
    4: ['Thư mục và tệp cơ bản', 'Sắp xếp thuật toán có điều kiện đơn giản', 'An toàn khi sử dụng Internet'],
    5: ['Tổ chức thông tin', 'Thuật toán tuần tự và rẽ nhánh', 'Sử dụng Internet an toàn, có trách nhiệm'],
  },
};

export const SUBJECT_LABELS: Record<string, string> = {
  math: 'Toán',
  vietnamese: 'Tiếng Việt',
  english: 'Tiếng Anh',
  science: 'Khoa học / Tự nhiên và Xã hội',
  history_geo: 'Lịch sử & Địa lí',
  ethics: 'Đạo đức',
  informatics: 'Tin học',
};
