/**
 * ĐẢO PHIÊU LƯU TỪ VỰNG — VIETNAMESE LEARNING GAME
 * Thiết kế cho iPad thế hệ 7 Safari & Web hiện đại
 */

// ==========================================
// 1. TRẠNG THÁI ỨNG DỤNG (APP STATE)
// ==========================================
const state = {
  items: [],
  lessons: [],
  currentLessonIndex: 0,
  currentWordIndex: 0,
  currentWord: null,
  currentDialect: 'north', // 'north' (Bắc - Hà Nội) hoặc 'south' (Nam - Sài Gòn)
  soundEnabled: true,
  speechRate: 0.75, // Tốc độ vừa chậm cho trẻ 4-6 tuổi
  audioUnlocked: false,
  score: 0,
  unlockedLessons: [0], // Bài 1 mở khóa mặc định
  carriedOverWords: [], // Tối đa 2 từ làm sai chuyển qua bài sau
  quizRound: null,
  unlockAllMode: true // Mặc định tự do chọn bất kỳ bài học nào trên iPad
};

// Danh sách lời khen ngợi phong phú, hào hứng khi bé trả lời đúng
const PRAISE_PHRASES = [
  "Đúng rồi! Bé giỏi quá! 🌟",
  "Hoan hô bé! Bé thông minh tuyệt vời! 🎉",
  "Chính xác luôn! Bé đỉnh thật đấy! 🚀",
  "Bé chọn chuẩn xác rồi! Quá tuyệt! 👏",
  "Bé thật là siêu nhân học chữ! 🌈",
  "Đúng rồi bé ơi! Tiếp tục phát huy nhé! 💖",
  "Tuyệt cú mèo! Bé trả lời xuất sắc! 🐱✨",
  "Giỏi lắm! Bé nhớ bài rất siêu! 🏆"
];

// Danh sách lời khích lệ, động viên nhẹ nhàng khi bé chọn chưa đúng
const ENCOURAGE_PHRASES = [
  "Bé ơi cố lên, cùng thử lại nhé! 💪",
  "Chưa chính xác rồi, bé nhìn kỹ lại nào! 👀",
  "Tiếc quá, bé thử chọn lại lần nữa nhé! 🍀",
  "Không sao đâu bé yêu, cùng làm lại nào! 💖",
  "Sắp đúng rồi, bé thử xem hình khác nhé! ✨",
  "Bé quan sát kỹ chữ và chọn lại nhé! 🧐"
];

// Hình minh họa sinh động cho từng câu ví dụ
const exampleIllustrationMap = {
  // 32 từ khởi đầu
  'ba': '📚👨‍👧', // Ba đọc sách cùng bé
  'bà': '👵✨', // Bà kể chuyện cổ tích
  'bố': '👨🚲', // Bố đưa bé đi chơi
  'mẹ': '👩‍👦💖', // Mẹ ôm bé
  'bé': '👶🎈', // Bé cười với bóng bay
  'bò': '🐄🌾', // Bò gặm cỏ xanh
  'mèo': '🐱💤', // Mèo nằm ngủ
  'gà': '🐔🌽', // Gà mổ thóc
  'cá': '🐟🌊', // Cá bơi tung tăng
  'vịt': '🦆🏊', // Vịt bơi ở ao
  'chó': '🐶🎾', // Chó chơi bóng
  'hoa': '🌸🌿', // Bé ngắm hoa
  'lá': '🍃🍂', // Chiếc lá rơi
  'cây': '🌳🍎', // Cây cao trong vườn
  'nắng': '☀️🕶️', // Hôm nay có nắng
  'mưa': '🌧️☔', // Trời đang mưa
  'đá': '🪨🏞️', // Bé nhặt viên đá
  'đèn': '💡🛋️', // Bé bật đèn
  'bút': '✏️📝', // Bé cầm bút vẽ
  'sách': '📖🎒', // Bé mở sách học
  'vở': '📓✏️', // Cuốn vở xinh xắn
  'bàn': '🪑📚', // Bàn học ngăn nắp
  'ghế': '🛋️🏡', // Chiếc ghế êm ái
  'nhà': '🏡🌸', // Ngôi nhà ấm cúng
  'cửa': '🚪🔑', // Cửa mở rộng
  'cơm': '🍚🥢', // Bát cơm thơm dẻo
  'nước': '🥛🧊', // Cốc nước mát
  'xe': '🚗🛣️', // Chiếc xe chạy bon bon
  'đánh': '🥁🎵', // Bé đánh trống rộn ràng
  'bóng': '⚽🥅', // Bé đá bóng
  'đau': '🩹🤕', // Băng dán vết thương
  'sau': '➡️🚶', // Đi sau một bước
  'tay': '✋🎨', // Bàn tay vẽ tranh
  'mắt': '👀✨', // Đôi mắt sáng ngời
  'miệng': '👄🍎', // Miệng cười tươi
  'chân': '🦶⚽', // Chân sút bóng
  'ăn': '🍚🥄', // Bé xúc cơm ăn
  'uống': '🥛😋', // Bé uống sữa mát
  'ngủ': '😴🌙', // Bé ngủ say sưa
  'đi': '🚶🎒', // Bé đi đến trường

  // Các từ SGK phổ biến tiếp theo
  'cô': '👩‍🏫🌸',
  'na': '🍈🌿',
  'cơ': '🚩🇻🇳',
  'đa': '🌳🏡',
  'ca nô': '🛥️🌊',
  'ca sĩ': '🎤🎶',
  'ca múa': '💃🎵',
  'bế': '🤱💕',
  'me': '🌿😋',
  'lê': '🍐✨',
  'bè': '🛶🌊',
  'bê': '🐂🌾',
  'cà': '🍆🌱',
  'bồ': '🕊️☁️',
  'cờ': '🇻🇳⭐',
  'cỏ': '🌿🌼',
  'cỗ': '🍲🥢',
  'cọ': '🌴🌞',
  'bẻ': '🌽🌻',
  'dê': '🐐🌿',
  'đỗ': '🫘🌱',
  'bi': '🔮✨',
  'bí đỏ': '🎃🌾',
  'đi đò': '🛶🌊',
  'bé bò': '👶🧸',
  'cố đô': '🏯✨',
  'đi bộ': '🚶🌳',
  'hề': '🤡🎈',
  'khế': '⭐🌿',
  'khỉ bé': '🐒🍌',
  'hồ cá': '🐠💦',
  'dù': '☂️🌧️',
  'nụ': '🌷🍃',
  'nơ đỏ': '🎀✨',
  'tô mì': '🍜🥢',
  'nho': '🍇🌿',
  'phở': '🍜🍋'
};

