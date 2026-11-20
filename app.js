/**
 * ĐẢO PHIÊU LƯU TỪ VỰNG — VIETNAMESE LEARNING GAME
 * Thiết kế cho iPad thế hệ 7 Safari & Web hiện đại
 */

// ==========================================
// 1. TRẠNG THÁI ỨNG DỤNG (APP STATE)
// ==========================================
const state = {
  items: [],
  activeFilter: 'confirmed', // 'confirmed' hoặc 'starter'
  currentWordIndex: 0,
  currentWord: null,
  soundEnabled: true,
  speechRate: 0.75, // Tốc độ vừa chậm cho trẻ 4-6 tuổi
  audioUnlocked: false,
  score: 0,
  quizSelectedTiles: []
};

// Emoji biểu tượng cho từng chủ đề / từ
const emojiMap = {
  'ba': '👨',
  'bà': '👵',
  'bố': '👨‍👧',
  'mẹ': '👩‍👦',
  'bé': '👶',
  'bò': '🐄',
  'mèo': '🐱',
  'gà': '🐔',
  'cá': '🐟',
  'vịt': '🦆',
  'chó': '🐶',
  'hoa': '🌸',
  'lá': '🍃',
  'cây': '🌳',
  'nắng': '☀️',
  'mưa': '🌧️',
  'đá': '🪨',
  'đèn': '💡',
  'bút': '✏️',
  'sách': '📖',
  'vở': '📓',
  'bàn': '🪑',
  'ghế': '🛋️',
  'nhà': '🏡',
  'cửa': '🚪',
  'cơm': '🍚',
  'nước': '🥛',
  'xe': '🚗',
  'đánh': '🥁', // Dạy đánh trống an toàn cho trẻ
  'bóng': '⚽',
  'đau': '🩹',
  'sau': '➡️'
};

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
    const response = await fetch('./01-vocabulary/vocabulary_vi_v2.json');
    if (!response.ok) throw new Error('Không thể tải file JSON');
    const data = await response.json();
    state.items = data.items || [];
    renderIslandMap();
  } catch (err) {
    console.warn('Đang tải dữ liệu dự phòng...', err);
    // Dữ liệu dự phòng nếu mở trực tiếp bằng file:/// trên máy
    loadFallbackData();
  }
}

// Thiết lập các sự kiện giao diện
function setupEventListeners() {
  // 1. Mở khóa âm thanh trên iPad Safari (Bắt buộc tương tác chạm lần đầu)
  const btnStart = document.getElementById('btn-start');
  btnStart.addEventListener('click', unlockAudioAndStart);
  btnStart.addEventListener('touchstart', unlockAudioAndStart, { passive: true });

  // 2. Điều hướng Header
  document.getElementById('btn-back').addEventListener('click', () => switchView('view-map'));
  document.getElementById('btn-sound-toggle').addEventListener('click', toggleSound);
  document.getElementById('btn-speed-toggle').addEventListener('click', toggleSpeed);

  // 3. Chuyển đổi ngôn ngữ
  document.getElementById('lang-vi').addEventListener('click', () => {
    showToast('Đang chọn: Tiếng Việt 🇻🇳');
  });
  document.getElementById('lang-ja').addEventListener('click', () => {
    showToast('🇯🇵 Phần tiếng Nhật sẽ có trong giai đoạn mở rộng tiếp theo!');
  });

  // 4. Bộ lọc bản đồ
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.activeFilter = e.target.dataset.filter;
      renderIslandMap();
    });
  });

  // 5. Trạm học từ vựng
  document.getElementById('btn-play-full').addEventListener('click', () => {
    if (state.currentWord) speakText(state.currentWord.word);
  });

  document.getElementById('btn-play-all-steps').addEventListener('click', playAllPhonicsSteps);

  document.getElementById('btn-play-example').addEventListener('click', () => {
    if (state.currentWord && state.currentWord.example_vi) {
      speakText(state.currentWord.example_vi);
    }
  });

  document.getElementById('btn-prev-word').addEventListener('click', prevWord);
  document.getElementById('btn-next-word').addEventListener('click', nextWord);

  // 6. Mini Game Thử Thách
  document.getElementById('btn-launch-game').addEventListener('click', startQuizGame);
  document.getElementById('btn-exit-game').addEventListener('click', () => switchView('view-station'));
  document.getElementById('btn-check-quiz').addEventListener('click', checkQuizAnswer);
  document.getElementById('btn-reset-quiz').addEventListener('click', resetQuizTiles);
}

// Mở khóa AudioContext trên iPad Safari
function unlockAudioAndStart() {
  state.audioUnlocked = true;
  
  // Phát âm thanh câm để giải phóng AudioContext trên WebKit Safari
  if ('speechSynthesis' in window) {
    const silent = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(silent);
  }

  // Ẩn màn hình Splash
  const splash = document.getElementById('splash-screen');
  splash.classList.add('hidden');
  showToast('Đã mở khóa âm thanh cho iPad! Chúc bé học vui! 🌟');
}