// Dữ liệu hình ảnh và tên gọi trực quan cho trẻ nhỏ
const pictureData = {
  // 32 từ khởi đầu
  'ba': { emoji: '👨‍👧', label: 'Người Ba (Bố)' },
  'bà': { emoji: '👵', label: 'Người Bà' },
  'bố': { emoji: '👨', label: 'Người Bố' },
  'mẹ': { emoji: '👩‍👦', label: 'Người Mẹ' },
  'bé': { emoji: '👶', label: 'Em Bé' },
  'bò': { emoji: '🐄', label: 'Con Bò' },
  'mèo': { emoji: '🐱', label: 'Con Mèo' },
  'gà': { emoji: '🐔', label: 'Con Gà' },
  'cá': { emoji: '🐟', label: 'Con Cá' },
  'vịt': { emoji: '🦆', label: 'Con Vịt' },
  'chó': { emoji: '🐶', label: 'Con Chó' },
  'hoa': { emoji: '🌸', label: 'Bông Hoa' },
  'lá': { emoji: '🍃', label: 'Chiếc Lá' },
  'cây': { emoji: '🌳', label: 'Cây Xanh' },
  'nắng': { emoji: '☀️', label: 'Ánh Nắng' },
  'mưa': { emoji: '🌧️', label: 'Trời Mưa' },
  'đá': { emoji: '🪨', label: 'Hòn Đá' },
  'đèn': { emoji: '💡', label: 'Cái Đèn' },
  'bút': { emoji: '✏️', label: 'Cây Bút' },
  'sách': { emoji: '📖', label: 'Cuốn Sách' },
  'vở': { emoji: '📓', label: 'Quyển Vở' },
  'tay': { emoji: '✋', label: 'Bàn Tay' },
  'mắt': { emoji: '👀', label: 'Đôi Mắt' },
  'miệng': { emoji: '👄', label: 'Cái Miệng' },
  'chân': { emoji: '🦶', label: 'Bàn Chân' },
  'ăn': { emoji: '🍚', label: 'Bé Ăn Cơm' },
  'uống': { emoji: '🥛', label: 'Bé Uống Nước' },
  'ngủ': { emoji: '😴', label: 'Bé Đi Ngủ' },
  'đánh': { emoji: '🥁', label: 'Đánh Trống' },
  'đi': { emoji: '🚶', label: 'Đi Bộ' },
  'đau': { emoji: '🩹', label: 'Vết Đau' },
  'sau': { emoji: '➡️', label: 'Đi Phía Sau' },
  'bóng': { emoji: '⚽', label: 'Quả Bóng' },
  'xe': { emoji: '🚗', label: 'Chiếc Xe' },
  'nhà': { emoji: '🏡', label: 'Ngôi Nhà' },
  'cửa': { emoji: '🚪', label: 'Cánh Cửa' },
  'bàn': { emoji: '🪑', label: 'Bàn Học' },
  'ghế': { emoji: '🛋️', label: 'Cái Ghế' },

  // Mở rộng các từ SGK
  'cô': { emoji: '👩‍🏫', label: 'Cô Giáo' },
  'na': { emoji: '🍈', label: 'Quả Na' },
  'cơ': { emoji: '🚩', label: 'Cờ Đỏ' },
  'đa': { emoji: '🌳', label: 'Cây Đa' },
  'ca nô': { emoji: '🛥️', label: 'Ca Nô' },
  'ca sĩ': { emoji: '🎤', label: 'Ca Sĩ' },
  'ca múa': { emoji: '💃', label: 'Ca Múa' },
  'bế': { emoji: '🤱', label: 'Bế Bé' },
  'me': { emoji: '🌿', label: 'Quả Me' },
  'lê': { emoji: '🍐', label: 'Quả Lê' },
  'bè': { emoji: '🛶', label: 'Cái Bè' },
  'bê': { emoji: '🐂', label: 'Con Bê' },
  'cà': { emoji: '🍆', label: 'Quả Cà' },
  'bồ': { emoji: '🕊️', label: 'Chim Bồ Câu' },
  'cờ': { emoji: '🇻🇳', label: 'Lá Cờ' },
  'cỏ': { emoji: '🌿', label: 'Bãi Cỏ' },
  'cỗ': { emoji: '🍲', label: 'Mâm Cỗ' },
  'cọ': { emoji: '🌴', label: 'Cây Cọ' },
  'bẻ': { emoji: '🌽', label: 'Bẻ Bắp' },
  'bễ': { emoji: '🔨', label: 'Cái Bễ' },
  'bệ': { emoji: '🏛️', label: 'Bệ Đá' },
  'dê': { emoji: '🐐', label: 'Con Dê' },
  'đỗ': { emoji: '🫘', label: 'Hạt Đỗ' },
  'bi': { emoji: '🔮', label: 'Viên Bi' },
  'da bò': { emoji: '👞', label: 'Tấm Da Bò' },
  'dỗ bé': { emoji: '🧸', label: 'Dỗ Em Bé' },
  'bí đỏ': { emoji: '🎃', label: 'Quả Bí Đỏ' },
  'đi đò': { emoji: '🛶', label: 'Đi Con Đò' },
  'bé bò': { emoji: '👶', label: 'Em Bé Bò' },
  'cố đô': { emoji: '🏯', label: 'Thành Cố Đô' },
  'đi bộ': { emoji: '🚶', label: 'Đi Bộ' },
  'da cá': { emoji: '🐟', label: 'Tấm Da Cá' },
  'đổ': { emoji: '🫗', label: 'Rót Nước' },
  'hề': { emoji: '🤡', label: 'Chú Hề' },
  'kẻ': { emoji: '📏', label: 'Kẻ Vạch' },
  'khế': { emoji: '⭐', label: 'Quả Khế' },
  'kì đà': { emoji: '🦎', label: 'Con Kì Đà' },
  'khe đá': { emoji: '⛰️', label: 'Khe Đá' },
  'khỉ bé': { emoji: '🐒', label: 'Con Khỉ' },
  'hồ cá': { emoji: '🐠', label: 'Hồ Nuôi Cá' },
  'dù': { emoji: '☂️', label: 'Chiếc Dù (Ô)' },
  'tổ': { emoji: '🪺', label: 'Tổ Chim' },
  'dữ': { emoji: '🦁', label: 'Hung Dữ' },
  'củ từ': { emoji: '🥔', label: 'Củ Từ' },
  'cử tạ': { emoji: '🏋️', label: 'Môn Cử Tạ' },
  'tu hú': { emoji: '🐦', label: 'Chim Tu Hú' },
  'tê tê': { emoji: '🦔', label: 'Con Tê Tê' },
  'nụ': { emoji: '🌷', label: 'Nụ Hoa' },
  'mạ': { emoji: '🌾', label: 'Cây Mạ Non' },
  'nơ đỏ': { emoji: '🎀', label: 'Chiếc Nơ Đỏ' },
  'tô mì': { emoji: '🍜', label: 'Tô Mì Thơm' },
  'le le': { emoji: '🦆', label: 'Vịt Le Le' },
  'li': { emoji: '🥛', label: 'Cái Ly (Cốc)' },
  'nho': { emoji: '🍇', label: 'Chùm Nho' },
  'pi-a-nô': { emoji: '🎹', label: 'Đàn Pi-a-nô' },
  'phở': { emoji: '🍜', label: 'Bát Phở' },
  'thị': { emoji: '🍈', label: 'Quả Thị' },
  'nhũ đá': { emoji: '🪨', label: 'Nhũ Đá Hang' },
  'pa-nô': { emoji: '🖼️', label: 'Biển Pa-nô' },
  'phố cổ': { emoji: '🏮', label: 'Phố Cổ' },
  'cá thu': { emoji: '🐟', label: 'Con Cá Thu' },
  'cá mú': { emoji: '🐠', label: 'Con Cá Mú' },
  'kè đá': { emoji: '🪨', label: 'Bờ Kè Đá' },
  'cà phê': { emoji: '☕', label: 'Ly Cà Phê' },
  'cổ thụ': { emoji: '🌳', label: 'Cây Cổ Thụ' },
  'nhà kho': { emoji: '🏭', label: 'Nhà Kho' },
  'lư đá': { emoji: '🪨', label: 'Lư Đá' },
  'rổ': { emoji: '🧺', label: 'Cái Rổ' }
};

// Emoji dự phòng
const emojiMap = {
  'ba': '👨‍👧', 'bà': '👵', 'bố': '👨', 'mẹ': '👩‍👦', 'bé': '👶',
  'bò': '🐄', 'mèo': '🐱', 'gà': '🐔', 'cá': '🐟', 'vịt': '🦆',
  'chó': '🐶', 'hoa': '🌸', 'lá': '🍃', 'cây': '🌳', 'nắng': '☀️',
  'mưa': '🌧️', 'đá': '🪨', 'đèn': '💡', 'bút': '✏️', 'sách': '📖',
  'vở': '📓', 'bàn': '🪑', 'ghế': '🛋️', 'nhà': '🏡', 'cửa': '🚪',
  'cơm': '🍚', 'nước': '🥛', 'xe': '🚗', 'đánh': '🥁', 'bóng': '⚽',
  'đau': '🩹', 'sau': '➡️', 'tay': '✋', 'mắt': '👀', 'miệng': '👄',
  'chân': '🦶', 'ăn': '🍚', 'uống': '🥛', 'ngủ': '😴', 'đi': '🚶'
};

// Hàm lấy thông tin hình ảnh và tên gọi với cơ chế fallback thông minh (100% từ đều có hình)
function getPictureDataForWord(word) {
  if (pictureData[word]) return pictureData[word];
  
  // Suy luận thông minh theo từ khóa
  if (word.includes('cá')) return { emoji: '🐟', label: `Con ${word}` };
  if (word.includes('bò') || word.includes('bê')) return { emoji: '🐄', label: `Con ${word}` };
  if (word.includes('chó')) return { emoji: '🐶', label: `Con ${word}` };
  if (word.includes('mèo')) return { emoji: '🐱', label: `Con ${word}` };
  if (word.includes('gà')) return { emoji: '🐔', label: `Con ${word}` };
  if (word.includes('vịt')) return { emoji: '🦆', label: `Con ${word}` };
  if (word.includes('chim') || word.includes('bồ') || word.includes('tu hú') || word.includes('le le')) return { emoji: '🐦', label: `Con ${word}` };
  if (word.includes('hoa') || word.includes('nụ')) return { emoji: '🌸', label: `Bông ${word}` };
  if (word.includes('cây') || word.includes('đa') || word.includes('thụ')) return { emoji: '🌳', label: `Cây ${word}` };
  if (word.includes('lá') || word.includes('cỏ') || word.includes('mạ')) return { emoji: '🌿', label: word };
  if (word.includes('quả') || word.includes('khế') || word.includes('na') || word.includes('lê') || word.includes('nho') || word.includes('thị')) return { emoji: '🍎', label: `Quả ${word}` };
  if (word.includes('xe') || word.includes('ca nô') || word.includes('đò')) return { emoji: '🚗', label: word };
  if (word.includes('nhà') || word.includes('cố đô') || word.includes('phố')) return { emoji: '🏡', label: word };
  if (word.includes('đá')) return { emoji: '🪨', label: `Hòn ${word}` };
  if (word.includes('mì') || word.includes('phở') || word.includes('cơm') || word.includes('cỗ')) return { emoji: '🍜', label: `Món ${word}` };

  const emoji = emojiMap[word] || '🌟';
  return { emoji, label: `Từ: ${word}` };
}

// ==========================================
// 1.1 LƯU TRỮ TIẾN ĐỘ VĨNH VIỄN TRÊN IPAD (LOCALSTORAGE)
// ==========================================
const STORAGE_KEY = 'vietnhat_adventure_progress_v1';

function saveProgressToStorage() {
  try {
    const data = {
      unlockedLessons: state.unlockedLessons,
      currentLessonIndex: state.currentLessonIndex,
      score: state.score,
      unlockAllMode: state.unlockAllMode,
      carriedOverIds: (state.carriedOverWords || []).map(w => w.id)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save note:', e);
  }
}

function loadProgressFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.unlockedLessons)) state.unlockedLessons = data.unlockedLessons;
      if (typeof data.currentLessonIndex === 'number') state.currentLessonIndex = data.currentLessonIndex;
      if (typeof data.score === 'number') state.score = data.score;
      if (typeof data.unlockAllMode === 'boolean') state.unlockAllMode = data.unlockAllMode;
      state._savedCarriedIds = data.carriedOverIds || [];
    }
  } catch (e) {
    console.warn('Storage load note:', e);
  }
}

// ==========================================
// 2. KHỞI TẠO ỨNG DỤNG & TẢI DỮ LIỆU
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadVocabularyData();
});

// Tải dữ liệu từ vocabulary_vi_v2.json
async function loadVocabularyData() {
  try {
    loadProgressFromStorage();
    const response = await fetch('./01-vocabulary/vocabulary_vi_v2.json');
    if (!response.ok) throw new Error('Không thể tải file JSON');
    const data = await response.json();
    state.items = data.items || [];
    if (state._savedCarriedIds && state._savedCarriedIds.length > 0) {
      state.carriedOverWords = state.items.filter(x => state._savedCarriedIds.includes(x.id));
    }
    buildLessons();
    renderLessonTabs();
    renderIslandMap();
  } catch (err) {
    console.warn('Đang tải dữ liệu dự phòng...', err);
    loadFallbackData();
  }
}