// ==========================================
// 3. RENDER BẢN ĐỒ THÁM HIỂM (ISLAND MAP)
// ==========================================
function renderIslandMap() {
  const container = document.getElementById('island-grid');
  container.innerHTML = '';

  // Lọc từ: từ đã duyệt hoặc 32 từ khởi đầu
  const filtered = state.items.filter(item => {
    if (state.activeFilter === 'confirmed') {
      return item.phonics && item.phonics.status === 'user_confirmed';
    } else {
      // 32 từ khởi đầu (vi_0001 - vi_0032)
      return item.content_status === 'authored_starter';
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="map-intro">Chưa có từ nào trong mục này.</p>';
    return;
  }

  filtered.forEach(item => {
    const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
    const card = document.createElement('div');
    card.className = `island-node ${isConfirmed ? 'confirmed' : ''}`;
    
    const icon = emojiMap[item.word] || '🌿';
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
  document.getElementById('example-text').textContent = `"${item.example_vi || ''}"`;
  document.getElementById('word-emoji').textContent = emojiMap[item.word] || '📖';

  const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
  const badge = document.getElementById('phonics-badge');
  if (isConfirmed) {
    badge.textContent = '🌟 Đã duyệt cách ghép vần';
    badge.className = 'badge-status';
  } else {
    badge.textContent = '⏳ Đang chờ thẩm định giáo viên';
    badge.className = 'badge-status';
    badge.style.background = '#fef3c7';
    badge.style.color = '#92400e';
  }

  // Render các bước đánh vần
  renderPhonicsSteps(item);

  // Chuyển sang View Station
  switchView('view-station');

  // Đọc từ chào mừng
  setTimeout(() => {
    speakText(item.word);
  }, 300);
}

// Render các thẻ bước đánh vần
function renderPhonicsSteps(item) {
  const wrapper = document.getElementById('phonics-steps-wrapper');
  wrapper.innerHTML = '';

  const sequence = (item.phonics && item.phonics.sequence) ? item.phonics.sequence : [];

  if (sequence.length === 0) {
    wrapper.innerHTML = '<p style="color:#64748b; font-style:italic;">Chuỗi ghép âm đang chờ xác nhận từ giáo viên dạy đọc.</p>';
    return;
  }

  sequence.forEach((stepText, index) => {
    // Thẻ bước
    const card = document.createElement('div');
    card.className = 'step-card';
    card.id = `step-card-${index}`;
    card.innerHTML = `
      <span class="step-number">Bước ${index + 1}</span>
      <span class="step-text">${stepText}</span>
    `;

    card.addEventListener('click', () => {
      highlightStep(index);
      speakText(stepText);
    });

    wrapper.appendChild(card);

    // Mũi tên liên kết (trừ bước cuối)
    if (index < sequence.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'step-arrow';
      arrow.textContent = '➔';
      wrapper.appendChild(arrow);
    }
  });
}

// Đọc toàn bộ chuỗi đánh vần lần lượt
async function playAllPhonicsSteps() {
  if (!state.currentWord || !state.currentWord.phonics || !state.currentWord.phonics.sequence) return;
  const seq = state.currentWord.phonics.sequence;

  for (let i = 0; i < seq.length; i++) {
    highlightStep(i);
    await speakTextAsync(seq[i]);
    await waitMs(600);
  }

  // Đọc từ hoàn chỉnh cuối cùng
  await waitMs(400);
  speakText(state.currentWord.word);
}

function highlightStep(index) {
  document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`step-card-${index}`);
  if (card) {
    card.classList.add('active');
    setTimeout(() => card.classList.remove('active'), 1200);
  }
}

// Điều hướng từ tiếp / từ trước
function prevWord() {
  if (state.currentWordIndex > 0) {
    state.currentWordIndex--;
    openWordStation(state.items[state.currentWordIndex]);
  } else {
    showToast('Đây là từ đầu tiên trong danh sách!');
  }
}

function nextWord() {
  if (state.currentWordIndex < state.items.length - 1) {
    state.currentWordIndex++;
    openWordStation(state.items[state.currentWordIndex]);
  } else {
    showToast('Đã đến từ cuối cùng!');
  }
}

// ==========================================
// 5. MINI GAME THỬ THÁCH GHÉP TỪ
// ==========================================
function startQuizGame() {
  if (!state.currentWord) return;
  const word = state.currentWord;
  const seq = (word.phonics && word.phonics.sequence) ? word.phonics.sequence : [word.word];

  document.getElementById('quiz-target-hint').textContent = word.word;
  document.getElementById('quiz-feedback').className = 'quiz-feedback hidden';
  state.quizSelectedTiles = [];

  const dropZone = document.getElementById('drop-zone');
  const tilesPool = document.getElementById('tiles-pool');
  dropZone.innerHTML = '<span style="color:#94a3b8; font-size:15px;">Chạm vào các mảnh âm bên dưới theo đúng thứ tự ghép nhé!</span>';
  tilesPool.innerHTML = '';

  // Xáo trộn các bước
  const shuffled = [...seq].sort(() => Math.random() - 0.5);

  shuffled.forEach((step, idx) => {
    const tile = document.createElement('button');
    tile.className = 'sound-tile';
    tile.textContent = step;
    tile.dataset.text = step;
    tile.dataset.id = `tile-${idx}`;

    tile.addEventListener('click', () => selectQuizTile(tile, step));
    tilesPool.appendChild(tile);
  });

  switchView('view-game');
}

function selectQuizTile(tile, stepText) {
  if (tile.classList.contains('selected')) return;

  tile.classList.add('selected');
  speakText(stepText);
  state.quizSelectedTiles.push({ el: tile, text: stepText });

  const dropZone = document.getElementById('drop-zone');
  if (state.quizSelectedTiles.length === 1) {
    dropZone.innerHTML = '';
  }

  const placed = document.createElement('div');
  placed.className = 'step-card';
  placed.style.margin = '4px';
  placed.innerHTML = `<span class="step-text">${stepText}</span>`;
  dropZone.appendChild(placed);
}

function resetQuizTiles() {
  startQuizGame();
}

function checkQuizAnswer() {
  if (!state.currentWord || !state.currentWord.phonics) return;
  const expected = state.currentWord.phonics.sequence || [];
  const selected = state.quizSelectedTiles.map(t => t.text);

  const feedback = document.getElementById('quiz-feedback');
  feedback.classList.remove('hidden');

  const isMatch = expected.length === selected.length &&
                  expected.every((val, idx) => val === selected[idx]);

  if (isMatch) {
    feedback.className = 'quiz-feedback success';
    feedback.innerHTML = '🎉 Hoan hô bé! Bé ghép âm hoàn toàn chính xác!';
    state.score += 10;
    document.getElementById('game-score').textContent = state.score;
    speakText('Hoan hô bé! Tuyệt vời!');
    confettiEffect();
  } else {
    feedback.className = 'quiz-feedback error';
    feedback.innerHTML = '💡 Chưa đúng thứ tự rồi, bé bấm "Làm lại" để thử lại nhé!';
    speakText('Bé thử lại nhé!');
  }
}

// Hiệu ứng ăn mừng khi hoàn thành
function confettiEffect() {
  showToast('🌟 +10 Ngôi sao! Bé giỏi lắm!');
}

// ==========================================
// 6. XỬ LÝ ÂM THANH & TỔNG HỢP GIỌNG ĐỌC
// ==========================================
function speakText(text) {
  if (!state.soundEnabled || !text) return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Ngắt âm đang phát nếu có
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = state.speechRate;
    utterance.pitch = 1.0;

    // Ưu tiên giọng miền Bắc nếu trình duyệt có sẵn
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.name.includes('Vietnamese') || v.name.includes('Hanoi'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  }
}

function speakTextAsync(text) {
  return new Promise((resolve) => {
    if (!state.soundEnabled || !text || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = state.speechRate;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  });
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const icon = document.getElementById('sound-icon');
  icon.textContent = state.soundEnabled ? '🔊' : '🔇';
  showToast(state.soundEnabled ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT');
}

function toggleSpeed() {
  if (state.speechRate === 0.75) {
    state.speechRate = 1.0;
    document.getElementById('speed-label').textContent = 'Vừa';
  } else {
    state.speechRate = 0.75;
    document.getElementById('speed-label').textContent = 'Chậm';
  }
  showToast(`Tốc độ đọc: ${document.getElementById('speed-label').textContent}`);
}

// ==========================================
// 7. TIỆN ÍCH GIAO DIỆN & ĐIỀU HƯỚNG
// ==========================================
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  const btnBack = document.getElementById('btn-back');
  if (viewId === 'view-map') {
    btnBack.classList.add('hidden');
  } else {
    btnBack.classList.remove('hidden');
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
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
// 8. DỮ LIỆU DỰ PHÒNG KHI KHÔNG CÓ SERVER
// ==========================================
function loadFallbackData() {
  // Dự phòng 5 từ đã duyệt chuẩn
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
        sequence: ["bờ", "a", "ba"]
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
        sequence: ["bờ", "a", "ba", "ba huyền bà"]
      }
    },
    {
      id: "vi_0005",
      word: "bé",
      meaning_vi_child: "trẻ nhỏ đáng yêu",
      example_vi: "Bé đang cười tươi.",
      topic: "con người",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "e", "be", "be sắc bé"]
      }
    },
    {
      id: "vi_0006",
      word: "bò",
      meaning_vi_child: "con bò ăn cỏ ngoài đồng",
      example_vi: "Con bò đang ăn cỏ xanh.",
      topic: "động vật",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "o", "bo", "bo huyền bò"]
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
        sequence: ["đờ", "a", "nhờ", "anh", "đanh", "đanh sắc đánh"]
      }
    }
  ];
  renderIslandMap();
}