// Xây dựng lộ trình bài học: mỗi bài ~10 từ theo mức độ dễ đến khó
function buildLessons() {
  const authored = state.items.filter(x => x.content_status === 'authored_starter');
  const sgkItems = state.items.filter(x => x.content_status !== 'authored_starter');

  // Phân loại nghiêm ngặt theo tiến trình sư phạm:
  // Cấp 1 (2 âm/vần đơn giản) -> Cấp 2 (3 âm/vần đôi) -> Cấp 3 (4-5 âm & từ ghép)
  const level1 = authored.filter(x => x.phonics?.complexity === '2_am');
  const level2 = authored.filter(x => x.phonics?.complexity === '3_am');
  const level3 = authored.filter(x => x.phonics?.complexity === '4_5_am');

  const lessons = [];

  // Bài 1: 10 từ 2 âm cơ bản 1 (Gia đình & Động vật gần gũi)
  lessons.push({
    id: 'lesson-1',
    lessonIndex: 0,
    title: 'Bài 1: Ghép 2 âm cơ bản (Gia đình & Động vật)',
    level: 'Cấp 1 (2 âm - Rất dễ)',
    items: level1.slice(0, 10)
  });

  // Bài 2: 10 từ 2 âm cơ bản 2 (Thiên nhiên & Cây cối)
  lessons.push({
    id: 'lesson-2',
    lessonIndex: 1,
    title: 'Bài 2: Ghép 2 âm cơ bản (Thiên nhiên & Cây cối)',
    level: 'Cấp 1 (2 âm - Dễ)',
    items: level1.slice(10, 20)
  });

  // Bài 3: 10 từ 2 âm cơ bản 3 (Sinh hoạt & Đồ dùng)
  lessons.push({
    id: 'lesson-3',
    lessonIndex: 2,
    title: 'Bài 3: Ghép 2 âm mở rộng (Đồ dùng & Sinh hoạt)',
    level: 'Cấp 1 (2 âm - Dễ)',
    items: level1.slice(20, 30)
  });

  // Bài 4: 10 từ 3 âm 1 (Vần đôi & Âm cuối đơn giản)
  lessons.push({
    id: 'lesson-4',
    lessonIndex: 3,
    title: 'Bài 4: Nâng lên 3 âm (Vần đôi & Âm cuối 1)',
    level: 'Cấp 2 (3 âm - Vừa)',
    items: level2.slice(0, 10)
  });

  // Bài 5: 10 từ 3 âm 2 (Cơ thể & Hoạt động)
  lessons.push({
    id: 'lesson-5',
    lessonIndex: 4,
    title: 'Bài 5: Nâng lên 3 âm (Cơ thể & Hoạt động 2)',
    level: 'Cấp 2 (3 âm - Vừa)',
    items: level2.slice(10, 20)
  });

  // Bài 6: 10 từ 4 - 5 âm / vần phức tạp & từ ghép
  lessons.push({
    id: 'lesson-6',
    lessonIndex: 5,
    title: 'Bài 6: Nâng lên 4-5 âm & Từ ghép',
    level: 'Cấp 3 (4-5 âm - Nâng cao)',
    items: level3.slice(0, 10)
  });

  // Bài 7 trở đi: Toàn bộ các từ SGK tiếp theo, mỗi bài 10 từ
  const chunkSize = 10;
  let lessonNum = 7;
  for (let i = 0; i < sgkItems.length; i += chunkSize) {
    const chunk = sgkItems.slice(i, i + chunkSize);
    lessons.push({
      id: `lesson-${lessonNum}`,
      lessonIndex: lessonNum - 1,
      title: `Bài ${lessonNum}: Luyện đọc SGK`,
      level: `Cấp ${lessonNum} (Mở rộng)`,
      items: chunk
    });
    lessonNum++;
  }

  state.lessons = lessons;
}

// Render các nút chọn bài học (Lesson tabs với trạng thái mở khóa)
function renderLessonTabs() {
  const container = document.getElementById('lesson-tabs');
  if (!container) return;
  container.innerHTML = '';

  state.lessons.forEach((l, idx) => {
    const isUnlocked = state.unlockAllMode || state.unlockedLessons.includes(idx);
    const btn = document.createElement('button');
    btn.className = `lesson-tab-btn ${idx === state.currentLessonIndex ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
    
    if (isUnlocked) {
      btn.textContent = `Bài ${idx + 1} (${l.items.length} từ)`;
    } else {
      btn.innerHTML = `🔒 Bài ${idx + 1}`;
    }

    btn.addEventListener('click', () => {
      if (!isUnlocked) {
        showToast(`🔒 Bé hãy đạt từ 8/10 điểm ở Bài ${idx} để mở khóa Bài ${idx + 1} nhé!`);
        return;
      }
      state.currentLessonIndex = idx;
      saveProgressToStorage();
      renderLessonTabs();
      renderIslandMap();
    });
    container.appendChild(btn);
  });

  const curLesson = state.lessons[state.currentLessonIndex];
  if (curLesson) {
    document.getElementById('current-lesson-title').textContent = `${curLesson.title} — ${curLesson.level}`;
    const mapBtnText = document.getElementById('map-challenge-btn-text');
    if (mapBtnText) {
      mapBtnText.textContent = `Thử thách ghép hình Bài ${state.currentLessonIndex + 1} (10 câu)`;
    }
  }

  // Cập nhật giao diện nút Bật/Tắt chế độ tự do chọn bài
  const btnToggle = document.getElementById('btn-toggle-unlock-all');
  if (btnToggle) {
    if (state.unlockAllMode) {
      btnToggle.className = 'btn-mode-toggle active';
      const icon = document.getElementById('mode-toggle-icon');
      const label = document.getElementById('mode-toggle-label');
      if (icon) icon.textContent = '🔓';
      if (label) label.textContent = 'Tự do chọn bài: BẬT';
    } else {
      btnToggle.className = 'btn-mode-toggle';
      const icon = document.getElementById('mode-toggle-icon');
      const label = document.getElementById('mode-toggle-label');
      if (icon) icon.textContent = '🔒';
      if (label) label.textContent = 'Mở khóa từng bài';
    }
  }
}

// Thiết lập các sự kiện giao diện
function setupEventListeners() {
  // 1. Mở khóa âm thanh trên iPad Safari (Bắt buộc tương tác chạm lần đầu)
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', unlockAudioAndStart);
    btnStart.addEventListener('touchstart', unlockAudioAndStart, { passive: true });
  }

  // 1.2 Bật/Tắt chế độ tự do chọn bài học & Đặt lại tiến độ
  document.getElementById('btn-toggle-unlock-all')?.addEventListener('click', () => {
    state.unlockAllMode = !state.unlockAllMode;
    saveProgressToStorage();
    renderLessonTabs();
    showToast(state.unlockAllMode
      ? 'Đã BẬT: Bé có thể tự do chọn bất kỳ bài học nào! 🔓'
      : 'Đã BẬT: Chế độ học theo lộ trình (đạt 8/10 để qua bài) 🔒');
  });

  document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
    state.unlockedLessons = [0];
    state.currentLessonIndex = 0;
    state.score = 0;
    state.carriedOverWords = [];
    saveProgressToStorage();
    renderLessonTabs();
    renderIslandMap();
    showToast('Đã đặt lại tiến độ học tập từ Bài 1! 🌟');
  });

  // 2. Điều hướng Header
  document.getElementById('btn-back')?.addEventListener('click', () => switchView('view-map'));
  document.getElementById('btn-sound-toggle')?.addEventListener('click', toggleSound);
  document.getElementById('btn-speed-toggle')?.addEventListener('click', toggleSpeed);

  // 3. Chuyển đổi ngôn ngữ
  document.getElementById('lang-vi')?.addEventListener('click', () => {
    showToast('Đang chọn: Tiếng Việt 🇻🇳');
  });
  document.getElementById('lang-ja')?.addEventListener('click', () => {
    showToast('🇯🇵 Phần tiếng Nhật sẽ có trong giai đoạn mở rộng tiếp theo!');
  });

  // 4. Trạm học từ vựng
  document.getElementById('btn-play-full')?.addEventListener('click', () => {
    if (state.currentWord) {
      playAudioSrc(getDialectAudio(state.currentWord, 'word'), state.currentWord.word);
    }
  });

  // 5. NÚT ĐÁNH VẦN DUY NHẤT (Không hiển thị các bước chữ rườm rà)
  document.getElementById('btn-play-all-steps')?.addEventListener('click', playAllPhonicsSteps);

  document.getElementById('btn-play-example')?.addEventListener('click', () => {
    if (state.currentWord && state.currentWord.example_vi) {
      playAudioSrc(getDialectAudio(state.currentWord, 'example'), state.currentWord.example_vi);
    }
  });

  document.getElementById('btn-prev-word')?.addEventListener('click', prevWord);
  document.getElementById('btn-next-word')?.addEventListener('click', nextWord);

  // 6. Mini Game Thử Thách Nhìn Chữ Chọn Hình (10 từ theo bài học)
  document.getElementById('btn-launch-game')?.addEventListener('click', () => startLessonChallenge(state.currentLessonIndex));
  document.getElementById('btn-map-start-quiz')?.addEventListener('click', () => startLessonChallenge(state.currentLessonIndex));
  document.getElementById('btn-exit-game')?.addEventListener('click', () => switchView('view-station'));
  document.getElementById('btn-quiz-listen')?.addEventListener('click', () => {
    if (state.quizRound) {
      const curItem = state.quizRound.questions[state.quizRound.currentIndex];
      if (curItem) {
        playAudioSrc(getDialectAudio(curItem, 'word'), curItem.word);
      }
    }
  });
  document.getElementById('btn-next-quiz')?.addEventListener('click', nextQuizQuestion);
}

// Mở khóa AudioContext trên iPad Safari
function unlockAudioAndStart() {
  state.audioUnlocked = true;
  
  // Mở khóa Web Audio API trên iPad Safari (bọc try-catch an toàn tuyệt đối)
  try {
    getAudioContext();
  } catch (e) {
    console.warn('AudioContext init note:', e);
  }

  // Phát âm thanh câm để giải phóng AudioContext trên WebKit Safari
  try {
    if ('speechSynthesis' in window) {
      const silent = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(silent);
    }
  } catch (e) {
    console.warn('SpeechSynthesis note:', e);
  }

  // Ẩn màn hình Splash
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('hidden');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 450);
  }
  showToast('Đã mở khóa âm thanh cho iPad! Chúc bé học vui! 🌟');
}

// ==========================================
// 3. RENDER BẢN ĐỒ THÁM HIỂM (ISLAND MAP THEO BÀI HỌC)
// ==========================================
function renderIslandMap() {
  const container = document.getElementById('island-grid');
  if (!container) return;
  container.innerHTML = '';

  const currentLesson = state.lessons[state.currentLessonIndex];
  const itemsToRender = currentLesson ? currentLesson.items : state.items.slice(0, 10);

  if (!itemsToRender || itemsToRender.length === 0) {
    container.innerHTML = '<p class="map-intro">Chưa có từ nào trong bài học này.</p>';
    return;
  }

  itemsToRender.forEach(item => {
    const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
    const card = document.createElement('div');
    card.className = `island-node ${isConfirmed ? 'confirmed' : ''}`;
    
    const pic = getPictureDataForWord(item.word);
    const icon = pic.emoji || '🌿';
    const statusText = isConfirmed ? 'Chơi ngay' : 'Đang duyệt';
    const badgeClass = isConfirmed ? 'ready' : 'pending';

    card.innerHTML = `
      <div class="node-icon">${icon}</div>
      <div class="node-word">${item.word}</div>
      <span class="node-badge ${badgeClass}">${statusText}</span>
    `;

    card.addEventListener('click', () => openWordStation(item));
    container.appendChild(card);
  });
}

// ==========================================
// 4. PHÒNG KHÁM PHÁ TỪ & ĐÁNH VẦN (STATION)
// ==========================================
function openWordStation(item) {
  state.currentWord = item;
  state.currentWordIndex = state.items.findIndex(x => x.id === item.id);

  // Cập nhật thông tin giao diện
  document.getElementById('word-display').textContent = item.word;
  document.getElementById('word-meaning').textContent = item.meaning_vi_child || 'Chờ cập nhật nghĩa';
  document.getElementById('word-topic').textContent = item.topic || 'khám phá';
  document.getElementById('example-text').textContent = `"${item.example_vi || 'Đang cập nhật ví dụ'}"`;
  
  const pic = getPictureDataForWord(item.word);
  document.getElementById('word-emoji').textContent = pic.emoji || '📖';
  
  // Cập nhật hình ảnh minh họa cho câu ví dụ
  const exEmoji = document.getElementById('example-emoji');
  if (exEmoji) {
    exEmoji.textContent = exampleIllustrationMap[item.word] || '🌟';
  }

  const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
  const badge = document.getElementById('phonics-badge');
  if (badge) {
    if (isConfirmed) {
      badge.textContent = '🌟 Đã kiểm duyệt';
      badge.className = 'badge-status ready';
      badge.style.background = '#dcfce7';
      badge.style.color = '#15803d';
    } else {
      badge.textContent = '⏳ Đang chờ thẩm định giáo viên';
      badge.className = 'badge-status';
      badge.style.background = '#fef3c7';
      badge.style.color = '#92400e';
    }
  }

  // Chuyển sang View Station
  switchView('view-station');

  // Đọc từ chào mừng bằng file thu âm chuẩn của giọng đang chọn
  setTimeout(() => {
    playAudioSrc(getDialectAudio(item, 'word'), item.word);
  }, 300);
}

// PHÁT ÂM THANH ĐÁNH VẦN DUY NHẤT (Không hiển thị thẻ bước chữ rườm rà)
async function playAllPhonicsSteps() {
  if (!state.currentWord) return;
  const wordItem = state.currentWord;
  const seq = (wordItem.phonics && wordItem.phonics.sequence && wordItem.phonics.sequence.length > 0)
    ? wordItem.phonics.sequence
    : [wordItem.word];

  const btn = document.getElementById('btn-play-all-steps');
  if (btn) btn.classList.add('playing');

  try {
    for (let i = 0; i < seq.length; i++) {
      const audioSrc = getDialectAudio(wordItem, 'step', i);
      await playAudioSrc(audioSrc, seq[i], 1.25);
      await waitMs(140);
    }

    // Đọc từ hoàn chỉnh cuối cùng
    await waitMs(180);
    await playAudioSrc(getDialectAudio(wordItem, 'word'), wordItem.word, 1.0);
  } finally {
    if (btn) btn.classList.remove('playing');
  }
}

function prevWord() {
  const currentLesson = state.lessons[state.currentLessonIndex];
  const list = currentLesson ? currentLesson.items : state.items;
  const idx = list.findIndex(x => x.id === state.currentWord?.id);
  if (idx > 0) {
    openWordStation(list[idx - 1]);
  } else {
    showToast('Đây là từ đầu tiên của bài học!');
  }
}

function nextWord() {
  const currentLesson = state.lessons[state.currentLessonIndex];
  const list = currentLesson ? currentLesson.items : state.items;
  const idx = list.findIndex(x => x.id === state.currentWord?.id);
  if (idx >= 0 && idx < list.length - 1) {
    openWordStation(list[idx + 1]);
  } else {
    showToast('Bé đã xem hết các từ trong bài học này! 🎉');
  }
}

// ==========================================
// 5. THỬ THÁCH NHÌN CHỮ CHỌN HÌNH (10 TỪ/BÀI, ĐẠT 8/10 MỚI MỞ KHÓA)
// ==========================================

// Bắt đầu vòng thử thách 10 câu cho Bài học đang chọn
function startLessonChallenge(lessonIndex) {
  state.currentLessonIndex = lessonIndex;
  const currentLesson = state.lessons[lessonIndex];
  if (!currentLesson) return;

  // 1. Lấy các từ chuyển tiếp từ bài trước (tối đa 2 từ)
  const carried = [...state.carriedOverWords];

  // 2. Lấy các từ trong bài học hiện tại (loại trừ từ đã có trong carried)
  const lessonItems = currentLesson.items.filter(item => !carried.some(c => c.id === item.id));

  // 3. Kết hợp để đủ 10 câu: carried (tối đa 2) + lessonItems
  const targetCount = 10;
  const neededFromLesson = Math.max(0, targetCount - carried.length);
  const selectedLessonItems = lessonItems.slice(0, neededFromLesson);

  const quizQuestions = [...carried, ...selectedLessonItems];
  
  // Dự phòng nếu bài có ít hơn số từ cần thiết: lấy thêm từ kho chung
  if (quizQuestions.length < targetCount) {
    const backupPool = currentLesson.items.concat(state.items).filter(x => !quizQuestions.some(q => q.id === x.id));
    quizQuestions.push(...backupPool.slice(0, targetCount - quizQuestions.length));
  }

  // Khởi tạo trạng thái vòng thử thách
  state.quizRound = {
    lessonIndex: lessonIndex,
    questions: quizQuestions,
    currentIndex: 0,
    score: 0,
    missedWords: [], // Danh sách các từ bé làm sai ở vòng này
    firstAttempt: true,
    carriedIds: carried.map(c => c.id) // Để hiển thị badge "Ôn lại"
  };

  switchView('view-game');
  loadQuizQuestionByIndex(0);
}

// Nạp câu hỏi theo chỉ mục trong vòng 10 câu
function loadQuizQuestionByIndex(index) {
  const round = state.quizRound;
  if (!round || index >= round.questions.length) return;

  const targetItem = round.questions[index];
  const word = targetItem.word;
  round.firstAttempt = true;

  // Cập nhật tiến độ & điểm
  document.getElementById('quiz-progress').textContent = `${index + 1}/10`;
  document.getElementById('game-score').textContent = round.score;
  document.getElementById('quiz-word-display').textContent = word;

  // Hiển thị huy hiệu "Ôn lại từ cũ" nếu từ này chuyển tiếp từ bài trước
  const badgeCarry = document.getElementById('quiz-carryover-badge');
  if (badgeCarry) {
    if (round.carriedIds.includes(targetItem.id)) {
      badgeCarry.classList.remove('hidden');
    } else {
      badgeCarry.classList.add('hidden');
    }
  }

  // Reset feedback & nút tiếp theo
  const feedback = document.getElementById('quiz-feedback');
  feedback.className = 'quiz-feedback hidden';
  feedback.innerHTML = '';
  document.getElementById('btn-next-quiz').classList.add('hidden');

  // Lấy các đáp án gây nhiễu từ các từ khác trong bài học hoặc kho chung
  const otherItems = round.questions.concat(state.items).filter(x => x.word !== word);
  const shuffledOthers = [...otherItems].sort(() => Math.random() - 0.5);
  const distractors = shuffledOthers.slice(0, 2);

  const targetPic = getPictureDataForWord(word);
  const options = [
    { word: word, emoji: targetPic.emoji, label: targetPic.label, isCorrect: true },
    ...distractors.map(d => {
      const p = getPictureDataForWord(d.word);
      return { word: d.word, emoji: p.emoji, label: p.label, isCorrect: false };
    })
  ];

  // Xáo trộn vị trí các thẻ hình
  const shuffledOptions = options.sort(() => Math.random() - 0.5);

  const container = document.getElementById('picture-options-grid');
  container.innerHTML = '';

  shuffledOptions.forEach(opt => {
    const card = document.createElement('div');
    card.className = 'picture-card';
    card.innerHTML = `
      <span class="pic-emoji">${opt.emoji}</span>
      <span class="pic-label">${opt.label}</span>
    `;

    card.addEventListener('click', () => handlePictureSelect(card, opt));
    container.appendChild(card);
  });
}

// Xử lý khi bé chạm chọn hình
function handlePictureSelect(cardElement, option) {
  const round = state.quizRound;
  if (!round) return;

  const currentItem = round.questions[round.currentIndex];
  const feedback = document.getElementById('quiz-feedback');
  feedback.classList.remove('hidden');

  if (option.isCorrect) {
    // Bé chọn ĐÚNG!
    cardElement.classList.add('correct');

    if (round.firstAttempt) {
      round.score++;
      document.getElementById('game-score').textContent = round.score;
    }

    // 1. Âm thanh chuông reo chiến thắng vui nhộn
    playChimeSound('correct');

    // 2. Bắn pháo hoa rực rỡ
    triggerFireworks();

    // 3. Phát giọng người thật khen ngợi "Đúng rồi! Bé giỏi quá!" (không bị robot tiếng Anh)
    const correctAudio = `06-assets/audio/common/correct-${state.currentDialect}.mp3`;
    playAudioSrc(correctAudio, 'Đúng rồi! Bé giỏi quá!');

    // Lời khen ngợi phong phú hiển thị trên màn hình
    const praise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
    feedback.className = 'quiz-feedback success';
    feedback.innerHTML = `🎉 ${praise} Chữ <b>"${option.word}"</b> chính là <b>${option.label}</b>!`;

    // Khóa click tạm thời
    document.querySelectorAll('.picture-card').forEach(c => c.style.pointerEvents = 'none');

    // Hiện nút tiếp theo
    document.getElementById('btn-next-quiz').classList.remove('hidden');
  } else {
    // Bé chọn SAI!
    cardElement.classList.add('wrong');

    // Ghi nhận từ này bị làm sai ở lần đầu
    if (round.firstAttempt) {
      if (!round.missedWords.some(w => w.id === currentItem.id)) {
        round.missedWords.push(currentItem);
      }
      round.firstAttempt = false;
    }

    // 1. ÂM THANH "BÀ BƯ BƯ" HÀI HƯỚC
    playWrongBuzzer();

    // 2. HIỂN THỊ DẤU X MÀU ĐỎ RỒI MỜ BIẾN MẤT
    showWrongXMark();

    // 3. Phát giọng người thật động viên "Bé thử lại nhé!" (không bị robot tiếng Anh)
    const tryAgainAudio = `06-assets/audio/common/try-again-${state.currentDialect}.mp3`;
    setTimeout(() => {
      playAudioSrc(tryAgainAudio, 'Bé thử lại nhé!');
    }, 450);

    // Lời khích lệ hiển thị trên màn hình
    const encourage = ENCOURAGE_PHRASES[Math.floor(Math.random() * ENCOURAGE_PHRASES.length)];
    feedback.className = 'quiz-feedback error';
    feedback.innerHTML = `💡 ${encourage} Đây là <b>${option.label}</b>. Bé nhìn kỹ chữ lại nhé!`;

    setTimeout(() => {
      cardElement.classList.remove('wrong');
    }, 600);
  }
}

// Chuyển sang câu hỏi tiếp theo hoặc tổng kết vòng
function nextQuizQuestion() {
  document.querySelectorAll('.picture-card').forEach(c => c.style.pointerEvents = 'auto');
  const round = state.quizRound;
  if (!round) return;

  round.currentIndex++;
  if (round.currentIndex < round.questions.length) {
    loadQuizQuestionByIndex(round.currentIndex);
  } else {
    // Hoàn thành cả 10 câu -> Hiện bảng tổng kết
    finishQuizRound();
  }
}

// Hiển thị bảng tổng kết vòng thử thách (Yêu cầu đạt 8/10 để mở khóa bài tiếp theo)
function finishQuizRound() {
  const round = state.quizRound;
  const isPassed = round.score >= 8;
  const modal = document.getElementById('quiz-summary-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const nextLessonIdx = round.lessonIndex + 1;

  if (isPassed) {
    // VƯỢT QUA BÀI HỌC!
    if (!state.unlockedLessons.includes(nextLessonIdx) && nextLessonIdx < state.lessons.length) {
      state.unlockedLessons.push(nextLessonIdx);
      renderLessonTabs();
    }
    saveProgressToStorage();

    // Chuyển tối đa 2 từ làm sai sang bài sau để ôn tập
    state.carriedOverWords = round.missedWords.slice(0, 2);

    triggerFireworks();
    playChimeSound('correct');

    let carryMsg = '';
    if (state.carriedOverWords.length > 0) {
      const wordsStr = state.carriedOverWords.map(w => `<b>"${w.word}"</b>`).join(', ');
      carryMsg = `<div class="carry-notice">📌 Các từ ${wordsStr} bé sẽ được gặp lại để ôn tập ở bài tiếp theo nhé!</div>`;
    }

    modal.innerHTML = `
      <div class="summary-card victory">
        <div class="summary-icon">🏆 🌟 🎓</div>
        <h2>XUẤT SẮC QUÁ BÉ ƠI!</h2>
        <p class="summary-score">Bé đạt <b>${round.score}/10</b> câu đúng!</p>
        <p class="summary-desc">Bé đã hoàn thành xuất sắc và mở khóa <b>Bài ${nextLessonIdx + 1}</b>!</p>
        ${carryMsg}
        <div class="summary-actions">
          ${nextLessonIdx < state.lessons.length ? `
            <button id="btn-modal-next-lesson" class="btn-hero pulse">
              🚀 Khám phá Bài ${nextLessonIdx + 1} ngay
            </button>
          ` : ''}
          <button id="btn-modal-replay" class="btn-secondary">
            🔄 Chơi lại bài này
          </button>
          <button id="btn-modal-map" class="btn-secondary">
            🗺️ Về bản đồ
          </button>
        </div>
      </div>
    `;

    speakVoiceText(`Xuất sắc quá bé ơi! Bé đạt ${round.score} trên 10 câu đúng và mở khóa bài tiếp theo!`);
  } else {
    // CHƯA ĐẠT 8/10
    playWrongBuzzer();

    modal.innerHTML = `
      <div class="summary-card retry">
        <div class="summary-icon">💪 🐣 🌈</div>
        <h2>CỐ LÊN BÉ YÊU!</h2>
        <p class="summary-score">Bé đạt <b>${round.score}/10</b> câu đúng.</p>
        <p class="summary-desc">Bé cần đạt từ <b>8/10</b> câu đúng trở lên để mở khóa Bài tiếp theo. Bé hãy thử lại nhé!</p>
        <div class="summary-actions">
          <button id="btn-modal-retry" class="btn-hero">
            🔄 Thử lại ngay nào!
          </button>
          <button id="btn-modal-map" class="btn-secondary">
            🗺️ Về bản đồ
          </button>
        </div>
      </div>
    `;

    speakVoiceText(`Bé đạt ${round.score} trên 10 điểm. Bé thử lại để đạt từ 8 điểm trở lên nhé!`);
  }

  // Gắn sự kiện cho các nút điều hướng trong modal
  setTimeout(() => {
    document.getElementById('btn-modal-next-lesson')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      state.currentLessonIndex = nextLessonIdx;
      renderLessonTabs();
      renderIslandMap();
      switchView('view-map');
    });

    const btnRetry = document.getElementById('btn-modal-retry') || document.getElementById('btn-modal-replay');
    btnRetry?.addEventListener('click', () => {
      modal.classList.add('hidden');
      startLessonChallenge(round.lessonIndex);
    });

    document.getElementById('btn-modal-map')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      switchView('view-map');
    });
  }, 100);
}

// Hiển thị dấu X màu đỏ nổi bật rồi mờ biến mất
function showWrongXMark() {
  const x = document.getElementById('wrong-x-mark');
  if (!x) return;
  x.classList.add('show');
  setTimeout(() => {
    x.classList.remove('show');
  }, 850);
}

// ==========================================
// 6. XỬ LÝ ÂM THANH: PHÁT AUDIO FILE CHUẨN & DỰ PHÒNG TTS
// ==========================================
let currentAudio = null;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Phát âm thanh chuông reo (Đúng)
function playChimeSound(type) {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (type === 'correct') {
    // Hợp âm chiến thắng rộn rã: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
    });
  }
}

// ÂM THANH "BÀ BƯ BƯ" HÀI HƯỚC KHI BÉ LÀM SAI (3 nốt trầm giảm dần)
function playWrongBuzzer() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 240, start: 0.0, dur: 0.22, vol: 0.2 },   // "bà"
    { freq: 190, start: 0.24, dur: 0.22, vol: 0.22 }, // "bư"
    { freq: 140, start: 0.48, dur: 0.38, vol: 0.25 }  // "bư" trầm ngân
  ];

  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.start);
    osc.frequency.exponentialRampToValueAtTime(n.freq * 0.9, ctx.currentTime + n.start + n.dur);

    gain.gain.setValueAtTime(0, ctx.currentTime + n.start);
    gain.gain.linearRampToValueAtTime(n.vol, ctx.currentTime + n.start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.start + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + n.start);
    osc.stop(ctx.currentTime + n.start + n.dur + 0.05);
  });
}

// Đọc lời khen ngợi hoặc động viên bằng giọng nói
function speakVoiceText(text) {
  if (!state.soundEnabled || !text) return;
  try {
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(clean)}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn('speakVoiceText note:', e);
  }
}

// Phát file âm thanh đã thu âm hoặc truyền phát Google Translate TTS chuẩn tiếng Việt
function playAudioSrc(audioSrc, fallbackText, rate = 1.0) {
  return new Promise((resolve) => {
    if (!state.soundEnabled) return resolve();

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (audioSrc) {
      const audio = new Audio(audioSrc);
      currentAudio = audio;
      audio.playbackRate = rate;

      audio.onended = () => resolve();
      audio.onerror = () => {
        fallbackSpeech(fallbackText, resolve);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackSpeech(fallbackText, resolve);
        });
      }
    } else {
      fallbackSpeech(fallbackText, resolve);
    }
  });
}

// Phát âm tiếng Việt chuẩn 100% bằng Google Translate TTS MP3 stream (loại bỏ triệt để robot tiếng Anh trên iPad)
function fallbackSpeech(text, resolve) {
  if (!text || !state.soundEnabled) return resolve();
  try {
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(clean)}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => resolve());
    }
  } catch (e) {
    resolve();
  }
}

// Lấy đường dẫn âm thanh tương ứng với giọng đang chọn (Bắc / Nam)
function getDialectAudio(item, type, stepIndex = 0) {
  if (!item || !item.audio) return null;

  const dialects = item.audio.dialects;
  if (dialects && dialects[state.currentDialect]) {
    const dialectData = dialects[state.currentDialect];
    if (type === 'word') return dialectData.word_full || null;
    if (type === 'example') return dialectData.example_sentence || null;
    if (type === 'step') {
      return (dialectData.phonics_steps && dialectData.phonics_steps[stepIndex]) || null;
    }
  }

  // Fallback cấu trúc cũ
  if (type === 'word') return item.audio.word_full || null;
  if (type === 'example') return item.audio.example_sentence || null;
  if (type === 'step') {
    return (item.audio.phonics_steps && item.audio.phonics_steps[stepIndex]) || null;
  }

  return null;
}

// Bật/tắt giọng đọc Bắc - Nam
function toggleDialect() {
  state.currentDialect = state.currentDialect === 'north' ? 'south' : 'north';
  const label = document.getElementById('dialect-label');
  if (state.currentDialect === 'north') {
    label.textContent = 'Miền Bắc';
    showToast('Đã chuyển sang giọng đọc: Miền Bắc (Hà Nội) 🏙️');
  } else {
    label.textContent = 'Miền Nam';
    showToast('Đã chuyển sang giọng đọc: Miền Nam (Sài Gòn) 🌴');
  }
}

// Bật/tắt toàn bộ âm thanh
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const icon = document.getElementById('sound-icon');
  if (state.soundEnabled) {
    icon.textContent = '🔊';
    showToast('Âm thanh: Đã BẬT 🔊');
  } else {
    icon.textContent = '🔇';
    if (currentAudio) currentAudio.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    showToast('Âm thanh: Đã TẮT 🔇');
  }
}

// Chuyển đổi tốc độ đọc
function toggleSpeed() {
  const label = document.getElementById('speed-label');
  if (state.speechRate === 0.75) {
    state.speechRate = 0.95;
    label.textContent = 'Vừa';
    showToast('Tốc độ đọc: Vừa phải');
  } else if (state.speechRate === 0.95) {
    state.speechRate = 0.65;
    label.textContent = 'Rất chậm';
    showToast('Tốc độ đọc: Rất chậm cho bé nghe rõ');
  } else {
    state.speechRate = 0.75;
    label.textContent = 'Chậm';
    showToast('Tốc độ đọc: Chậm chuẩn');
  }
}

// ==========================================
// 7. HIỆU ỨNG PHÁO HOA KHI LÀM ĐÚNG
// ==========================================
let fireworksParticles = [];
let fireworksAnimationId = null;

function triggerFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');

  const originX = canvas.width / 2;
  const originY = canvas.height * 0.45;

  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#fde047', '#06b6d4'];

  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    fireworksParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      radius: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.015 + Math.random() * 0.018,
      gravity: 0.18
    });
  }

  if (!fireworksAnimationId) {
    animateFireworks();
  }
}

function animateFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = fireworksParticles.length - 1; i >= 0; i--) {
    const p = fireworksParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      fireworksParticles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }

  if (fireworksParticles.length > 0) {
    fireworksAnimationId = requestAnimationFrame(animateFireworks);
  } else {
    cancelAnimationFrame(fireworksAnimationId);
    fireworksAnimationId = null;
    canvas.classList.remove('active');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==========================================
// 8. TIỆN ÍCH GIAO DIỆN & ĐIỀU HƯỚNG
// ==========================================
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    if (viewId === 'view-map') {
      btnBack.classList.add('hidden');
    } else {
      btnBack.classList.remove('hidden');
    }
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2200);
}

function waitMs(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ==========================================
// 9. DỮ LIỆU DỰ PHÒNG KHI KHÔNG CÓ SERVER
// ==========================================
function loadFallbackData() {
  state.items = [
    {
      id: "vi_0001",
      word: "ba",
      meaning_vi_child: "bố hoặc người đàn ông; cần ngữ cảnh",
      example_vi: "Ba đang đọc sách cho bé.",
      topic: "gia đình",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "a", "bờ a ba"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0001/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0001/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0001/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0001/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0001/03-blend.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0001/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0001/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0001/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0001/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0001/03-blend.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0002",
      word: "bà",
      meaning_vi_child: "người phụ nữ lớn tuổi trong gia đình",
      example_vi: "Bà kể chuyện cho bé nghe.",
      topic: "gia đình",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "a", "bờ a ba", "ba huyền bà"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0002/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0002/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0002/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0002/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0002/03-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0002/04-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0002/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0002/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0002/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0002/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0002/03-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0002/04-tone.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0005",
      word: "bé",
      meaning_vi_child: "em nhỏ đáng yêu",
      example_vi: "Bé cười thật tươi.",
      topic: "gia đình",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "e", "bờ e be", "be sắc bé"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0005/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0005/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0005/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0005/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0005/03-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0005/04-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0005/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0005/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0005/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0005/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0005/03-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0005/04-tone.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0006",
      word: "bò",
      meaning_vi_child: "con bò ăn cỏ trên đồng",
      example_vi: "Con bò gặm cỏ xanh mướt.",
      topic: "động vật",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "o", "bờ o bo", "bo huyền bò"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0006/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0006/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0006/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0006/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0006/03-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0006/04-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0006/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0006/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0006/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0006/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0006/03-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0006/04-tone.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0029",
      word: "đánh",
      meaning_vi_child: "dùng tay hoặc dùi tác động; đánh trống",
      example_vi: "Bé đánh trống rộn ràng.",
      topic: "hành động",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["đờ", "a", "nhờ", "a nhờ anh", "đờ anh đanh", "đanh sắc đánh"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0029/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0029/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0029/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/02-rime-01.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/03-rime-02.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/04-rime-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/05-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/06-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0029/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0029/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0029/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/02-rime-01.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/03-rime-02.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/04-rime-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/05-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/06-tone.mp3"
            ]
          }
        }
      }
    }
  ];
  buildLessons();
  renderLessonTabs();
  renderIslandMap();
}
